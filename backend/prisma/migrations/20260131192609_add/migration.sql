/*
  Warnings:

  - Added the required column `orderType` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `Order` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "OrderSide" AS ENUM ('BUY', 'SELL');

-- CreateEnum
CREATE TYPE "OrderExecutionType" AS ENUM ('LIMIT', 'MARKET');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "orderType" "OrderExecutionType" NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" "OrderSide" NOT NULL;

-- DropEnum
DROP TYPE "OrderType";
