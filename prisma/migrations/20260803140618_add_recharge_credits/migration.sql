-- CreateTable
CREATE TABLE "recharge_orders" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "creemCheckoutId" TEXT NOT NULL,
    "creemTransactionId" TEXT,
    "creemCustomerId" TEXT,
    "productId" TEXT NOT NULL,
    "amountUsdCents" INTEGER NOT NULL,
    "credits" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "recharge_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_transactions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "balanceAfter" INTEGER NOT NULL,
    "orderId" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "credit_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "recharge_orders_creemCheckoutId_key" ON "recharge_orders"("creemCheckoutId");

-- CreateIndex
CREATE INDEX "recharge_orders_userId_idx" ON "recharge_orders"("userId");

-- CreateIndex
CREATE INDEX "recharge_orders_status_idx" ON "recharge_orders"("status");

-- CreateIndex
CREATE INDEX "credit_transactions_userId_createdAt_idx" ON "credit_transactions"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "recharge_orders" ADD CONSTRAINT "recharge_orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_transactions" ADD CONSTRAINT "credit_transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_transactions" ADD CONSTRAINT "credit_transactions_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "recharge_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
