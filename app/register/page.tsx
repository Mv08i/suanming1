import RegisterClient from "./register-client";
import { SITE } from "../site-config";

export const metadata = {
  title: `${SITE.brandEn} - Create Account`,
  description: "Sign up to start using the service.",
};

// 保持为 Server Component，Next.js 才能静态预渲染进 CDN 缓存
export default function RegisterPage() {
  return <RegisterClient />;
}
