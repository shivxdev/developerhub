/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "headline" TEXT,
ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "linkedinUrl" TEXT,
ADD COLUMN     "twitterUrl" TEXT,
ADD COLUMN     "username" TEXT,
ADD COLUMN     "websiteUrl" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
