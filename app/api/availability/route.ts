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

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { arrival, departure, selected_apartments, selectedApartmentIds } =
      body;

    if (
      !arrival ||
      !departure ||
      (!selected_apartments && !selectedApartmentIds)
    ) {
      return Response.json(
        {
          success: false,
          message: 'Fehlende Pflichtdaten.',
        },
        {
          status: 400,
          headers: corsHeaders,
        },
      );
    }

    const arrivalDate = new Date(arrival);
    const departureDate = new Date(departure);

    if (isNaN(arrivalDate.getTime()) || isNaN(departureDate.getTime())) {
      return Response.json(
        {
          success: false,
          message: 'Ungültige Datumsangaben.',
        },
        {
          status: 400,
          headers: corsHeaders,
        },
      );
    }

    const nights = Math.ceil(
      (departureDate.getTime() - arrivalDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (nights <= 0) {
      return Response.json(
        {
          success: false,
          message: 'Das Abreisedatum muss nach dem Anreisedatum liegen.',
        },
        {
          status: 400,
          headers: corsHeaders,
        },
      );
    }

    const selectedValue = selected_apartments || selectedApartmentIds;

    const apartment = await prisma.apartment.findFirst({
      where: {
        OR: [{ name: String(selectedValue) }, { slug: String(selectedValue) }],
      },
      include: {
        blockedRanges: true,
        priceSeasons: true,
      },
    });

    if (!apartment) {
      return Response.json(
        {
          success: false,
          message: 'Apartment nicht gefunden.',
        },
        {
          status: 404,
          headers: corsHeaders,
        },
      );
    }

    const overlappingBlockedRange = apartment.blockedRanges.find((range) => {
      const blockedStart = new Date(range.startDate);
      const blockedEnd = new Date(range.endDate);

      return arrivalDate < blockedEnd && departureDate > blockedStart;
    });

    if (overlappingBlockedRange) {
      return Response.json(
        {
          success: true,
          available: false,
          apartmentId: apartment.id,
          apartmentName: apartment.name,
          message: 'Das Apartment ist im gewählten Zeitraum nicht verfügbar.',
        },
        {
          headers: corsHeaders,
        },
      );
    }

    const matchingSeason = apartment.priceSeasons.find((season) => {
      const seasonStart = new Date(season.startDate);
      const seasonEnd = new Date(season.endDate);

      return arrivalDate >= seasonStart && departureDate <= seasonEnd;
    });

    const pricePerNight =
      matchingSeason?.pricePerNight ?? apartment.basePrice ?? 0;

    const cleaningFee = apartment.cleaningFee ?? 0;
    const totalPrice = pricePerNight * nights + cleaningFee;

    return Response.json(
      {
        success: true,
        available: true,
        apartmentId: apartment.id,
        apartmentName: apartment.name,
        nights,
        pricePerNight,
        cleaningFee,
        totalPrice,
        currency: 'EUR',
        seasonApplied: !!matchingSeason,
        minStay: matchingSeason?.minStay ?? 1,
        message: 'Apartment ist verfügbar.',
      },
      {
        headers: corsHeaders,
      },
    );
  } catch (error) {
    console.error('Availability API error:', error);

    return Response.json(
      {
        success: false,
        message: 'Serverfehler bei der Verfügbarkeitsprüfung.',
      },
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }
}
