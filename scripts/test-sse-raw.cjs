/**
 * 直接调用智谱 API 并打印原始 SSE chunk，用于排查流式解析问题。
 * 用法: node scripts/test-sse-raw.cjs
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const apiKey = process.env.OPENAI_API_KEY;
const baseUrl = process.env.OPENAI_BASE_URL || "https://open.bigmodel.cn/api/paas/v4";
const model = process.env.OPENAI_MODEL || "glm-4-flash";

console.log("=== 配置 ===");
console.log("Base URL:", baseUrl);
console.log("Model:", model);
console.log("API Key:", apiKey ? apiKey.slice(0, 8) + "..." : "(missing)");
console.log("");

async function main() {
  const resp = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: "你是一个算命先生，请用中文回答。" },
        { role: "user", content: "今天运势如何？请用100字回答。" },
      ],
      stream: true,
      max_tokens: 4096,
    }),
  });

  console.log("=== HTTP 响应 ===");
  console.log("Status:", resp.status, resp.statusText);
  console.log("Content-Type:", resp.headers.get("content-type"));
  console.log("");

  if (!resp.ok) {
    const text = await resp.text();
    console.error("错误响应:", text);
    process.exit(1);
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let chunkCount = 0;
  let totalDeltaChars = 0;
  let allContent = "";

  console.log("=== 原始 SSE Chunk（前 20 个）===\n");

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    const text = decoder.decode(value, { stream: true });
    chunkCount++;

    if (chunkCount <= 20) {
      console.log(`--- Chunk #${chunkCount} (${text.length} bytes) ---`);
      console.log(JSON.stringify(text));
      console.log("");
    }

    // 解析每个 data: 行
    const lines = text.split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const payload = trimmed.slice(5).trim();
      if (payload === "[DONE]") {
        console.log("\n=== [DONE] 收到 ===");
        continue;
      }
      try {
        const evt = JSON.parse(payload);
        const delta = evt.choices?.[0]?.delta?.content;
        const message = evt.choices?.[0]?.message?.content;
        if (delta) {
          totalDeltaChars += delta.length;
          allContent += delta;
        }
        if (message && !delta) {
          console.log("  ⚠️ message.content 模式:", JSON.stringify(message).slice(0, 100));
        }
        if (chunkCount <= 20) {
          console.log("  delta:", JSON.stringify(delta), "message:", JSON.stringify(message)?.slice(0, 60));
        }
      } catch {}
    }
  }

  console.log("\n=== 汇总 ===");
  console.log("总 Chunk 数:", chunkCount);
  console.log("总 delta 字符数:", totalDeltaChars);
  console.log("拼接内容:", allContent.slice(0, 200));
}

main().catch((e) => {
  console.error("FATAL:", e);
  process.exit(1);
});