import { prisma } from '@/src/lib/prisma';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function VoucherConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ code?: string }>;
}) {
  const { slug } = await params;
  const { code } = await searchParams;

  const hotel = await prisma.hotel.findUnique({
    where: { slug },
    select: { name: true, accentColor: true },
  });
  if (!hotel) return notFound();

  const voucher = code
    ? await prisma.voucher.findFirst({
        where: { code, hotel: { slug } },
        select: { code: true, status: true, expiresAt: true, senderName: true, recipientName: true },
      })
    : null;

  const accent = hotel.accentColor || '#111827';
  const expires = voucher
    ? new Intl.DateTimeFormat('de-AT', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(voucher.expiresAt))
    : null;

  return (
    <html lang="de">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Gutschein bestätigt — {hotel.name}</title>
        <style>{`
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: ui-sans-serif, system-ui, -apple-system, sans-serif; background: #f0f2f5; color: #111827; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px 16px; }
          .card { background: #fff; border-radius: 20px; box-shadow: 0 4px 24px rgba(0,0,0,0.09); max-width: 480px; width: 100%; padding: 40px 32px; text-align: center; }
          .check { width: 64px; height: 64px; border-radius: 50%; background: ${accent}18; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px; }
          .code-box { background: #f9fafb; border: 2px dashed #d1d5db; border-radius: 14px; padding: 20px; margin: 24px 0; }
        `}</style>
      </head>
      <body>
        <div className="card">
          <div className="check">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{hotel.name}</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em', color: '#0f172a', marginBottom: 12 }}>Vielen Dank!</h1>
          <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.6 }}>
            Ihr Gutschein wurde erfolgreich gekauft. Sie erhalten in Kürze eine Bestätigung per E-Mail.
          </p>

          {voucher && (
            <div className="code-box">
              <div style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Ihr Gutschein-Code</div>
              <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '0.12em', color: '#0f172a', fontFamily: 'monospace' }}>{voucher.code}</div>
              {expires && <div style={{ marginTop: 8, fontSize: 13, color: '#9ca3af' }}>Gültig bis {expires}</div>}
            </div>
          )}

          <a
            href={`/gutschein/${slug}`}
            style={{ display: 'inline-block', marginTop: 8, fontSize: 14, color: accent, fontWeight: 600, textDecoration: 'none' }}
          >
            Weiteren Gutschein kaufen →
          </a>
        </div>
      </body>
    </html>
  );
}
