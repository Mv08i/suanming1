-- AlterTable
ALTER TABLE "ai_requests" ADD COLUMN     "category" TEXT;

-- CreateTable
CREATE TABLE "divination_records" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "question" TEXT,
    "castData" JSONB NOT NULL,
    "summary" TEXT,
    "requestId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "divination_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "divination_records_userId_createdAt_idx" ON "divination_records"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "divination_records_type_idx" ON "divination_records"("type");

-- CreateIndex
CREATE INDEX "ai_requests_category_idx" ON "ai_requests"("category");

-- AddForeignKey
ALTER TABLE "divination_records" ADD CONSTRAINT "divination_records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
