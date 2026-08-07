import type { NextRequest } from "next/server";
import NextAuth from "next-auth";

import { authConfig } from "@/lib/auth.config";

// NextAuth 实例（只用不含 Prisma 的 authConfig，保证 Edge Runtime 可用）
const { auth } = NextAuth(authConfig);

// Next.js 16: middleware 约定改名为 proxy，必须 export function（不能是 const 解构）
// auth 作为 middleware 在运行时接受 NextRequest，这里用类型断言对齐 Auth.js 的重载签名
export async function proxy(request: NextRequest) {
  return (auth as unknown as (req: NextRequest) => Promise<unknown>)(request);
}

// 受保护路径：未登录会被重定向到 /login
// - /dashboard 控制台
// - /chat AI 对话
// 注意：/divine/* 公开可浏览（游客可见），起卦/解卦 API 自身校验登录，未登录返回 401 由前端跳 /login
export const config = {
  matcher: ["/dashboard/:path*", "/chat"],
};
