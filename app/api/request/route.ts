import { prisma } from '@/src/lib/prisma';
import { getResend, getFromEmail, buildEmailHtml, buildPriceTable, buildInfoBlock, buildDivider, eur } from '@/src/lib/email';
import { rateLimit, rateLimitResponse } from '@/src/lib/rate-limit';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsHeaders });
}

function parseSelectedApartmentIds(raw: string): number[] {
  return raw.split(',').map(i => i.trim()).filter(Boolean).map(Number).filter(i => Number.isInteger(i) && i > 0);
}

function normalizeDate(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getNightsBetween(arrival: Date, departure: Date) {
  return Math.round((normalizeDate(departure).getTime() - normalizeDate(arrival).getTime()) / 86400000);
}

function formatDate(d: Date): string {
  return new Intl.DateTimeFormat('de-AT', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const hotelSlug = String(body.hotel || '').trim();
    const email = String(body.email || '').trim();

    // Rate limit: 10 bookings per IP per 15 min, 3 per email per 5 min
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const { ok: ipOk } = rateLimit(`booking:ip:${ip}`, 10, 15 * 60 * 1000);
    if (!ipOk) return rateLimitResponse();
    if (email) {
      const { ok: emailOk } = rateLimit(`booking:email:${email}`, 3, 5 * 60 * 1000);
      if (!emailOk) return rateLimitResponse();
    }
    const arrivalRaw = String(body.arrival || '').trim();
    const departureRaw = String(body.departure || '').trim();
    const nights = Number(body.nights || 0);
    const adults = Number(body.adults || 0);
    const children = Number(body.children || 0);
    const selectedApartmentIdsRaw = String(body.selected_apartments || '').trim();

    // Support both object format {key: true/false} and array format [key1, key2]
    let selectedExtrasKeys: string[] = [];
    if (body.extras) {
      if (Array.isArray(body.extras)) {
        selectedExtrasKeys = body.extras.map((k: unknown) => String(k));
      } else if (typeof body.extras === 'object') {
        selectedExtrasKeys = Object.entries(body.extras)
          .filter(([, v]) => v === true)
          .map(([k]) => k);
      }
    }

    const salutation = String(body.salutation || '').trim();
    const firstname = String(body.firstname || '').trim();
    const lastname = String(body.lastname || '').trim();
    const country = String(body.country || '').trim();
    const message = String(body.message || '').trim();
    const newsletter = Boolean(body.newsletter);
    const bookingType: 'request' | 'booking' = body.bookingType === 'booking' ? 'booking' : 'request';

    if (!hotelSlug || !arrivalRaw || !departureRaw || !nights || !adults || !selectedApartmentIdsRaw || !lastname || !email) {
      return Response.json({ success: false, message: 'Pflichtfelder fehlen.' }, { status: 400, headers: corsHeaders });
    }

    const arrival = new Date(arrivalRaw);
    const departure = new Date(departureRaw);

    if (Number.isNaN(arrival.getTime()) || Number.isNaN(departure.getTime())) {
      return Response.json({ success: false, message: 'Ungültige Datumswerte.' }, { status: 400, headers: corsHeaders });
    }
    if (departure <= arrival) {
      return Response.json({ success: false, message: 'Abreise muss nach Anreise liegen.' }, { status: 400, headers: corsHeaders });
    }

    const selectedApartmentIds = parseSelectedApartmentIds(selectedApartmentIdsRaw);
    if (selectedApartmentIds.length === 0) {
      return Response.json({ success: false, message: 'Keine gültigen Apartments ausgewählt.' }, { status: 400, headers: corsHeaders });
    }

    const hotel = await prisma.hotel.findUnique({
      where: { slug: hotelSlug },
      select: {
        id: true, name: true, email: true, accentColor: true,
        emailTemplates: { select: { type: true, subject: true, body: true } },
        extras: {
          where: { isActive: true },
          select: { key: true, name: true, type: true, billingType: true, price: true },
        },
      },
    });

    if (!hotel) {
      return Response.json({ success: false, message: 'Hotel nicht gefunden.' }, { status: 404, headers: corsHeaders });
    }

    const apartments = await prisma.apartment.findMany({
      where: { id: { in: selectedApartmentIds }, hotelId: hotel.id },
      select: {
        id: true, name: true, basePrice: true, cleaningFee: true,
        priceSeasons: { select: { startDate: true, endDate: true, pricePerNight: true } },
      },
    });

    if (apartments.length !== selectedApartmentIds.length) {
      return Response.json({ success: false, message: 'Mindestens ein ausgewähltes Apartment gehört nicht zu diesem Hotel.' }, { status: 400, headers: corsHeaders });
    }

    // Calculate apartment pricing
    const apartmentPricing = apartments.map((apartment) => {
      let totalPrice = 0;
      for (let i = 0; i < nights; i++) {
        const currentDate = new Date(arrival);
        currentDate.setDate(arrival.getDate() + i);
        const season = apartment.priceSeasons.find(s => currentDate >= s.startDate && currentDate <= s.endDate);
        totalPrice += Number(season?.pricePerNight ?? apartment.basePrice ?? 0);
      }
      totalPrice += Number(apartment.cleaningFee ?? 0);
      return { apartmentId: apartment.id, apartmentName: apartment.name, totalPrice: Number(totalPrice.toFixed(2)), cleaningFee: Number(apartment.cleaningFee ?? 0) };
    });

    const apartmentsTotal = apartmentPricing.reduce((sum, i) => sum + i.totalPrice, 0);
    const guestCount = adults + children;

    // Calculate extras and insurance
    type ExtraLineItem = { key: string; name: string; type: string; billingType: string; unitPrice: number; quantity: number; subtotal: number; label: string };
    const extrasLineItems: ExtraLineItem[] = [];
    let extrasTotal = 0;

    for (const extra of hotel.extras) {
      if (!selectedExtrasKeys.includes(extra.key)) continue;

      const unitPrice = Number(extra.price);
      let quantity = 1;
      let label = extra.name;

      if (extra.billingType === 'per_night') { quantity = nights; label = `${extra.name} (${nights} Nächte)`; }
      else if (extra.billingType === 'per_person_per_night') { quantity = guestCount * nights; label = `${extra.name} (${guestCount} Pers. × ${nights} Nächte)`; }
      else if (extra.billingType === 'per_person_per_stay') { quantity = guestCount; label = `${extra.name} (${guestCount} Personen)`; }

      const subtotal = unitPrice * quantity;
      extrasTotal += subtotal;
      extrasLineItems.push({ key: extra.key, name: extra.name, type: extra.type, billingType: extra.billingType, unitPrice, quantity, subtotal, label });
    }

    const totalBookingPrice = apartmentsTotal + extrasTotal;

    // Save to DB
    const requestEntry = await prisma.request.create({
      data: {
        hotelId: hotel.id, arrival, departure, nights, adults, children,
        selectedApartmentIds: selectedApartmentIds.join(','),
        salutation, firstname, lastname, email, country,
        message: message || null, newsletter,
        status: bookingType === 'booking' ? 'confirmed' : 'new',
        extrasJson: extrasLineItems.length > 0 ? extrasLineItems : [],
      },
    });

    // Auto-block dates for confirmed bookings
    if (bookingType === 'booking') {
      await prisma.blockedRange.createMany({
        data: selectedApartmentIds.map((apartmentId) => ({
          apartmentId,
          startDate: arrival,
          endDate: departure,
          type: 'booking',
          note: `Buchung #${requestEntry.id} — ${firstname} ${lastname}`,
        })),
      });
    }

    // Build email content
    const accent = hotel.accentColor || '#111827';
    const apartmentNames = apartments.map(a => a.name).join(', ');

    const tplVars: Record<string, string> = {
      '{{guestName}}': firstname,
      '{{guestLastName}}': lastname,
      '{{hotelName}}': hotel.name,
      '{{arrival}}': formatDate(arrival),
      '{{departure}}': formatDate(departure),
      '{{nights}}': String(nights),
      '{{apartmentName}}': apartmentNames,
      '{{bookingId}}': String(requestEntry.id),
    };
    function fillTpl(str: string) {
      return Object.entries(tplVars).reduce((s, [k, v]) => s.replaceAll(k, v), str);
    }
    const getTpl = (type: string) => hotel.emailTemplates.find(t => t.type === type);
    const regularExtras = extrasLineItems.filter(e => e.type !== 'insurance');
    const insuranceExtras = extrasLineItems.filter(e => e.type === 'insurance');
    const declinedInsurance = !insuranceExtras.length && hotel.extras.some(e => e.type === 'insurance');

    function buildExtrasSection(): string {
      let html = '';

      if (regularExtras.length > 0) {
        html += `<div style="margin-bottom:12px;">`;
        regularExtras.forEach(e => {
          html += `<div style="display:flex;justify-content:space-between;padding:6px 0;font-size:14px;"><span style="color:#374151;">${e.label}</span><span style="font-weight:600;color:#111827;">${eur(e.subtotal)}</span></div>`;
        });
        html += `</div>`;
      }

      if (insuranceExtras.length > 0) {
        html += `<div style="padding:12px 16px;background:#fefce8;border:1px solid #fef08a;border-radius:8px;margin-bottom:12px;">`;
        html += `<div style="font-size:11px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px;">Versicherung</div>`;
        insuranceExtras.forEach(e => {
          html += `<div style="font-size:14px;color:#111827;">${e.name} — <strong>${eur(e.subtotal)}</strong></div>`;
        });
        html += `</div>`;
      } else if (declinedInsurance) {
        html += `<div style="padding:12px 16px;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;margin-bottom:12px;">`;
        html += `<div style="font-size:13px;color:#991b1b;">Versicherung: <strong>Abgelehnt</strong></div>`;
        html += `</div>`;
      }

      if (!regularExtras.length && !insuranceExtras.length && !declinedInsurance) {
        html += `<div style="font-size:14px;color:#6b7280;">Keine</div>`;
      }

      return html;
    }

    const priceRows = apartmentPricing.map(a => ({ label: a.apartmentName, amount: eur(a.totalPrice) }));
    if (extrasTotal > 0) priceRows.push({ label: 'Zusatzleistungen', amount: eur(extrasTotal) });
    const priceTable = buildPriceTable(priceRows, 'Gesamtbetrag', eur(totalBookingPrice), accent);

    // Send emails
    try {
      const resend = getResend();
      if (!resend) throw new Error('Resend not configured');

      const receiverEmail = hotel.email || process.env.BOOKING_RECEIVER_EMAIL!;
      const fromEmail = getFromEmail();

      // Hotel notification
      const hotelTpl = getTpl('request_hotel');
      const hotelSubject = hotelTpl
        ? fillTpl(hotelTpl.subject)
        : bookingType === 'booking'
          ? `Neue verbindliche Buchung #${requestEntry.id} — ${formatDate(arrival)} bis ${formatDate(departure)}`
          : `Neue Buchungsanfrage #${requestEntry.id} — ${formatDate(arrival)} bis ${formatDate(departure)}`;

      await resend.emails.send({
        from: fromEmail,
        to: receiverEmail,
        subject: hotelSubject,
        html: buildEmailHtml({
          hotelName: hotel.name,
          accentColor: accent,
          title: bookingType === 'booking' ? 'Neue verbindliche Buchung' : 'Neue Buchungsanfrage',
          preheader: `${firstname} ${lastname} — ${apartmentNames} — ${nights} Nächte`,
          body: `
            ${buildInfoBlock('Zeitraum', `${formatDate(arrival)} — ${formatDate(departure)} (${nights} Nächte)`)}
            ${buildInfoBlock('Gäste', `${adults} Erwachsene${children ? `, ${children} Kinder` : ''}`)}
            ${buildInfoBlock('Apartments', apartmentNames)}
            ${buildDivider()}
            <div style="font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">Zusatzleistungen</div>
            ${buildExtrasSection()}
            ${buildDivider()}
            ${priceTable}
            ${buildDivider()}
            ${buildInfoBlock('Kontakt', `${salutation ? salutation + ' ' : ''}${firstname} ${lastname}<br/>${email}${country ? '<br/>' + country : ''}`)}
            ${message ? buildInfoBlock('Nachricht', message) : ''}
            <div style="font-size:12px;color:#9ca3af;margin-top:8px;">Newsletter: ${newsletter ? 'Ja' : 'Nein'}</div>
          `,
          footer: `<p style="margin:0;font-size:12px;color:#6b7280;">Buchungs-ID: #${requestEntry.id}</p>`,
        }),
      });

      // Guest confirmation
      try {
        const guestTplType = bookingType === 'booking' ? 'booking_guest' : 'request_guest';
        const guestTpl = getTpl(guestTplType);
        const guestSubject = guestTpl
          ? fillTpl(guestTpl.subject)
          : bookingType === 'booking'
            ? `Buchungsbestätigung bei ${hotel.name}`
            : `Ihre Buchungsanfrage bei ${hotel.name}`;
        const guestBodyText = guestTpl
          ? fillTpl(guestTpl.body)
          : bookingType === 'booking'
            ? 'Ihre Buchung ist <strong>bestätigt</strong>. Wir freuen uns auf Ihren Besuch!'
            : 'vielen Dank für Ihre Buchungsanfrage. Wir haben Ihre Daten erhalten und melden uns in Kürze mit den weiteren Details.';

        await resend.emails.send({
          from: fromEmail,
          to: email,
          subject: guestSubject,
          html: buildEmailHtml({
            hotelName: hotel.name,
            accentColor: accent,
            title: bookingType === 'booking' ? 'Buchungsbestätigung' : 'Vielen Dank für Ihre Anfrage',
            preheader: `${apartmentNames} — ${formatDate(arrival)} bis ${formatDate(departure)}`,
            body: `
              <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 20px;">
                ${firstname ? `Hallo ${firstname},` : 'Hallo,'}<br/><br/>
                ${guestBodyText}
              </p>
              ${buildDivider()}
              ${buildInfoBlock('Zeitraum', `${formatDate(arrival)} — ${formatDate(departure)} (${nights} Nächte)`)}
              ${buildInfoBlock('Gäste', `${adults} Erwachsene${children ? `, ${children} Kinder` : ''}`)}
              ${buildInfoBlock('Apartments', apartmentNames)}
              ${buildDivider()}
              <div style="font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">Zusatzleistungen</div>
              ${buildExtrasSection()}
              ${buildDivider()}
              ${priceTable}
              ${message ? buildDivider() + buildInfoBlock('Ihre Nachricht', message) : ''}
              <p style="font-size:15px;color:#374151;line-height:1.6;margin:24px 0 0;">
                Mit freundlichen Grüßen<br/>
                <strong>${hotel.name}</strong>
              </p>
            `,
            footer: `<p style="margin:0;font-size:12px;color:#6b7280;">Buchungs-ID: #${requestEntry.id}</p>`,
          }),
        });
      } catch {
        // Guest mail error should not block the booking
      }
    } catch (mailError) {
      console.error('Mail error:', mailError);
    }

    return Response.json({ success: true, requestId: requestEntry.id }, { headers: corsHeaders });
  } catch (error) {
    console.error(error);
    return Response.json({ success: false, message: 'Fehler beim Speichern der Buchung.' }, { status: 500, headers: corsHeaders });
  }
}
