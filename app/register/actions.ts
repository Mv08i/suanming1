"use server";

import { signIn } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { SIGNUP_BONUS_CREDITS } from "@/lib/credits";
import { AuthError } from "next-auth";

type State = { error?: string } | undefined;

export async function register(_prevState: State, formData: FormData): Promise<State> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "").trim() || null;

  if (!email || !password) {
    return { error: "邮箱和密码不能为空" };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "邮箱格式不正确" };
  }
  if (password.length < 8) {
    return { error: "密码至少 8 位" };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "该邮箱已注册" };
  }

  const passwordHash = await hashPassword(password);
  await prisma.user.create({
    data: {
      email,
      name,
      passwordHash,
      // 注册赠送初始积分：建余额行 + 记一条审计流水
      balance: {
        create: {
          balance: SIGNUP_BONUS_CREDITS,
          totalCharged: SIGNUP_BONUS_CREDITS,
        },
      },
      transactions: {
        create: {
          type: "RECHARGE",
          amount: SIGNUP_BONUS_CREDITS,
          balanceAfter: SIGNUP_BONUS_CREDITS,
          description: `注册赠送 ${SIGNUP_BONUS_CREDITS} 积分`,
        },
      },
    },
  });

  // 注册成功后自动登录
  try {
    await signIn("credentials", { email, password, redirectTo: "/divine" });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "自动登录失败，请前往登录页手动登录" };
    }
    // NEXT_REDIRECT 不是 AuthError，必须原样抛出，否则重定向不生效
    throw error;
  }
}
