import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { retrievePaymentIntent } from '@/src/lib/stripe-server';
import { pushBooking } from '@/src/lib/beds24';
import { createNukiCode } from '@/src/lib/nuki';
import { hasPlanAccess } from '@/src/lib/plan-gates';
import { getResend, getFromEmail, buildEmailHtml, buildInfoBlock } from '@/src/lib/email';
import { getEmailTranslations, type Lang } from '@/src/lib/email-i18n';
import { log } from '@/src/lib/logger';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

const LANG_TO_LOCALE: Record<Lang, string> = {
  de: 'de-AT', en: 'en-GB', it: 'it-IT', fr: 'fr-FR',
  nl: 'nl-NL', ru: 'ru-RU', pl: 'pl-PL', cs: 'cs-CZ', es: 'es-ES',
};
const VALID_LANGS = new Set<Lang>(['de', 'en', 'it', 'fr', 'nl', 'ru', 'pl', 'cs', 'es']);
function toLang(s: string): Lang { return VALID_LANGS.has(s as Lang) ? (s as Lang) : 'de'; }
function fmtDate(d: Date, locale = 'de-AT') {
  return new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d);
}

export async function POST(req: NextRequest) {
  try {
    const { requestId, paymentIntentId } = await req.json();

    if (!requestId || !paymentIntentId) {
      return NextResponse.json({ success: false, message: 'Fehlende Parameter.' }, { status: 400, headers: corsHeaders });
    }

    const request = await prisma.request.findUnique({
      where: { id: Number(requestId) },
      include: {
        hotel: {
          select: {
            id: true, name: true, email: true, accentColor: true, plan: true,
            settings: { select: { stripeSecretKey: true } },
            emailTemplates: { where: { type: 'booking_guest' } },
            nukiConfig: { select: { apiToken: true } },
          },
        },
      },
    });

    if (!request || request.status !== 'pending_stripe') {
      return NextResponse.json({ success: false, message: 'Buchung nicht gefunden.' }, { status: 404, headers: corsHeaders });
    }

    const secretKey = request.hotel?.settings?.stripeSecretKey;
    if (!secretKey) {
      return NextResponse.json({ success: false, message: 'Stripe nicht konfiguriert.' }, { status: 500, headers: corsHeaders });
    }

    const pi = await retrievePaymentIntent(secretKey, paymentIntentId);
    if (pi.status !== 'succeeded') {
      log('payment.failed', { method: 'stripe', requestId: request.id, hotelId: request.hotel?.id, reason: pi.status });
      return NextResponse.json({ success: false, message: 'Zahlung noch nicht abgeschlossen.' }, { status: 402, headers: corsHeaders });
    }

    // Confirm booking
    await prisma.request.update({
      where: { id: request.id },
      data: { status: 'booked', paypalOrderId: paymentIntentId, checkinToken: crypto.randomUUID() },
    });
    log('payment.confirmed', { method: 'stripe', requestId: request.id, hotelId: request.hotel?.id });

    // Block dates
    const apartmentIds = request.selectedApartmentIds
      .split(',').map(s => s.trim()).filter(Boolean).map(Number).filter(n => n > 0);
    if (apartmentIds.length > 0) {
      await prisma.blockedRange.createMany({
        data: apartmentIds.map(apartmentId => ({
          apartmentId,
          startDate: request.arrival,
          endDate: request.departure,
          type: 'booking',
          note: `Buchung #${request.id} — ${request.firstname ?? ''} ${request.lastname} (Stripe)`,
        })),
      });
    }

    // Beds24 outbound sync
    try {
      const beds24Config = await prisma.beds24Config.findUnique({
        where: { hotelId: request.hotel!.id },
        select: { isEnabled: true, refreshToken: true },
      });
      if (beds24Config?.isEnabled && apartmentIds.length > 0) {
        const mappings = await prisma.beds24ApartmentMapping.findMany({
          where: { apartmentId: { in: apartmentIds } },
          select: { beds24RoomId: true },
        });
        const arrStr = request.arrival.toISOString().slice(0, 10);
        const depStr = request.departure.toISOString().slice(0, 10);
        for (const m of mappings) {
          await pushBooking(beds24Config.refreshToken, {
            roomId: m.beds24RoomId,
            arrival: arrStr,
            departure: depStr,
            guestName: `${request.firstname ?? ''} ${request.lastname}`.trim(),
            guestEmail: request.email,
            numAdults: request.adults,
            numChildren: request.children ?? 0,
            externalRef: `BW-${request.id}`,
          });
        }
      }
    } catch (beds24Err) {
      console.error('[Beds24] Stripe confirm sync failed:', beds24Err);
    }

    // Nuki access code
    if (request.hotel?.nukiConfig && hasPlanAccess(request.hotel.plan ?? 'starter', 'pro')) {
      try {
        const apts = await prisma.apartment.findMany({
          where: { id: { in: apartmentIds } },
          select: { id: true, nukiSmartlockId: true },
        });
        const code = Math.floor(100000 + Math.random() * 900000);
        const authIds: string[] = [];
        for (const apt of apts) {
          if (!apt.nukiSmartlockId) continue;
          const authId = await createNukiCode(
            request.hotel.nukiConfig.apiToken,
            apt.nukiSmartlockId,
            `${request.firstname ?? ''} ${request.lastname} #${request.id}`,
            request.arrival,
            request.departure,
            code,
          );
          authIds.push(`${apt.nukiSmartlockId}:${authId}`);
        }
        if (authIds.length > 0) {
          await prisma.request.update({
            where: { id: request.id },
            data: { nukiCode: String(code), nukiAuthIds: authIds.join(',') },
          });
        }
      } catch (nukiErr) {
        console.error('[Nuki] Stripe confirm code generation failed:', nukiErr);
      }
    }

    // Emails
    try {
      const resend = getResend();
      if (resend && request.hotel) {
        const hotel = request.hotel;
        const accent = hotel.accentColor || '#111827';
        const receiverEmail = hotel.email || process.env.BOOKING_RECEIVER_EMAIL!;
        const lang = toLang(request.language);
        const i18n = getEmailTranslations(lang);
        const locale = LANG_TO_LOCALE[lang];

        await resend.emails.send({
          from: getFromEmail(),
          to: receiverEmail,
          subject: `Neue Buchung #${request.id} — Stripe-Zahlung bestätigt — ${fmtDate(request.arrival)} bis ${fmtDate(request.departure)}`,
          html: buildEmailHtml({
            hotelName: hotel.name,
            accentColor: accent,
            title: 'Stripe-Zahlung bestätigt',
            preheader: `${request.firstname ?? ''} ${request.lastname} — ${fmtDate(request.arrival)}–${fmtDate(request.departure)}`,
            body: `
              ${buildInfoBlock('Status', '✅ Zahlung via Stripe eingegangen')}
              ${buildInfoBlock('Zeitraum', `${fmtDate(request.arrival)} — ${fmtDate(request.departure)} (${request.nights} Nächte)`)}
              ${buildInfoBlock('Gäste', `${request.adults} Erwachsene${request.children ? `, ${request.children} Kinder` : ''}`)}
              ${buildInfoBlock('Gast', `${request.firstname ?? ''} ${request.lastname} · ${request.email}`)}
              ${buildInfoBlock('Stripe Payment Intent', paymentIntentId)}
            `,
            footer: `<p style="margin:0;font-size:12px;color:#6b7280;">Buchungs-ID: #${request.id}</p>`,
          }),
        });

        const guestTpl = hotel.emailTemplates?.[0];
        const fill = (s: string) => s
          .replaceAll('{{guestName}}', request.firstname ?? '')
          .replaceAll('{{guestLastName}}', request.lastname)
          .replaceAll('{{hotelName}}', hotel.name)
          .replaceAll('{{arrival}}', fmtDate(request.arrival, locale))
          .replaceAll('{{departure}}', fmtDate(request.departure, locale))
          .replaceAll('{{nights}}', String(request.nights))
          .replaceAll('{{bookingId}}', String(request.id));

        const guestSubject = guestTpl ? fill(guestTpl.subject) : i18n.bookingSubject(hotel.name);
        const guestGreeting = guestTpl?.greeting ? fill(guestTpl.greeting) : i18n.greeting(request.firstname ?? '');
        const guestBodyText = guestTpl?.body ? fill(guestTpl.body) : `${i18n.bookingBody} ${ lang === 'de' ? 'Ihre Zahlung via Kreditkarte wurde erfolgreich verarbeitet.' : 'Your credit card payment has been successfully processed.'}`;
        const guestSignoff = guestTpl?.signoff ? fill(guestTpl.signoff) : i18n.signoff;

        await resend.emails.send({
          from: getFromEmail(),
          to: request.email,
          subject: guestSubject,
          html: buildEmailHtml({
            hotelName: hotel.name,
            accentColor: accent,
            title: i18n.bookingTitle,
            preheader: `${fmtDate(request.arrival, locale)} – ${fmtDate(request.departure, locale)}`,
            body: `
              <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 20px;">
                ${guestGreeting}<br/><br/>
                <span style="white-space:pre-wrap;">${guestBodyText.replace(/\n/g, '<br/>')}</span>
              </p>
              ${buildInfoBlock(i18n.period, `${fmtDate(request.arrival, locale)} — ${fmtDate(request.departure, locale)} (${i18n.nights(request.nights)})`)}
              ${buildInfoBlock(i18n.guests, i18n.adults(request.adults) + (request.children ? i18n.children(request.children) : ''))}
              <p style="font-size:15px;color:#374151;line-height:1.6;margin:24px 0 0;">${guestSignoff},<br/><strong>${hotel.name}</strong></p>
            `,
            footer: `<p style="margin:0;font-size:12px;color:#6b7280;">Buchungs-ID: #${request.id}</p>`,
          }),
        });
      }
    } catch (emailErr) {
      console.error('[Stripe confirm] email error:', emailErr);
      log('email.error', { template: 'stripe_confirmation', requestId: request.id, error: emailErr instanceof Error ? emailErr.message : String(emailErr) });
    }

    log('email.sent', { template: 'stripe_confirmation', requestId: request.id });
    return NextResponse.json({ success: true }, { headers: corsHeaders });
  } catch (err) {
    console.error('[Stripe confirm] error:', err);
    log('booking.error', { route: 'stripe/confirm', error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ success: false, message: 'Serverfehler.' }, { status: 500, headers: corsHeaders });
  }
}
