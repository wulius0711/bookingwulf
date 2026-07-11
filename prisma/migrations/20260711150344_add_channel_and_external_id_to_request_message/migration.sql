-- AlterTable
ALTER TABLE "RequestMessage" ADD COLUMN     "channel" TEXT NOT NULL DEFAULT 'direct',
ADD COLUMN     "externalId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "RequestMessage_requestId_externalId_key" ON "RequestMessage"("requestId", "externalId");
