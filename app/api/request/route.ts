import { prisma } from '@/src/lib/prisma';
import { getResend, getFromEmail, buildEmailHtml, buildPriceTable, buildInfoBlock, buildDivider, eur } from '@/src/lib/email';
import { getEmailTranslations, dateLocale, type Lang } from '@/src/lib/email-i18n';
import { rateLimit, rateLimitResponse } from '@/src/lib/rate-limit';
import { bookingRequestSchema } from '@/src/lib/schemas';
import { createNukiCode } from '@/src/lib/nuki';
import { pushBooking } from '@/src/lib/beds24';
import { hasPlanAccess } from '@/src/lib/plan-gates';
import { calculateOrtstaxe } from '@/src/lib/ortstaxe';

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

function formatDate(d: Date, locale = 'de-AT'): string {
  return new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d);
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.json();
    const parsed = bookingRequestSchema.safeParse(rawBody);
    if (!parsed.success) {
      return Response.json({ success: false, message: 'Ungültige Eingabe.' }, { status: 400, headers: corsHeaders });
    }
    const body = parsed.data;

    const hotelSlug = body.hotel.trim();
    const email = body.email.trim();

    // Rate limit: 10 bookings per IP per 15 min, 3 per email per 5 min
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const { ok: ipOk } = rateLimit(`booking:ip:${ip}`, 10, 15 * 60 * 1000);
    if (!ipOk) return rateLimitResponse();
    const { ok: emailOk } = rateLimit(`booking:email:${email}`, 3, 5 * 60 * 1000);
    if (!emailOk) return rateLimitResponse();

    const arrivalRaw = body.arrival.trim();
    const departureRaw = body.departure.trim();
    const nights = body.nights;
    const adults = body.adults;
    const children = body.children;
    const childBirthdays = body.child_birthdays;
    const additionalGuests = body.additional_guests;
    const selectedApartmentIdsRaw = body.selected_apartments.trim();

    // Support both object format {key: true/false} and array format [key1, key2]
    let selectedExtrasKeys: string[] = [];
    if (body.extras) {
      if (Array.isArray(body.extras)) {
        selectedExtrasKeys = body.extras;
      } else {
        selectedExtrasKeys = Object.entries(body.extras)
          .filter(([, v]) => v === true)
          .map(([k]) => k);
      }
    }

    const salutation = body.salutation.trim();
    const firstname = body.firstname.trim();
    const lastname = body.lastname.trim();
    const paymentMethod = body.payment_method.trim();
    const street = body.street.trim();
    const zip = body.zip.trim();
    const city = body.city.trim();
    const country = body.country.trim();
    const message = body.message.trim();
    const newsletter = body.newsletter;
    const bookingType = body.bookingType;
    const showPrices = body.showPrices !== false;
    const browserLang = body.browserLanguage.toLowerCase();
    const LANG_PREFIXES: [string, Lang][] = [
      ['de', 'de'], ['it', 'it'], ['fr', 'fr'], ['nl', 'nl'],
      ['es', 'es'], ['pl', 'pl'], ['cs', 'cs'], ['ru', 'ru'],
    ];
    const autoLang: Lang = LANG_PREFIXES.find(([prefix]) => browserLang.startsWith(prefix))?.[1] ?? 'en';

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
        id: true, name: true, email: true, accentColor: true, plan: true,
        emailTemplates: { select: { type: true, subject: true, greeting: true, body: true, signoff: true } },
        extras: {
          where: { isActive: true },
          select: { key: true, name: true, type: true, billingType: true, price: true, showInWidget: true, showInUpsell: true },
        },
        nukiConfig: { select: { apiToken: true } },
        settings: { select: { ortstaxeMode: true, ortstaxePerPersonPerNight: true, ortstaxeMinAge: true, preArrivalEnabled: true, depositEnabled: true, depositType: true, depositValue: true, depositDueDays: true, bankAccountHolder: true, bankIban: true, bankBic: true } },
      },
    });

    if (!hotel) {
      return Response.json({ success: false, message: 'Hotel nicht gefunden.' }, { status: 404, headers: corsHeaders });
    }

    const apartments = await prisma.apartment.findMany({
      where: { id: { in: selectedApartmentIds }, hotelId: hotel.id },
      select: {
        id: true, name: true, basePrice: true, cleaningFee: true,
        nukiSmartlockId: true,
        priceSeasons: { select: { startDate: true, endDate: true, pricePerNight: true } },
        beds24Mapping: { select: { beds24RoomId: true } },
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

    // i18n setup (needed for guest labels)
    const lang = autoLang;
    const i18n = getEmailTranslations(lang);
    const locale = dateLocale[lang];

    // Calculate extras and insurance
    type ExtraLineItem = { key: string; name: string; type: string; billingType: string; unitPrice: number; quantity: number; subtotal: number; label: string; guestLabel: string };
    const extrasLineItems: ExtraLineItem[] = [];
    let extrasTotal = 0;

    for (const extra of hotel.extras) {
      if (!selectedExtrasKeys.includes(extra.key)) continue;

      const unitPrice = Number(extra.price);
      let quantity = 1;
      // German label for hotel notification
      let label = extra.name;
      let guestLabel = extra.name;

      if (extra.billingType === 'per_night') {
        quantity = nights;
        label = `${extra.name} (${nights} Nächte)`;
        guestLabel = i18n.perNight(extra.name, nights);
      } else if (extra.billingType === 'per_person_per_night') {
        quantity = guestCount * nights;
        label = `${extra.name} (${guestCount} Pers. × ${nights} Nächte)`;
        guestLabel = i18n.perPersonPerNight(extra.name, guestCount, nights);
      } else if (extra.billingType === 'per_person_per_stay') {
        quantity = guestCount;
        label = `${extra.name} (${guestCount} Personen)`;
        guestLabel = i18n.perPersonPerStay(extra.name, guestCount);
      }

      const subtotal = unitPrice * quantity;
      extrasTotal += subtotal;
      extrasLineItems.push({ key: extra.key, name: extra.name, type: extra.type, billingType: extra.billingType, unitPrice, quantity, subtotal, label, guestLabel });
    }

    // Calculate Ortstaxe
    const ortstaxeTotal = calculateOrtstaxe({
      settings: {
        ortstaxeMode: hotel.settings?.ortstaxeMode ?? 'off',
        ortstaxePerPersonPerNight: Number(hotel.settings?.ortstaxePerPersonPerNight ?? 0) || null,
        ortstaxeMinAge: hotel.settings?.ortstaxeMinAge ?? null,
      },
      roomTotalWithoutBreakfast: apartmentsTotal,
      adults,
      children,
      nights,
      arrivalDate: arrival,
      childBirthdays,
    });

    const totalBookingPrice = apartmentsTotal + extrasTotal + ortstaxeTotal;

    // Generate token for all instant bookings — used for guest portal + check-in
    const isInstantBooking = bookingType === 'booking';
    const checkinToken = isInstantBooking ? crypto.randomUUID() : null;

    // Save to DB
    const isPaypalBooking = paymentMethod.toLowerCase() === 'paypal' && bookingType === 'booking';
    const isStripeBooking = paymentMethod.toLowerCase() === 'stripe' && bookingType === 'booking';
    const requestEntry = await prisma.request.create({
      data: {
        hotelId: hotel.id, arrival, departure, nights, adults, children,
        selectedApartmentIds: selectedApartmentIds.join(','),
        salutation, firstname, lastname, email, country,
        message: message || null, paymentMethod: paymentMethod || null, newsletter,
        status: isPaypalBooking ? 'pending_paypal' : isStripeBooking ? 'pending_stripe' : (isInstantBooking ? 'booked' : 'new'),
        language: autoLang,
        extrasJson: extrasLineItems.length > 0 ? extrasLineItems : [],
        pricingJson: {
          apartments: apartmentPricing,
          extrasTotal,
          ortstaxeTotal,
          total: totalBookingPrice,
        },
        ...(checkinToken ? { checkinToken } : {}),
      },
    });

    // PayPal redirect flow — return approval URL, skip blocking and emails
    if (isPaypalBooking) {
      try {
        const hotelSettings = await prisma.hotelSettings.findUnique({
          where: { hotelId: hotel.id },
          select: { paypalClientId: true, paypalClientSecret: true },
        });
        if (hotelSettings?.paypalClientId && hotelSettings?.paypalClientSecret) {
          const { getPaypalAccessToken, createPaypalOrder } = await import('@/src/lib/paypal');
          const base = process.env.NEXT_PUBLIC_BASE_URL || `https://${process.env.VERCEL_URL}`;
          const accessToken = await getPaypalAccessToken(hotelSettings.paypalClientId, hotelSettings.paypalClientSecret);
          const { orderId, approvalUrl } = await createPaypalOrder(
            accessToken,
            totalBookingPrice,
            'EUR',
            `${base}/api/paypal/capture?requestId=${requestEntry.id}`,
            `${base}/booking-confirmed?status=cancelled`,
            `Buchung #${requestEntry.id} — ${hotel.name}`,
          );
          await prisma.request.update({ where: { id: requestEntry.id }, data: { paypalOrderId: orderId } });
          return Response.json({ success: true, approvalUrl }, { headers: corsHeaders });
        }
      } catch (paypalErr) {
        console.error('[PayPal] order creation failed:', paypalErr);
        return Response.json({ success: false, message: 'PayPal-Zahlung konnte nicht gestartet werden.' }, { status: 502, headers: corsHeaders });
      }
      // PayPal credentials missing
      return Response.json({ success: false, message: 'PayPal nicht konfiguriert.' }, { status: 500, headers: corsHeaders });
    }

    // Stripe flow — create PaymentIntent, return clientSecret
    if (isStripeBooking) {
      try {
        const hotelSettings = await prisma.hotelSettings.findUnique({
          where: { hotelId: hotel.id },
          select: { stripeSecretKey: true },
        });
        if (hotelSettings?.stripeSecretKey) {
          const { createPaymentIntent } = await import('@/src/lib/stripe-server');
          const { clientSecret } = await createPaymentIntent(
            hotelSettings.stripeSecretKey,
            totalBookingPrice,
            { requestId: String(requestEntry.id), hotelName: hotel.name },
          );
          return Response.json({ success: true, clientSecret, requestId: requestEntry.id }, { headers: corsHeaders });
        }
        return Response.json({ success: false, message: 'Stripe nicht konfiguriert.' }, { status: 500, headers: corsHeaders });
      } catch (stripeErr) {
        console.error('[Stripe] PaymentIntent creation failed:', stripeErr);
        return Response.json({ success: false, message: 'Kartenzahlung konnte nicht gestartet werden.' }, { status: 502, headers: corsHeaders });
      }
    }

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

    // Beds24 outbound sync — push booking to Beds24 so Airbnb/Booking.com get blocked
    if (bookingType === 'booking') {
      try {
        const beds24Config = await prisma.beds24Config.findUnique({
          where: { hotelId: hotel.id },
          select: { isEnabled: true, refreshToken: true },
        });
        if (beds24Config?.isEnabled) {
          const arrivalStr = arrival.toISOString().slice(0, 10);
          const departureStr = departure.toISOString().slice(0, 10);
          for (const apt of apartments) {
            if (!apt.beds24Mapping?.beds24RoomId) continue;
            await pushBooking(beds24Config.refreshToken, {
              roomId: apt.beds24Mapping.beds24RoomId,
              arrival: arrivalStr,
              departure: departureStr,
              guestName: `${firstname ?? ''} ${lastname}`.trim(),
              guestEmail: email,
              numAdults: adults,
              numChildren: children,
              externalRef: `BW-${requestEntry.id}`,
            });
          }
        }
      } catch (beds24Err) {
        // Non-blocking: booking proceeds regardless of Beds24 failures
        console.error('[Beds24] outbound sync failed:', beds24Err);
      }
    }

    // Generate Nuki access code for instant bookings (Pro+)
    let nukiCode: string | null = null;
    if (bookingType === 'booking' && hotel.nukiConfig && hasPlanAccess(hotel.plan ?? 'starter', 'pro')) {
      try {
        const code = Math.floor(100000 + Math.random() * 900000);
        const authIds: string[] = [];
        for (const apt of apartments) {
          if (!apt.nukiSmartlockId) continue;
          const authId = await createNukiCode(
            hotel.nukiConfig.apiToken,
            apt.nukiSmartlockId,
            `${firstname} ${lastname} #${requestEntry.id}`,
            arrival,
            departure,
            code,
          );
          authIds.push(`${apt.nukiSmartlockId}:${authId}`);
        }
        if (authIds.length > 0) {
          nukiCode = String(code);
          await prisma.request.update({
            where: { id: requestEntry.id },
            data: { nukiCode, nukiAuthIds: authIds.join(',') },
          });
        }
      } catch (nukiErr) {
        console.error('Nuki code generation failed:', nukiErr);
        try {
          const resend = getResend();
          const receiverEmail = hotel.email || process.env.BOOKING_RECEIVER_EMAIL;
          if (resend && receiverEmail) {
            await resend.emails.send({
              from: getFromEmail(),
              to: receiverEmail,
              subject: `Nuki-Fehler: Zugangscode für Buchung #${requestEntry.id} konnte nicht erstellt werden`,
              html: `<p>Hallo,</p>
<p>bei der Buchung <strong>#${requestEntry.id}</strong> von <strong>${firstname} ${lastname}</strong> (${formatDate(arrival)} – ${formatDate(departure)}) konnte kein Nuki-Zugangscode generiert werden.</p>
<p>Bitte stellen Sie dem Gast den Zugang manuell bereit.</p>
<p style="color:#6b7280;font-size:13px;">Technischer Fehler: ${nukiErr instanceof Error ? nukiErr.message : String(nukiErr)}</p>`,
            });
          }
        } catch (mailErr) {
          console.error('Failed to send Nuki error email:', mailErr);
        }
      }
    }

    // Build email content
    const accent = hotel.accentColor || '#111827';
    const apartmentNames = apartments.map(a => a.name).join(', ');

    // Deposit + bank details block for guest email
    const depositEnabled = hotel.settings?.depositEnabled ?? false;
    const depositType = hotel.settings?.depositType ?? 'percent';
    const depositValue = hotel.settings?.depositValue ?? 25;
    const depositAmount = depositEnabled && totalBookingPrice > 0
      ? (depositType === 'fixed'
          ? depositValue
          : Math.round((totalBookingPrice * depositValue / 100) / 10) * 10)
      : 0;
    const depositDueDays = hotel.settings?.depositDueDays ?? 7;
    const bankIban = hotel.settings?.bankIban;
    const bankBic = hotel.settings?.bankBic;
    const bankHolder = hotel.settings?.bankAccountHolder;
    const depositBlock = (isInstantBooking && depositAmount > 0 && bankIban)
      ? `${buildDivider()}
        <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:20px 24px;">
          <div style="font-size:11px;font-weight:700;color:#1e40af;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:12px;">Anzahlung</div>
          <p style="margin:0 0 12px;font-size:14px;color:#374151;">Bitte überweisen Sie innerhalb von ${depositDueDays} Tagen einen Anzahlungsbetrag von <strong>€ ${depositAmount.toFixed(2).replace('.', ',')}</strong> auf folgendes Konto:</p>
          ${bankHolder ? `<div style="font-size:14px;color:#111827;font-weight:600;">${bankHolder}</div>` : ''}
          <div style="font-size:14px;color:#111827;">IBAN: <strong>${bankIban}</strong></div>
          ${bankBic ? `<div style="font-size:14px;color:#111827;">BIC: <strong>${bankBic}</strong></div>` : ''}
          <div style="font-size:13px;color:#6b7280;margin-top:8px;">Verwendungszweck: Buchung #${requestEntry.id} – ${firstname} ${lastname}</div>
        </div>`
      : '';

    const tplVars: Record<string, string> = {
      '{{guestName}}': firstname,
      '{{guestLastName}}': lastname,
      '{{hotelName}}': hotel.name,
      '{{arrival}}': formatDate(arrival, locale),
      '{{departure}}': formatDate(departure, locale),
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

    const bookedExtraKeys = new Set(extrasLineItems.map(e => e.key));
    const upsellExtras = hotel.extras.filter(
      e => e.showInUpsell && e.type !== 'insurance' && !bookedExtraKeys.has(e.key)
    );

    function buildExtrasSection(useGuestLabels = false): string {
      let html = '';
      const insuranceLabel = useGuestLabels ? i18n.insurance : 'Versicherung';
      const declinedLabel = useGuestLabels ? i18n.insuranceDeclined : 'Abgelehnt';
      const noneLabel = useGuestLabels ? i18n.noExtras : 'Keine';

      if (regularExtras.length > 0) {
        html += `<div style="margin-bottom:12px;">`;
        regularExtras.forEach(e => {
          const lbl = useGuestLabels ? e.guestLabel : e.label;
          html += showPrices
            ? `<div style="display:flex;justify-content:space-between;padding:6px 0;font-size:14px;"><span style="color:#374151;">${lbl}</span><span style="font-weight:600;color:#111827;">${eur(e.subtotal)}</span></div>`
            : `<div style="padding:6px 0;font-size:14px;color:#374151;">${lbl}</div>`;
        });
        html += `</div>`;
      }

      if (insuranceExtras.length > 0) {
        html += `<div style="padding:12px 16px;background:#fefce8;border:1px solid #fef08a;border-radius:8px;margin-bottom:12px;">`;
        html += `<div style="font-size:11px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px;">${insuranceLabel}</div>`;
        insuranceExtras.forEach(e => {
          html += showPrices
            ? `<div style="font-size:14px;color:#111827;">${e.name} — <strong>${eur(e.subtotal)}</strong></div>`
            : `<div style="font-size:14px;color:#111827;">${e.name}</div>`;
        });
        html += `</div>`;
      } else if (declinedInsurance) {
        html += `<div style="padding:12px 16px;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;margin-bottom:12px;">`;
        html += `<div style="font-size:13px;color:#991b1b;">${insuranceLabel}: <strong>${declinedLabel}</strong></div>`;
        html += `</div>`;
      }

      if (!regularExtras.length && !insuranceExtras.length && !declinedInsurance) {
        html += `<div style="font-size:14px;color:#6b7280;">${noneLabel}</div>`;
      }

      return html;
    }

    // Hotel price table (German)
    const priceRows = apartmentPricing.map(a => ({ label: a.apartmentName, amount: eur(a.totalPrice) }));
    if (extrasTotal > 0) priceRows.push({ label: 'Zusatzleistungen', amount: eur(extrasTotal) });
    if (ortstaxeTotal > 0) priceRows.push({ label: 'Ortstaxe', amount: eur(ortstaxeTotal) });
    const priceTable = showPrices ? buildPriceTable(priceRows, 'Gesamtbetrag', eur(totalBookingPrice), accent) : '';

    // Guest price table (translated)
    const guestPriceRows = apartmentPricing.map(a => ({ label: a.apartmentName, amount: eur(a.totalPrice) }));
    if (extrasTotal > 0) guestPriceRows.push({ label: i18n.extrasTotal, amount: eur(extrasTotal) });
    if (ortstaxeTotal > 0) guestPriceRows.push({ label: 'Ortstaxe', amount: eur(ortstaxeTotal) });
    const guestPriceTable = showPrices ? buildPriceTable(guestPriceRows, i18n.total, eur(totalBookingPrice), accent) : '';

    // Send emails
    try {
      const resend = getResend();
      if (!resend) throw new Error('Resend not configured');

      const receiverEmail = hotel.email || process.env.BOOKING_RECEIVER_EMAIL!;
      const fromEmail = getFromEmail();
      const base = process.env.NEXT_PUBLIC_BASE_URL || `https://${process.env.VERCEL_URL}`;
      const checkinUrl = checkinToken && hotel.settings?.preArrivalEnabled ? `${base}/checkin/${checkinToken}` : null;
      const portalUrl = checkinToken ? `${base}/gast/${checkinToken}` : null;

      tplVars['{{portalUrl}}'] = portalUrl ?? '';

      // Hotel notification (always German)
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
            ${childBirthdays.length ? buildInfoBlock('Geburtstage Kinder', childBirthdays.map((d, i) => `Kind ${i + 1}: ${d}`).join('<br/>')) : ''}
            ${additionalGuests.length ? buildInfoBlock('Weitere Gäste', additionalGuests.map((g, i) => {
              const name = [g.firstname, g.lastname].filter(Boolean).join(' ') || '—';
              const bd = g.birthday ? `, geb. ${g.birthday}` : '';
              return `${i + 1}. ${name}${bd}`;
            }).join('<br/>')) : ''}
            ${buildInfoBlock('Apartments', apartmentNames)}
            ${buildDivider()}
            <div style="font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">Zusatzleistungen</div>
            ${buildExtrasSection()}
            ${buildDivider()}
            ${priceTable}
            ${buildDivider()}
            ${paymentMethod ? buildInfoBlock('Zahlungsmethode', paymentMethod) : ''}
            ${buildInfoBlock('Kontakt', `${salutation ? salutation + ' ' : ''}${firstname} ${lastname}<br/>${email}<br/>${[street, [zip, city].filter(Boolean).join(' '), country].filter(Boolean).join('<br/>')}`)}
            ${message ? buildInfoBlock('Nachricht', message) : ''}
            <div style="font-size:12px;color:#9ca3af;margin-top:8px;">Newsletter: ${newsletter ? 'Ja' : 'Nein'}</div>
          `,
          footer: `<p style="margin:0;font-size:12px;color:#6b7280;">Buchungs-ID: #${requestEntry.id}</p>`,
        }),
      });

      // Guest confirmation (in hotel's configured language)
      try {
        const guestTplType = bookingType === 'booking' ? 'booking_guest' : 'request_guest';
        const guestTpl = getTpl(guestTplType);
        const guestSubject = guestTpl
          ? fillTpl(guestTpl.subject)
          : bookingType === 'booking'
            ? i18n.bookingSubject(hotel.name)
            : i18n.requestSubject(hotel.name);
        const guestBodyText = guestTpl
          ? fillTpl(guestTpl.body)
          : bookingType === 'booking'
            ? i18n.bookingBody
            : i18n.requestBody;
        const guestGreeting = guestTpl?.greeting
          ? fillTpl(guestTpl.greeting)
          : i18n.greeting(firstname);
        const guestSignoff = guestTpl?.signoff
          ? fillTpl(guestTpl.signoff)
          : i18n.signoff;

        const guestsText = i18n.adults(adults) + (children ? i18n.children(children) : '');
        const periodText = `${formatDate(arrival, locale)} — ${formatDate(departure, locale)} (${i18n.nights(nights)})`;

        await resend.emails.send({
          from: fromEmail,
          to: email,
          subject: guestSubject,
          html: buildEmailHtml({
            hotelName: hotel.name,
            accentColor: accent,
            title: bookingType === 'booking' ? i18n.bookingTitle : i18n.requestTitle,
            preheader: `${apartmentNames} — ${formatDate(arrival, locale)} bis ${formatDate(departure, locale)}`,
            autoReplyText: i18n.autoReply,
            body: `
              <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 20px;">
                ${guestGreeting}<br/><br/>
                ${guestBodyText}
              </p>
              ${buildDivider()}
              ${buildInfoBlock(i18n.period, periodText)}
              ${buildInfoBlock(i18n.guests, guestsText)}
              ${buildInfoBlock(i18n.apartments, apartmentNames)}
              ${buildDivider()}
              <div style="font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">${i18n.extras}</div>
              ${buildExtrasSection(true)}
              ${buildDivider()}
              ${guestPriceTable}
              ${depositBlock}
              ${message ? buildDivider() + buildInfoBlock(i18n.yourMessage, message) : ''}
              ${nukiCode ? `
                ${buildDivider()}
                <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px 24px;text-align:center;">
                  <div style="font-size:12px;font-weight:700;color:#166534;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px;">🔑 Ihr digitaler Zugangscode</div>
                  <div style="font-size:36px;font-weight:800;letter-spacing:0.15em;color:#111827;font-family:monospace;">${nukiCode}</div>
                  <div style="font-size:13px;color:#374151;margin-top:8px;">Gültig von Anreise bis Abreise — öffnet das Schloss direkt vor Ort.</div>
                </div>
              ` : ''}
              ${portalUrl ? `
                ${buildDivider()}
                <div style="margin-top:4px;padding:16px;background:#f9fafb;border-radius:10px;border:1px solid #e5e7eb;">
                  <p style="margin:0 0 10px;font-size:14px;color:#374151;font-weight:600;">Ihr Gästeportal</p>
                  <p style="margin:0 0 14px;font-size:13px;color:#6b7280;line-height:1.5;">Alle Details zu Ihrer Buchung, Check-In, Kontakt und mehr — jederzeit abrufbar.</p>
                  <a href="${portalUrl}" style="display:inline-block;padding:10px 20px;background:${accent};color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;">
                    Gästeportal öffnen →
                  </a>
                </div>
              ` : ''}
              ${checkinUrl ? `
                ${buildDivider()}
                <div style="margin-top:4px;padding:16px;background:#f9fafb;border-radius:10px;border:1px solid #e5e7eb;">
                  <p style="margin:0 0 10px;font-size:14px;color:#374151;font-weight:600;">Online Check-in</p>
                  <p style="margin:0 0 14px;font-size:13px;color:#6b7280;line-height:1.5;">Füllen Sie bitte vorab das Online Check-in Formular aus — das spart Zeit bei der Ankunft.</p>
                  <a href="${checkinUrl}" style="display:inline-block;padding:10px 20px;background:${accent};color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;">
                    Jetzt einchecken →
                  </a>
                </div>
              ` : ''}
              ${upsellExtras.length > 0 ? `
                ${buildDivider()}
                <div style="padding:16px 18px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;">
                  <div style="font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:10px;">Noch etwas dazubuchen?</div>
                  ${upsellExtras.map(e => `
                    <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #f0f0f0;">
                      <div>
                        <div style="font-size:14px;font-weight:600;color:#111827;">${e.name}</div>
                      </div>
                      <div style="font-size:13px;color:#374151;font-weight:600;flex-shrink:0;margin-left:16px;">${new Intl.NumberFormat('de-AT', { style: 'currency', currency: 'EUR' }).format(Number(e.price))}</div>
                    </div>
                  `).join('')}
                  ${portalUrl ? `
                    <div style="margin-top:14px;">
                      <a href="${portalUrl}" style="display:inline-block;padding:9px 18px;background:${accent};color:#ffffff;text-decoration:none;border-radius:8px;font-size:13px;font-weight:600;">
                        Jetzt dazubuchen →
                      </a>
                    </div>
                  ` : ''}
                </div>
              ` : ''}
              <p style="font-size:15px;color:#374151;line-height:1.6;margin:24px 0 0;">
                ${guestSignoff}<br/>
                <strong>${hotel.name}</strong>
              </p>
              ${hotel.email ? `<p style="font-size:13px;color:#6b7280;margin:8px 0 0;">${i18n.contactLine(hotel.email)}</p>` : ''}
            `,
            footer: `<p style="margin:0;font-size:12px;color:#6b7280;">${i18n.bookingId(requestEntry.id)}</p>`,
          }),
        });
      } catch {
        // Guest mail error should not block the booking
      }
    } catch (mailError) {
      console.error('Mail error:', mailError);
    }

    // Redeem voucher for confirmed bank-transfer bookings only
    if (bookingType === 'booking' && body.voucherCode) {
      try {
        await prisma.voucher.updateMany({
          where: { code: body.voucherCode, hotelId: hotel.id, status: 'active' },
          data: { status: 'redeemed', redeemedAt: new Date(), redeemedOnRequestId: requestEntry.id },
        });
      } catch (e) {
        console.error('[voucher redeem]', e);
      }
    }

    return Response.json({ success: true, requestId: requestEntry.id }, { headers: corsHeaders });
  } catch (error) {
    console.error(error);
    return Response.json({ success: false, message: 'Fehler beim Speichern der Buchung.' }, { status: 500, headers: corsHeaders });
  }
}
