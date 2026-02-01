/*
  Warnings:

  - You are about to drop the column `remainingQuantity` on the `Trade` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "remainingQuantity" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Trade" DROP COLUMN "remainingQuantity";
