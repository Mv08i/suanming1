import DivineHomeClient from "./divine-home-client";
import { SITE } from "../site-config";

export const metadata = {
  title: SITE.brandEn,
  description: `${SITE.brandEn} - AI Destiny Consultation platform featuring Liu Yao, Plum Blossom, and Qi Men Dun Jia with AI interpretation`,
};

// 保持为 Server Component，Next.js 才能正确注册路由
export default function DivineHomePage() {
  return <DivineHomeClient />;
}
