import type { DefaultSession } from "next-auth";

// 扩展 Auth.js 类型，让 session.user 携带 id
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
  }
}
