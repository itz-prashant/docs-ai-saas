/*
  Warnings:

  - You are about to drop the column `docsLinks` on the `Project` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Project" DROP COLUMN "docsLinks",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pending';

-- CreateTable
CREATE TABLE "DocLink" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "embedding" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DocLink_projectId_idx" ON "DocLink"("projectId");

-- AddForeignKey
ALTER TABLE "DocLink" ADD CONSTRAINT "DocLink_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
