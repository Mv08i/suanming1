// 共享 SSE 流水线：从 app/api/ai/chat/route.ts 抽出
// 统一处理：创建 AiRequest → 扣 5 积分 → 流式 SSE → 成功/失败回退
// chat route 与 /api/divine/interpret 都复用此函数

import { prisma } from "../prisma";
import {
  deductCredits,
  refundCredits,
  FIXED_PER_CALL_CREDITS,
} from "../credits";
import { createChatCompletionStream, type ChatMessage } from "../ai-client";

export type AiCategory = "CHAT" | "LIUYAO" | "MEIHUA" | "QIMEN";

/** SSE 事件格式：event: xxx\r\n data: {...}\n\n */
function sse(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

/**
 * Vercel / 部分 CDN 对 SSE 流有缓冲阈值。
 * 发几行 SSE 注释（":" 开头，客户端忽略）触发 flush。
 * 每行 80 字节 x 5 行 = 400 字节，足以绕过大多数缓冲。
 */
function warmupPad(): string {
  const line = ":" + "x".repeat(78) + "\n";
  return line.repeat(5);
}

export interface InterpretParams {
  userId: string;
  messages: ChatMessage[];
  model?: string;
  category: AiCategory;
  description: string;
  /** 成功完成时回调（done 事件发出前调用），可写历史记录等 */
  onDone?: (r: {
    requestId: string;
    inputTokens: number;
    outputTokens: number;
    model: string;
    fullContent: string;
  }) => Promise<void>;
}

/**
 * 运行一次 AI 解读，返回 SSE Response。
 * - 成功：AiRequest.SUCCESS + 调 onDone + 发 done 事件
 * - 失败：refundCredits + AiRequest.FAILED + 发 error 事件
 * - 扣费失败（余额不足）：直接返 402 JSON（不进 SSE）
 */
export async function runInterpret(params: InterpretParams): Promise<Response> {
  const { userId, messages, model, category, description, onDone } = params;
  const initialModel = model ?? process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  // 1. 创建 AiRequest（PENDING，预扣 5 积分）
  const aiReq = await prisma.aiRequest.create({
    data: {
      userId,
      model: initialModel,
      creditsReserved: FIXED_PER_CALL_CREDITS,
      status: "PENDING",
      category,
    },
  });
  const requestId = aiReq.id;

  // 2. 扣积分（失败返回 402 JSON，不进 SSE 流）
  const ded = await deductCredits({
    userId,
    amount: FIXED_PER_CALL_CREDITS,
    requestId,
    description,
  });
  if (!ded.success) {
    await prisma.aiRequest.update({
      where: { id: requestId },
      data: { status: "FAILED", errorMessage: ded.error, completedAt: new Date() },
    });
    return new Response(JSON.stringify({ error: ded.error ?? "扣费失败" }), {
      status: 402,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 3. 流式响应
  const encoder = new TextEncoder();
  let fullContent = "";
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let outputTokens = 0;
      let inputTokens = 0;
      let actualModel = initialModel;
      let errored = false;

      try {
        // 1) 先灌 4KB SSE 注释，绕过 Vercel/CDN 的流式缓冲阈值
        controller.enqueue(encoder.encode(warmupPad()));
        // 2) meta 事件（扣费 + 余额信息，客户端先显示）
        controller.enqueue(
          encoder.encode(
            sse("meta", {
              requestId,
              model: initialModel,
              creditsCharged: FIXED_PER_CALL_CREDITS,
              newBalance: ded.newBalance,
            }),
          ),
        );

        for await (const chunk of createChatCompletionStream({ messages, model })) {
          if (chunk.type === "delta") {
            fullContent += chunk.content;
            controller.enqueue(encoder.encode(sse("delta", { content: chunk.content })));
          } else if (chunk.type === "done") {
            inputTokens = chunk.inputTokens;
            outputTokens = chunk.outputTokens;
            actualModel = chunk.model;
          } else if (chunk.type === "error") {
            errored = true;
            await refundCredits({
              userId,
              amount: FIXED_PER_CALL_CREDITS,
              requestId,
              description: `AI 调用失败回退: ${chunk.message.slice(0, 100)}`,
            }).catch(() => {});
            await prisma.aiRequest.update({
              where: { id: requestId },
              data: {
                status: "FAILED",
                errorMessage: chunk.message.slice(0, 500),
                completedAt: new Date(),
                creditsCharged: 0,
                inputTokens,
                outputTokens,
                model: actualModel,
              },
            });
            controller.enqueue(encoder.encode(sse("error", { error: chunk.message })));
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
            return;
          }
        }

        // 正常完成
        await prisma.aiRequest.update({
          where: { id: requestId },
          data: {
            status: "SUCCESS",
            completedAt: new Date(),
            inputTokens,
            outputTokens,
            creditsCharged: FIXED_PER_CALL_CREDITS,
            model: actualModel,
          },
        });
        if (onDone) {
          try {
            await onDone({ requestId, inputTokens, outputTokens, model: actualModel, fullContent });
          } catch {
            // onDone 失败不影响主流程
          }
        }
        controller.enqueue(
          encoder.encode(
            sse("done", {
              inputTokens,
              outputTokens,
              newBalance: ded.newBalance,
              model: actualModel,
              requestId,
            }),
          ),
        );
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (err) {
        if (!errored) {
          const msg = err instanceof Error ? err.message : String(err);
          await refundCredits({
            userId,
            amount: FIXED_PER_CALL_CREDITS,
            requestId,
            description: `流式异常回退: ${msg.slice(0, 100)}`,
          }).catch(() => {});
          await prisma.aiRequest.update({
            where: { id: requestId },
            data: {
              status: "FAILED",
              errorMessage: msg.slice(0, 500),
              completedAt: new Date(),
              creditsCharged: 0,
              inputTokens,
              outputTokens,
              model: actualModel,
            },
          });
          controller.enqueue(encoder.encode(sse("error", { error: msg })));
        }
        try {
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch {
          // controller 可能已关闭
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
