import { auth } from "@/lib/auth";
import { runInterpret } from "@/lib/divine/interpret";
import type { ChatMessage } from "@/lib/ai-client";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "未登录" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: { messages?: ChatMessage[]; model?: string; locale?: "en" | "zh" };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "请求体格式错误" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return new Response(JSON.stringify({ error: "messages 必填且非空" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const model = body.model ?? process.env.OPENAI_MODEL;
  const locale: "en" | "zh" = body.locale === "zh" ? "zh" : "en";

  // 按当前 locale 前置 system 消息，约束 AI 回复语言（默认英文）
  const systemContent =
    locale === "zh"
      ? "你是一个乐于助人的 AI 助手。请用中文回答用户的问题。"
      : "You are a helpful AI assistant. Please respond in English.";
  const messages: ChatMessage[] = [
    { role: "system", content: systemContent },
    ...body.messages!,
  ];

  // 复用共享 SSE 流水线（扣费 + SSE + 失败回退 + AiRequest 状态机）
  return runInterpret({
    userId: session.user.id,
    messages,
    model,
    category: "CHAT",
    description: `AI 对话 (${model ?? "默认"})`,
  });
}
