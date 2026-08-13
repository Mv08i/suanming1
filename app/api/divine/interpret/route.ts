// 解卦 API（付费 SSE，扣 5 积分，复用 runInterpret 流水线）
// 服务端终判：重新 performCast 推导卦象，拼 system prompt，再走 SSE
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { performCast, type CastRequest } from "@/lib/divine/cast";
import { buildPrompt } from "@/lib/divine/prompts";
import { runInterpret } from "@/lib/divine/interpret";
import type { DivinationType } from "@/lib/divine/types";
import type { ChatMessage } from "@/lib/ai-client";

export const runtime = "nodejs";

interface InterpretBody extends CastRequest {
  model?: string;
  locale?: "en" | "zh";
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "未登录" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  const userId = session.user.id;

  let body: InterpretBody;
  try {
    body = (await req.json()) as InterpretBody;
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

  // 服务端终判：重新推导卦象（不信任客户端 cast 内容，只接 input 参数）
  let canonicalCast;
  try {
    canonicalCast = performCast(body);
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "起卦失败" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 先建 DivinationRecord（requestId 待 onDone 回填）
  const record = await prisma.divinationRecord.create({
    data: {
      userId,
      type: body.type,
      question: body.question ?? null,
      castData: canonicalCast as unknown as object,
      requestId: null,
    },
  });

  const prompt = buildPrompt(canonicalCast, body.question, body.locale);
  const userText = body.question?.trim()
    ? body.question
    : body.locale === "en" ? "Please interpret this hexagram." : "请解卦";
  const messages: ChatMessage[] = [
    { role: "system", content: prompt },
    { role: "user", content: userText },
  ];

  const category = body.type as Exclude<DivinationType, never>;
  const typeName = body.type === "LIUYAO" ? "六爻" : body.type === "MEIHUA" ? "梅花易数" : "奇门遁甲";

  return runInterpret({
    userId,
    messages,
    model: body.model,
    category,
    description: `命理咨询(${typeName})`,
    onDone: async ({ requestId, fullContent }) => {
      await prisma.divinationRecord.update({
        where: { id: record.id },
        data: {
          requestId,
          summary: fullContent.slice(0, 200),
        },
      });
    },
  });
}
