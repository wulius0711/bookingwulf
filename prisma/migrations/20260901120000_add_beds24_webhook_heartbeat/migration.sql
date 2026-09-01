-- AlterTable
ALTER TABLE "Beds24Config" ADD COLUMN     "lastWebhookAt" TIMESTAMP(3),
ADD COLUMN     "lastWebhookError" TEXT;
