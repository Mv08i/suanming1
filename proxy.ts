import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

export const proxy = auth(async (req) => {
  const { pathname } = req.nextUrl;

  // /credits/success 是 Creem 支付回调落地页，此时用户浏览器可能还没建立 session
  // （Creem 是服务器端 → 浏览器端跳回），放它过去，页面自己展示公开内容
  if (pathname === "/credits/success") {
    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/chat/:path*",
    "/divine/:path*",
    "/credits/:path*",
  ],
};
