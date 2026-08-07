import { prisma } from "./prisma";
import type { CreditPackage } from "./creem";
import type { RechargeOrder } from "@prisma/client";

const TX_OPTS = { timeout: 30000, maxWait: 15000 } as const;

/**
 * 创建充值订单（PENDING 状态）
 */
export async function createRechargeOrder(params: {
  userId: string;
  pkg: CreditPackage;
  creemCheckoutId: string;
}): Promise<RechargeOrder> {
  return prisma.rechargeOrder.create({
    data: {
      userId: params.userId,
      creemCheckoutId: params.creemCheckoutId,
      productId: params.pkg.productId ?? "",
      amountUsdCents: params.pkg.amountUsdCents,
      credits: params.pkg.credits,
      status: "PENDING",
    },
  });
}

/**
 * 充值入账（幂等 + 事务 + 行锁）
 */
export async function applyRecharge(orderId: string): Promise<{
  success: boolean;
  alreadyProcessed?: boolean;
  error?: string;
}> {
  return prisma.$transaction(async (tx) => {
    const order = await tx.rechargeOrder.findUnique({
      where: { id: orderId },
    });
    if (!order) return { success: false, error: `订单 ${orderId} 不存在` };
    if (order.status === "PAID") return { success: true, alreadyProcessed: true };
    if (order.status === "FAILED") return { success: false, error: "订单已失败" };

    await tx.$queryRaw`SELECT * FROM credit_balances WHERE "userId" = ${order.userId} FOR UPDATE`;
    const balance = await tx.creditBalance.findUnique({
      where: { userId: order.userId },
    });
    if (!balance) return { success: false, error: `用户 ${order.userId} 余额记录不存在` };

    const newBalance = balance.balance + order.credits;

    await tx.creditBalance.update({
      where: { userId: order.userId },
      data: {
        balance: newBalance,
        totalCharged: balance.totalCharged + order.credits,
      },
    });
    await tx.creditTransaction.create({
      data: {
        userId: order.userId,
        type: "RECHARGE",
        amount: order.credits,
        balanceAfter: newBalance,
        orderId: order.id,
        description: `充值 ${order.credits} 积分`,
      },
    });
    await tx.rechargeOrder.update({
      where: { id: order.id },
      data: { status: "PAID", paidAt: new Date() },
    });

    return { success: true };
  }, TX_OPTS);
}

/**
 * 扣积分（单点扣费入口：所有消耗都走这里，保证行为一致）
 *
 * - 行锁：同用户并发串行，防超扣
 * - 余额不足：立即返回错误，不扣
 * - 幂等：传 `requestId` 时，同一 requestId 第二次调用直接返回原结果（防重复扣费）
 *   实现：查 `requestId -> creditTransaction(type=USE)` 若已存在则返回原记录 balanceAfter
 */
export async function deductCredits(params: {
  userId: string;
  amount: number; // 要扣多少（正数）
  description?: string;
  requestId?: string; // AiRequest.id，用于幂等 + 关联流水
}): Promise<{
  success: boolean;
  error?: string;
  newBalance?: number;
  transactionId?: string;
  alreadyDeducted?: boolean;
}> {
  if (params.amount <= 0) return { success: false, error: "扣费金额必须 > 0" };

  return prisma.$transaction(async (tx) => {
    // 幂等：同一 requestId 已扣过的不再扣
    if (params.requestId) {
      const existing = await tx.creditTransaction.findFirst({
        where: {
          userId: params.userId,
          requestId: params.requestId,
          type: "USE",
        },
      });
      if (existing) {
        return {
          success: true,
          alreadyDeducted: true,
          newBalance: existing.balanceAfter,
          transactionId: existing.id,
        };
      }
    }

    // 锁余额行
    await tx.$queryRaw`SELECT * FROM credit_balances WHERE "userId" = ${params.userId} FOR UPDATE`;
    const balance = await tx.creditBalance.findUnique({
      where: { userId: params.userId },
    });
    if (!balance) return { success: false, error: "余额记录不存在" };

    if (balance.balance < params.amount) {
      return {
        success: false,
        error: `余额不足（需要 ${params.amount}，当前 ${balance.balance}）`,
      };
    }

    const newBalance = balance.balance - params.amount;
    const totalUsed = balance.totalUsed + params.amount;

    await tx.creditBalance.update({
      where: { userId: params.userId },
      data: { balance: newBalance, totalUsed },
    });
    const txn = await tx.creditTransaction.create({
      data: {
        userId: params.userId,
        type: "USE",
        amount: -params.amount,
        balanceAfter: newBalance,
        description: params.description,
        requestId: params.requestId,
      },
    });

    return {
      success: true,
      newBalance,
      transactionId: txn.id,
    };
  }, TX_OPTS);
}

/**
 * 退积分（失败回退时用，比如 AI 调用失败）
 *
 * - 行锁：同并发安全
 * - 幂等：同一 requestId 第二次调用直接返回原结果
 *   （查 requestId -> creditTransaction(type=REFUND) 已存在则返回）
 * - 回退金额不能超过原扣费金额：通过 AiRequest.creditsReserved - creditsRefunded 校验
 */
export async function refundCredits(params: {
  userId: string;
  amount: number; // 要退多少（正数）
  requestId: string; // AiRequest.id — 必须有，REFUND 必须关联请求才能对账
  description?: string;
}): Promise<{
  success: boolean;
  error?: string;
  newBalance?: number;
  transactionId?: string;
  alreadyRefunded?: boolean;
}> {
  if (params.amount <= 0) return { success: false, error: "回退金额必须 > 0" };

  return prisma.$transaction(async (tx) => {
    // 幂等：同一 requestId 已退过直接返回
    const existingRefund = await tx.creditTransaction.findFirst({
      where: {
        userId: params.userId,
        requestId: params.requestId,
        type: "REFUND",
      },
    });
    if (existingRefund) {
      return {
        success: true,
        alreadyRefunded: true,
        newBalance: existingRefund.balanceAfter,
        transactionId: existingRefund.id,
      };
    }

    // 校验：原 AiRequest 存在 + 回退累计不超过预扣
    const req = await tx.aiRequest.findUnique({ where: { id: params.requestId } });
    if (!req) return { success: false, error: `请求 ${params.requestId} 不存在` };
    const remainingToRefund = req.creditsReserved - req.creditsCharged - req.creditsRefunded;
    if (params.amount > remainingToRefund) {
      return {
        success: false,
        error: `回退金额 ${params.amount} 超过可退上限 ${remainingToRefund}`,
      };
    }

    // 锁余额行
    await tx.$queryRaw`SELECT * FROM credit_balances WHERE "userId" = ${params.userId} FOR UPDATE`;
    const balance = await tx.creditBalance.findUnique({
      where: { userId: params.userId },
    });
    if (!balance) return { success: false, error: "余额记录不存在" };

    const newBalance = balance.balance + params.amount;

    await tx.creditBalance.update({
      where: { userId: params.userId },
      data: { balance: newBalance },
    });
    const txn = await tx.creditTransaction.create({
      data: {
        userId: params.userId,
        type: "REFUND",
        amount: params.amount,
        balanceAfter: newBalance,
        description: params.description,
        requestId: params.requestId,
      },
    });

    // 更新 AiRequest 的回退累计
    await tx.aiRequest.update({
      where: { id: params.requestId },
      data: { creditsRefunded: req.creditsRefunded + params.amount },
    });

    return {
      success: true,
      newBalance,
      transactionId: txn.id,
    };
  }, TX_OPTS);
}

export const FIXED_PER_CALL_CREDITS = 5; // 每次 AI 对话固定扣费
export const SIGNUP_BONUS_CREDITS = 15; // 注册赠送积分
