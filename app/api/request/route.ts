import { prisma } from '@/src/lib/prisma';
import { Resend } from 'resend';

function getResend() {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

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

function normalizeDate(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getNightsBetween(arrival: Date, departure: Date) {
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
    const nights = Number(body.nights || 0);
    const adults = Number(body.adults || 0);
    const children = Number(body.children || 0);
    const selectedApartmentIdsRaw = String(
      body.selected_apartments || '',
    ).trim();

    const selectedExtrasKeys: string[] = Array.isArray(body.extras)
      ? body.extras.map((k: unknown) => String(k))
      : [];


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
      select: {
        id: true,
        name: true,
        email: true,
        extras: {
          where: { isActive: true },
          select: { key: true, name: true, billingType: true, price: true },
        },
      },
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
        basePrice: true,
        cleaningFee: true,
        priceSeasons: {
          select: {
            startDate: true,
            endDate: true,
            pricePerNight: true,
          },
        },
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

    const apartmentPricing = apartments.map((apartment) => {
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

      return {
        apartmentId: apartment.id,
        apartmentName: apartment.name,
        totalPrice: Number(totalPrice.toFixed(2)),
        cleaningFee: apartment.cleaningFee ?? 0,
      };
    });

    const apartmentsTotal = apartmentPricing.reduce(
      (sum, item) => sum + item.totalPrice,
      0,
    );

    const guestCount = adults + children;

    type ExtraLineItem = {
      key: string;
      name: string;
      billingType: string;
      unitPrice: number;
      quantity: number;
      subtotal: number;
      label: string;
    };

    const extrasLineItems: ExtraLineItem[] = [];
    let extrasTotal = 0;

    for (const extra of hotel.extras) {
      if (!selectedExtrasKeys.includes(extra.key)) continue;

      const unitPrice = Number(extra.price);
      let quantity = 1;
      let label = extra.name;

      if (extra.billingType === 'per_night') {
        quantity = nights;
        label = `${extra.name} (${nights} Nächte)`;
      } else if (extra.billingType === 'per_person_per_night') {
        quantity = guestCount * nights;
        label = `${extra.name} (${guestCount} Pers. × ${nights} Nächte)`;
      } else if (extra.billingType === 'per_person_per_stay') {
        quantity = guestCount;
        label = `${extra.name} (${guestCount} Personen)`;
      }

      const subtotal = unitPrice * quantity;
      extrasTotal += subtotal;
      extrasLineItems.push({ key: extra.key, name: extra.name, billingType: extra.billingType, unitPrice, quantity, subtotal, label });
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
        extrasJson: extrasLineItems.length > 0 ? extrasLineItems : [],
      },
    });

    const extrasHtml = extrasLineItems.length
      ? `<ul style="margin: 8px 0 0 0; padding-left: 18px; line-height: 1.6;">
          ${extrasLineItems.map((e) => `<li>${e.label} — € ${e.subtotal.toFixed(2)}</li>`).join('')}
        </ul>`
      : 'Keine';

    const totalBookingPrice = apartmentsTotal + extrasTotal;

    try {
      const resend = getResend();
      const apartmentNames = apartments.map((a) => a.name).join(', ');
      const receiverEmail = hotel.email || process.env.BOOKING_RECEIVER_EMAIL!;

      if (resend) await resend.emails.send({
        from: process.env.BOOKING_FROM_EMAIL!,
        to: receiverEmail,
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

          <p><strong>Zusatzleistungen:</strong><br/>
            ${extrasHtml}</p>

            <p><strong>Preisübersicht:</strong></p>

              <table style="width:100%; max-width:400px; border-collapse:collapse; font-size:14px;">
                <tr>
                  <td style="padding:4px 0;">Apartments</td>
                  <td style="text-align:right;">€ ${apartmentsTotal.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding:4px 0;">Zusatzleistungen</td>
                  <td style="text-align:right;">€ ${extrasTotal.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding-top:8px; font-weight:600;">Gesamtbetrag</td>
                  <td style="text-align:right; padding-top:8px; font-weight:700;">
                    € ${totalBookingPrice.toFixed(2)}
                  </td>
                </tr>
              </table>


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

      try {
        if (resend) await resend.emails.send({
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

            <p><strong>Zusatzleistungen:</strong><br/>
              ${extrasHtml}</p>

              <p><strong>Preisübersicht:</strong></p>

                <table style="width:100%; max-width:400px; border-collapse:collapse; font-size:14px;">
                  <tr>
                    <td style="padding:4px 0;">Apartments</td>
                    <td style="text-align:right;">€ ${apartmentsTotal.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td style="padding:4px 0;">Zusatzleistungen</td>
                    <td style="text-align:right;">€ ${extrasTotal.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td style="padding-top:8px; font-weight:600;">Gesamtbetrag</td>
                    <td style="text-align:right; padding-top:8px; font-weight:700;">
                      € ${totalBookingPrice.toFixed(2)}
                    </td>
                  </tr>
                </table>


            ${
              message
                ? `<p><strong>Ihre Nachricht:</strong><br/>${message}</p>`
                : ''
            }

            <p>Wir melden uns in Kürze mit den weiteren Details.</p>

            <p>Mit freundlichen Grüßen<br/>
            ${hotel.name}</p>

            <hr/>

            <p style="font-size:12px;color:#777;">
            Buchungs-ID: ${requestEntry.id}
            </p>
          `,
        });

      } catch {
        // Gast-Mail-Fehler soll Buchung nicht blockieren
      }
    } catch (mailError) {
      console.error('Mail error:', mailError);
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
