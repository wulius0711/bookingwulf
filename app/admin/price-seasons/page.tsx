import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import { writeAuditLog } from '@/src/lib/audit';
import Link from 'next/link';
import PriceSeasonList from './PriceSeasonList';

export const dynamic = 'force-dynamic';

type PageProps = { searchParams: Promise<{ hotel?: string }> };

async function deleteSeason(formData: FormData) {
  'use server';

  const session = await verifySession();
  const id = Number(formData.get('id'));
  if (!id) return;

  const season = await prisma.priceSeason.findUnique({
    where: { id },
    include: { apartment: { select: { hotelId: true, name: true } } },
  });
  if (!season) return;
  if (session.hotelId !== null && season.apartment?.hotelId !== session.hotelId) return;

  await prisma.priceSeason.delete({ where: { id } });

  if (season.apartment) {
    await writeAuditLog(season.apartment.hotelId, {
      price_season_deleted: `${season.name || 'Saison'} | ${season.apartment.name} | ${season.startDate.toISOString().slice(0, 10)}–${season.endDate.toISOString().slice(0, 10)} | €${season.pricePerNight}/Nacht`,
    }, {
      price_season_deleted: null,
    });
  }
}

export default async function PriceSeasonsPage({ searchParams }: PageProps) {
  const session = await verifySession();
  const { hotel } = await searchParams;

  const isSuperAdmin = session.hotelId === null;

  const hotels = isSuperAdmin
    ? await prisma.hotel.findMany({ where: { isActive: true }, orderBy: { name: 'asc' }, select: { id: true, name: true } })
    : [];

  const selectedHotelId = isSuperAdmin
    ? (hotel && !Number.isNaN(Number(hotel)) ? Number(hotel) : null)
    : session.hotelId;

  const seasons = await prisma.priceSeason.findMany({
    where: selectedHotelId !== null
      ? { apartment: { hotelId: selectedHotelId } }
      : undefined,
    include: { apartment: { include: { hotel: { select: { name: true, settings: { select: { accentColor: true } } } } } } },
    orderBy: { startDate: 'asc' },
  });

  return (
    <main className="admin-page" style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ margin: 0 }}>Preiszeiträume</h1>

        <Link href="/admin/price-seasons/new">
          <button style={{ padding: '10px 16px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
            Neu anlegen
          </button>
        </Link>
      </div>

      {isSuperAdmin && (
        <form method="GET" style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#4b5563', letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
            Hotel
          </label>
          <select
            name="hotel"
            defaultValue={selectedHotelId !== null ? String(selectedHotelId) : ''}
            style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, background: '#fff', color: '#111', minWidth: 200 }}
          >
            <option value="">Alle Hotels</option>
            {hotels.map((h) => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>
          <button type="submit" style={{ padding: '8px 14px', border: '1px solid #d1d5db', background: '#fff', color: '#111', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            Filtern
          </button>
          {selectedHotelId !== null && (
            <a href="/admin/price-seasons" style={{ fontSize: 13, color: '#6b7280', textDecoration: 'none' }}>
              Zurücksetzen
            </a>
          )}
        </form>
      )}

      {seasons.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', marginTop: 20 }}>
          <p style={{ fontSize: 15, color: '#6b7280', marginBottom: 16 }}>Keine Preiszeiträume vorhanden.</p>
          <a href="/admin/price-seasons/new" style={{ padding: '10px 20px', borderRadius: 8, background: 'var(--accent)', color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
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
