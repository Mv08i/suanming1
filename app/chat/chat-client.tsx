"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useT } from "../i18n/context";

type Role = "user" | "assistant";

interface Msg {
  id: string;
  role: Role;
  content: string;
  creditsCharged?: number;
  newBalance?: number;
  error?: string;
  streaming?: boolean; // 正在流式接收中
  model?: string;
}

interface MetaEvent {
  requestId: string;
  model: string;
  creditsCharged: number;
  newBalance: number;
}
interface DeltaEvent { content: string; }
interface DoneEvent {
  inputTokens: number;
  outputTokens: number;
  newBalance: number;
  model: string;
  requestId: string;
}
interface ErrorEvent { error: string; }

export default function ChatClientPage() {
  const t = useT();
  const { locale } = useLocale();
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: "welcome",
      role: "assistant",
      content: t("chat.welcome"),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/user/balance", { credentials: "include" });
        if (r.ok) {
          const d = await r.json();
          setBalance(d.balance ?? 0);
        }
      } catch {}
    })();
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  /** 解析 SSE 流：返回从 buffer 中解析出的事件列表，并返回剩余未解析的 buffer */
  function parseSseBuffer(buf: string): { events: { event: string; data: string }[]; rest: string } {
    const events: { event: string; data: string }[] = [];
    let rest = buf;
    let idx: number;
    while ((idx = rest.indexOf("\n\n")) >= 0) {
      const block = rest.slice(0, idx);
      rest = rest.slice(idx + 2);
      let event = "message";
      const dataLines: string[] = [];
      for (const line of block.split("\n")) {
        if (line.startsWith("event:")) event = line.slice(6).trim();
        else if (line.startsWith("data:")) dataLines.push(line.slice(5).trim());
      }
      if (dataLines.length > 0) {
        events.push({ event, data: dataLines.join("\n") });
      }
    }
    return { events, rest };
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Msg = { id: "u-" + Date.now(), role: "user", content: text };
    const asstId = "a-" + (Date.now() + 1);
    const pending: Msg = { id: asstId, role: "assistant", content: "", streaming: true };

    setMessages((m) => [...m, userMsg, pending]);
    setInput("");
    setLoading(true);

    const ac = new AbortController();
    abortRef.current = ac;

    try {
      const resp = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          locale,
          messages: [
            ...messages
              .filter((m) => m.role !== "assistant" || !m.error)
              .slice(-5)
              .map(({ role, content }) => ({ role, content })),
            { role: "user", content: text },
          ],
        }),
        signal: ac.signal,
      });

      // 非 200 响应：JSON 错误（扣费失败/未登录/参数错误）
      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        setMessages((m) =>
          m.map((x) =>
            x.id === asstId
              ? { ...x, streaming: false, error: errData?.error ?? `${t("chat.errorRequestFailed")} (HTTP ${resp.status})` }
              : x,
          ),
        );
        return;
      }

      // SSE 流式：读 body
      const reader = resp.body?.getReader();
      if (!reader) {
        setMessages((m) =>
          m.map((x) => (x.id === asstId ? { ...x, streaming: false, error: t("chat.errorStream") } : x)),
        );
        return;
      }

      const decoder = new TextDecoder();
      let buf = "";
      let gotDone = false;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });

        const { events, rest } = parseSseBuffer(buf);
        buf = rest;

        for (const ev of events) {
          if (ev.data === "[DONE]") {
            gotDone = true;
            setMessages((m) =>
              m.map((x) => (x.id === asstId ? { ...x, streaming: false } : x)),
            );
            break;
          }

          let parsed: unknown;
          try {
            parsed = JSON.parse(ev.data);
          } catch {
            continue;
          }

          if (ev.event === "meta") {
            const d = parsed as MetaEvent;
            setMessages((m) =>
              m.map((x) =>
                x.id === asstId
                  ? { ...x, model: d.model, creditsCharged: d.creditsCharged, newBalance: d.newBalance }
                  : x,
              ),
            );
            setBalance(d.newBalance);
          } else if (ev.event === "delta") {
            const d = parsed as DeltaEvent;
            setMessages((m) =>
              m.map((x) => (x.id === asstId ? { ...x, content: x.content + d.content } : x)),
            );
          } else if (ev.event === "done") {
            const d = parsed as DoneEvent;
            setMessages((m) =>
              m.map((x) =>
                x.id === asstId
                  ? { ...x, streaming: false, model: d.model, newBalance: d.newBalance }
                  : x,
              ),
            );
            setBalance(d.newBalance);
          } else if (ev.event === "error") {
            const d = parsed as ErrorEvent;
            setMessages((m) =>
              m.map((x) =>
                x.id === asstId
                  ? { ...x, streaming: false, error: d.error, newBalance: undefined }
                  : x,
              ),
            );
          }
        }
        if (gotDone) break;
      }

      // 流自然结束但没收到 [DONE]：兜底关闭 streaming
      setMessages((m) => m.map((x) => (x.id === asstId ? { ...x, streaming: false } : x)));
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setMessages((m) =>
          m.map((x) => (x.id === asstId ? { ...x, streaming: false, error: t("chat.errorCancelled") } : x)),
        );
      } else {
        const msg = err instanceof Error ? err.message : t("chat.errorNetwork");
        setMessages((m) =>
          m.map((x) => (x.id === asstId ? { ...x, streaming: false, error: `${t("chat.errorNetwork")}: ${msg}` } : x)),
        );
      }
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }

  function stopStreaming() {
    abortRef.current?.abort();
  }

  return (
    <div
      className="chat-container"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 72px)",
        maxHeight: "calc(100vh - 72px)",
      }}
    >
      <div
        className="chat-topbar"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 8,
          borderBottom: "1px solid #e5e7eb",
          padding: "8px 0",
          marginBottom: 8,
        }}
      >
        <div style={{ fontSize: 14, color: "#6b7280" }}>
          {t("chat.costHint")}
        </div>
        <div style={{ fontSize: 14 }}>
          {t("chat.balanceLabel")}
          <strong style={{ fontSize: 18, color: balance === null ? "#9ca3af" : "#111827" }}>
            {balance === null ? t("chat.loading") : balance}
          </strong>{" "}
          {t("common.credits")}
        </div>
      </div>

      <div
        ref={listRef}
        className="chat-list"
        style={{
          flex: 1,
          overflowY: "auto",
          border: "1px solid #e5e7eb",
          borderRadius: 8,
          padding: 12,
          marginBottom: 12,
        }}
      >
        {messages.map((m) => (
          <div
            key={m.id}
            style={{
              display: "flex",
              justifyContent: m.role === "user" ? "flex-end" : "flex-start",
              marginBottom: 12,
            }}
          >
            <div
              className="chat-bubble"
              style={{
                maxWidth: "70%",
                padding: "10px 14px",
                borderRadius: 12,
                background: m.role === "user" ? "#2563eb" : "#f3f4f6",
                color: m.role === "user" ? "white" : "#111827",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {m.error ? (
                <span style={{ color: "#dc2626" }}>❌ {m.error}</span>
              ) : (
                <>
                  {m.content}
                  {m.streaming && (m.content === "" ? (
                    <span style={{ opacity: 0.6 }}>{t("chat.thinking")}</span>
                  ) : (
                    <span
                      style={{
                        display: "inline-block",
                        width: 8,
                        height: 14,
                        marginLeft: 2,
                        background: m.role === "user" ? "#fff" : "#2563eb",
                        animation: "blink 1s steps(2) infinite",
                        verticalAlign: "text-bottom",
                      }}
                    />
                  ))}
                </>
              )}
              {m.creditsCharged !== undefined && !m.error && (
                <div
                  style={{
                    marginTop: 6,
                    fontSize: 11,
                    color: m.role === "user" ? "#dbeafe" : "#6b7280",
                  }}
                >
                  {t("chat.costThis")} {m.creditsCharged} {t("common.credits")}
                  {typeof m.newBalance === "number" && ` · ${t("chat.balanceWord")} ${m.newBalance}`}
                  {m.model && ` · ${m.model}`}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="chat-input-area" style={{ display: "flex", gap: 8 }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder={t("chat.inputPlaceholder")}
          disabled={loading}
          style={{
            flex: 1,
            resize: "none",
            height: 64,
            padding: 10,
            borderRadius: 8,
            border: "1px solid #d1d5db",
            fontSize: 14,
            fontFamily: "inherit",
          }}
        />
        {loading ? (
          <button
            onClick={stopStreaming}
            style={{
              alignSelf: "flex-end",
              height: 64,
              padding: "0 20px",
              borderRadius: 8,
              background: "#dc2626",
              color: "white",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              border: "none",
            }}
          >
            {t("chat.stop")}
          </button>
        ) : (
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            style={{
              alignSelf: "flex-end",
              height: 64,
              padding: "0 20px",
              borderRadius: 8,
              background: "#2563eb",
              color: "white",
              fontSize: 14,
              fontWeight: 600,
              cursor: input.trim() ? "pointer" : "not-allowed",
              opacity: input.trim() ? 1 : 0.6,
              border: "none",
            }}
          >
            {t("chat.btnSend")}
          </button>
        )}
      </div>

      <style>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
