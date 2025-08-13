-- CreateEnum
CREATE TYPE "public"."MarketStatus" AS ENUM ('ACTIVE', 'RESOLVED', 'CLOSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."MarketResolution" AS ENUM ('YES', 'NO', 'NULL');

-- CreateTable
CREATE TABLE "public"."Market" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'yes/no',
    "description" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "status" "public"."MarketStatus" NOT NULL DEFAULT 'ACTIVE',
    "resolution" "public"."MarketResolution" NOT NULL DEFAULT 'NULL',
    "initialPriceYes" DOUBLE PRECISION NOT NULL,
    "currentPriceYes" DOUBLE PRECISION NOT NULL,
    "totalVolume" DOUBLE PRECISION NOT NULL,
    "spread" DOUBLE PRECISION NOT NULL,
    "yesShares" BIGINT NOT NULL,
    "noShares" BIGINT NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Market_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Market_title_key" ON "public"."Market"("title");
