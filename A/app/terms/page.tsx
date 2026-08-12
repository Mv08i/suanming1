import { SITE } from "../site-config";
import TermsView from "./terms-view";

export const metadata = {
  title: `Terms of Service - ${SITE.brandEn}`,
  description: `${SITE.brandEn} Terms of Service: usage rules, credits and recharge, divination disclaimer.`,
};

export default function TermsPage() {
  return <TermsView />;
}
