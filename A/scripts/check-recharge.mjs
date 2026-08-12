import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: "testuser001@example.com" },
  });
  if (!user) {
    console.log("用户 testuser001@example.com 不存在");
    return;
  }
  console.log("=== 用户 ===");
  console.log("id:", user.id);
  console.log("email:", user.email);

  console.log("\n=== 余额 ===");
  const balance = await prisma.creditBalance.findUnique({
    where: { userId: user.id },
  });
  console.log(balance ?? "（无余额记录）");

  console.log("\n=== 充值订单 ===");
  const orders = await prisma.rechargeOrder.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  console.log("订单数:", orders.length);
  for (const o of orders) {
    console.log(
      `  [${o.status}] ${o.credits}积分 / $${(o.amountUsdCents / 100).toFixed(2)} | checkout=${o.creemCheckoutId} | 创建=${o.createdAt.toISOString()} | 支付=${o.paidAt?.toISOString() ?? "null"}`,
    );
  }

  console.log("\n=== 积分流水 ===");
  const txns = await prisma.creditTransaction.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  console.log("流水数:", txns.length);
  for (const t of txns) {
    console.log(
      `  [${t.type}] ${t.amount > 0 ? "+" : ""}${t.amount} → 余额${t.balanceAfter} | ${t.description ?? ""} | ${t.createdAt.toISOString()}`,
    );
  }
}

main()
  .catch((e) => {
    console.error("查询失败:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
