import LoginClient from "./login-client";
import { SITE } from "../site-config";

export const metadata = {
  title: `${SITE.brandEn} - Login`,
  description: "Sign in to your account.",
};

// 保持为 Server Component，Next.js 才能静态预渲染进 CDN 缓存
export default function LoginPage() {
  return <LoginClient />;
}
