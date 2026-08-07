import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPackageById, createCheckoutSession } from "@/lib/creem";
import { createRechargeOrder } from "@/lib/credits";

// 创建 Creem Checkout Session
// 前端 POST { packageId } → 返回 { checkoutUrl, orderId }，前端重定向到 checkoutUrl 完成支付
export async function POST(req: NextRequest) {
  // 1. 登录校验
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  // 2. 解析套餐 id
  let packageId: unknown;
  try {
    const body = await req.json();
    packageId = body?.packageId;
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
  }

  const pkg = getPackageById(String(packageId));
  if (!pkg) {
    return NextResponse.json({ error: "无效的套餐" }, { status: 400 });
  }

  const origin = new URL(req.url).origin;
  const successUrl = `${origin}/credits/success`;

  // 3. 调 Creem 创建 checkout
  let checkout: { checkoutId: string; checkoutUrl: string };
  try {
    checkout = await createCheckoutSession({
      pkg,
      userId: session.user.id,
      userEmail: session.user.email,
      successUrl,
      requestId: `uid_${session.user.id}_${Date.now()}`,
    });
  } catch (e) {
    console.error("[checkout] 创建 Creem checkout 失败:", e);
    return NextResponse.json(
      { error: "创建支付订单失败: " + (e as Error).message },
      { status: 500 },
    );
  }

  // 4. 落库订单（PENDING），用 checkoutId 关联，webhook 回来时用它找订单
  const order = await createRechargeOrder({
    userId: session.user.id,
    pkg,
    creemCheckoutId: checkout.checkoutId,
  });

  // 5. 返回 checkoutUrl，前端 location.href 跳转过去
  return NextResponse.json({
    checkoutUrl: checkout.checkoutUrl,
    orderId: order.id,
  });
}
