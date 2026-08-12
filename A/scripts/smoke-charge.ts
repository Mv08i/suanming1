import { PrismaClient } from "@prisma/client";
import { deductCredits, FIXED_PER_CALL_CREDITS } from "../lib/credits";

const prisma = new PrismaClient();

async function run() {
  const u = await prisma.user.findFirst({
    where: { email: "testuser001@example.com" },
  });
  if (!u) return console.log("no user");
  const userId = u.id;

  const initBal = await prisma.creditBalance.findUnique({ where: { userId } });
  console.log("初始余额:", initBal?.balance, "totalUsed:", initBal?.totalUsed);

  // 模拟 2 次成功对话
  for (let i = 0; i < 2; i++) {
    const req = await prisma.aiRequest.create({
      data: {
        userId,
        model: "mock-echo",
        creditsReserved: FIXED_PER_CALL_CREDITS,
        status: "PENDING",
      },
    });
    const d = await deductCredits({
      userId,
      amount: FIXED_PER_CALL_CREDITS,
      requestId: req.id,
      description: "AI 对话 (mock-echo)",
    });
    console.log(`  [${i + 1}] 扣5积分:`, d);
    await prisma.aiRequest.update({
      where: { id: req.id },
      data: {
        status: "SUCCESS",
        creditsCharged: FIXED_PER_CALL_CREDITS,
        completedAt: new Date(),
        inputTokens: 10 + i,
        outputTokens: 20 + i,
      },
    });
  }

  const afterBal = await prisma.creditBalance.findUnique({ where: { userId } });
  console.log("\n两次扣费后余额:", afterBal?.balance, "totalUsed:", afterBal?.totalUsed);

  await prisma.$disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
