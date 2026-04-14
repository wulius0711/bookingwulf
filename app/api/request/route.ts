import { prisma } from '@/src/lib/prisma';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

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

    console.log('REQUEST API HIT');
    console.log('BODY HOTEL:', body.hotel);

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
        firstname,
        lastname,
        email,
        country,
        message: message || null,
        newsletter,
        status: 'new',
      },
    });

    try {
      console.log('=== MAIL START ===');
      console.log('TO:', process.env.BOOKING_RECEIVER_EMAIL);
      console.log('FROM:', process.env.BOOKING_FROM_EMAIL);
      console.log('=== SENDING MAIL ===');

      const apartmentNames = apartments.map((a) => a.name).join(', ');

      const mailResponse = await resend.emails.send({
        from: process.env.BOOKING_FROM_EMAIL!,
        to: process.env.BOOKING_RECEIVER_EMAIL!,
        subject: `Neue Buchung (${arrivalRaw} → ${departureRaw})`,
        html: `
          <h2>Neue Buchung – ${hotel.name}</h2>

          <p><strong>Buchungszeitraum:</strong><br/>
          ${arrivalRaw} → ${departureRaw} (${nights} Nächte)</p>

          <p><strong>Gäste:</strong><br/>
          Erwachsene: ${adults}<br/>
          Kinder: ${children}</p>

          <p><strong>Apartments:</strong><br/>
          ${apartmentNames}</p>

          <hr/>

          <p><strong>Kontakt:</strong><br/>
          ${salutation} ${firstname} ${lastname}<br/>
          ${email}<br/>
          ${country}</p>

          ${message ? `<p><strong>Nachricht:</strong><br/>${message}</p>` : ''}

          <hr/>

          <p style="font-size:12px;color:#777;">
          Newsletter: ${newsletter ? 'Ja' : 'Nein'}
          </p>

          <p style="font-size:12px;color:#777;">
            Buchungs-ID: ${requestEntry.id}
          </p>
        `,
      });

      // 📩 BESTÄTIGUNG AN GAST
      try {
        await resend.emails.send({
          from: process.env.BOOKING_FROM_EMAIL!,
          to: email,
          subject: `Ihre Buchung bei ${hotel.name}`,
          html: `
      <h2>Ihre Buchung bei ${hotel.name}</h2>

      <p>Hallo ${firstname || ''},</p>

      <p>vielen Dank für Ihre Buchung.</p>

      <p><strong>Buchungszeitraum:</strong><br/>
      ${arrivalRaw} → ${departureRaw} (${nights} Nächte)</p>

      <p><strong>Gäste:</strong><br/>
      Erwachsene: ${adults}<br/>
      Kinder: ${children}</p>

      <p><strong>Gebuchte Apartments:</strong><br/>
      ${apartments.map((a) => a.name).join(', ')}</p>

      ${message ? `<p><strong>Ihre Nachricht:</strong><br/>${message}</p>` : ''}

      <p>Wir melden uns in Kürze mit den weiteren Details.</p>

      <p>Mit freundlichen Grüßen<br/>
      ${hotel.name}</p>

      <hr/>

      <p style="font-size:12px;color:#777;">
      Buchungs-ID: ${requestEntry.id}
      </p>
    `,
        });

        console.log('CUSTOMER MAIL SENT');
      } catch (customerMailError) {
        console.error('CUSTOMER MAIL ERROR:', customerMailError);
      }

      console.log('MAIL RESPONSE:', JSON.stringify(mailResponse, null, 2));
    } catch (mailError) {
      console.error('MAIL ERROR:', mailError);
    }

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
      { success: false, message: 'Fehler beim Speichern der Buchung.' },
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }
}
