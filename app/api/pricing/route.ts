import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const hotelId = Number(searchParams.get('hotelId'));
  const arrival = searchParams.get('arrival');
  const departure = searchParams.get('departure');
  const apartmentId = Number(searchParams.get('apartmentId'));

  if (!hotelId || !arrival || !departure || !apartmentId) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  const arrivalDate = new Date(arrival);
  const departureDate = new Date(departure);
  const nights = Math.round((departureDate.getTime() - arrivalDate.getTime()) / 86400000);

  if (nights <= 0) return NextResponse.json({ error: 'Invalid dates' }, { status: 400 });

  const [apartment, settings] = await Promise.all([
    prisma.apartment.findUnique({
      where: { id: apartmentId },
      select: {
        basePrice: true,
        cleaningFee: true,
        priceSeasons: {
          where: {
            startDate: { lte: departureDate },
            endDate: { gte: arrivalDate },
          },
          orderBy: { startDate: 'asc' },
        },
      },
    }),
    prisma.hotelSettings.findUnique({
      where: { hotelId },
      select: {
        lastMinuteDiscountPercent: true,
        lastMinuteDiscountDays: true,
        occupancySurchargePercent: true,
        occupancySurchargeThreshold: true,
      },
    }),
  ]);

  if (!apartment) return NextResponse.json({ error: 'Apartment not found' }, { status: 404 });

  // Base price: use first matching season, else apartment base price
  const season = apartment.priceSeasons[0] ?? null;
  const pricePerNight = season ? Number(season.pricePerNight) : Number(apartment.basePrice ?? 0);
  const minStay = season?.minStay ?? 1;
  const cleaningFee = Number(apartment.cleaningFee ?? 0);

  let subtotal = pricePerNight * nights;
  const breakdown: { label: string; amount: number }[] = [
    { label: `${pricePerNight.toFixed(2)} × ${nights} Nächte`, amount: subtotal },
  ];

  if (cleaningFee > 0) {
    breakdown.push({ label: 'Reinigungsgebühr', amount: cleaningFee });
  }

  // Last-minute discount
  let discountPercent = 0;
  if (settings?.lastMinuteDiscountPercent && settings.lastMinuteDiscountPercent > 0) {
    const daysUntilArrival = Math.ceil((arrivalDate.getTime() - Date.now()) / 86400000);
    if (daysUntilArrival <= settings.lastMinuteDiscountDays && daysUntilArrival >= 0) {
      discountPercent = settings.lastMinuteDiscountPercent;
      const discountAmount = -(subtotal * discountPercent / 100);
      breakdown.push({ label: `Last-Minute Rabatt (${discountPercent}%)`, amount: discountAmount });
      subtotal += discountAmount;
    }
  }

  // Occupancy surcharge
  let surchargePercent = 0;
  if (settings?.occupancySurchargePercent && settings.occupancySurchargePercent > 0) {
    const [allApartments, blockedCount] = await Promise.all([
      prisma.apartment.count({ where: { hotelId, isActive: true } }),
      prisma.blockedRange.count({
        where: {
          hotelId,
          type: 'booking',
          startDate: { lt: departureDate },
          endDate: { gt: arrivalDate },
        },
      }),
    ]);

    const occupancy = allApartments > 0 ? (blockedCount / allApartments) * 100 : 0;
    if (occupancy >= settings.occupancySurchargeThreshold) {
      surchargePercent = settings.occupancySurchargePercent;
      const surchargeBase = pricePerNight * nights;
      const surchargeAmount = surchargeBase * surchargePercent / 100;
      breakdown.push({ label: `Nachfrageaufschlag (${surchargePercent}%)`, amount: surchargeAmount });
      subtotal += surchargeAmount;
    }
  }

  const total = subtotal + (cleaningFee > 0 ? 0 : 0); // cleaning fee already in breakdown

  return NextResponse.json({
    pricePerNight,
    nights,
    cleaningFee,
    subtotal: pricePerNight * nights,
    total: subtotal + cleaningFee,
    breakdown,
    minStay,
    discountPercent,
    surchargePercent,
    seasonName: season?.name ?? null,
  });
}
