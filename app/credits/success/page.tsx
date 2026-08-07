import Link from "next/link";

export default function SuccessPage() {
  return (
    <main
      style={{
        maxWidth: 600,
        margin: "0 auto",
        padding: 24,
        textAlign: "center",
      }}
    >
      <h1>✅ 支付成功</h1>
      <p style={{ color: "#666", marginTop: 16 }}>
        积分到账可能需要几秒钟（取决于 Creem webhook 回调速度），
        <br />
        请到控制台查看余额。
      </p>
      <Link
        href="/dashboard"
        style={{
          display: "inline-block",
          marginTop: 24,
          padding: "10px 24px",
          background: "#2563eb",
          color: "white",
          borderRadius: 6,
          textDecoration: "none",
        }}
      >
        返回控制台
      </Link>
    </main>
  );
}
