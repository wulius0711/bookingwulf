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

function parseSelectedApartmentIds(raw: string): number[] {
  return raw
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => Number(item))
    .filter((item) => Number.isInteger(item) && item > 0);
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
    const selectedApartmentIdsRaw = String(
      body.selected_apartments || '',
    ).trim();

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
      !selectedApartmentIdsRaw ||
      !lastname ||
      !email
    ) {
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

    if (departure <= arrival) {
      return Response.json(
        { success: false, message: 'Abreise muss nach Anreise liegen.' },
        { status: 400, headers: corsHeaders },
      );
    }

    const selectedApartmentIds = parseSelectedApartmentIds(
      selectedApartmentIdsRaw,
    );

    if (selectedApartmentIds.length === 0) {
      return Response.json(
        { success: false, message: 'Keine gültigen Apartments ausgewählt.' },
        { status: 400, headers: corsHeaders },
      );
    }

    const hotel = await prisma.hotel.findUnique({
      where: { slug: hotelSlug },
      select: { id: true, name: true },
    });

    if (!hotel) {
      return Response.json(
        { success: false, message: 'Hotel nicht gefunden.' },
        { status: 404, headers: corsHeaders },
      );
    }

    const apartments = await prisma.apartment.findMany({
      where: {
        id: { in: selectedApartmentIds },
        hotelId: hotel.id,
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (apartments.length !== selectedApartmentIds.length) {
      return Response.json(
        {
          success: false,
          message:
            'Mindestens ein ausgewähltes Apartment gehört nicht zu diesem Hotel.',
        },
        { status: 400, headers: corsHeaders },
      );
    }

    const requestMessage = [firstname ? `Vorname: ${firstname}` : '', message]
      .filter(Boolean)
      .join('\n\n');

    const requestEntry = await prisma.request.create({
      data: {
        hotelId: hotel.id,
        arrival,
        departure,
        nights,
        adults,
        children,
        selectedApartmentIds: selectedApartmentIds.join(','),
        salutation,
        lastname,
        email,
        country,
        message: requestMessage || null,
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
