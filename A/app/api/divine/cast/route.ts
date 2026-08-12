// 起卦 API（免费，不扣费）
// 服务端终判：只接受 type/question/coinSums/method/number，自行推导卦象
import { auth } from "@/lib/auth";
import { performCast, type CastRequest } from "@/lib/divine/cast";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "未登录" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: CastRequest;
  try {
    body = (await req.json()) as CastRequest;
  } catch {
    return new Response(JSON.stringify({ error: "请求体格式错误" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  if (!body.type || !["LIUYAO", "MEIHUA", "QIMEN"].includes(body.type)) {
    return new Response(JSON.stringify({ error: "type 必须为 LIUYAO/MEIHUA/QIMEN" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const cast = performCast(body);
    return new Response(JSON.stringify({ cast }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "起卦失败" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}
