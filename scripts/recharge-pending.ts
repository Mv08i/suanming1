import { PrismaClient } from "@prisma/client";
import { applyRecharge } from "../lib/credits";

const prisma = new PrismaClient();

async function main() {
  const pendingOrders = await prisma.rechargeOrder.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
  });
  console.log(`找到 ${pendingOrders.length} 个 PENDING 订单，开始入账...\n`);

  for (const order of pendingOrders) {
    const result = await applyRecharge(order.id);
    console.log(
      `订单 ${order.id} (${order.credits}积分 / $${(order.amountUsdCents / 100).toFixed(2)}):`,
      result,
    );
  }

  if (pendingOrders.length > 0) {
    const userId = pendingOrders[0].userId;
    const balance = await prisma.creditBalance.findUnique({
      where: { userId },
    });
    console.log("\n=== 最终余额 ===");
    console.log(balance);

    const txns = await prisma.creditTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    console.log(`\n=== 流水 (${txns.length} 条) ===`);
    for (const t of txns) {
      console.log(
        `  [${t.type}] ${t.amount > 0 ? "+" : ""}${t.amount} → 余额${t.balanceAfter} | ${t.description ?? ""}`,
      );
    }
  }
}

main()
  .catch((e) => {
    console.error("入账失败:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
