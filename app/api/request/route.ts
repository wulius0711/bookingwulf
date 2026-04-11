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

    const hotelSlug = String(body.hotel || '').trim();
    const arrivalRaw = String(body.arrival || '').trim();
    const departureRaw = String(body.departure || '').trim();
    const nights = Number(body.nights || 0);
    const adults = Number(body.adults || 0);
    const children = Number(body.children || 0);
    const selectedApartmentIds = String(body.selected_apartments || '').trim();

    const salutation = String(body.salutation || '').trim();
    const firstname = String(body.firstname || '').trim();
    const lastname = String(body.lastname || '').trim();
    const email = String(body.email || '').trim();
    const country = String(body.country || '').trim();
    const message = String(body.message || '').trim();
    const newsletter = Boolean(body.newsletter);

    if (
      !hotelSlug ||
      !arrivalRaw ||
      !departureRaw ||
      !nights ||
      !adults ||
      !selectedApartmentIds ||
      !lastname ||
      !email
    ) {
      return Response.json(
        { success: false, message: 'Pflichtfelder fehlen.' },
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

    const requestEntry = await prisma.request.create({
      data: {
        hotelId: hotel.id,
        arrival: new Date(arrivalRaw),
        departure: new Date(departureRaw),
        nights,
        adults,
        children,
        selectedApartmentIds,
        salutation,
        lastname,
        email,
        country,
        message: [firstname ? `Vorname: ${firstname}` : '', message]
          .filter(Boolean)
          .join('\n\n'),
        newsletter,
        status: 'new',
      },
    });

    return Response.json(
      {
        success: true,
        requestId: requestEntry.id,
      },
      {
        headers: corsHeaders,
      },
    );
  } catch (error) {
    console.error(error);

    return Response.json(
      { success: false, message: 'Fehler beim Speichern der Anfrage.' },
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }
}
