"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useT } from "../i18n/context";
import LanguageSwitch from "../i18n/language-switch";

export default function DivineHeader({ email }: { email: string | null }) {
  const t = useT();
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    if (!email) return; // 未登录不查余额
    (async () => {
      try {
        const r = await fetch("/api/user/balance", { credentials: "include" });
        if (r.ok) {
          const d = await r.json();
          setBalance(d.balance ?? 0);
        }
      } catch {}
    })();
  }, [email]);

  return (
    <header
      style={{
        borderBottom: "1px solid #3a2a1f",
        background: "rgba(15,10,8,0.6)",
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        className="divine-header-inner"
        style={{
          maxWidth: 960,
          margin: "0 auto",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <Link
          href="/divine"
          className="divine-brand"
          style={{
            color: "#c9a961",
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: 4,
            textDecoration: "none",
          }}
        >
          {t("common.brand")}
        </Link>
        <nav className="divine-nav" style={{ display: "flex", gap: 18, fontSize: 14 }}>
          <Link href="/divine" style={navStyle}>
            {t("nav.cast")}
          </Link>
          <Link href="/divine/history" style={navStyle}>
            {t("nav.history")}
          </Link>
          <Link href="/dashboard" style={navStyle}>
            {t("nav.dashboard")}
          </Link>
        </nav>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <LanguageSwitch />
          {email ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 13 }}>
              <span style={{ color: "#c9a961" }}>
                {t("nav.balance")}{" "}
                <strong style={{ fontSize: 16 }}>
                  {balance === null ? t("common.loading") : balance}
                </strong>{" "}
                {t("common.credits")}
              </span>
              <span className="divine-user-email" style={{ color: "#8a7a65" }}>{email}</span>
            </div>
          ) : (
            <Link
              href="/login"
              style={{
                color: "#1a1410",
                background: "#c9a961",
                padding: "6px 16px",
                borderRadius: 4,
                textDecoration: "none",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              {t("nav.login")}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

const navStyle: React.CSSProperties = {
  color: "#e8dcc8",
  textDecoration: "none",
  opacity: 0.85,
};
