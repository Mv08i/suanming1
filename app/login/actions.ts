"use server";

import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";

type State = { error?: string } | undefined;

export async function login(_prevState: State, formData: FormData): Promise<State> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "邮箱和密码不能为空" };
  }

  try {
    await signIn("credentials", { email, password, redirectTo: "/divine" });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "邮箱或密码错误" };
    }
    // NEXT_REDIRECT，必须原样抛出
    throw error;
  }
}
