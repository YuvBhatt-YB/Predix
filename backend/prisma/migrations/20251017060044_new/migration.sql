-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."TransactionType" ADD VALUE 'TRADE_LOCK';
ALTER TYPE "public"."TransactionType" ADD VALUE 'TRADE_RELEASE';
ALTER TYPE "public"."TransactionType" ADD VALUE 'TRADE_PAYOUT';
ALTER TYPE "public"."TransactionType" ADD VALUE 'LOSS';

-- AlterTable
ALTER TABLE "public"."Wallet" ADD COLUMN     "locked" DOUBLE PRECISION NOT NULL DEFAULT 0;
