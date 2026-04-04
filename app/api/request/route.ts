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
    const data = await req.json();

    const arrival = new Date(data.arrival);
    const departure = new Date(data.departure);

    const apartmentNames = String(data.selected_apartments || '')
      .split(',')
      .map((s: string) => s.trim())
      .filter(Boolean);

    if (!data.arrival || !data.departure) {
      return Response.json(
        { success: false, message: 'An- und Abreisedatum sind erforderlich.' },
        { status: 400, headers: corsHeaders },
      );
    }

    if (apartmentNames.length === 0) {
      return Response.json(
        {
          success: false,
          message: 'Bitte wählen Sie mindestens ein Apartment aus.',
        },
        { status: 400, headers: corsHeaders },
      );
    }

    if (!data.lastname || !data.email) {
      return Response.json(
        { success: false, message: 'Name und E-Mail sind erforderlich.' },
        { status: 400, headers: corsHeaders },
      );
    }

    const apartments = await prisma.apartment.findMany({
      where: {
        name: {
          in: apartmentNames,
        },
        isActive: true,
      },
    });

    if (apartments.length !== apartmentNames.length) {
      return Response.json(
        {
          success: false,
          message:
            'Ein oder mehrere ausgewählte Apartments wurden nicht gefunden.',
        },
        { status: 404, headers: corsHeaders },
      );
    }

    for (const apartment of apartments) {
      const overlapping = await prisma.blockedRange.findFirst({
        where: {
          apartmentId: apartment.id,
          startDate: {
            lt: departure,
          },
          endDate: {
            gt: arrival,
          },
        },
      });

      if (overlapping) {
        return Response.json(
          {
            success: false,
            message: `${apartment.name} ist im gewählten Zeitraum nicht verfügbar.`,
          },
          { status: 409, headers: corsHeaders },
        );
      }
    }

    const result = await prisma.request.create({
      data: {
        arrival,
        departure,
        nights: Number(data.nights),
        adults: Number(data.adults),
        children: Number(data.children || 0),
        selectedApartmentIds: apartmentNames.join(', '),
        salutation: String(data.salutation || ''),
        lastname: String(data.lastname || ''),
        email: String(data.email || ''),
        country: String(data.country || ''),
        message: data.message ? String(data.message) : null,
        newsletter: Boolean(data.newsletter),
      },
    });

    return Response.json(
      {
        success: true,
        result,
      },
      { headers: corsHeaders },
    );
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        success: false,
        message: 'Serverfehler',
      },
      { status: 500, headers: corsHeaders },
    );
  }
}
