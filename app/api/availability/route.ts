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

function getNights(arrival: Date, departure: Date) {
  return Math.ceil(
    (departure.getTime() - arrival.getTime()) / (1000 * 60 * 60 * 24),
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const arrivalRaw = body.arrival;
    const departureRaw = body.departure;

    const selectedApartmentsRaw =
      body.selected_apartments || body.selectedApartmentIds || '';

    if (!arrivalRaw || !departureRaw) {
      return Response.json(
        {
          success: false,
          message: 'An- und Abreisedatum sind erforderlich.',
        },
        {
          status: 400,
          headers: corsHeaders,
        },
      );
    }

    const arrival = new Date(arrivalRaw);
    const departure = new Date(departureRaw);

    if (Number.isNaN(arrival.getTime()) || Number.isNaN(departure.getTime())) {
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

    const nights = getNights(arrival, departure);

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

    const apartmentNames = String(selectedApartmentsRaw)
      .split(',')
      .map((s: string) => s.trim())
      .filter(Boolean);

    if (apartmentNames.length === 0) {
      return Response.json(
        {
          success: false,
          message: 'Bitte wählen Sie mindestens ein Apartment aus.',
        },
        {
          status: 400,
          headers: corsHeaders,
        },
      );
    }

    const apartments = await prisma.apartment.findMany({
      where: {
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
      const foundNames = apartments.map((a) => a.name);
      const missingNames = apartmentNames.filter(
        (name: string) => !foundNames.includes(name),
      );

      return Response.json(
        {
          success: false,
          message: `Ein oder mehrere Apartments wurden nicht gefunden: ${missingNames.join(', ')}`,
        },
        {
          status: 404,
          headers: corsHeaders,
        },
      );
    }

    const apartmentResults = apartments.map((apartment) => {
      const overlappingBlockedRange = apartment.blockedRanges.find((range) => {
        const blockedStart = new Date(range.startDate);
        const blockedEnd = new Date(range.endDate);

        return arrival < blockedEnd && departure > blockedStart;
      });

      if (overlappingBlockedRange) {
        return {
          apartmentId: apartment.id,
          apartmentName: apartment.name,
          available: false,
          nights,
          pricePerNight: 0,
          cleaningFee: apartment.cleaningFee ?? 0,
          totalPrice: 0,
          seasonApplied: false,
          minStay: 1,
          message: `${apartment.name} ist im gewählten Zeitraum nicht verfügbar.`,
        };
      }

      const matchingSeason = apartment.priceSeasons.find((season) => {
        const seasonStart = new Date(season.startDate);
        const seasonEnd = new Date(season.endDate);

        return arrival >= seasonStart && departure <= seasonEnd;
      });

      const pricePerNight =
        matchingSeason?.pricePerNight ?? apartment.basePrice ?? 0;

      const cleaningFee = apartment.cleaningFee ?? 0;
      const totalPrice = pricePerNight * nights + cleaningFee;

      return {
        apartmentId: apartment.id,
        apartmentName: apartment.name,
        available: true,
        nights,
        pricePerNight,
        cleaningFee,
        totalPrice,
        seasonApplied: !!matchingSeason,
        minStay: matchingSeason?.minStay ?? 1,
        message: `${apartment.name} ist verfügbar.`,
      };
    });

    const unavailableApartments = apartmentResults.filter(
      (item) => !item.available,
    );

    const availableApartments = apartmentResults.filter(
      (item) => item.available,
    );

    const totalSelectionPrice = availableApartments.reduce(
      (sum, item) => sum + item.totalPrice,
      0,
    );

    // Single apartment fallback für bestehendes Frontend
    if (apartmentResults.length === 1) {
      const single = apartmentResults[0];

      return Response.json(
        {
          success: true,
          available: single.available,
          apartmentId: single.apartmentId,
          apartmentName: single.apartmentName,
          nights: single.nights,
          pricePerNight: single.pricePerNight,
          cleaningFee: single.cleaningFee,
          totalPrice: single.totalPrice,
          currency: 'EUR',
          seasonApplied: single.seasonApplied,
          minStay: single.minStay,
          message: single.message,
          apartmentResults,
          totalSelectionPrice,
        },
        {
          headers: corsHeaders,
        },
      );
    }

    return Response.json(
      {
        success: true,
        available: unavailableApartments.length === 0,
        message:
          unavailableApartments.length === 0
            ? 'Alle ausgewählten Apartments sind verfügbar.'
            : 'Mindestens ein ausgewähltes Apartment ist nicht verfügbar.',
        currency: 'EUR',
        nights,
        apartmentResults,
        availableApartments,
        unavailableApartments,
        totalSelectionPrice,
        selectedCount: apartmentResults.length,
        availableCount: availableApartments.length,
        unavailableCount: unavailableApartments.length,
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
