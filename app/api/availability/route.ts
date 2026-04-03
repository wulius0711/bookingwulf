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
    const apartmentName = String(data.selected_apartments || '').trim();

    if (!arrival || !departure || !apartmentName) {
      return Response.json(
        { success: false, message: 'Fehlende Daten' },
        { status: 400, headers: corsHeaders },
      );
    }

    const apartment = await prisma.apartment.findFirst({
      where: {
        name: apartmentName,
        isActive: true,
      },
    });

    if (!apartment) {
      return Response.json(
        {
          success: false,
          available: false,
          message: 'Apartment nicht gefunden',
        },
        { status: 404, headers: corsHeaders },
      );
    }

    const overlappingBlock = await prisma.blockedRange.findFirst({
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

    if (overlappingBlock) {
      return Response.json(
        {
          success: true,
          available: false,
          message: 'Das Apartment ist im gewählten Zeitraum nicht verfügbar.',
        },
        { headers: corsHeaders },
      );
    }

    return Response.json(
      {
        success: true,
        available: true,
        message: 'Apartment ist verfügbar.',
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
