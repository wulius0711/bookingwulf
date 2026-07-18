-- AlterTable
ALTER TABLE "Apartment" ADD COLUMN     "housekeepingChecklistItems" JSONB,
ADD COLUMN     "housekeepingChecklistState" JSONB,
ADD COLUMN     "housekeepingNote" TEXT,
ADD COLUMN     "housekeepingStatus" TEXT NOT NULL DEFAULT 'clean',
ADD COLUMN     "housekeepingUpdatedAt" TIMESTAMP(3);
