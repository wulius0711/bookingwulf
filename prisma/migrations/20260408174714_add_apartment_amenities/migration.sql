-- AlterTable
ALTER TABLE "Apartment" ADD COLUMN     "amenities" TEXT[] DEFAULT ARRAY[]::TEXT[];
