import { Creem } from "creem";

// Creem 客户端单例
// 文档: https://docs.creem.io/api-reference/introduction
const apiKey = process.env.CREEM_API_KEY;
const server = process.env.NODE_ENV === "production" ? "prod" : "test";

if (!apiKey) {
  // 不抛错，避免阻塞启动；真正调用 checkout 时会因 401 暴露问题
  console.warn("[creem] CREEM_API_KEY 未设置，checkout 调用会失败");
}

export const creem = new Creem({ apiKey, server });

// 充值套餐配置（3 档带 bonus）
export type CreditPackage = {
  id: string;
  name: string;
  baseCredits: number;
  bonus: number;
  credits: number; // 实际到账 = base + bonus
  amountUsd: number;
  amountUsdCents: number;
  productId: string | undefined;
  description: string;
  popular?: boolean;
};

export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: "100",
    name: "Starter",
    baseCredits: 100,
    bonus: 0,
    credits: 100,
    amountUsd: 1,
    amountUsdCents: 100,
    productId: process.env.CREEM_PRODUCT_100,
    description: "100 credits",
  },
  {
    id: "600",
    name: "Popular",
    baseCredits: 500,
    bonus: 100,
    credits: 600,
    amountUsd: 5,
    amountUsdCents: 500,
    productId: process.env.CREEM_PRODUCT_600,
    description: "500 + 100 bonus",
    popular: true,
  },
  {
    id: "2500",
    name: "Best Value",
    baseCredits: 2000,
    bonus: 500,
    credits: 2500,
    amountUsd: 20,
    amountUsdCents: 2000,
    productId: process.env.CREEM_PRODUCT_2500,
    description: "2000 + 500 bonus",
  },
];

export function getPackageById(id: string): CreditPackage | undefined {
  return CREDIT_PACKAGES.find((p) => p.id === id);
}

/**
 * 创建 Creem Checkout Session
 * 返回 checkoutId（用于本地建订单）和 checkoutUrl（前端重定向过去支付）
 */
export async function createCheckoutSession(params: {
  pkg: CreditPackage;
  userId: string;
  userEmail: string;
  successUrl: string;
  requestId: string;
}): Promise<{ checkoutId: string; checkoutUrl: string }> {
  const { pkg } = params;
  if (!pkg.productId) {
    throw new Error(
      `套餐 ${pkg.id} 的 Creem product_id 未配置（检查 .env 的 CREEM_PRODUCT_${pkg.id}）`,
    );
  }

  const checkout = await creem.checkouts.create({
    productId: pkg.productId,
    successUrl: params.successUrl,
    customer: { email: params.userEmail },
    requestId: params.requestId,
    metadata: {
      userId: params.userId,
      packageId: pkg.id,
      credits: String(pkg.credits),
    },
  });

  const checkoutUrl = checkout.checkoutUrl;
  if (!checkoutUrl) {
    throw new Error("Creem 返回的 checkout 缺少 checkout_url 字段");
  }

  return { checkoutId: checkout.id, checkoutUrl };
}
