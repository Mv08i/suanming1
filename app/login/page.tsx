"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login } from "./actions";
import { useT } from "../i18n/context";
import { useLocalizedError } from "../i18n/use-localized-error";
import LanguageSwitch from "../i18n/language-switch";

export default function LoginPage() {
  const t = useT();
  const localizeError = useLocalizedError();
  const [state, formAction, pending] = useActionState(login, undefined);

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <LanguageSwitch />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{t("login.heading")}</h1>
          <p className="text-sm text-gray-500">{t("login.subheading")}</p>
        </div>

        <form action={formAction} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              {t("login.email")}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              {t("login.password")}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
            />
          </div>

          {state?.error && (
            <p className="text-sm text-red-600">{localizeError(state.error)}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded px-4 py-2 text-white disabled:opacity-50"
            style={{
              background: "#a52a2a",
              border: "1px solid #5a2a2a",
              fontSize: 15,
              fontWeight: 600,
              cursor: pending ? "not-allowed" : "pointer",
            }}
          >
            {pending ? t("login.btnSubmitting") : t("login.btnSubmit")}
          </button>
        </form>

        <p className="text-sm" style={{ color: "#8a7a65" }}>
          {t("login.noAccount")}{" "}
          <Link
            href="/register"
            style={{
              color: "#c9a961",
              fontWeight: 600,
              textDecoration: "none",
              border: "1px solid #c9a961",
              borderRadius: 4,
              padding: "2px 10px",
              display: "inline-block",
              marginLeft: 4,
            }}
          >
            {t("login.linkRegister")}
          </Link>
        </p>

        <p className="text-xs text-gray-400">
          {t("login.termsPrefix")}{" "}
          <Link href="/terms" className="underline">
            {t("login.termsLink")}
          </Link>{" "}
          {t("login.andJoiner")}{" "}
          <Link href="/privacy" className="underline">
            {t("login.privacyLink")}
          </Link>
        </p>
      </div>
    </main>
  );
}
