/**
 * 验证新用户注册赠送积分是否正确
 *
 * 用法：
 *   npx tsx scripts/verify-signup-bonus.ts <email>
 *
 * 检查项：
 *   1. 用户存在
 *   2. CreditBalance.balance === 15
 *   3. CreditBalance.totalCharged === 15
 *   4. CreditBalance.totalUsed === 0
 *   5. 存在一条 RECHARGE 流水：amount=15, balanceAfter=15, description 含「注册赠送」
 *
 * 退出码：0=全部通过，1=有失败项
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const EXPECTED = 15;

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("用法: npx tsx scripts/verify-signup-bonus.ts <email>");
    process.exit(1);
  }

  console.log(`\n🔍 验证用户 ${email} 的注册赠送积分\n${"=".repeat(50)}`);

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    include: {
      balance: true,
      transactions: {
        where: { type: "RECHARGE" },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  const checks: { name: string; pass: boolean; detail: string }[] = [];

  // 1. 用户存在
  checks.push({
    name: "用户存在",
    pass: !!user,
    detail: user ? `id=${user.id}` : "未找到",
  });
  if (!user) {
    printReport(checks);
    process.exit(1);
  }

  // 2-4. 余额检查
  const bal = user.balance;
  checks.push({
    name: `余额 balance === ${EXPECTED}`,
    pass: bal?.balance === EXPECTED,
    detail: `实际: ${bal?.balance ?? "无余额行"}`,
  });
  checks.push({
    name: `累计充值 totalCharged === ${EXPECTED}`,
    pass: bal?.totalCharged === EXPECTED,
    detail: `实际: ${bal?.totalCharged ?? "无余额行"}`,
  });
  checks.push({
    name: `累计消耗 totalUsed === 0`,
    pass: bal?.totalUsed === 0,
    detail: `实际: ${bal?.totalUsed ?? "无余额行"}`,
  });

  // 5. 审计流水
  const bonusTxn = user.transactions.find(
    (t) =>
      t.amount === EXPECTED &&
      t.balanceAfter === EXPECTED &&
      (t.description ?? "").includes("注册赠送"),
  );
  checks.push({
    name: `存在注册赠送流水 (RECHARGE / amount=${EXPECTED} / balanceAfter=${EXPECTED})`,
    pass: !!bonusTxn,
    detail: bonusTxn
      ? `txnId=${bonusTxn.id}, desc="${bonusTxn.description}"`
      : `未找到匹配流水（共 ${user.transactions.length} 条 RECHARGE 记录）`,
  });

  printReport(checks);
  const allPass = checks.every((c) => c.pass);
  process.exit(allPass ? 0 : 1);
}

function printReport(checks: { name: string; pass: boolean; detail: string }[]) {
  console.log("");
  for (const c of checks) {
    const icon = c.pass ? "✅" : "❌";
    console.log(`${icon} ${c.name}`);
    console.log(`     ${c.detail}`);
  }
  const failed = checks.filter((c) => !c.pass).length;
  console.log(`\n${"=".repeat(50)}`);
  if (failed === 0) {
    console.log(`🎉 全部 ${checks.length} 项检查通过\n`);
  } else {
    console.log(`⚠️  ${failed}/${checks.length} 项未通过\n`);
  }
}

main()
  .catch((e) => {
    console.error("脚本异常:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
