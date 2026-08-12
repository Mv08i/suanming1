import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

const PROTECTED_PREFIXES = ["/dashboard", "/chat", "/divine", "/credits"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 静态资源 / API 路由 / NextAuth 内部路由直接放行
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/static") ||
    /\.(svg|png|jpg|jpeg|gif|ico|css|js|woff2?|ttf|eot)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  // 只对受保护路由做 auth 检查
  const isProtected = PROTECTED_PREFIXES.some(
    (r) => pathname === r || pathname.startsWith(r + "/")
  );

  if (isProtected) {
    try {
      // NextAuth v5 beta: auth() 在 middleware/proxy 中的类型签名需要断言
      const session = await (auth as (req: NextRequest) => Promise<any>)(request);
      if (!session?.user) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
      }
    } catch {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|api|auth|favicon.ico|static|.*\\.(?:svg|png|jpg|jpeg|gif|ico|css|js|woff2?|ttf|eot)$).*)",
  ],
};
