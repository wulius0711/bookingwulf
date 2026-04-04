import { prisma } from '@/src/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function deleteSeason(formData: FormData) {
  'use server';

  const id = Number(formData.get('id'));
  if (!id) return;

  await prisma.priceSeason.delete({
    where: { id },
  });
}

export default async function PriceSeasonsPage() {
  const seasons = await prisma.priceSeason.findMany({
    include: {
      apartment: true,
    },
    orderBy: {
      startDate: 'asc',
    },
  });

  return (
    <main style={{ padding: 40, fontFamily: 'Arial' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h1>Preiszeiträume</h1>

        <Link href="/admin/price-seasons/new">
          <button
            style={{
              padding: '10px 16px',
              background: '#111',
              color: '#fff',
              border: 'none',
              borderRadius: 999,
              cursor: 'pointer',
            }}
          >
            Neu anlegen
          </button>
        </Link>
      </div>

      {seasons.length === 0 ? (
        <p>Keine Preiszeiträume vorhanden.</p>
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
                    borderRadius: 999,
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
