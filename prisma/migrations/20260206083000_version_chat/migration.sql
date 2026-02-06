-- DropIndex
DROP INDEX IF EXISTS "ChatMessage_projectId_createdAt_idx";

-- DropForeignKey
ALTER TABLE "ChatMessage" DROP CONSTRAINT IF EXISTS "ChatMessage_projectId_fkey";

-- AlterTable
ALTER TABLE "ChatMessage" DROP COLUMN IF EXISTS "projectId",
ADD COLUMN "trackId" TEXT NOT NULL,
ADD COLUMN "versionId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "ChatMessage_versionId_createdAt_idx" ON "ChatMessage"("versionId", "createdAt");

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "Version"("id") ON DELETE CASCADE ON UPDATE CASCADE;
