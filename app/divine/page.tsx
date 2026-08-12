import DivineHomeClient from "./divine-home-client";
import { SITE } from "../site-config";

export const metadata = {
  title: SITE.brandEn,
  description: `${SITE.brandEn} - AI 算命平台，提供六爻、梅花易数、奇门遁甲在线起卦与 AI 解卦`,
};

// 保持为 Server Component，Next.js 才能正确注册路由
export default function DivineHomePage() {
  return <DivineHomeClient />;
}
