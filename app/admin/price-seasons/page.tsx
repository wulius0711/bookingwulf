import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import Link from 'next/link';
import PriceSeasonList from './PriceSeasonList';

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

  const isSuperAdmin = session.hotelId === null;

  const seasons = await prisma.priceSeason.findMany({
    where: session.hotelId !== null
      ? { apartment: { hotelId: session.hotelId } }
      : undefined,
    include: { apartment: { include: { hotel: { select: { name: true } } } } },
    orderBy: { startDate: 'asc' },
  });

  return (
    <main className="admin-page" style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Preiszeiträume</h1>

        {seasons.length > 0 && (
          <Link href="/admin/price-seasons/new">
            <button style={{ padding: '10px 16px', background: '#111', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
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
        <div style={{ marginTop: 20 }}>
          <PriceSeasonList seasons={seasons} deleteSeason={deleteSeason} isSuperAdmin={isSuperAdmin} />
        </div>
      )}
    </main>
  );
}
