"use client";

import { useT } from "../i18n/context";
import type { useSseInterpret } from "./useSseInterpret";
import { cardStyle, btnPrimary, btnDanger, errorStyle, cursorStyle, h3Style } from "./styles";

type Interp = ReturnType<typeof useSseInterpret>;

interface Props {
  interp: Interp;
  onStart: () => void;
  /** 是否已起卦（用于决定是否渲染面板） */
  ready: boolean;
  title?: string;
}

/**
 * AI 解卦面板（梅花/奇门/六爻通用）
 * 复用 useSseInterpret 的 state，统一渲染 meta/delta/done/error 与停止按钮。
 */
export default function InterpretPanel({ interp, onStart, ready, title }: Props) {
  const t = useT();
  if (!ready) return null;
  const { state } = interp;
  const heading = title ?? t("interp.title");

  return (
    <div style={cardStyle}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <h3 style={{ ...h3Style, margin: 0 }}>{heading}</h3>
        {state.loading ? (
          <button onClick={interp.stop} style={btnDanger}>
            {t("interp.btnStop")}
          </button>
        ) : (
          <button onClick={onStart} disabled={state.loading} style={btnPrimary}>
            {state.content ? t("interp.btnRestart") : t("interp.btnStart")}
          </button>
        )}
      </div>

      {state.meta && (
        <div style={{ fontSize: 12, color: "#8a7a65", marginBottom: 8 }}>
          {t("interp.meta", {
            model: state.meta.model,
            credits: state.meta.creditsCharged,
            balance: state.meta.newBalance,
          })}
        </div>
      )}

      {state.content && (
        <div
          style={{
            whiteSpace: "pre-wrap",
            lineHeight: 1.8,
            color: "#e8dcc8",
            padding: 12,
            background: "rgba(0,0,0,0.25)",
            borderRadius: 6,
            border: "1px solid #3a2a1f",
          }}
        >
          {state.content}
          {state.loading && <span style={cursorStyle}>▍</span>}
        </div>
      )}

      {state.error && <div style={errorStyle}>❌ {state.error}</div>}

      {state.done && (
        <div style={{ fontSize: 12, color: "#8a7a65", marginTop: 8 }}>
          {t("interp.doneMeta", {
            in: state.done.inputTokens,
            out: state.done.outputTokens,
            balance: state.done.newBalance,
          })}
        </div>
      )}
    </div>
  );
}
