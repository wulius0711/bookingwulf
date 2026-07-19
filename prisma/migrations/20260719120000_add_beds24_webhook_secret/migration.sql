-- AlterTable
ALTER TABLE "Beds24Config" ADD COLUMN     "webhookSecret" TEXT;

-- Backfill existing rows with a random per-hotel secret (superseded once each hotel reconnects)
UPDATE "Beds24Config" SET "webhookSecret" = md5(random()::text || clock_timestamp()::text) || md5(random()::text || clock_timestamp()::text) WHERE "webhookSecret" IS NULL;

-- AlterTable
ALTER TABLE "Beds24Config" ALTER COLUMN "webhookSecret" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Beds24Config_webhookSecret_key" ON "Beds24Config"("webhookSecret");
