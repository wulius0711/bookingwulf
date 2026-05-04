import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import { buildEmailHtml, buildPriceTable, buildInfoBlock, buildDivider, eur } from '@/src/lib/email';
import { hasPlanAccess } from '@/src/lib/plan-gates';

const SAMPLE: Record<string, string> = {
  '{{guestName}}': 'Max',
  '{{guestLastName}}': 'Mustermann',
  '{{hotelName}}': 'Hotel Beispiel',
  '{{arrival}}': '20.07.2026',
  '{{departure}}': '27.07.2026',
  '{{nights}}': '7',
  '{{apartmentName}}': 'Apartment Seeblick',
  '{{bookingId}}': '42',
};

function fill(str: string, hotelName: string) {
  return Object.entries({ ...SAMPLE, '{{hotelName}}': hotelName })
    .reduce((s, [k, v]) => s.replaceAll(k, v), str);
}

export async function GET(req: Request) {
  const session = await verifySession().catch(() => null);
  if (!session) return new Response('Unauthorized', { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'request_guest';

  const hotel = session.hotelId
    ? await prisma.hotel.findUnique({
        where: { id: session.hotelId },
        select: { id: true, name: true, accentColor: true, plan: true, emailTemplates: true, settings: { select: { checkoutTime: true, checkoutReminderText: true, checkoutReminderSubject: true, checkoutReminderBody: true, reviewRequestSubject: true, reviewRequestBody: true, reviewRequestLink: true } } },
      })
    : null;

  const hasPro = !session.hotelId || hasPlanAccess(hotel?.plan ?? 'starter', 'pro');
  const tpl = hasPro ? hotel?.emailTemplates.find(t => t.type === type) : null;
  const hotelName = hotel?.name ?? 'Hotel Beispiel';
  const accent = hotel?.accentColor ?? '#111827';
  const s = hotel?.settings;

  // — Checkout Reminder preview —
  if (type === 'checkout_reminder') {
    const checkoutTime = s?.checkoutTime || '10:00 Uhr';
    const subject = (s?.checkoutReminderSubject || 'Erinnerung Check-out heute — {{hotelName}}')
      .replace('{{hotelName}}', hotelName);
    const bodyText = (s?.checkoutReminderBody || 'wir hoffen, du hattest einen schönen Aufenthalt! Heute ist dein Abreisetag — bitte hinterlasse das Zimmer bis {{checkoutTime}}.')
      .replace('{{checkoutTime}}', checkoutTime).replace('{{hotelName}}', hotelName);
    const instructionsBlock = s?.checkoutReminderText
      ? `<p style="font-size:14px;color:#374151;line-height:1.7;margin:16px 0 0;background:#f8fafc;border-radius:10px;padding:14px 16px;">${s.checkoutReminderText.replace(/\n/g, '<br/>')}</p>`
      : '';
    const html = buildEmailHtml({
      hotelName, accentColor: accent, title: 'Auf Wiedersehen!',
      preheader: subject, autoReplyText: 'Diese E-Mail wurde automatisch versendet.',
      body: `<p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 12px;">Hallo Max,<br/><br/>${bodyText.replace(/\n/g, '<br/>')}</p>${instructionsBlock}`,
      footer: `<p style="margin:0;font-size:12px;color:#6b7280;">Buchungs-ID: #42 — Vorschau mit Beispieldaten</p>`,
    });
    return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }

  // — Review Request preview —
  if (type === 'review_request') {
    const subject = (s?.reviewRequestSubject || 'Wie war dein Aufenthalt? — {{hotelName}}')
      .replace('{{hotelName}}', hotelName);
    const bodyText = s?.reviewRequestBody || 'wir hoffen, es hat dir bei uns gefallen! Wenn du einen Moment Zeit hast, würden wir uns sehr über eine kurze Bewertung freuen — das hilft uns sehr und anderen Gästen bei ihrer Entscheidung.';
    const reviewUrl = s?.reviewRequestLink || '#';
    const html = buildEmailHtml({
      hotelName, accentColor: accent, title: 'Danke für deinen Besuch!',
      preheader: subject, autoReplyText: 'Diese E-Mail wurde automatisch versendet.',
      body: `
        <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 16px;">Hallo Max,<br/><br/>${bodyText.replace(/\n/g, '<br/>')}</p>
        <div style="margin-top:24px;">
          <a href="${reviewUrl}" style="display:inline-block;padding:13px 28px;background:${accent};color:#ffffff;text-decoration:none;border-radius:10px;font-size:15px;font-weight:700;">Jetzt bewerten →</a>
        </div>
        <p style="font-size:13px;color:#9ca3af;margin:20px 0 0;">Es dauert nur eine Minute — vielen Dank!</p>
      `,
      footer: `<p style="margin:0;font-size:12px;color:#6b7280;">Buchungs-ID: #42 — Vorschau mit Beispieldaten</p>`,
    });
    return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }

  const isBooking = type === 'booking_guest';
  const isGuest = type !== 'request_hotel';

  const subject = fill(tpl?.subject ?? (isBooking ? 'Buchungsbestätigung bei {{hotelName}}' : 'Ihre Buchungsanfrage bei {{hotelName}}'), hotelName);
  const greeting = isGuest ? fill(tpl?.greeting ?? 'Hallo {{guestName}},', hotelName) : '';
  const bodyText = fill(
    tpl?.body ?? (isBooking
      ? 'Ihre Buchung ist bestätigt. Wir freuen uns auf Ihren Besuch!'
      : type === 'request_guest'
        ? 'vielen Dank für Ihre Buchungsanfrage. Wir haben Ihre Daten erhalten und melden uns in Kürze mit den weiteren Details.'
        : ''),
    hotelName
  );
  const signoff = isGuest ? fill(tpl?.signoff ?? 'Mit freundlichen Grüßen', hotelName) : '';

  const priceTable = buildPriceTable(
    [{ label: 'Apartment Seeblick', amount: eur(980) }, { label: 'Endreinigung', amount: eur(80) }],
    'Gesamtbetrag', eur(1060), accent
  );

  const guestBody = `
    <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 20px;">
      ${greeting}<br/><br/>
      ${bodyText}
    </p>
    ${buildDivider()}
    ${buildInfoBlock('Zeitraum', '20.07.2026 — 27.07.2026 (7 Nächte)')}
    ${buildInfoBlock('Gäste', '2 Erwachsene, 1 Kind')}
    ${buildInfoBlock('Apartments', 'Apartment Seeblick')}
    ${buildDivider()}
    ${priceTable}
    <p style="font-size:15px;color:#374151;line-height:1.6;margin:24px 0 0;">
      ${signoff}<br/>
      <strong>${hotelName}</strong>
    </p>
  `;

  const hotelBody = `
    ${buildInfoBlock('Zeitraum', '20.07.2026 — 27.07.2026 (7 Nächte)')}
    ${buildInfoBlock('Gäste', '2 Erwachsene, 1 Kind')}
    ${buildInfoBlock('Apartments', 'Apartment Seeblick')}
    ${buildDivider()}
    ${priceTable}
    ${buildDivider()}
    ${buildInfoBlock('Kontakt', 'Max Mustermann<br/>max@beispiel.at<br/>Österreich')}
  `;

  const title = isBooking ? 'Buchungsbestätigung' : isGuest ? 'Vielen Dank für Ihre Anfrage' : 'Neue Buchungsanfrage';

  const html = buildEmailHtml({
    hotelName,
    accentColor: accent,
    title,
    preheader: subject,
    body: isGuest ? guestBody : hotelBody,
    footer: `<p style="margin:0;font-size:12px;color:#6b7280;">Buchungs-ID: #42 — Vorschau mit Beispieldaten</p>`,
  });

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
