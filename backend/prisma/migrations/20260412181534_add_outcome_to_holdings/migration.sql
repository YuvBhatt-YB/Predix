/*
  Warnings:

  - A unique constraint covering the columns `[userId,marketId,outcome]` on the table `Holdings` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Holdings_userId_marketId_key";

-- AlterTable
ALTER TABLE "Holdings" ADD COLUMN     "outcome" "OrderOutcome" NOT NULL DEFAULT 'YES';

-- CreateIndex
CREATE UNIQUE INDEX "Holdings_userId_marketId_outcome_key" ON "Holdings"("userId", "marketId", "outcome");
