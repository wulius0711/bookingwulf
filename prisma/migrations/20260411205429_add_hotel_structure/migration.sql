-- DropIndex
DROP INDEX "Apartment_slug_key";

-- AlterTable
ALTER TABLE "AdminUser" ADD COLUMN     "hotelId" INTEGER,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "role" SET DEFAULT 'hotel_admin';

-- AlterTable
ALTER TABLE "Apartment" ADD COLUMN     "hotelId" INTEGER;

-- AlterTable
ALTER TABLE "BlockedRange" ADD COLUMN     "hotelId" INTEGER,
ALTER COLUMN "apartmentId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Request" ADD COLUMN     "hotelId" INTEGER;

-- CreateTable
CREATE TABLE "Hotel" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Hotel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HotelSettings" (
    "id" SERIAL NOT NULL,
    "hotelId" INTEGER NOT NULL,
    "showPrices" BOOLEAN NOT NULL DEFAULT true,
    "allowMultiSelect" BOOLEAN NOT NULL DEFAULT false,
    "showAmenities" BOOLEAN NOT NULL DEFAULT true,
    "showExtrasStep" BOOLEAN NOT NULL DEFAULT true,
    "showPhoneField" BOOLEAN NOT NULL DEFAULT true,
    "showMessageField" BOOLEAN NOT NULL DEFAULT true,
    "enableImageSlider" BOOLEAN NOT NULL DEFAULT true,
    "enableLightbox" BOOLEAN NOT NULL DEFAULT true,
    "accentColor" TEXT,
    "backgroundColor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HotelSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Hotel_slug_key" ON "Hotel"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "HotelSettings_hotelId_key" ON "HotelSettings"("hotelId");

-- AddForeignKey
ALTER TABLE "HotelSettings" ADD CONSTRAINT "HotelSettings_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Apartment" ADD CONSTRAINT "Apartment_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlockedRange" ADD CONSTRAINT "BlockedRange_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminUser" ADD CONSTRAINT "AdminUser_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE SET NULL ON UPDATE CASCADE;
