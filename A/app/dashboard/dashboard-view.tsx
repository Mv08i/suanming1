"use client";

import Link from "next/link";
import { useT } from "../i18n/context";

interface TxnView {
  id: string;
  type: string;
  amount: number;
  balanceAfter: number;
  requestId: string | null;
  description: string | null;
  createdAt: string;
}

interface ReqView {
  id: string;
  model: string;
  errorMessage: string | null;
  status: string;
}

interface Props {
  balance: number;
  totalCharged: number;
  totalUsed: number;
  successCount: number;
  failedCount: number;
  txns: TxnView[];
  reqs: ReqView[];
  userName: string;
}

export default function DashboardView({
  balance,
  totalCharged,
  totalUsed,
  successCount,
  failedCount,
  txns,
  reqs,
  userName,
}: Props) {
  const t = useT();
  const isZh = t("common.brand") === "卜微";
  const locale = isZh ? "zh-CN" : "en-US";
  const reqMap = new Map(reqs.map((r) => [r.id, r]));

  function typeBadge(txn: TxnView) {
    let label: string;
    let color: string;
    let bg: string;
    switch (txn.type) {
      case "RECHARGE":
        label = isZh ? "充值" : "Recharge";
        color = "#16a34a"; bg = "#dcfce7"; break;
      case "USE":
        label = isZh ? "消耗" : "Use";
        color = "#ea580c"; bg = "#ffedd5"; break;
      case "REFUND":
        label = isZh ? "回退" : "Refund";
        color = "#2563eb"; bg = "#dbeafe"; break;
      default:
        label = txn.type; color = "#6b7280"; bg = "#f3f4f6";
    }
    return { label, color, bg };
  }

  function txnDescription(txn: TxnView): string {
    if (txn.requestId) {
      const req = reqMap.get(txn.requestId);
      if (req) {
        const base = isZh ? `AI 对话 · ${req.model}` : `AI call · ${req.model}`;
        if (txn.type === "USE" && req.status === "FAILED") {
          return isZh ? `${base}（失败，已回退）` : `${base} (failed, refunded)`;
        }
        if (txn.type === "REFUND" && req.errorMessage) {
          return isZh
            ? `${base}（失败回退: ${req.errorMessage.slice(0, 30)}）`
            : `${base} (refund: ${req.errorMessage.slice(0, 30)})`;
        }
        return base;
      }
    }
    // 翻译注册赠送描述
    if (txn.description && /注册赠送/.test(txn.description)) {
      const m = txn.description.match(/(\d+)/);
      const n = m ? m[1] : "";
      return t("dashboard.txSignupBonus", { n });
    }
    return txn.description ?? "";
  }

  return (
    <div className="mx-auto max-w-5xl p-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("nav.dashboard")}</h1>
        <p className="text-gray-600">{t("dashboard.welcome")}{userName}</p>
      </div>

      <div
        className="stat-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 16,
        }}
      >
        <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 16 }}>
          <p style={{ color: "#6b7280", fontSize: 13, margin: 0 }}>{t("dashboard.balanceTitle")}</p>
          <p style={{ fontSize: 32, fontWeight: 700, margin: "8px 0 0" }}>{balance}</p>
          <p style={{ color: "#9ca3af", fontSize: 12, margin: "4px 0 0" }}>
            {t("dashboard.totalCharged")} {totalCharged} · {t("dashboard.totalUsed")} {totalUsed}
          </p>
        </div>
        <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 16 }}>
          <p style={{ color: "#6b7280", fontSize: 13, margin: 0 }}>{t("dashboard.successCount")}</p>
          <p style={{ fontSize: 32, fontWeight: 700, margin: "8px 0 0", color: "#16a34a" }}>
            {successCount}
          </p>
          <p style={{ color: "#9ca3af", fontSize: 12, margin: "4px 0 0" }}>
            <Link href="/chat" style={{ color: "#2563eb" }}>{t("dashboard.goChat")}</Link>
          </p>
        </div>
        <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 16 }}>
          <p style={{ color: "#6b7280", fontSize: 13, margin: 0 }}>{t("dashboard.failedCount")}</p>
          <p style={{ fontSize: 32, fontWeight: 700, margin: "8px 0 0", color: "#7c2d12" }}>
            {failedCount}
          </p>
          <p style={{ color: "#9ca3af", fontSize: 12, margin: "4px 0 0" }}>
            {t("dashboard.failedHint")}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 p-6">
        <h2 className="font-semibold">{t("dashboard.recentTx")}</h2>
        {txns.length === 0 ? (
          <p className="mt-2 text-sm text-gray-500">
            {isZh ? "暂无记录，充值后会在这里显示" : "No records yet. They will appear here after you buy credits."}
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-gray-100">
            {txns.map((txn) => {
              const badge = typeBadge(txn);
              return (
                <li
                  key={txn.id}
                  className="txn-row"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 8,
                    padding: "10px 0",
                    fontSize: 14,
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: 1 }}>
                    <span
                      style={{
                        background: badge.bg,
                        color: badge.color,
                        padding: "2px 8px",
                        borderRadius: 10,
                        fontSize: 12,
                        fontWeight: 600,
                        flexShrink: 0,
                      }}
                    >
                      {badge.label}
                    </span>
                    <span className="font-mono" style={{ flexShrink: 0 }}>
                      {txn.amount > 0 ? "+" : ""}
                      {txn.amount}
                    </span>
                    <span
                      className="ml-2 text-gray-500 txn-desc"
                      style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                    >
                      {txnDescription(txn)}
                    </span>
                  </span>
                  <span className="txn-meta" style={{ color: "#9ca3af", fontSize: 13, flexShrink: 0, marginLeft: 12 }}>
                    {t("nav.balance")} {txn.balanceAfter} · {new Date(txn.createdAt).toLocaleString(locale)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
