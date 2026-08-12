"use client";

import { useState } from "react";
import { useSseInterpret } from "../useSseInterpret";
import { useT } from "../../i18n/context";
import { useLocale } from "../../i18n/context";
import InterpretPanel from "../interpret-panel";
import type { LiuYaoCast } from "@/lib/divine/types";

// ===== 铜钱和值 → 三枚铜钱显示 =====
// 和值 6=老阴(3字) 7=少阳(2字1背) 8=少阴(1字2背) 9=老阳(3背)
function sumToCoins(sum: number): number[] {
  const yangCount = sum - 6; // 0..3 阳背数
  // 返回 3 枚，1=背(阳) 0=字(阴)
  return [0, 1, 2].map((i) => (i < yangCount ? 1 : 0));
}

function shakeCoins(): number {
  let s = 0;
  for (let i = 0; i < 3; i++) s += Math.random() < 0.5 ? 2 : 3;
  return s; // 6,7,8,9
}

// 手动选卦：每爻 {yinYang:0阴1阳, moving:boolean} → coinSum
function manualToSum(yinYang: 0 | 1, moving: boolean): number {
  if (yinYang === 1) return moving ? 9 : 7; // 阳：动=老阳9, 不动=少阳7
  return moving ? 6 : 8; // 阴：动=老阴6, 不动=少阴8
}

const YAO_KEYS = ["yao.1", "yao.2", "yao.3", "yao.4", "yao.5", "yao.6"] as const;

export default function LiuYaoClient() {
  const t = useT();
  const { locale } = useLocale();
  const yaoName = (i: number) => `${t(YAO_KEYS[i])}${t("yao.suffix")}`;
  const [mode, setMode] = useState<"shake" | "manual">("shake");
  // 摇铜钱模式
  const [shaken, setShaken] = useState<number[]>([]); // 已摇的和值
  const [shaking, setShaking] = useState(false);
  // 手动选卦模式
  const [manual, setManual] = useState<{ yinYang: 0 | 1; moving: boolean }[]>(
    Array.from({ length: 6 }, () => ({ yinYang: 1, moving: false })),
  );
  // 起卦结果
  const [cast, setCast] = useState<LiuYaoCast | null>(null);
  const [castError, setCastError] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  // AI 解卦
  const interp = useSseInterpret();

  const coinSums =
    mode === "shake"
      ? shaken.length === 6
        ? (shaken as [number, number, number, number, number, number])
        : null
      : (manual.map((m) => manualToSum(m.yinYang, m.moving)) as [number, number, number, number, number, number]);

  async function onShake() {
    if (shaking || shaken.length >= 6) return;
    setShaking(true);
    await new Promise((r) => setTimeout(r, 350)); // 动画时长
    const s = shakeCoins();
    setShaken((arr) => [...arr, s]);
    setShaking(false);
  }

  function resetShake() {
    setShaken([]);
    setCast(null);
    setCastError(null);
    interp.reset();
  }

  async function performCast() {
    if (!coinSums) return;
    setCast(null);
    setCastError(null);
    interp.reset();
    try {
      const r = await fetch("/api/divine/cast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ type: "LIUYAO", coinSums, question: question.trim() || undefined }),
      });
      const d = await r.json();
      if (r.status === 401) {
        window.location.href = "/login";
        return;
      }
      if (!r.ok) {
        setCastError(d?.error ?? t("liuyao.castFailed") + ` (HTTP ${r.status})`);
        return;
      }
      setCast(d.cast as LiuYaoCast);
    } catch (e) {
      setCastError(e instanceof Error ? e.message : t("liuyao.castRequestFailed"));
    }
  }

  function startInterpret() {
    if (!coinSums) return;
    interp.run({
      type: "LIUYAO",
      coinSums,
      question: question.trim() || undefined,
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h2 style={h2Style}>{t("liuyao.heading")}</h2>
        <p style={hintStyle}>{t("liuyao.hint")}</p>
      </div>

      {/* 所问之事 */}
      <input
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder={t("liuyao.questionPlaceholder")}
        style={inputStyle}
      />

      {/* 模式切换 */}
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => setMode("shake")} style={mode === "shake" ? tabActive : tabStyle}>
          {t("liuyao.tabShake")}
        </button>
        <button onClick={() => setMode("manual")} style={mode === "manual" ? tabActive : tabStyle}>
          {t("liuyao.tabManual")}
        </button>
        {(mode === "shake" ? shaken.length > 0 : true) && (
          <button onClick={resetShake} style={resetBtnStyle}>
            {t("liuyao.btnReset")}
          </button>
        )}
      </div>

      {/* 摇铜钱模式 */}
      {mode === "shake" && (
        <div style={cardStyle}>
          <div style={{ fontSize: 13, color: "#8a7a65", marginBottom: 8 }}>
            {t("liuyao.shakenCount", { n: shaken.length })}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {Array.from({ length: 6 }).map((_, i) => {
              const sum = shaken[i];
              const idxFromTop = 5 - i; // 上爻在上显示
              return (
                <div key={i} style={yaoRowStyle}>
                  <span style={yaoLabelStyle}>{yaoName(i)}</span>
                  {sum === undefined ? (
                    <span style={{ color: "#5a4a3a" }}>—</span>
                  ) : (
                    <span style={{ display: "flex", gap: 4, alignItems: "center" }}>
                      {sumToCoins(sum).map((c, j) => (
                        <span
                          key={j}
                          style={{
                            display: "inline-block",
                            width: 18,
                            height: 18,
                            borderRadius: "50%",
                            border: "1px solid #c9a961",
                            background: c ? "#c9a961" : "#2a1f18",
                            color: c ? "#1a1410" : "#8a7a65",
                            textAlign: "center",
                            fontSize: 11,
                            lineHeight: "16px",
                            animation: shaking && shaken.length === i ? "coinflip .35s" : undefined,
                          }}
                        >
                          {c ? t("coin.back") : t("coin.face")}
                        </span>
                      ))}
                      <span style={{ marginLeft: 8, color: sum === 6 || sum === 9 ? "#c0392b" : "#bfae95" }}>
                        {sum}（{sum === 6 ? t("coin.oldYin") : sum === 9 ? t("coin.oldYang") : sum === 7 ? t("coin.youngYang") : t("coin.youngYin")}）
                      </span>
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          <button
            onClick={onShake}
            disabled={shaking || shaken.length >= 6}
            style={shaking || shaken.length >= 6 ? btnDisabled : btnPrimary}
          >
            {shaking ? t("liuyao.shaking") : shaken.length >= 6 ? t("liuyao.done") : t("liuyao.btnShake", { n: shaken.length + 1 })}
          </button>
        </div>
      )}

      {/* 手动选卦模式 */}
      {mode === "manual" && (
        <div style={cardStyle}>
          <div style={{ fontSize: 13, color: "#8a7a65", marginBottom: 8 }}>
            {t("liuyao.manualHint")}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {manual.map((m, i) => (
              <div key={i} style={yaoRowStyle}>
                <span style={yaoLabelStyle}>{yaoName(i)}</span>
                <button
                  onClick={() =>
                    setManual((arr) => arr.map((x, j) => (j === i ? { ...x, yinYang: (x.yinYang ? 0 : 1) as 0 | 1 } : x)))
                  }
                  style={m.yinYang === 1 ? yaoYangBtn : yaoYinBtn}
                >
                  {m.yinYang === 1 ? t("liuyao.yang") : t("liuyao.yin")}
                </button>
                <label style={{ fontSize: 13, color: "#bfae95", display: "flex", alignItems: "center", gap: 4 }}>
                  <input
                    type="checkbox"
                    checked={m.moving}
                    onChange={(e) =>
                      setManual((arr) => arr.map((x, j) => (j === i ? { ...x, moving: e.target.checked } : x)))
                    }
                  />
                  {t("liuyao.moving")}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 起卦按钮 */}
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={performCast} disabled={!coinSums} style={!coinSums ? btnDisabled : btnPrimary}>
          {t("liuyao.btnCast")}
        </button>
      </div>

      {castError && <div style={errorStyle}>❌ {castError}</div>}

      {/* 卦象展示 */}
      {cast && <GuaDisplay cast={cast} />}

      {/* AI 解卦 */}
      {cast && <InterpretInline interp={interp} onStart={startInterpret} />}

      <style>{`
        @keyframes coinflip {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(720deg); }
        }
      `}</style>
    </div>
  );
}

// ===== 卦象展示组件 =====
function GuaDisplay({ cast }: { cast: LiuYaoCast }) {
  const t = useT();
  const yaoName = (i: number) => `${t(YAO_KEYS[i])}${t("yao.suffix")}`;
  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 12, color: "#8a7a65" }}>{t("gua.primary")}</div>
          <div style={{ fontSize: 22, color: "#c9a961", letterSpacing: 4 }}>{cast.primary.name}</div>
          <div style={{ fontSize: 12, color: "#8a7a65" }}>
            {cast.primary.palace}{t("gua.palaceSuffix")}·{cast.primary.palaceElement}
          </div>
        </div>
        {cast.changed && (
          <div>
            <div style={{ fontSize: 12, color: "#8a7a65" }}>{t("gua.changed")}</div>
            <div style={{ fontSize: 22, color: "#c9a961", letterSpacing: 4 }}>{cast.changed.name}</div>
          </div>
        )}
        <div>
          <div style={{ fontSize: 12, color: "#8a7a65" }}>{t("gua.moving")}</div>
          <div style={{ fontSize: 18, color: "#c0392b" }}>
            {cast.movingLines.length ? cast.movingLines.map((n) => yaoName(n - 1)).join("、") : t("gua.noMoving")}
          </div>
        </div>
      </div>
      <div style={{ fontSize: 12, color: "#8a7a65", marginBottom: 8 }}>
        {cast.lunarBrief} · {cast.dayGanZhi}{t("gua.daySuffix")} · {cast.solarTerm ?? ""}
      </div>

      <div className="divine-table-wrap">
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ color: "#8a7a65" }}>
            <th style={thStyle}>{t("gua.thLine")}</th>
            <th style={thStyle}>{t("gua.thYinYang")}</th>
            <th style={thStyle}>{t("gua.thNaJia")}</th>
            <th style={thStyle}>{t("gua.thRelation")}</th>
            <th style={thStyle}>{t("gua.thSpirit")}</th>
            <th style={thStyle}>{t("gua.thShiYing")}</th>
          </tr>
        </thead>
        <tbody>
          {cast.primary.lines
            .slice()
            .reverse()
            .map((l) => (
              <tr key={l.position} style={{ borderBottom: "1px solid #2a1f18" }}>
                <td style={tdStyle}>{yaoName(l.position - 1)}</td>
                <td style={tdStyle}>
                  {l.yinYang === "阳" ? t("liuyao.yang") : t("liuyao.yin")}
                  {l.isMoving && <span style={{ color: "#c0392b" }}>{t("gua.movingMark")}</span>}
                </td>
                <td style={{ ...tdStyle, color: "#c9a961" }}>{l.ganZhi}</td>
                <td style={tdStyle}>{l.relation}</td>
                <td style={tdStyle}>{l.spirit}</td>
                <td style={{ ...tdStyle, color: l.shiYing ? "#c0392b" : "#5a4a3a" }}>{l.shiYing ?? ""}</td>
              </tr>
            ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}

// ===== AI 解卦内联面板（六爻专用，复用 InterpretPanel）=====
function InterpretInline({ interp, onStart }: {
  interp: ReturnType<typeof useSseInterpret>;
  onStart: () => void;
}) {
  return <InterpretPanel interp={interp} onStart={onStart} ready={true} />;
}

// ===== 样式常量 =====
const h2Style: React.CSSProperties = { fontSize: 24, color: "#c9a961", margin: 0, letterSpacing: 4 };
const h3Style: React.CSSProperties = { fontSize: 18, color: "#c9a961", letterSpacing: 2 };
const hintStyle: React.CSSProperties = { fontSize: 13, color: "#8a7a65", marginTop: 6, lineHeight: 1.6 };
const inputStyle: React.CSSProperties = {
  padding: "8px 12px",
  background: "rgba(42,31,24,0.6)",
  border: "1px solid #3a2a1f",
  borderRadius: 6,
  color: "#e8dcc8",
  fontSize: 14,
  fontFamily: "inherit",
};
const cardStyle: React.CSSProperties = {
  padding: 16,
  background: "rgba(42,31,24,0.4)",
  border: "1px solid #3a2a1f",
  borderRadius: 8,
};
const tabStyle: React.CSSProperties = {
  padding: "6px 16px",
  background: "transparent",
  border: "1px solid #3a2a1f",
  borderRadius: 6,
  color: "#bfae95",
  cursor: "pointer",
  fontFamily: "inherit",
};
const tabActive: React.CSSProperties = {
  ...tabStyle,
  background: "#3a2a1f",
  color: "#c9a961",
  borderColor: "#c9a961",
};
const resetBtnStyle: React.CSSProperties = {
  ...tabStyle,
  marginLeft: "auto",
  color: "#a52a2a",
};
const btnPrimary: React.CSSProperties = {
  padding: "8px 20px",
  background: "#a52a2a",
  border: "none",
  borderRadius: 6,
  color: "#e8dcc8",
  cursor: "pointer",
  fontFamily: "inherit",
  fontSize: 14,
};
const btnDisabled: React.CSSProperties = {
  ...btnPrimary,
  opacity: 0.4,
  cursor: "not-allowed",
};
const btnDanger: React.CSSProperties = {
  ...btnPrimary,
  background: "#5a2a2a",
};
const yaoRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: "6px 0",
};
const yaoLabelStyle: React.CSSProperties = { width: 40, color: "#8a7a65", fontSize: 13 };
const yaoYangBtn: React.CSSProperties = {
  padding: "2px 10px",
  background: "#a52a2a",
  border: "none",
  borderRadius: 4,
  color: "#e8dcc8",
  cursor: "pointer",
  fontFamily: "inherit",
  fontSize: 13,
};
const yaoYinBtn: React.CSSProperties = {
  ...yaoYangBtn,
  background: "#2a1f18",
  color: "#bfae95",
  border: "1px solid #3a2a1f",
};
const thStyle: React.CSSProperties = { textAlign: "left", padding: "6px 8px", fontWeight: 400 };
const tdStyle: React.CSSProperties = { padding: "6px 8px", color: "#e8dcc8" };
const errorStyle: React.CSSProperties = { color: "#e57373", fontSize: 13, padding: 8 };
const cursorStyle: React.CSSProperties = {
  display: "inline-block",
  animation: "blink 1s steps(2) infinite",
  color: "#c9a961",
};
