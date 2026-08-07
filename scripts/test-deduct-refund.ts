import { PrismaClient } from "@prisma/client";
import { deductCredits, refundCredits, FIXED_PER_CALL_CREDITS } from "../lib/credits";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: "testuser001@example.com" },
    include: { balance: true },
  });
  if (!user) throw new Error("用户不存在");
  const userId = user.id;
  console.log("=== 初始状态 ===");
  console.log(`用户余额: ${user.balance?.balance} | totalUsed: ${user.balance?.totalUsed}`);

  // 1. 第一次扣 5 积分（成功）
  const req1Id = "test-req-" + Date.now() + "-1";
  await prisma.aiRequest.create({
    data: { id: req1Id, userId, model: "test", creditsReserved: FIXED_PER_CALL_CREDITS, status: "PENDING" },
  });
  const ded1 = await deductCredits({
    userId,
    amount: FIXED_PER_CALL_CREDITS,
    requestId: req1Id,
    description: "AI 对话测试1",
  });
  console.log("\n=== [1] deductCredits 第1次 ===");
  console.log(ded1);

  // 2. 同样 requestId 再扣一次（幂等，应返回 alreadyDeducted）
  const ded1b = await deductCredits({
    userId,
    amount: FIXED_PER_CALL_CREDITS,
    requestId: req1Id,
    description: "AI 对话测试1 重复",
  });
  console.log("\n=== [2] deductCredits 同 requestId 重复（幂等） ===");
  console.log(ded1b);
  console.log("幂等正确?", ded1b.alreadyDeducted === true && ded1b.transactionId === ded1.transactionId);

  // 3. 扣 999999 积分（余额不足拦截）
  const dedBad = await deductCredits({
    userId,
    amount: 999999,
    description: "测试余额不足",
  });
  console.log("\n=== [3] deductCredits 余额不足 ===");
  console.log(dedBad);
  console.log("正确拦截?", dedBad.success === false && dedBad.error?.includes("余额不足"));

  // 4. 退 5 积分（req1Id 失败回退）
  await prisma.aiRequest.update({ where: { id: req1Id }, data: { status: "FAILED", errorMessage: "mock failure" } });
  const ref1 = await refundCredits({
    userId,
    amount: FIXED_PER_CALL_CREDITS,
    requestId: req1Id,
    description: "AI 调用失败回退",
  });
  console.log("\n=== [4] refundCredits 回退 ===");
  console.log(ref1);

  // 5. 同 requestId 再退一次（幂等 alreadyRefunded）
  const ref1b = await refundCredits({
    userId,
    amount: FIXED_PER_CALL_CREDITS,
    requestId: req1Id,
    description: "重复回退",
  });
  console.log("\n=== [5] refundCredits 重复（幂等） ===");
  console.log(ref1b);
  console.log("幂等正确?", ref1b.alreadyRefunded === true);

  // 6. 超退：退 1000 超过可退上限
  const req2Id = "test-req-" + Date.now() + "-2";
  await prisma.aiRequest.create({
    data: { id: req2Id, userId, model: "test", creditsReserved: 5, status: "FAILED" },
  });
  await deductCredits({ userId, amount: 5, requestId: req2Id });
  const refBad = await refundCredits({
    userId,
    amount: 1000,
    requestId: req2Id,
    description: "超退测试",
  });
  console.log("\n=== [6] refundCredits 超退拦截 ===");
  console.log(refBad);
  console.log("正确拦截?", refBad.success === false && refBad.error?.includes("超过可退上限"));

  // 最终检查
  const b = await prisma.creditBalance.findUnique({ where: { userId } });
  const txns = await prisma.creditTransaction.count({ where: { userId } });
  console.log("\n=== 最终 ===");
  console.log(`余额: ${b?.balance} (初始 300 - 扣5 + 退5 - 扣5 = 295)`);
  console.log(`totalUsed: ${b?.totalUsed} (应=10，因为扣了两次5)`);
  console.log(`流水条数: ${txns}`);

  // 清理测试数据
  console.log("\n清理测试产生的 AiRequest 和关联流水...");
  await prisma.creditTransaction.deleteMany({
    where: { requestId: { in: [req1Id, req2Id] } },
  });
  await prisma.aiRequest.deleteMany({ where: { id: { in: [req1Id, req2Id] } } });
  console.log("已清理；为保证余额回到 300 totalUsed=0，重置余额");
  await prisma.creditBalance.update({
    where: { userId },
    data: { balance: 300, totalCharged: 300, totalUsed: 0 },
  });
  console.log("余额已重置为 300, totalUsed=0");
}

main()
  .catch((e) => { console.error("FAIL:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
