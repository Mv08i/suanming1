"use client";

import Link from "next/link";
import { useT } from "../../i18n/context";
import { cardStyle } from "../styles";

interface DivRecord {
  id: string;
  type: string;
  question: string | null;
  castData: Record<string, unknown>;
  summary: string | null;
  createdAt: string;
}

const TYPE_HREF: Record<string, string> = {
  LIUYAO: "/divine/liuyao",
  MEIHUA: "/divine/meihua",
  QIMEN: "/divine/qimen",
};

const TYPE_TITLE_KEY: Record<string, "divine.liuyao.title" | "divine.meihua.title" | "divine.qimen.title"> = {
  LIUYAO: "divine.liuyao.title",
  MEIHUA: "divine.meihua.title",
  QIMEN: "divine.qimen.title",
};

export default function HistoryList({ records }: { records: DivRecord[] }) {
  const t = useT();
  const isZh = t("common.brand") === "卜微";
  const locale = isZh ? "zh-CN" : "en-US";

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 24, color: "#c9a961", margin: 0, letterSpacing: 4 }}>
          {t("history.title")}
        </h2>
        <p style={{ fontSize: 13, color: "#8a7a65", marginTop: 6 }}>
          {isZh
            ? `最近 ${records.length} 条记录。点击「再起一卦」可重新起卦。`
            : `${records.length} recent records. Click an entry to cast again.`}
        </p>
      </div>

      {records.length === 0 ? (
        <div className="history-card" style={{ ...cardStyle, textAlign: "center", color: "#8a7a65" }}>
          {t("history.empty")}
          {" — "}
          <Link href="/divine" style={{ color: "#c9a961", margin: "0 4px" }}>
            {t("nav.cast")}
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {records.map((r) => {
            const castData = r.castData ?? {};
            const guaName =
              (castData.primary as { name?: string } | undefined)?.name ??
              (r.type === "QIMEN"
                ? castData.dun === "yang"
                  ? isZh ? "阳遁" : "Yang-dun"
                  : isZh ? "阴遁" : "Yin-dun"
                : "—");
            const lunar = (castData.lunarBrief as string | undefined) ?? "";
            return (
              <div key={r.id} className="history-card" style={cardStyle}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 8,
                    flexWrap: "wrap",
                    gap: 8,
                  }}
                >
                  <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                    <span
                      style={{
                        fontSize: 12,
                        color: "#a52a2a",
                        border: "1px solid #a52a2a",
                        borderRadius: 4,
                        padding: "1px 8px",
                      }}
                    >
                      {TYPE_TITLE_KEY[r.type] ? t(TYPE_TITLE_KEY[r.type]!) : r.type}
                    </span>
                    <span style={{ fontSize: 18, color: "#c9a961", letterSpacing: 2 }}>{guaName}</span>
                    {lunar && <span style={{ fontSize: 12, color: "#8a7a65" }}>{lunar}</span>}
                  </div>
                  <span style={{ fontSize: 12, color: "#8a7a65" }}>
                    {new Date(r.createdAt).toLocaleString(locale)}
                  </span>
                </div>

                {r.question && (
                  <div style={{ fontSize: 13, color: "#bfae95", marginBottom: 6 }}>
                    {isZh ? "所问：" : "Q: "}{r.question}
                  </div>
                )}

                {r.summary && (
                  <div
                    style={{
                      fontSize: 13,
                      color: "#e8dcc8",
                      lineHeight: 1.7,
                      whiteSpace: "pre-wrap",
                      padding: 10,
                      background: "rgba(0,0,0,0.2)",
                      borderRadius: 6,
                      border: "1px solid #2a1f18",
                      marginBottom: 8,
                      maxHeight: 120,
                      overflow: "hidden",
                    }}
                  >
                    {r.summary}
                  </div>
                )}

                <div style={{ display: "flex", gap: 8 }}>
                  <Link
                    href={TYPE_HREF[r.type] ?? "/divine"}
                    style={{
                      fontSize: 13,
                      color: "#c9a961",
                      textDecoration: "none",
                      border: "1px solid #3a2a1f",
                      borderRadius: 4,
                      padding: "2px 10px",
                    }}
                  >
                    {t("history.btnRecast")}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
