"use client";

import Link from "next/link";
import { useT } from "../i18n/context";
import { useLocale } from "../i18n/context";
import { DIVINE_INTROS, INTRO_FIELDS } from "./introductions";
import type { DictKey } from "../i18n/dictionaries";

const ITEMS: { href: string; titleKey: DictKey; descKey: DictKey; tagKey: DictKey; key: "LIUYAO" | "MEIHUA" | "QIMEN" }[] = [
  { href: "/divine/liuyao", titleKey: "divine.liuyao.title", descKey: "divine.liuyao.desc", tagKey: "divine.liuyao.tag", key: "LIUYAO" },
  { href: "/divine/meihua", titleKey: "divine.meihua.title", descKey: "divine.meihua.desc", tagKey: "divine.meihua.tag", key: "MEIHUA" },
  { href: "/divine/qimen", titleKey: "divine.qimen.title", descKey: "divine.qimen.desc", tagKey: "divine.qimen.tag", key: "QIMEN" },
];

export default function DivineHomeClient() {
  const t = useT();
  const { locale } = useLocale();

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 32, marginTop: 24 }}>
        <h1
          className="divine-h1"
          style={{
            fontSize: 36,
            color: "#c9a961",
            letterSpacing: 12,
            margin: 0,
            fontWeight: 700,
          }}
        >
          {t("common.brand")}
        </h1>
        <p className="divine-subtitle" style={{ color: "#8a7a65", marginTop: 8, letterSpacing: 2 }}>
          {t("divine.home.subtitle")}
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 16,
        }}
      >
        {ITEMS.map((it) => (
          <Link
            key={it.href}
            href={it.href}
            style={{
              display: "block",
              padding: 24,
              background: "rgba(42,31,24,0.6)",
              border: "1px solid #3a2a1f",
              borderRadius: 8,
              textDecoration: "none",
              color: "inherit",
              transition: "border-color .2s, transform .2s",
            }}
          >
            <div
              style={{
                fontSize: 13,
                color: "#a52a2a",
                marginBottom: 8,
                letterSpacing: 2,
              }}
            >
              {t(it.tagKey)}
            </div>
            <h2
              style={{
                fontSize: 26,
                color: "#c9a961",
                margin: "0 0 12px",
                letterSpacing: 6,
              }}
            >
              {t(it.titleKey)}
            </h2>
            <p style={{ color: "#bfae95", fontSize: 14, lineHeight: 1.7, margin: 0 }}>
              {t(it.descKey)}
            </p>
          </Link>
        ))}
      </div>

      <div style={{ marginTop: 36 }}>
        <h2
          className="divine-section-h2"
          style={{
            fontSize: 20,
            color: "#c9a961",
            letterSpacing: 6,
            marginBottom: 16,
            textAlign: "center",
          }}
        >
          {t("divine.home.introsTitle")}
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {ITEMS.map((it) => {
            const intro = DIVINE_INTROS[it.key][locale];
            return (
              <details
                key={it.key}
                style={{
                  background: "rgba(42,31,24,0.4)",
                  border: "1px solid #3a2a1f",
                  borderRadius: 8,
                  padding: "12px 16px",
                }}
              >
                <summary
                  style={{
                    cursor: "pointer",
                    color: "#c9a961",
                    fontSize: 16,
                    letterSpacing: 4,
                    listStyle: "none",
                    outline: "none",
                  }}
                >
                  <span style={{ marginRight: 8 }}>◈</span>
                  {t(it.titleKey)} · {t("divine.home.introLabel")}
                </summary>
                <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                  {INTRO_FIELDS.map((f) => (
                    <div key={f.field} style={{ fontSize: 14, lineHeight: 1.8 }}>
                      <span
                        style={{
                          color: "#a52a2a",
                          marginRight: 8,
                          fontSize: 13,
                          letterSpacing: 2,
                        }}
                      >
                        【{f.label[locale]}】
                      </span>
                      <span style={{ color: "#e8dcc8" }}>{intro[f.field]}</span>
                    </div>
                  ))}
                </div>
              </details>
            );
          })}
        </div>
      </div>
    </div>
  );
}
