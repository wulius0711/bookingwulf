import { generateVoucherPdf } from '@/src/lib/voucherPdf';
import { verifySession } from '@/src/lib/session';

export async function GET(req: Request) {
  await verifySession(); // Admin only

  const { searchParams } = new URL(req.url);
  const accent = searchParams.get('accent') || '#111827';
  const hotel = searchParams.get('hotel') || 'Musterhotel';
  const type = searchParams.get('type') || 'value';

  const pdf = await generateVoucherPdf({
    hotelName: hotel,
    accentColor: accent,
    templateName: type === 'nights' ? 'Kurzurlaub für zwei' : 'Erlebnis-Gutschein',
    code: 'ABCD-EFGH-1234',
    type,
    value: type === 'nights' ? 2 : 150,
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    recipientName: 'Maria Muster',
    senderName: 'Hans Muster',
    message: 'Alles Gute zum Geburtstag! Genieße deinen Aufenthalt.',
  });

  return new Response(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="gutschein-preview.pdf"',
    },
  });
}
