-- CreateEnum
CREATE TYPE "MarketStatus" AS ENUM ('ACTIVE', 'RESOLVED', 'CLOSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('BUY', 'SELL');

-- CreateEnum
CREATE TYPE "OrderOutcome" AS ENUM ('YES', 'NO');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('OPEN', 'MATCHED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('CREDIT', 'DEBIT', 'TRADE_LOCK', 'TRADE_RELEASE', 'TRADE_PAYOUT', 'LOSS');

-- CreateEnum
CREATE TYPE "MarketResolution" AS ENUM ('YES', 'NO', 'NULL');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "profileImg" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wallet" (
    "id" TEXT NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL,
    "locked" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "userID" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Holdings" (
    "id" TEXT NOT NULL,
    "shares" DOUBLE PRECISION NOT NULL,
    "avgPrice" DOUBLE PRECISION NOT NULL,
    "userId" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Holdings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Market" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'yes/no',
    "description" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "status" "MarketStatus" NOT NULL DEFAULT 'ACTIVE',
    "resolution" "MarketResolution" NOT NULL DEFAULT 'NULL',
    "initialPriceYes" DOUBLE PRECISION NOT NULL,
    "currentPriceYes" DOUBLE PRECISION NOT NULL,
    "totalVolume" DOUBLE PRECISION NOT NULL,
    "spread" DOUBLE PRECISION NOT NULL,
    "yesShares" INTEGER NOT NULL,
    "noShares" INTEGER NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Market_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "userProfileImg" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "type" "OrderType" NOT NULL,
    "outcome" "OrderOutcome" NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "OrderStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trade" (
    "id" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "buyOrderId" TEXT NOT NULL,
    "sellOrderId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "outcome" "OrderOutcome" NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Trade_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_userID_key" ON "Wallet"("userID");

-- CreateIndex
CREATE UNIQUE INDEX "Holdings_userId_marketId_key" ON "Holdings"("userId", "marketId");

-- CreateIndex
CREATE UNIQUE INDEX "Market_title_key" ON "Market"("title");

-- CreateIndex
CREATE INDEX "Market_createdAt_idx" ON "Market"("createdAt");

-- CreateIndex
CREATE INDEX "Comment_marketId_createdAt_idx" ON "Comment"("marketId", "createdAt");

-- CreateIndex
CREATE INDEX "Order_marketId_createdAt_idx" ON "Order"("marketId", "createdAt");

-- CreateIndex
CREATE INDEX "Order_userId_createdAt_idx" ON "Order"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Holdings" ADD CONSTRAINT "Holdings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Holdings" ADD CONSTRAINT "Holdings_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "Market"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "Market"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "Market"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "Market"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_buyOrderId_fkey" FOREIGN KEY ("buyOrderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_sellOrderId_fkey" FOREIGN KEY ("sellOrderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
