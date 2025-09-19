/*
  Warnings:

  - Added the required column `userProfileImg` to the `Comment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Comment" ADD COLUMN     "userProfileImg" TEXT NOT NULL;
