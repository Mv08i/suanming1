"use client";

import Link from "next/link";
import { useT } from "../i18n/context";
import LanguageSwitch from "../i18n/language-switch";
import LogoutButton from "./logout-button";

const NAV_ITEMS: { href: string; key: "nav.dashboard" | "nav.chat" | "nav.cast" | "nav.history" | "nav.credits" }[] = [
  { href: "/dashboard", key: "nav.dashboard" },
  { href: "/chat", key: "nav.chat" },
  { href: "/divine", key: "nav.cast" },
  { href: "/divine/history", key: "nav.history" },
  { href: "/credits", key: "nav.credits" },
];

export default function DashboardNav({ email }: { email: string }) {
  const t = useT();
  return (
    <div className="mx-auto flex max-w-5xl items-center justify-between p-4">
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <span className="font-bold">{t("common.brand")}</span>
        <nav style={{ display: "flex", gap: 12, fontSize: 14 }}>
          {NAV_ITEMS.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              {t(it.key)}
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <LanguageSwitch />
        <span className="text-sm text-gray-500">{email}</span>
        <LogoutButton />
      </div>
    </div>
  );
}
