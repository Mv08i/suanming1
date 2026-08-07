"use client";

import { useCallback, useRef, useState } from "react";
import { useLocale } from "../i18n/context";

// SSE 事件类型（与 /api/divine/interpret 和 /api/ai/chat 一致）
export interface MetaEvent {
  requestId: string;
  model: string;
  creditsCharged: number;
  newBalance: number;
}
export interface DoneEvent {
  inputTokens: number;
  outputTokens: number;
  newBalance: number;
  model: string;
  requestId: string;
}

interface SseEvent {
  event: string;
  data: string;
}

function parseSseBuffer(buf: string): { events: SseEvent[]; rest: string } {
  const events: SseEvent[] = [];
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

export interface InterpretState {
  content: string;
  meta: MetaEvent | null;
  done: DoneEvent | null;
  error: string | null;
  loading: boolean;
}

export function useSseInterpret() {
  const { locale, t } = useLocale();
  const [state, setState] = useState<InterpretState>({
    content: "",
    meta: null,
    done: null,
    error: null,
    loading: false,
  });
  const abortRef = useRef<AbortController | null>(null);

  const run = useCallback(async (body: unknown, onSettled?: () => void) => {
    setState({ content: "", meta: null, done: null, error: null, loading: true });
    const ac = new AbortController();
    abortRef.current = ac;

    try {
      // 注入当前 locale，让 AI 用对应语言解卦
      const bodyWithLocale = { ...(body as object), locale };
      const resp = await fetch("/api/divine/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(bodyWithLocale),
        signal: ac.signal,
      });

      if (resp.status === 401) {
        window.location.href = "/login";
        return;
      }
      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        setState({
          content: "",
          meta: null,
          done: null,
          error: errData?.error ?? `${t("chat.errorRequestFailed")} (HTTP ${resp.status})`,
          loading: false,
        });
        onSettled?.();
        return;
      }

      const reader = resp.body?.getReader();
      if (!reader) {
        setState((s) => ({ ...s, error: t("chat.errorStream"), loading: false }));
        onSettled?.();
        return;
      }

      const decoder = new TextDecoder();
      let buf = "";
      while (true) {
        const { value, done: rdone } = await reader.read();
        if (rdone) break;
        buf += decoder.decode(value, { stream: true });
        const { events, rest } = parseSseBuffer(buf);
        buf = rest;

        for (const ev of events) {
          if (ev.data === "[DONE]") {
            setState((s) => ({ ...s, loading: false }));
            onSettled?.();
            return;
          }
          let parsed: Record<string, unknown>;
          try {
            parsed = JSON.parse(ev.data);
          } catch {
            continue;
          }
          if (ev.event === "meta") {
            setState((s) => ({ ...s, meta: parsed as unknown as MetaEvent }));
          } else if (ev.event === "delta") {
            const c = (parsed as { content: string }).content;
            setState((s) => ({ ...s, content: s.content + c }));
          } else if (ev.event === "done") {
            setState((s) => ({ ...s, done: parsed as unknown as DoneEvent, loading: false }));
          } else if (ev.event === "error") {
            setState((s) => ({
              ...s,
              error: (parsed as { error: string }).error,
              loading: false,
            }));
          }
        }
      }
      setState((s) => ({ ...s, loading: false }));
      onSettled?.();
    } catch (e) {
      const msg =
        e instanceof DOMException && e.name === "AbortError"
          ? t("chat.errorCancelled")
          : e instanceof Error
            ? e.message
            : t("chat.errorNetwork");
      setState((s) => ({ ...s, error: msg, loading: false }));
      onSettled?.();
    } finally {
      abortRef.current = null;
    }
  }, [locale, t]);

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const reset = useCallback(() => {
    setState({ content: "", meta: null, done: null, error: null, loading: false });
  }, []);

  return { state, run, stop, reset };
}
