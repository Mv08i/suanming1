// OpenAI 兼容客户端。支持 OpenAI 官方 API 或任何兼容格式的（智谱 / Groq / DeepSeek 等）。
// 没配 API_KEY 时自动走本地 mock 回退（保证扣费链路可测）。

/** 兼容 \r\n\r\n 和 \n\n 的 SSE 块边界查找 */
function findSseBoundary(buf: string): number {
  const idx4 = buf.indexOf("\r\n\r\n");
  const idx2 = buf.indexOf("\n\n");
  if (idx4 < 0) return idx2;
  if (idx2 < 0) return idx4;
  return Math.min(idx4, idx2);
}

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

/** 流式 chunk：通过 async generator 逐个 yield 给调用方 */
export type ChatStreamYield =
  | { type: "delta"; content: string }
  | { type: "done"; inputTokens: number; outputTokens: number; model: string }
  | { type: "error"; message: string };

/** 判断是否应该走 mock（没配 key，或 key 还是占位符） */
function shouldUseMock(): boolean {
  const key = (process.env.OPENAI_API_KEY ?? "").trim();
  if (!key) return true;
  // 占位符检查：任何含 "FILL" 或 "YOUR" 或 "PLACEHOLDER" 的 key 都视为未配置
  const upper = key.toUpperCase();
  if (upper.includes("FILL") || upper.includes("YOUR") || upper.includes("PLACEHOLDER")) return true;
  return false;
}

/**
 * 非流式聊天：输入 messages 数组，返回完整回复字符串
 * - 配了 OPENAI_API_KEY → 调真实接口
 * - 没配（或占位符） → 返回 mock 回复（带 echo 你的提问），不扣真钱，保证链路可测
 */
export async function createChatCompletion(params: {
  messages: ChatMessage[];
  model?: string;
  signal?: AbortSignal;
}): Promise<{ content: string; inputTokens: number; outputTokens: number; model: string }> {
  const apiKey = process.env.OPENAI_API_KEY;
  const baseUrl = process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1";
  const model = params.model ?? process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  if (shouldUseMock()) {
    // Mock 回退
    const userMsgs = params.messages.filter((m) => m.role === "user").map((m) => m.content);
    const last = userMsgs[userMsgs.length - 1] ?? "";
    const content = `[Mock AI 回复（未配置 OPENAI_API_KEY，使用本地模拟）]\n\n你说的是：「${last.slice(0, 200)}」\n\n这里是一段模拟的 AI 回复内容。在生产环境配置 OPENAI_API_KEY 后，会调用真实大模型接口。`;
    return {
      content,
      inputTokens: [...last].length,
      outputTokens: [...content].length,
      model: "mock-echo",
    };
  }

  const resp = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: params.messages,
      stream: false,
    }),
    signal: params.signal,
  });

  if (!resp.ok) {
    const errText = await resp.text().catch(() => "");
    throw new Error(`AI API error ${resp.status}: ${errText.slice(0, 300)}`);
  }

  const data = (await resp.json()) as {
    choices: { message: { content: string } }[];
    usage?: { prompt_tokens?: number; completion_tokens?: number };
    model?: string;
  };

  const content = data.choices?.[0]?.message?.content ?? "";
  const inputTokens = data.usage?.prompt_tokens ?? 0;
  const outputTokens = data.usage?.completion_tokens ?? 0;

  return { content, inputTokens, outputTokens, model: data.model ?? model };
}

/**
 * 流式聊天：async generator，逐个 yield ChatStreamYield
 *
 * - 配了 OPENAI_API_KEY → 真实 OpenAI stream（SSE 协议，解析 data: 行）
 * - 没配 → mock 按词切块流式发送，模拟打字机效果
 *
 * 用法：
 *   for await (const chunk of createChatCompletionStream({...})) {
 *     if (chunk.type === "delta") sendToClient(chunk.content);
 *     if (chunk.type === "done") finalize(chunk.inputTokens, chunk.outputTokens);
 *     if (chunk.type === "error") handleError(chunk.message);
 *   }
 */
export async function* createChatCompletionStream(params: {
  messages: ChatMessage[];
  model?: string;
  signal?: AbortSignal;
}): AsyncGenerator<ChatStreamYield, void, unknown> {
  const apiKey = process.env.OPENAI_API_KEY;
  const baseUrl = process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1";
  const model = params.model ?? process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  // ===== Mock 流式：按词切块，模拟打字机 =====
  if (shouldUseMock()) {
    const userMsgs = params.messages.filter((m) => m.role === "user").map((m) => m.content);
    const last = userMsgs[userMsgs.length - 1] ?? "";
    const fullContent = `[Mock AI 流式回复（未配置 OPENAI_API_KEY）]

你说的是：「${last.slice(0, 200)}」

这是一段模拟的 AI 流式回复。生产环境配置 OPENAI_API_KEY 后会调用真实大模型。当前模式下按词切块发送，方便测试 SSE 渲染效果（打字机动画）。`;

    // 按空格/换行切词，每块 4-6 字符
    const tokens = fullContent.match(/\S+\s*|\s+/g) ?? [fullContent];
    let outputTokens = 0;
    for (const tok of tokens) {
      // 模拟网络延迟（30-80ms）
      await new Promise((r) => setTimeout(r, 30 + Math.random() * 50));
      outputTokens += [...tok].length;
      yield { type: "delta", content: tok };
    }
    yield { type: "done", inputTokens: [...last].length, outputTokens, model: "mock-echo" };
    return;
  }

  // ===== 真实流式（OpenAI 兼容，含智谱 AI） =====
  let resp: Response;
  try {
    const body: Record<string, unknown> = {
      model,
      messages: params.messages,
      stream: true,
      max_tokens: 4096,
    };
    // 注：智谱等部分厂商不支持 stream_options.include_usage，
    // 因此默认不发送；若调用方显式开启，可以通过环境变量控制。
    if (process.env.AI_STREAM_USAGE === "1") {
      body.stream_options = { include_usage: true };
    }
    resp = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal: params.signal,
    });
  } catch (err) {
    yield { type: "error", message: err instanceof Error ? err.message : "网络请求失败" };
    return;
  }

  if (!resp.ok) {
    const errText = await resp.text().catch(() => "");
    yield { type: "error", message: `AI API error ${resp.status}: ${errText.slice(0, 300)}` };
    return;
  }

  if (!resp.body) {
    yield { type: "error", message: "AI API 返回空 body" };
    return;
  }

  // 解析 SSE：兼容 \n\n 和 \r\n\r\n 两种分隔符
  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  let inputTokens = 0;
  let outputTokens = 0;
  let actualModel = model;
  // 兼容部分厂商（如智谱）每个 chunk 给完整 message.content 的模式：
  // 用 lastEmittedContent 记录已发送的前缀，yield 差分（新增尾部）
  let lastEmittedContent = "";

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });

      // 同时匹配 \r\n\r\n 和 \n\n，优先处理 \r\n\r\n
      let idx: number;
      while ((idx = findSseBoundary(buf)) >= 0) {
        const sepLen = buf.startsWith("\r\n\r\n", idx) ? 4 : 2;
        const block = buf.slice(0, idx);
        buf = buf.slice(idx + sepLen);

        // block 内多行，取 "data:" 行，兼容 \r\n 行结束
        const lines = block.split(/\r?\n/);
        for (const rawLine of lines) {
          const line = rawLine.trim();
          if (!line.startsWith("data:")) continue;
          const payload = line.slice(5).trim();
          if (payload === "[DONE]") {
            yield { type: "done", inputTokens, outputTokens, model: actualModel };
            return;
          }
          try {
            const evt = JSON.parse(payload) as {
              choices?: {
                delta?: { content?: string | null; reasoning_content?: string | null };
                message?: { content?: string | null };
                finish_reason?: string | null;
              }[];
              usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
              model?: string;
            };
            if (evt.model) actualModel = evt.model;
            if (evt.usage?.prompt_tokens) inputTokens = evt.usage.prompt_tokens;
            if (evt.usage?.completion_tokens) outputTokens = evt.usage.completion_tokens;

            // 兼容：优先 delta.content（增量），回退 message.content（完整内容）
            const deltaContent = evt.choices?.[0]?.delta?.content;
            const messageContent = evt.choices?.[0]?.message?.content;
            const rawContent: string | undefined =
              deltaContent ?? messageContent ?? undefined;

            if (rawContent) {
              // 如果前面已经发过内容且 rawContent 是完整前缀模式，
              // 则取 rawContent 去除已发送前缀的部分作为增量
              if (lastEmittedContent && rawContent.startsWith(lastEmittedContent)) {
                const inc = rawContent.slice(lastEmittedContent.length);
                if (inc) {
                  outputTokens += [...inc].length; // fallback 估算
                  yield { type: "delta", content: inc };
                  lastEmittedContent = rawContent;
                }
              } else {
                // 纯增量模式或首个 chunk，直接 yield rawContent
                outputTokens += [...rawContent].length; // fallback 估算
                yield { type: "delta", content: rawContent };
                lastEmittedContent =
                  messageContent !== undefined ? rawContent : lastEmittedContent + rawContent;
              }
            }
            // reasoning_content（部分模型的思考过程）忽略，不计入可见输出
          } catch {
            // 单行解析失败跳过，不影响后续
          }
        }
      }
    }
    // 流自然结束（没收到 [DONE]）：也算成功
    yield { type: "done", inputTokens, outputTokens, model: actualModel };
  } catch (err) {
    yield { type: "error", message: err instanceof Error ? err.message : "流读取失败" };
  }
}

