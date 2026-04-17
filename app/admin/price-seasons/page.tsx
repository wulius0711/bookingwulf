import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function deleteSeason(formData: FormData) {
  'use server';

  const session = await verifySession();
  const id = Number(formData.get('id'));
  if (!id) return;

  if (session.hotelId !== null) {
    const season = await prisma.priceSeason.findUnique({
      where: { id },
      include: { apartment: { select: { hotelId: true } } },
    });
    if (!season || season.apartment?.hotelId !== session.hotelId) return;
  }

  await prisma.priceSeason.delete({ where: { id } });
}

export default async function PriceSeasonsPage() {
  const session = await verifySession();

  const seasons = await prisma.priceSeason.findMany({
    where: session.hotelId !== null
      ? { apartment: { hotelId: session.hotelId } }
      : undefined,
    include: { apartment: true },
    orderBy: { startDate: 'asc' },
  });

  return (
    <main style={{ padding: 40, fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h1>Preiszeiträume</h1>

        {seasons.length > 0 && (
          <Link href="/admin/price-seasons/new">
            <button
              style={{
                padding: '10px 16px',
                background: '#111',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
              }}
            >
              Neu anlegen
            </button>
          </Link>
        )}
      </div>

      {seasons.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <p style={{ fontSize: 15, color: '#6b7280', marginBottom: 16 }}>Keine Preiszeiträume vorhanden.</p>
          <a href="/admin/price-seasons/new" style={{ padding: '10px 20px', borderRadius: 8, background: '#111', color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
            Neue Preissaison anlegen
          </a>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 16, marginTop: 20 }}>
          {seasons.map((s) => (
            <div
              key={s.id}
              style={{
                border: '1px solid #ddd',
                padding: 16,
                borderRadius: 12,
                background: '#fff',
              }}
            >
              <strong>{s.apartment?.name}</strong>
              <br />
              {new Date(s.startDate).toLocaleDateString('de-AT')} –{' '}
              {new Date(s.endDate).toLocaleDateString('de-AT')}
              <br />
              Preis: € {s.pricePerNight}
              <br />
              <form action={deleteSeason} style={{ marginTop: 10 }}>
                <input type="hidden" name="id" value={s.id} />
                <button
                  type="submit"
                  style={{
                    padding: '6px 12px',
                    border: '1px solid red',
                    background: '#fff',
                    color: 'red',
                    borderRadius: 8,
                    cursor: 'pointer',
                  }}
                >
                  Löschen
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
