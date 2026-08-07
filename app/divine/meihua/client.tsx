"use client";

import { useState } from "react";
import { useSseInterpret } from "../useSseInterpret";
import { useT } from "../../i18n/context";
import InterpretPanel from "../interpret-panel";
import type { MeihuaCast } from "@/lib/divine/types";
import type { DictKey } from "../../i18n/dictionaries";
import {
  h2Style,
  hintStyle,
  inputStyle,
  cardStyle,
  tabStyle,
  tabActive,
  resetBtnStyle,
  btnPrimary,
  tdStyle,
  errorStyle,
} from "../styles";

const YAO_KEYS = ["yao.1", "yao.2", "yao.3", "yao.4", "yao.5", "yao.6"] as const;

// 爻象渲染：0=阴 ▬ ▬  1=阳 ▬▬，动爻标红
function linesRows(
  lines: (0 | 1)[],
  movingLine: number | undefined,
  t: (k: DictKey) => string,
) {
  return lines
    .slice()
    .reverse()
    .map((b, i) => {
      const pos = lines.length - i;
      const isMoving = movingLine === pos;
      return (
        <div key={pos} style={{ display: "flex", gap: 8, alignItems: "center", padding: "2px 0" }}>
          <span style={{ width: 28, color: "#8a7a65", fontSize: 12 }}>
            {t(YAO_KEYS[pos - 1])}{t("yao.suffix")}
          </span>
          <span style={{ color: isMoving ? "#c0392b" : "#e8dcc8", letterSpacing: 2, fontSize: 15 }}>
            {b ? "▬▬▬" : "▬ ▬"}
          </span>
          {isMoving && <span style={{ color: "#c0392b", fontSize: 12 }}>{t("gua.movingMark")}</span>}
        </div>
      );
    });
}

export default function MeihuaClient() {
  const t = useT();
  const yaoName = (i: number) => `${t(YAO_KEYS[i])}${t("yao.suffix")}`;
  const [mode, setMode] = useState<"time" | "number">("time");
  const [number, setNumber] = useState("");
  const [cast, setCast] = useState<MeihuaCast | null>(null);
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
    const body: Record<string, unknown> = { type: "MEIHUA", method: mode, question: question.trim() || undefined };
    if (mode === "number") {
      const n = parseInt(number, 10);
      if (!n || n <= 0) {
        setCastError(t("meihua.numberInvalid"));
        return;
      }
      body.number = n;
    }
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
        setCastError(d?.error ?? `${t("liuyao.castFailed")} (HTTP ${r.status})`);
        return;
      }
      setCast(d.cast as MeihuaCast);
    } catch (e) {
      setCastError(e instanceof Error ? e.message : t("liuyao.castRequestFailed"));
    }
  }

  function startInterpret() {
    const body: Record<string, unknown> = { type: "MEIHUA", method: mode, question: question.trim() || undefined };
    if (mode === "number") {
      const n = parseInt(number, 10);
      if (!n || n <= 0) return;
      body.number = n;
    }
    interp.run(body);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h2 style={h2Style}>{t("meihua.heading")}</h2>
        <p style={hintStyle}>{t("meihua.hint")}</p>
      </div>

      <input
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder={t("liuyao.questionPlaceholder")}
        style={inputStyle}
      />

      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => setMode("time")} style={mode === "time" ? tabActive : tabStyle}>
          {t("meihua.tabTime")}
        </button>
        <button onClick={() => setMode("number")} style={mode === "number" ? tabActive : tabStyle}>
          {t("meihua.tabNumber")}
        </button>
        <button onClick={reset} style={resetBtnStyle}>
          {t("liuyao.btnReset")}
        </button>
      </div>

      {mode === "number" && (
        <div style={cardStyle}>
          <div style={{ fontSize: 13, color: "#8a7a65", marginBottom: 8 }}>
            {t("meihua.numberPlaceholder")}
          </div>
          <input
            value={number}
            onChange={(e) => setNumber(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="38"
            style={inputStyle}
            inputMode="numeric"
          />
        </div>
      )}

      {mode === "time" && (
        <div style={{ fontSize: 13, color: "#8a7a65", padding: "8px 12px", background: "rgba(42,31,24,0.3)", borderRadius: 6 }}>
          {t("meihua.hint")}
        </div>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={performCast} style={btnPrimary}>
          {t("meihua.btnCast")}
        </button>
      </div>

      {castError && <div style={errorStyle}>❌ {castError}</div>}

      {cast && <MeihuaDisplay cast={cast} t={t} yaoName={yaoName} />}

      <InterpretPanel interp={interp} onStart={startInterpret} ready={!!cast} />
    </div>
  );
}

function MeihuaDisplay({
  cast,
  t,
  yaoName,
}: {
  cast: MeihuaCast;
  t: (k: DictKey) => string;
  yaoName: (i: number) => string;
}) {
  const isZh = t("common.brand") === "卜微";
  const upperLabel = isZh ? "上卦" : "Upper";
  const lowerLabel = isZh ? "下卦" : "Lower";
  const mutualLabel = isZh ? "互卦" : "Mutual";
  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 12, color: "#8a7a65" }}>{t("gua.primary")}</div>
          <div style={{ fontSize: 22, color: "#c9a961", letterSpacing: 4 }}>{cast.primary.name}</div>
        </div>
        <div>
          <div style={{ fontSize: 12, color: "#8a7a65" }}>{mutualLabel}</div>
          <div style={{ fontSize: 22, color: "#c9a961", letterSpacing: 4 }}>{cast.mutual.name}</div>
        </div>
        <div>
          <div style={{ fontSize: 12, color: "#8a7a65" }}>{t("gua.changed")}</div>
          <div style={{ fontSize: 22, color: "#c9a961", letterSpacing: 4 }}>{cast.changed.name}</div>
        </div>
        <div>
          <div style={{ fontSize: 12, color: "#8a7a65" }}>{t("gua.moving")}</div>
          <div style={{ fontSize: 18, color: "#c0392b" }}>{yaoName(cast.movingLine - 1)}</div>
        </div>
      </div>

      <div style={{ fontSize: 12, color: "#8a7a65", marginBottom: 12 }}>
        {cast.lunarBrief} · {cast.dayGanZhi}{t("gua.daySuffix")} · {cast.solarTerm ?? ""}
        <br />
        {cast.method === "time" ? t("meihua.tabTime") : t("meihua.tabNumber")} · {upperLabel} {cast.upperTrigram}({cast.upperElement}) {lowerLabel} {cast.lowerTrigram}({cast.lowerElement})
      </div>

      <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 12, color: "#8a7a65", marginBottom: 4 }}>{t("gua.primary")}</div>
          {linesRows(cast.primary.lines, cast.movingLine, t)}
        </div>
        <div>
          <div style={{ fontSize: 12, color: "#8a7a65", marginBottom: 4 }}>{mutualLabel}</div>
          {linesRows(cast.mutual.lines, undefined, t)}
        </div>
        <div>
          <div style={{ fontSize: 12, color: "#8a7a65", marginBottom: 4 }}>{t("gua.changed")}</div>
          {linesRows(cast.changed.lines, undefined, t)}
        </div>
      </div>

      <div style={{ marginTop: 16, padding: 12, background: "rgba(165,42,42,0.12)", borderRadius: 6, border: "1px solid #5a2a2a" }}>
        <div style={{ fontSize: 14, color: "#c9a961", marginBottom: 6 }}>
          {isZh ? "体用分析" : "Ti-Yong Analysis"}
        </div>
        <table style={{ fontSize: 13, borderCollapse: "collapse" }}>
          <tbody>
            <tr>
              <td style={tdStyle}>{isZh ? "体卦" : "Ti"}</td>
              <td style={{ ...tdStyle, color: "#c9a961" }}>
                {cast.tiYong.ti === "upper" ? upperLabel : lowerLabel} · {cast.tiYong.tiElement}
              </td>
              <td style={tdStyle}>{isZh ? "用卦" : "Yong"}</td>
              <td style={{ ...tdStyle, color: "#c9a961" }}>
                {cast.tiYong.yong === "upper" ? upperLabel : lowerLabel} · {cast.tiYong.yongElement}
              </td>
            </tr>
            <tr>
              <td style={tdStyle}>{isZh ? "关系" : "Relation"}</td>
              <td style={tdStyle} colSpan={3}>
                {cast.tiYong.relation}
              </td>
            </tr>
            <tr>
              <td style={tdStyle}>{isZh ? "断语" : "Verdict"}</td>
              <td style={{ ...tdStyle, color: "#c0392b" }} colSpan={3}>
                {cast.tiYong.verdict}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
