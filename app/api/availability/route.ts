import { prisma } from '@/src/lib/prisma';

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
    const body = await req.json();

    const hotelSlug = String(body.hotel || '').trim();
    const arrivalRaw = String(body.arrival || '').trim();
    const departureRaw = String(body.departure || '').trim();
    const selectedApartmentsRaw = String(body.selected_apartments || '').trim();

    if (!hotelSlug || !arrivalRaw || !departureRaw || !selectedApartmentsRaw) {
      return Response.json(
        { success: false, message: 'Pflichtfelder fehlen.' },
        { status: 400, headers: corsHeaders },
      );
    }

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
      select: { id: true },
    });

    if (!hotel) {
      return Response.json(
        { success: false, message: 'Hotel nicht gefunden.' },
        { status: 404, headers: corsHeaders },
      );
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

      totalPrice += apartment.cleaningFee ?? 0;

      const averagePricePerNight =
        nights > 0
          ? Number(
              ((totalPrice - (apartment.cleaningFee ?? 0)) / nights).toFixed(2),
            )
          : 0;

      return {
        apartmentId: apartment.id,
        apartmentName: apartment.name,
        available: true,
        totalPrice: Number(totalPrice.toFixed(2)),
        pricePerNight: averagePricePerNight,
        cleaningFee: apartment.cleaningFee ?? 0,
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
