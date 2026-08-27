-- AlterTable
ALTER TABLE "Beds24ApartmentMapping" ADD COLUMN     "channelOfferIds" JSONB;

-- AlterTable
ALTER TABLE "Beds24Config" ADD COLUMN     "connectedChannels" JSONB;

-- CreateTable
CREATE TABLE "ChannelPriceRange" (
    "id" SERIAL NOT NULL,
    "apartmentId" INTEGER NOT NULL,
    "channel" TEXT NOT NULL,
    "name" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "pricePerNight" DOUBLE PRECISION NOT NULL,
    "beds24SyncError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChannelPriceRange_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChannelPriceRange_apartmentId_channel_startDate_endDate_idx" ON "ChannelPriceRange"("apartmentId", "channel", "startDate", "endDate");

-- AddForeignKey
ALTER TABLE "ChannelPriceRange" ADD CONSTRAINT "ChannelPriceRange_apartmentId_fkey" FOREIGN KEY ("apartmentId") REFERENCES "Apartment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
