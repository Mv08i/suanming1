"use client";

import LegalShell, { LegalSection } from "../legal-shell";
import { useLocale, useT } from "../i18n/context";
import { SITE } from "../site-config";

type Section = {
  title: string;
  paragraphs?: string[];
  list?: string[];
};

const CONTENT: Record<"en" | "zh", { title: string; sections: Section[] }> = {
  en: {
    title: "Privacy Policy",
    sections: [
      {
        title: "1. Introduction",
        paragraphs: [
          `${SITE.brandEn} ("we") respects and protects your privacy by law. This policy explains how we collect, use, store, and protect your personal information when you use this website and our AI divination, AI chat, and credit recharge services.`,
          `By using the service, you consent to the data practices described in this policy. If you do not agree, please stop using the service.`,
        ],
      },
      {
        title: "2. Information We Collect",
        list: [
          "Account information: email address and optional nickname provided at registration. Passwords are stored as one-way bcrypt hashes; we cannot recover the plaintext.",
          "Usage records: your AI chat content, divination casts and readings, credit transactions, and recharge orders — used to deliver the service and for audit.",
          "Payment information: recharge payments are processed by Creem. We do not store full bank card numbers; only order IDs and transaction IDs are retained for reconciliation and support.",
          "Technical logs: access IP, browser type, access time, request logs — used for security and troubleshooting.",
        ],
      },
      {
        title: "3. How We Use Information",
        list: [
          "Provide AI chat and divination (Liu Yao, Plum Blossom, Qi Men Dun Jia) services, deducting credits per use.",
          "Process credit recharges, order reconciliation, and refunds (where applicable).",
          "Maintain login sessions and authentication.",
          "Security, anti-fraud, and service stability.",
          "Improve service quality, fix issues, and optimize experience.",
        ],
      },
      {
        title: "4. Third-Party Services",
        paragraphs: [
          "To deliver the service, we share necessary information with the following third parties, each governed by its own privacy policy:",
        ],
        list: [
          "Creem: payment processing for recharge transactions.",
          "AI service providers: receive your chat and divination input to generate AI responses.",
          "Neon: PostgreSQL database hosting for user and business data.",
          "Vercel: application hosting and CDN for website access.",
        ],
      },
      {
        title: "5. Cookies & Sessions",
        paragraphs: [
          "We use session cookies to keep you logged in. We do not use them for cross-site tracking or advertising. You may refuse cookies in your browser settings, but this may affect features such as login.",
        ],
      },
      {
        title: "6. Data Security",
        list: [
          "Passwords are stored as one-way bcrypt hashes.",
          "Data in transit is encrypted via HTTPS.",
          "Database operations use transactions and row locks to prevent credit anomalies and concurrency issues.",
          "Internal access is strictly limited.",
        ],
      },
      {
        title: "7. Data Retention",
        paragraphs: [
          "Account and business data is retained until you delete your account or request deletion. Technical logs are generally kept for no more than 90 days. Where laws require otherwise, those requirements prevail.",
        ],
      },
      {
        title: "8. Your Rights",
        list: [
          "Access and review your account information and usage records.",
          "Correct inaccurate personal information.",
          "Delete your account and related data (except where retention is required by law).",
          "Export your data.",
        ],
        paragraphs: [
          `To exercise these rights, contact us at the email at the bottom of this page. We will respond within a reasonable time.`,
        ],
      },
      {
        title: "9. Minors",
        paragraphs: [
          "This service is not offered to anyone under 18. If we learn that a minor is using the service without guardian consent, we will take steps to delete their information.",
        ],
      },
      {
        title: "10. Policy Changes",
        paragraphs: [
          "We may update this privacy policy from time to time. Updates will be posted on this page with a revised effective date. For material changes, we will notify you via in-site notice or email.",
        ],
      },
      {
        title: "11. Contact Us",
        paragraphs: [
          `For any questions about this privacy policy or personal information, contact: ${SITE.contactEmail}`,
        ],
      },
    ],
  },
  zh: {
    title: "隐私政策",
    sections: [
      {
        title: "一、引言",
        paragraphs: [
          `${SITE.brand}（以下简称“我们”）尊重并依法保护用户隐私。本政策说明我们在你使用本网站及 AI 算命、AI 对话、积分充值等服务时，如何收集、使用、存储与保护你的个人信息。`,
          "使用本服务即表示你同意本隐私政策所述的信息处理方式。如你不同意，请停止使用本服务。",
        ],
      },
      {
        title: "二、我们收集的信息",
        list: [
          "账户信息：注册时提供的邮箱地址、昵称（可选）。密码经 bcrypt 单向哈希存储，我们无法获取明文。",
          "使用记录：你的 AI 对话内容、算命起卦与解卦记录、积分流水、充值订单等，用于提供服务与审计。",
          "支付信息：充值支付由 Creem 处理，我们不存储完整银行卡号，仅保留订单号与交易 ID 用于对账与售后。",
          "技术日志：访问 IP、浏览器类型、访问时间、请求日志等，用于安全防护与故障排查。",
        ],
      },
      {
        title: "三、我们如何使用信息",
        list: [
          "提供 AI 对话与算命（六爻、梅花易数、奇门遁甲）服务，并按次扣减积分。",
          "处理积分充值、订单核对与退款（如适用）。",
          "维持登录会话与身份认证。",
          "安全防护、反欺诈与服务稳定性保障。",
          "改进服务质量、修复问题与优化体验。",
        ],
      },
      {
        title: "四、第三方服务",
        paragraphs: [
          "为提供服务，我们会在必要范围内与以下第三方共享相关信息。各服务受其各自隐私政策约束：",
        ],
        list: [
          "Creem：支付处理服务，处理充值交易。",
          "AI 服务提供商：接收你输入的对话与算卦内容，用于生成 AI 回复。",
          "Neon：PostgreSQL 数据库托管服务，存储用户与业务数据。",
          "Vercel：应用托管与 CDN 服务，提供网站访问。",
        ],
      },
      {
        title: "五、Cookie 与会话",
        paragraphs: [
          "我们使用会话 Cookie 维持你的登录状态，不用于跨站追踪或广告投放。你可通过浏览器设置拒绝 Cookie，但可能影响登录等功能。",
        ],
      },
      {
        title: "六、数据安全",
        list: [
          "密码采用 bcrypt 单向哈希存储。",
          "数据传输使用 HTTPS 加密。",
          "数据库操作采用事务与行锁，防止积分异常与并发问题。",
          "严格限制内部访问权限。",
        ],
      },
      {
        title: "七、数据保留",
        paragraphs: [
          "账户与业务数据将保留至你注销账户或主动要求删除。技术日志一般保留不超过 90 天。法律法规另有要求的，从其规定。",
        ],
      },
      {
        title: "八、你的权利",
        list: [
          "访问与查看你的账户信息与使用记录。",
          "更正不准确的个人信息。",
          "删除账户及相关数据（法律要求保留的除外）。",
          "导出你的数据。",
        ],
        paragraphs: [
          `行使上述权利请通过文末邮箱联系我们，我们将在合理期限内处理。`,
        ],
      },
      {
        title: "九、未成年人",
        paragraphs: [
          "本服务不向 18 岁以下未成年人提供。如发现未成年人在未获监护人同意的情况下使用本服务，我们将采取措施删除其信息。",
        ],
      },
      {
        title: "十、政策变更",
        paragraphs: [
          "我们可能不时更新本隐私政策，更新后将在本页公示并修订生效日期。重大变更时我们会通过站内通知或邮件告知你。",
        ],
      },
      {
        title: "十一、联系我们",
        paragraphs: [
          `如有任何关于本隐私政策或个人信息的问题，请联系：${SITE.contactEmail}`,
        ],
      },
    ],
  },
};

export default function PrivacyView() {
  const { locale } = useLocale();
  const t = useT();
  const c = CONTENT[locale];
  return (
    <LegalShell>
      <h1 className="mb-2 text-2xl font-bold">{c.title}</h1>
      <p className="mb-8 text-sm text-gray-500">
        {t("legal.effective")}
        {SITE.effectiveDate}
      </p>

      {c.sections.map((s, i) => (
        <LegalSection
          key={i}
          title={s.title}
          paragraphs={s.paragraphs}
          list={s.list}
        />
      ))}
    </LegalShell>
  );
}
