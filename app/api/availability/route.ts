import { prisma } from '@/src/lib/prisma';
import { availabilitySchema } from '@/src/lib/schemas';
import { hasPlanAccess } from '@/src/lib/plan-gates';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}

function normalizeDate(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getNights(arrival: Date, departure: Date) {
  const ms =
    normalizeDate(departure).getTime() - normalizeDate(arrival).getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export async function POST(req: Request) {
  try {
    const parsed = availabilitySchema.safeParse(await req.json());
    if (!parsed.success) {
      return Response.json(
        { success: false, message: 'Ungültige Eingabe.' },
        { status: 400, headers: corsHeaders },
      );
    }
    const { hotel: hotelSlug, arrival: arrivalRaw, departure: departureRaw, selected_apartments: selectedApartmentsRaw } = parsed.data;

    const arrival = new Date(arrivalRaw);
    const departure = new Date(departureRaw);

    if (Number.isNaN(arrival.getTime()) || Number.isNaN(departure.getTime())) {
      return Response.json(
        { success: false, message: 'Ungültige Datumswerte.' },
        { status: 400, headers: corsHeaders },
      );
    }

    const nights = getNights(arrival, departure);

    if (nights <= 0) {
      return Response.json(
        { success: false, message: 'Abreise muss nach Anreise liegen.' },
        { status: 400, headers: corsHeaders },
      );
    }

    const hotel = await prisma.hotel.findUnique({
      where: { slug: hotelSlug },
      select: { id: true, plan: true },
    });


    if (!hotel) {
      return Response.json(
        { success: false, message: 'Hotel nicht gefunden.' },
        { status: 404, headers: corsHeaders },
      );
    }

    const hotelSettings = await prisma.hotelSettings.findUnique({
      where: { hotelId: hotel.id },
      select: { gapNightDiscount: true, gapNightMaxLength: true },
    });

    // Pre-fetch gap bookings if gap-night feature is configured
    const hotelHasPro = hasPlanAccess(hotel.plan ?? 'starter', 'pro');
    const gapEnabled = hotelHasPro && hotelSettings?.gapNightDiscount && hotelSettings?.gapNightMaxLength && nights <= hotelSettings.gapNightMaxLength;
    let gapBeforeIds = new Set<number>();
    let gapAfterIds = new Set<number>();

    if (gapEnabled) {
      const arrivalNorm = normalizeDate(arrival);
      const departureNorm = normalizeDate(departure);
      const nextDay = (d: Date) => new Date(d.getTime() + 24 * 60 * 60 * 1000);

      const [beforeBookings, afterBookings] = await Promise.all([
        prisma.request.findMany({
          where: { hotelId: hotel.id, status: 'booked', departure: { gte: arrivalNorm, lt: nextDay(arrivalNorm) } },
          select: { selectedApartmentIds: true },
        }),
        prisma.request.findMany({
          where: { hotelId: hotel.id, status: 'booked', arrival: { gte: departureNorm, lt: nextDay(departureNorm) } },
          select: { selectedApartmentIds: true },
        }),
      ]);

      const parseIds = (bookings: { selectedApartmentIds: string }[]) =>
        new Set(bookings.flatMap((b) => b.selectedApartmentIds.split(',').map((s) => Number(s.trim())).filter(Boolean)));

      gapBeforeIds = parseIds(beforeBookings);
      gapAfterIds = parseIds(afterBookings);
    }

    const apartmentNames = selectedApartmentsRaw
      .split(',')
      .map((name) => name.trim())
      .filter(Boolean);

    const apartments = await prisma.apartment.findMany({
      where: {
        hotelId: hotel.id,
        name: {
          in: apartmentNames,
        },
        isActive: true,
      },
      include: {
        blockedRanges: true,
        priceSeasons: true,
      },
    });

    if (apartments.length !== apartmentNames.length) {
      return Response.json(
        {
          success: false,
          message:
            'Mindestens ein Apartment konnte im gewählten Hotel nicht gefunden werden.',
        },
        { status: 404, headers: corsHeaders },
      );
    }

    const unavailableApartments: Array<{
      apartmentId: number;
      apartmentName: string;
      message: string;
    }> = [];

    // Check confirmed bookings that overlap the requested period
    const confirmedBookings = await prisma.request.findMany({
      where: {
        hotelId: hotel.id,
        status: 'booked',
        arrival: { lt: departure },
        departure: { gt: arrival },
      },
      select: { selectedApartmentIds: true },
    });

    const bookedApartmentIds = new Set<number>();
    for (const booking of confirmedBookings) {
      for (const idStr of booking.selectedApartmentIds.split(',')) {
        const id = Number(idStr.trim());
        if (id) bookedApartmentIds.add(id);
      }
    }

    const apartmentResults = apartments.map((apartment) => {
      const overlapsBlocked = apartment.blockedRanges.some((range) => {
        return arrival < range.endDate && departure > range.startDate;
      });

      const isBooked = bookedApartmentIds.has(apartment.id);

      if (overlapsBlocked || isBooked) {
        unavailableApartments.push({
          apartmentId: apartment.id,
          apartmentName: apartment.name,
          message: 'Im gewählten Zeitraum nicht verfügbar.',
        });

        return {
          apartmentId: apartment.id,
          apartmentName: apartment.name,
          available: false,
          totalPrice: null,
          pricePerNight: null,
          cleaningFee: apartment.cleaningFee ?? 0,
        };
      }

      let totalPrice = 0;

      for (let i = 0; i < nights; i++) {
        const currentDate = new Date(arrival);
        currentDate.setDate(arrival.getDate() + i);

        const season = apartment.priceSeasons.find((season) => {
          return (
            currentDate >= season.startDate && currentDate <= season.endDate
          );
        });

        const nightlyPrice = season?.pricePerNight ?? apartment.basePrice ?? 0;
        totalPrice += nightlyPrice;
      }

      const cleaningFee = apartment.cleaningFee ?? 0;
      totalPrice += cleaningFee;

      // Gap-night discount
      const isGapNight = gapEnabled && gapBeforeIds.has(apartment.id) && gapAfterIds.has(apartment.id);
      const gapDiscount = isGapNight ? (hotelSettings?.gapNightDiscount ?? 0) : 0;
      if (gapDiscount > 0) {
        const baseOnly = totalPrice - cleaningFee;
        totalPrice = baseOnly * (1 - gapDiscount / 100) + cleaningFee;
      }

      const averagePricePerNight =
        nights > 0
          ? Number(((totalPrice - cleaningFee) / nights).toFixed(2))
          : 0;

      return {
        apartmentId: apartment.id,
        apartmentName: apartment.name,
        available: true,
        totalPrice: Number(totalPrice.toFixed(2)),
        pricePerNight: averagePricePerNight,
        cleaningFee,
        isGapNight,
        gapDiscount,
      };
    });

    if (unavailableApartments.length > 0) {
      return Response.json(
        {
          success: true,
          available: false,
          message:
            'Mindestens ein Apartment ist im gewählten Zeitraum nicht verfügbar.',
          unavailableApartments,
          nights,
        },
        { headers: corsHeaders },
      );
    }

    const totalPrice = apartmentResults.reduce(
      (sum, item) => sum + (item.totalPrice ?? 0),
      0,
    );

    const firstApartment = apartmentResults[0];

    return Response.json(
      {
        success: true,
        available: true,
        nights,
        totalPrice: Number(totalPrice.toFixed(2)),
        pricePerNight: firstApartment?.pricePerNight ?? 0,
        cleaningFee: firstApartment?.cleaningFee ?? 0,
        isGapNight: firstApartment?.isGapNight ?? false,
        gapDiscount: firstApartment?.gapDiscount ?? 0,
        apartments: apartmentResults,
      },
      { headers: corsHeaders },
    );
  } catch (error) {
    console.error(error);

    return Response.json(
      { success: false, message: 'Verfügbarkeit konnte nicht geprüft werden.' },
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }
}
