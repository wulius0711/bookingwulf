import { prisma } from '@/src/lib/prisma';
import { notFound } from 'next/navigation';
import ConfettiEffect from './ConfettiEffect';

export const dynamic = 'force-dynamic';

export default async function VoucherConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ codes?: string; code?: string; lang?: string }>;
}) {
  const { slug } = await params;
  const { codes, code, lang = 'de' } = await searchParams;
  const en = lang === 'en';

  const hotel = await prisma.hotel.findUnique({
    where: { slug },
    select: { name: true, accentColor: true },
  });
  if (!hotel) return notFound();

  // Support both ?codes=A,B,C (new) and ?code=A (legacy)
  const codeList = codes
    ? codes.split(',').map(c => c.trim()).filter(Boolean)
    : code ? [code] : [];

  const vouchers = codeList.length > 0
    ? await prisma.voucher.findMany({
        where: { code: { in: codeList }, hotel: { slug } },
        select: { code: true, expiresAt: true },
      })
    : [];

  const accent = hotel.accentColor || '#111827';
  const fmt = (d: Date) => new Intl.DateTimeFormat(en ? 'en-GB' : 'de-AT', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(d));

  return (
    <>
      <ConfettiEffect />
      <style>{`
        .vc-confirm-wrap {
          display: flex; align-items: center; justify-content: center;
          padding: 24px 16px; min-height: 100vh;
        }
        .vc-confirm-card {
          background: #fff; border-radius: 20px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.09);
          max-width: 480px; width: 100%; padding: 40px 32px; text-align: center;
          font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
        }
        .vc-check { width: 64px; height: 64px; border-radius: 50%; background: var(--vc-accent-glow); display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px; }
        .vc-code-box { background: #f9fafb; border: 2px dashed #d1d5db; border-radius: 14px; padding: 20px; margin: 12px 0; }
      `}</style>
      <div className="vc-confirm-wrap" style={{ '--vc-accent': accent, '--vc-accent-glow': `${accent}18` } as React.CSSProperties}>
        <div className="vc-confirm-card">
          <div className="vc-check">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{hotel.name}</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em', color: '#0f172a', marginBottom: 12 }}>{en ? 'Thank you!' : 'Vielen Dank!'}</h1>
          <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.6 }}>
            {en
              ? vouchers.length > 1 ? `Your ${vouchers.length} vouchers have been purchased successfully.` : 'Your voucher has been purchased successfully.'
              : vouchers.length > 1 ? `Deine ${vouchers.length} Gutscheine wurden erfolgreich gekauft.` : 'Dein Gutschein wurde erfolgreich gekauft.'
            }{' '}
            {en ? 'You will receive a confirmation email shortly.' : 'Du erhältst in Kürze eine Bestätigung per E-Mail.'}
          </p>

          {vouchers.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                {en ? (vouchers.length === 1 ? 'Your voucher code' : 'Your voucher codes') : (vouchers.length === 1 ? 'Dein Gutschein-Code' : 'Deine Gutschein-Codes')}
              </div>
              {vouchers.map(v => (
                <div key={v.code} className="vc-code-box">
                  <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '0.12em', color: '#0f172a', fontFamily: 'monospace' }}>{v.code}</div>
                  <div style={{ marginTop: 8, fontSize: 13, color: '#9ca3af' }}>{en ? 'Valid until' : 'Gültig bis'} {fmt(v.expiresAt)}</div>
                </div>
              ))}
            </div>
          )}

          <a href={`/gutschein/${slug}${en ? '?lang=en' : ''}`} style={{ display: 'inline-block', marginTop: 20, fontSize: 14, color: accent, fontWeight: 600, textDecoration: 'none' }}>
            {en ? 'Buy another voucher →' : 'Weiteren Gutschein kaufen →'}
          </a>
        </div>
      </div>
    </>
  );
}
