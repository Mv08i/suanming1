"use client";

import { useLocale } from "./context";

/** 右上角语言切换按钮：EN | 中 */
export default function LanguageSwitch() {
  const { locale, setLocale } = useLocale();
  const btn = (active: boolean): React.CSSProperties => ({
    padding: "2px 8px",
    fontSize: 12,
    fontWeight: 600,
    color: active ? "#1a1410" : "#8a7a65",
    background: active ? "#c9a961" : "transparent",
    border: "1px solid #3a2a1f",
    borderRadius: 4,
    cursor: "pointer",
    fontFamily: "inherit",
  });

  return (
    <div style={{ display: "flex", gap: 4 }}>
      <button
        onClick={() => setLocale("en")}
        style={btn(locale === "en")}
        aria-pressed={locale === "en"}
      >
        EN
      </button>
      <button
        onClick={() => setLocale("zh")}
        style={btn(locale === "zh")}
        aria-pressed={locale === "zh"}
      >
        中
      </button>
    </div>
  );
}
