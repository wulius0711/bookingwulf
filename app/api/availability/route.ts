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

    if (apartmentNames.length === 0) {
      return Response.json(
        { success: false, message: 'Keine Apartments ausgewählt.' },
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
          available: false,
          message: 'Ein oder mehrere Apartments wurden nicht gefunden.',
        },
        { status: 404, headers: corsHeaders },
      );
    }

    // 🔥 ALLE Apartments prüfen
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
            success: true,
            available: false,
            message: `${apartment.name} ist im gewählten Zeitraum nicht verfügbar.`,
          },
          { headers: corsHeaders },
        );
      }
    }

    return Response.json(
      {
        success: true,
        available: true,
        message: 'Alle Apartments sind verfügbar.',
      },
      { headers: corsHeaders },
    );
  } catch (error) {
    console.error(error);

    return Response.json(
      { success: false, message: 'Serverfehler' },
      { status: 500, headers: corsHeaders },
    );
  }
}
