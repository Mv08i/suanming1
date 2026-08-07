// 算命页面共享样式常量（中国传统风：暗色底 + 鎏金 + 朱砂红）
// 六爻页保留自有内联样式以避免回归，新页面（梅花/奇门/历史）统一从这里取用。

import type { CSSProperties } from "react";

export const h2Style: CSSProperties = { fontSize: 24, color: "#c9a961", margin: 0, letterSpacing: 4 };
export const h3Style: CSSProperties = { fontSize: 18, color: "#c9a961", letterSpacing: 2 };
export const hintStyle: CSSProperties = { fontSize: 13, color: "#8a7a65", marginTop: 6, lineHeight: 1.6 };
export const inputStyle: CSSProperties = {
  padding: "8px 12px",
  background: "rgba(42,31,24,0.6)",
  border: "1px solid #3a2a1f",
  borderRadius: 6,
  color: "#e8dcc8",
  fontSize: 14,
  fontFamily: "inherit",
  width: "100%",
  boxSizing: "border-box",
};
export const cardStyle: CSSProperties = {
  padding: 16,
  background: "rgba(42,31,24,0.4)",
  border: "1px solid #3a2a1f",
  borderRadius: 8,
};
export const tabStyle: CSSProperties = {
  padding: "6px 16px",
  background: "transparent",
  border: "1px solid #3a2a1f",
  borderRadius: 6,
  color: "#bfae95",
  cursor: "pointer",
  fontFamily: "inherit",
};
export const tabActive: CSSProperties = {
  ...tabStyle,
  background: "#3a2a1f",
  color: "#c9a961",
  borderColor: "#c9a961",
};
export const resetBtnStyle: CSSProperties = {
  ...tabStyle,
  marginLeft: "auto",
  color: "#a52a2a",
};
export const btnPrimary: CSSProperties = {
  padding: "8px 20px",
  background: "#a52a2a",
  border: "none",
  borderRadius: 6,
  color: "#e8dcc8",
  cursor: "pointer",
  fontFamily: "inherit",
  fontSize: 14,
};
export const btnDisabled: CSSProperties = {
  ...btnPrimary,
  opacity: 0.4,
  cursor: "not-allowed",
};
export const btnDanger: CSSProperties = {
  ...btnPrimary,
  background: "#5a2a2a",
};
export const thStyle: CSSProperties = { textAlign: "left", padding: "6px 8px", fontWeight: 400 };
export const tdStyle: CSSProperties = { padding: "6px 8px", color: "#e8dcc8" };
export const errorStyle: CSSProperties = { color: "#e57373", fontSize: 13, padding: 8 };
export const cursorStyle: CSSProperties = {
  display: "inline-block",
  animation: "blink 1s steps(2) infinite",
  color: "#c9a961",
};
