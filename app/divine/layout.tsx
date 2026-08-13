import { auth } from "@/lib/auth";
import DivineHeader from "./divine-header";

export const metadata = {
  title: "卜微 · AI 命理咨询",
  description: "六爻 · 梅花易数 · 奇门遁甲",
};

export default async function DivineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 游客可浏览命理咨询页；起卦/解卦 API 自身校验登录，未登录返回 401 由前端跳 /login
  const session = await auth();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #1a1410 0%, #0f0a08 100%)",
        color: "#e8dcc8",
        fontFamily:
          '"Songti SC","Noto Serif SC","Source Han Serif SC","SimSun",serif',
      }}
    >
      <DivineHeader email={session?.user?.email ?? null} />
      <main className="divine-main" style={{ maxWidth: 960, margin: "0 auto", padding: "24px 16px" }}>
        {children}
      </main>
    </div>
  );
}
