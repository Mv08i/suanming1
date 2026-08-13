// 验证脚本：查出用户最近5条流水和当前余额
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

(async () => {
  const email = process.argv[2];
  if (!email) {
    console.error("用法: node scripts/check-balance.cjs <邮箱>");
    process.exit(1);
  }
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      balance: true,
      transactions: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });
  if (!user) {
    console.error("未找到用户");
    process.exit(2);
  }
  console.log("==== 用户信息 ====");
  console.log(`ID    : ${user.id}`);
  console.log(`邮箱  : ${user.email}`);
  console.log(`余额  : ${user.balance?.balance ?? "N/A"}`);
  console.log(`累计充: ${user.balance?.totalCharged ?? "N/A"}`);
  console.log(`累计用: ${user.balance?.totalUsed ?? "N/A"}`);
  console.log("\n==== 最近 5 条流水 ====");
  for (const tx of user.transactions ?? []) {
    console.log(
      `[${tx.createdAt.toISOString()}] ${tx.type.padEnd(8)}  ${String(tx.amount).padStart(6)}  余额${tx.balanceAfter}  | ${tx.description ?? ""}`
    );
  }
  await prisma.$disconnect();
})();