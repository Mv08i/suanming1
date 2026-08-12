import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardView from "./dashboard-view";

type Txn = {
  id: string;
  type: string;
  amount: number;
  balanceAfter: number;
  requestId: string | null;
  description: string | null;
  createdAt: Date;
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = session.user.id;

  const [balance, recentTxnsRaw, aiReqCounts] = await Promise.all([
    prisma.creditBalance.findUnique({ where: { userId } }),
    prisma.creditTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 15,
      select: {
        id: true,
        type: true,
        amount: true,
        balanceAfter: true,
        requestId: true,
        description: true,
        createdAt: true,
      },
    }),
    prisma.aiRequest.groupBy({
      by: ["status"],
      where: { userId },
      _count: { _all: true },
    }),
  ]);

  const requestIds = recentTxnsRaw
    .map((t) => t.requestId)
    .filter((id): id is string => !!id);
  const requestMap = new Map<string, { model: string; errorMessage: string | null; status: string }>();
  if (requestIds.length > 0) {
    const reqs = await prisma.aiRequest.findMany({
      where: { id: { in: requestIds } },
      select: { id: true, model: true, errorMessage: true, status: true },
    });
    for (const r of reqs) requestMap.set(r.id, r);
  }

  const successCount = aiReqCounts.find((c) => c.status === "SUCCESS")?._count._all ?? 0;
  const failedCount = aiReqCounts.find((c) => c.status === "FAILED")?._count._all ?? 0;

  // 序列化 Date 为 ISO 字符串传给客户端组件
  const txns = recentTxnsRaw.map((t) => ({
    ...t,
    createdAt: t.createdAt.toISOString(),
  }));

  // requestMap 序列化为数组
  const reqs = Array.from(requestMap.entries()).map(([id, v]) => ({ id, ...v }));

  return (
    <DashboardView
      balance={balance?.balance ?? 0}
      totalCharged={balance?.totalCharged ?? 0}
      totalUsed={balance?.totalUsed ?? 0}
      successCount={successCount}
      failedCount={failedCount}
      txns={txns}
      reqs={reqs}
      userName={session.user.name ?? session.user.email ?? ""}
    />
  );
}
