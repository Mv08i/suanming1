"use client";

import { useState } from "react";
import { useSseInterpret } from "../useSseInterpret";
import { useT } from "../../i18n/context";
import InterpretPanel from "../interpret-panel";
import type { QiMenCast } from "@/lib/divine/types";
import {
  h2Style,
  hintStyle,
  inputStyle,
  cardStyle,
  btnPrimary,
  errorStyle,
  tdStyle,
} from "../styles";

export default function QiMenClient() {
  const t = useT();
  const [cast, setCast] = useState<QiMenCast | null>(null);
  const [castError, setCastError] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const interp = useSseInterpret();

  function reset() {
    setCast(null);
    setCastError(null);
    interp.reset();
  }

  async function performCast() {
    setCast(null);
    setCastError(null);
    interp.reset();
    const body = { type: "QIMEN" as const, question: question.trim() || undefined };
    try {
      const r = await fetch("/api/divine/cast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const d = await r.json();
      if (r.status === 401) {
        window.location.href = "/login";
        return;
      }
      if (!r.ok) {
        setCastError(d?.error ?? `${t("qimen.castFailed")} (HTTP ${r.status})`);
        return;
      }
      setCast(d.cast as QiMenCast);
    } catch (e) {
      setCastError(e instanceof Error ? e.message : t("qimen.castRequestFailed"));
    }
  }

  function startInterpret() {
    interp.run({ type: "QIMEN", question: question.trim() || undefined });
  }

  const isZh = t("common.brand") === "卜微";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h2 style={h2Style}>{t("divine.qimen.title")}</h2>
        <p style={hintStyle}>
          {t("qimen.hint")}
          <br />
          <span style={{ color: "#a52a2a" }}>
            {isZh ? "注：本站为简化体验版，未严格按置闰定局排正经九宫盘。" : "Note: simplified edition; the strict Nine-Palace chart is not fully arranged."}
          </span>
        </p>
      </div>

      <input
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder={isZh ? "所问之事（可选，如：问某事可否行之）" : "Your question (optional)"}
        style={inputStyle}
      />

      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={performCast} style={btnPrimary}>
          {t("qimen.btnCast")}
        </button>
        {cast && (
          <button onClick={reset} style={{ ...btnPrimary, background: "transparent", border: "1px solid #3a2a1f", color: "#bfae95" }}>
            {t("liuyao.btnReset")}
          </button>
        )}
      </div>

      {castError && <div style={errorStyle}>❌ {castError}</div>}

      {cast && <QiMenDisplay cast={cast} t={t} isZh={isZh} />}

      <InterpretPanel
        interp={interp}
        onStart={startInterpret}
        ready={!!cast}
        title={isZh ? "AI 解盘" : "AI Reading"}
      />
    </div>
  );
}

function QiMenDisplay({
  cast,
  t,
  isZh,
}: {
  cast: QiMenCast;
  t: (k: any) => string;
  isZh: boolean;
}) {
  const pillars = [
    { label: isZh ? "年柱" : "Year", value: cast.yearGanZhi },
    { label: isZh ? "月柱" : "Month", value: cast.monthGanZhi },
    { label: isZh ? "日柱" : "Day", value: cast.dayGanZhi },
    { label: isZh ? "时柱" : "Hour", value: cast.hourGanZhi },
  ];

  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 12, color: "#8a7a65" }}>
            {isZh ? "阴阳遁" : "Dun"}
          </div>
          <div style={{ fontSize: 22, color: "#c9a961", letterSpacing: 4 }}>
            {cast.dun === "yang" ? (isZh ? "阳遁" : "Yang-dun") : (isZh ? "阴遁" : "Yin-dun")}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 12, color: "#8a7a65" }}>
            {isZh ? "节气" : "Solar term"}
          </div>
          <div style={{ fontSize: 18, color: "#e8dcc8" }}>{cast.solarTerm}</div>
        </div>
      </div>

      <div style={{ fontSize: 13, color: "#c9a961", marginBottom: 12, padding: "8px 12px", background: "rgba(165,42,42,0.12)", borderRadius: 6, border: "1px solid #5a2a2a" }}>
        {cast.juHint}
      </div>

      <div style={{ fontSize: 12, color: "#8a7a65", marginBottom: 8 }}>
        {cast.lunarBrief} · {isZh ? "时辰序" : "Hour idx"} {cast.hourZhiIndex}
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, marginBottom: 12 }}>
        <tbody>
          <tr>
            {pillars.map((p) => (
              <td key={p.label} style={{ ...tdStyle, textAlign: "center", padding: "8px 4px" }}>
                <div style={{ fontSize: 12, color: "#8a7a65" }}>{p.label}</div>
                <div style={{ color: "#c9a961", fontSize: 18, letterSpacing: 2 }}>{p.value}</div>
              </td>
            ))}
          </tr>
        </tbody>
      </table>

      <div style={{ fontSize: 12, color: "#8a7a65", lineHeight: 1.8 }}>
        {isZh ? "起盘时刻：" : "Chart time: "}{cast.solarTime}
      </div>
    </div>
  );
}
