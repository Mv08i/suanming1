/**
 * 给指定邮箱账号直接增加积分（手动入账脚本）。
 *
 * 保证审计一致性：
 *   1) 先查 creditBalance FOR UPDATE 行锁，防并发异常
 *   2) 同时写入 CreditTransaction（type=RECHARGE），描述中注明「后台手动入账」
 *   3) creditBalance.totalCharged 同步累加（保持与充值行为一致）
 *
 * 用法：
 *   node scripts/add-credits-by-email.cjs <邮箱> <数量>
 *
 * 例：
 *   node scripts/add-credits-by-email.cjs 3279063230@qq.com 100
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const TX_OPTS = { timeout: 30000, maxWait: 15000 };

async function main() {
  const args = process.argv.slice(2);
  const email = args[0];
  const amount = parseInt(args[1], 10);

  if (!email || !amount || amount <= 0 || Number.isNaN(amount)) {
    console.error("用法: node scripts/add-credits-by-email.cjs <邮箱> <正数数量>");
    process.exit(1);
  }

  // 1) 先定位用户
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`[X] 找不到邮箱为 ${email} 的用户`);
    process.exit(2);
  }
  console.log(`[i] 目标用户: id=${user.id}  name=${user.name ?? "无"}  email=${user.email}`);

  const result = await prisma.$transaction(async (tx) => {
    // 行锁
    await tx.$queryRaw`SELECT * FROM credit_balances WHERE "userId" = ${user.id} FOR UPDATE`;
    const balanceRow = await tx.creditBalance.findUnique({ where: { userId: user.id } });
    if (!balanceRow) {
      throw new Error(`用户 ${user.id} 没有 credit_balance 记录，先注册或登录一次后再试`);
    }
    const oldBalance = balanceRow.balance;
    const oldTotalCharged = balanceRow.totalCharged;
    const newBalance = oldBalance + amount;
    const newTotalCharged = oldTotalCharged + amount;

    await tx.creditBalance.update({
      where: { userId: user.id },
      data: { balance: newBalance, totalCharged: newTotalCharged },
    });

    const txn = await tx.creditTransaction.create({
      data: {
        userId: user.id,
        type: "RECHARGE",
        amount,
        balanceAfter: newBalance,
        description: `后台手动入账 +${amount} 积分（脚本 add-credits-by-email）`,
      },
    });

    return { txn, oldBalance, newBalance, oldTotalCharged, newTotalCharged };
  }, TX_OPTS);

  console.log("");
  console.log("=========== 成功入账 ===========");
  console.log(`用户邮箱   : ${user.email}`);
  console.log(`变动积分   : +${amount}`);
  console.log(`变动前余额 : ${result.oldBalance}`);
  console.log(`变动后余额 : ${result.newBalance}`);
  console.log(`累计充值   : ${result.oldTotalCharged} -> ${result.newTotalCharged}`);
  console.log(`流水ID     : ${result.txn.id}`);
  console.log(`流水描述   : ${result.txn.description}`);
  console.log(`写入时间   : ${result.txn.createdAt.toISOString()}`);
  console.log("================================");
}

main()
  .catch((e) => {
    console.error("[FATAL]", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());