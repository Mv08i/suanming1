"use client";

import Link from "next/link";
import { useT } from "../i18n/context";
import LanguageSwitch from "../i18n/language-switch";

export default function ChatHeader({ email, balance }: { email: string; balance: number }) {
  const t = useT();
  return (
    <header className="border-b border-gray-200">
      <div className="mx-auto flex max-w-5xl items-center justify-between p-4">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span className="font-bold">{t("common.brand")}</span>
          <nav style={{ display: "flex", gap: 12, fontSize: 14 }}>
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
              {t("nav.dashboard")}
            </Link>
            <Link href="/credits" className="text-gray-600 hover:text-gray-900">
              {t("nav.credits")}
            </Link>
            <Link href="/divine" className="text-gray-600 hover:text-gray-900">
              {t("nav.cast")}
            </Link>
            <Link href="/divine/history" className="text-gray-600 hover:text-gray-900">
              {t("nav.history")}
            </Link>
            <span
              className="font-semibold"
              style={{ color: "#2563eb", borderBottom: "2px solid #2563eb", paddingBottom: 2 }}
            >
              {t("nav.chat")}
            </span>
          </nav>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <LanguageSwitch />
          <span className="text-sm text-gray-500">{email}</span>
          <span
            style={{
              fontSize: 13,
              background: "#fef3c7",
              color: "#92400e",
              padding: "2px 8px",
              borderRadius: 4,
            }}
          >
            {t("nav.balance")} {balance}
          </span>
        </div>
      </div>
    </header>
  );
}
