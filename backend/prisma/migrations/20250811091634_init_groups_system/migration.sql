/*
  Warnings:

  - You are about to drop the column `groupId` on the `Prise` table. All the data in the column will be lost.
  - Added the required column `creatorId` to the `Group` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ModerationLog" DROP CONSTRAINT "ModerationLog_priseId_fkey";

-- DropForeignKey
ALTER TABLE "Prise" DROP CONSTRAINT "Prise_groupId_fkey";

-- DropForeignKey
ALTER TABLE "Prise" DROP CONSTRAINT "Prise_userId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_groupId_fkey";

-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "creatorId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Prise" DROP COLUMN "groupId";

-- CreateTable
CREATE TABLE "PriseGroup" (
    "priseId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PriseGroup_pkey" PRIMARY KEY ("priseId","groupId")
);

-- CreateIndex
CREATE INDEX "PriseGroup_groupId_idx" ON "PriseGroup"("groupId");

-- CreateIndex
CREATE INDEX "Group_createdAt_idx" ON "Group"("createdAt");

-- CreateIndex
CREATE INDEX "Group_creatorId_idx" ON "Group"("creatorId");

-- CreateIndex
CREATE INDEX "GroupMember_groupId_role_idx" ON "GroupMember"("groupId", "role");

-- CreateIndex
CREATE INDEX "GroupMember_groupId_idx" ON "GroupMember"("groupId");

-- CreateIndex
CREATE INDEX "ModerationLog_createdAt_idx" ON "ModerationLog"("createdAt");

-- CreateIndex
CREATE INDEX "Prise_userId_idx" ON "Prise"("userId");

-- CreateIndex
CREATE INDEX "Prise_createdAt_idx" ON "Prise"("createdAt");

-- CreateIndex
CREATE INDEX "Report_priseId_idx" ON "Report"("priseId");

-- CreateIndex
CREATE INDEX "Report_spotId_idx" ON "Report"("spotId");

-- CreateIndex
CREATE INDEX "Report_userId_idx" ON "Report"("userId");

-- CreateIndex
CREATE INDEX "Report_priseId_resolved_idx" ON "Report"("priseId", "resolved");

-- CreateIndex
CREATE INDEX "Session_groupId_date_idx" ON "Session"("groupId", "date");

-- CreateIndex
CREATE INDEX "SessionInvite_userId_idx" ON "SessionInvite"("userId");

-- CreateIndex
CREATE INDEX "Spot_userId_idx" ON "Spot"("userId");

-- CreateIndex
CREATE INDEX "Spot_createdAt_idx" ON "Spot"("createdAt");

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriseGroup" ADD CONSTRAINT "PriseGroup_priseId_fkey" FOREIGN KEY ("priseId") REFERENCES "Prise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriseGroup" ADD CONSTRAINT "PriseGroup_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prise" ADD CONSTRAINT "Prise_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModerationLog" ADD CONSTRAINT "ModerationLog_priseId_fkey" FOREIGN KEY ("priseId") REFERENCES "Prise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
