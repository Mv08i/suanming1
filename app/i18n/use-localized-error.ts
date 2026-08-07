"use client";

import { useT } from "./context";
import type { DictKey } from "./dictionaries";

/** 已知中文错误信息 → 字典 key 映射，用于把 server action 返回的中文 message 翻译成当前 locale */
const ZH_ERROR_MAP: { pattern: RegExp; key: DictKey }[] = [
  { pattern: /^邮箱和密码不能为空$/, key: "login.errorEmpty" },
  { pattern: /^邮箱或密码错误$/, key: "login.errorInvalid" },
  { pattern: /^该邮箱已注册$/, key: "register.errorExists" },
  { pattern: /^密码至少 8 位$/, key: "register.errorShort" },
  { pattern: /^自动登录失败.*$/, key: "register.errorAutoLogin" },
];

/**
 * 把 server action 返回的中文错误信息翻译成当前 locale。
 * 未匹配的原文返回，便于用户看到具体动态内容（如带 requestId 的错误）。
 */
export function useLocalizedError() {
  const t = useT();
  return (raw: string | undefined): string | undefined => {
    if (!raw) return undefined;
    for (const { pattern, key } of ZH_ERROR_MAP) {
      if (pattern.test(raw)) return t(key);
    }
    return raw;
  };
}
