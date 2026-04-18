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
        select: { id: true, name: true, accentColor: true, plan: true, emailTemplates: true },
      })
    : null;

  const hasPro = !session.hotelId || hasPlanAccess(hotel?.plan ?? 'starter', 'pro');
  const tpl = hasPro ? hotel?.emailTemplates.find(t => t.type === type) : null;
  const hotelName = hotel?.name ?? 'Hotel Beispiel';
  const accent = hotel?.accentColor ?? '#111827';

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
