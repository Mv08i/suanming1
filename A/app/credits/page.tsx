import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CREDIT_PACKAGES } from "@/lib/creem";
import { CheckoutButton } from "./checkout-button";

export default async function CreditsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return (
      <main style={{ maxWidth: 600, margin: "0 auto", padding: 24 }}>
        <h1>充值积分</h1>
        <p>
          请先 <Link href="/login">登录</Link>
        </p>
      </main>
    );
  }

  const balance = await prisma.creditBalance.findUnique({
    where: { userId: session.user.id },
  });

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <h1>充值积分</h1>
        <Link href="/dashboard">← 返回控制台</Link>
      </div>

      <div
        style={{
          background: "#f5f5f5",
          padding: 16,
          borderRadius: 8,
          marginBottom: 24,
        }}
      >
        当前余额：<strong>{balance?.balance ?? 0}</strong> 积分
      </div>

      <div
        className="credits-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 16,
        }}
      >
        {CREDIT_PACKAGES.map((pkg) => (
          <div
            key={pkg.id}
            style={{
              border: pkg.popular ? "2px solid #2563eb" : "1px solid #ddd",
              borderRadius: 8,
              padding: 16,
              position: "relative",
            }}
          >
            {pkg.popular && (
              <span
                style={{
                  position: "absolute",
                  top: -10,
                  left: 16,
                  background: "#2563eb",
                  color: "white",
                  fontSize: 12,
                  padding: "2px 8px",
                  borderRadius: 4,
                }}
              >
                推荐
              </span>
            )}
            <h2 style={{ marginTop: 8 }}>{pkg.name}</h2>
            <p style={{ fontSize: 32, fontWeight: "bold", margin: "12px 0" }}>
              {pkg.credits}
              <span style={{ fontSize: 14, fontWeight: "normal" }}> 积分</span>
            </p>
            {pkg.bonus > 0 && (
              <p style={{ color: "#16a34a", fontSize: 14 }}>
                含 {pkg.bonus} 积分赠送
              </p>
            )}
            <p style={{ fontSize: 24, margin: "12px 0" }}>${pkg.amountUsd}</p>
            <CheckoutButton packageId={pkg.id} />
          </div>
        ))}
      </div>
    </main>
  );
}
