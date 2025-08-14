/*
  Warnings:

  - You are about to alter the column `yesShares` on the `Market` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `noShares` on the `Market` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.

*/
-- AlterTable
ALTER TABLE "public"."Market" ALTER COLUMN "yesShares" SET DATA TYPE INTEGER,
ALTER COLUMN "noShares" SET DATA TYPE INTEGER;
