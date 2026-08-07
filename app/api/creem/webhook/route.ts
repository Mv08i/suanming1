import { NextRequest, NextResponse } from "next/server";
import { constructWebhookEvent } from "creem/webhooks";
import { prisma } from "@/lib/prisma";
import { applyRecharge } from "@/lib/credits";

// Creem Webhook 处理
// Creem 在支付成功时 POST 到这个地址，我们验签后给用户加积分
export async function POST(req: NextRequest) {
  const secret = process.env.CREEM_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[creem webhook] CREEM_WEBHOOK_SECRET 未配置");
    return NextResponse.json({ error: "server misconfigured" }, { status: 500 });
  }

  // 验签需要原始 body（不能让框架先 parse 成 JSON）
  const rawBody = await req.text();
  const headers: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    headers[key] = value;
  });

  // 1. 验签 + 解析事件（一步到位，签名错会抛 WebhookVerificationError）
  console.log("[creem webhook] 收到请求, header keys:", Object.keys(headers));
  console.log("[creem webhook] 所有 header 值:", JSON.stringify(headers, null, 2));
  console.log("[creem webhook] body 长度:", rawBody.length, "前100字:", rawBody.slice(0, 100));
  let event;
  try {
    event = await constructWebhookEvent(rawBody, headers, secret);
  } catch (e) {
    console.error("[creem webhook] 验签失败:", (e as Error).message);
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  // 2. 只处理一次性支付完成事件（订阅类事件忽略）
  if (event.type !== "checkout.completed") {
    return NextResponse.json({ received: true, ignored: true, type: event.type });
  }

  // 3. 从事件数据拿 checkout id，找本地订单
  const data = event.data as {
    id?: string;
    metadata?: { userId?: string; packageId?: string; credits?: string };
  };
  const checkoutId = data.id;
  if (!checkoutId) {
    console.error("[creem webhook] 事件缺少 checkout id");
    return NextResponse.json({ error: "missing checkout id" }, { status: 400 });
  }

  const order = await prisma.rechargeOrder.findUnique({
    where: { creemCheckoutId: checkoutId },
  });

  if (!order) {
    console.error("[creem webhook] 找不到 checkoutId 对应的订单:", checkoutId);
    return NextResponse.json({ error: "order not found" }, { status: 404 });
  }

  // 4. 入账（幂等 + 事务 + 行锁）
  const result = await applyRecharge(order.id);
  if (!result.success) {
    console.error("[creem webhook] 入账失败:", result.error);
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({
    received: true,
    processed: !result.alreadyProcessed,
  });
}
