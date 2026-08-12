"use client";

import Link from "next/link";
import { useT } from "./i18n/context";
import { SITE } from "./site-config";
import LanguageSwitch from "./i18n/language-switch";

/**
 * 法律文档通用骨架：顶部品牌栏 + 底部交叉链接页脚。
 * 公开页面（无需登录），用于隐私政策、服务条款等。
 * 客户端组件：支持语言切换与 i18n 文案。
 */
export default function LegalShell({ children }: { children: React.ReactNode }) {
  const t = useT();
  return (
    <main className="flex min-h-screen flex-col bg-white text-gray-800">
      <header className="border-b border-gray-200">
        <div className="mx-auto flex max-w-3xl items-center justify-between p-4">
          <Link href="/" className="font-bold tracking-widest">
            {SITE.brand}
          </Link>
          <div className="flex items-center gap-4">
            <LanguageSwitch />
            <nav className="flex gap-4 text-sm text-gray-500">
              <Link href="/login" className="hover:text-gray-900">
                {t("login.heading")}
              </Link>
              <Link href="/register" className="hover:text-gray-900">
                {t("register.heading")}
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <article className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">{children}</article>

      <footer className="border-t border-gray-200">
        <div className="mx-auto flex max-w-3xl flex-wrap gap-4 p-4 text-sm text-gray-500">
          <Link href="/privacy" className="hover:text-gray-900">
            {t("legal.privacyLink")}
          </Link>
          <Link href="/terms" className="hover:text-gray-900">
            {t("legal.termsLink")}
          </Link>
          <span className="ml-auto">
            {t("legal.contact")}：{SITE.contactEmail}
          </span>
        </div>
      </footer>
    </main>
  );
}

/** 法律文档小节：标题 + 段落 + 列表 */
export function LegalSection({
  title,
  paragraphs,
  list,
}: {
  title: string;
  paragraphs?: string[];
  list?: string[];
}) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-lg font-semibold text-gray-900">{title}</h2>
      {paragraphs?.map((p, i) => (
        <p key={i} className="mb-2 text-sm leading-7 text-gray-700">
          {p}
        </p>
      ))}
      {list && (
        <ul className="ml-5 list-disc space-y-1 text-sm leading-7 text-gray-700">
          {list.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
