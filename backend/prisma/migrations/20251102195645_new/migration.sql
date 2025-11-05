-- CreateTable
CREATE TABLE "public"."Holdings" (
    "id" TEXT NOT NULL,
    "shares" DOUBLE PRECISION NOT NULL,
    "avgPrice" DOUBLE PRECISION NOT NULL,
    "userId" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Holdings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Holdings_userId_marketId_key" ON "public"."Holdings"("userId", "marketId");

-- AddForeignKey
ALTER TABLE "public"."Holdings" ADD CONSTRAINT "Holdings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Holdings" ADD CONSTRAINT "Holdings_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "public"."Market"("id") ON DELETE CASCADE ON UPDATE CASCADE;
