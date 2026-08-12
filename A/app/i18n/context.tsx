"use client";

import { createContext, useContext, useState, useCallback, ReactNode, useMemo } from "react";
import type { Locale, DictKey } from "./dictionaries";
import { translate } from "./dictionaries";

interface LocaleCtx {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: DictKey, params?: Record<string, string | number>) => string;
}

const Ctx = createContext<LocaleCtx | null>(null);

/** 全站 locale provider，默认英文，不持久化 */
export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("en");

  const t = useCallback(
    (key: DictKey, params?: Record<string, string | number>) =>
      translate(locale, key, params),
    [locale],
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, t]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLocale(): LocaleCtx {
  const ctx = useContext(Ctx);
  if (!ctx) {
    // 服务端渲染或未挂 Provider 时的兜底（返回英文 + 空操作）
    return {
      locale: "en",
      setLocale: () => {},
      t: (key) => key as string,
    };
  }
  return ctx;
}

/** 翻译 hook，最常用 */
export function useT() {
  return useLocale().t;
}
