/*
  Warnings:

  - A unique constraint covering the columns `[hotelId,slug]` on the table `Apartment` will be added. If there are existing duplicate values, this will fail.
  - Made the column `hotelId` on table `Apartment` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Apartment" ALTER COLUMN "hotelId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Request" ADD COLUMN     "firstname" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Apartment_hotelId_slug_key" ON "Apartment"("hotelId", "slug");
