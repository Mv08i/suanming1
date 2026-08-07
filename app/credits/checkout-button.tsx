"use client";

import { useState } from "react";

export function CheckoutButton({ packageId }: { packageId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/creem/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "创建订单失败");
      }
      // 重定向到 Creem 托管的支付页
      window.location.href = data.checkoutUrl;
    } catch (e) {
      setError((e as Error).message);
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        style={{
          width: "100%",
          padding: "10px 16px",
          background: loading ? "#94a3b8" : "#2563eb",
          color: "white",
          border: "none",
          borderRadius: 6,
          cursor: loading ? "not-allowed" : "pointer",
          fontSize: 14,
        }}
      >
        {loading ? "跳转中..." : "购买"}
      </button>
      {error && (
        <p style={{ color: "#dc2626", fontSize: 12, marginTop: 8 }}>{error}</p>
      )}
    </div>
  );
}
