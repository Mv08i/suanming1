import type { NextAuthConfig } from "next-auth";

/**
 * Auth.js 基础配置（不含 Prisma，Edge Runtime 安全）
 * 被 middleware.ts 和 lib/auth.ts 共用。
 */
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" }, // Credentials provider 必须用 jwt
  providers: [], // providers 在 lib/auth.ts 中填充（因为需要 Prisma）
  callbacks: {
    // 把 user.id 写进 JWT
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    // 把 JWT 里的 id 暴露到 session.user.id
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};
