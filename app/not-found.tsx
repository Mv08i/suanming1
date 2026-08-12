import Link from "next/link";

export default function NotFound() {
  return (
    <html>
      <body>
        <main
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            fontFamily: "system-ui, sans-serif",
            background: "#1a1310",
            color: "#e8dcc8",
          }}
        >
          <div style={{ textAlign: "center", maxWidth: 480 }}>
            <div style={{ fontSize: 72, fontWeight: 800, color: "#a52a2a", letterSpacing: 8 }}>
              404
            </div>
            <h1 style={{ fontSize: 24, color: "#c9a961", marginTop: 16, letterSpacing: 3 }}>
              页面不存在
            </h1>
            <p style={{ color: "#8a7a65", marginTop: 12, lineHeight: 1.7 }}>
              The page you are looking for does not exist or has been moved.
            </p>
            <div style={{ marginTop: 32, display: "flex", gap: 16, justifyContent: "center" }}>
              <Link
                href="/"
                style={{
                  padding: "10px 24px",
                  background: "#a52a2a",
                  color: "white",
                  textDecoration: "none",
                  borderRadius: 6,
                  fontWeight: 600,
                }}
              >
                返回首页
              </Link>
              <Link
                href="/login"
                style={{
                  padding: "10px 24px",
                  border: "1px solid #c9a961",
                  color: "#c9a961",
                  textDecoration: "none",
                  borderRadius: 6,
                  fontWeight: 600,
                }}
              >
                去登录
              </Link>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
