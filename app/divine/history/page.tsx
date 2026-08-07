import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import HistoryList from "./history-list";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const records = await prisma.divinationRecord.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // 序列化 Date 为 ISO 字符串，以便传给客户端组件
  const safe = records.map((r) => ({
    id: r.id,
    type: r.type,
    question: r.question,
    castData: r.castData as unknown as Record<string, unknown>,
    summary: r.summary,
    createdAt: r.createdAt.toISOString(),
  }));

  return <HistoryList records={safe} />;
}
