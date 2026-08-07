import { SITE } from "../site-config";
import PrivacyView from "./privacy-view";

export const metadata = {
  title: `Privacy Policy - ${SITE.brandEn}`,
  description: `${SITE.brandEn} Privacy Policy: how we collect, use, and protect your information.`,
};

export default function PrivacyPage() {
  return <PrivacyView />;
}
