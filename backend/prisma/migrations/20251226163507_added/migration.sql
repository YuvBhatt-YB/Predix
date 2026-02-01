/*
  Warnings:

  - Added the required column `remainingQuantity` to the `Trade` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Trade" ADD COLUMN     "remainingQuantity" DOUBLE PRECISION NOT NULL;
