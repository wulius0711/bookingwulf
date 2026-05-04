import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import Link from 'next/link';
import BlockedDateList from './BlockedDateList';

export const dynamic = 'force-dynamic';

type PageProps = { searchParams: Promise<{ hotel?: string }> };

async function deleteBlockedDate(formData: FormData) {
  'use server';

  const session = await verifySession();
  const id = Number(formData.get('id'));
  if (!id) return;

  if (session.hotelId !== null) {
    const range = await prisma.blockedRange.findUnique({
      where: { id },
      include: { apartment: { select: { hotelId: true } } },
    });
    if (!range || range.apartment?.hotelId !== session.hotelId) return;
  }

  await prisma.blockedRange.delete({ where: { id } });
}

export default async function BlockedDatesPage({ searchParams }: PageProps) {
  const session = await verifySession();
  const { hotel } = await searchParams;

  const isSuperAdmin = session.hotelId === null;

  const hotels = isSuperAdmin
    ? await prisma.hotel.findMany({ where: { isActive: true }, orderBy: { name: 'asc' }, select: { id: true, name: true } })
    : [];

  const selectedHotelId = isSuperAdmin
    ? (hotel && !Number.isNaN(Number(hotel)) ? Number(hotel) : null)
    : session.hotelId;

  const ranges = await prisma.blockedRange.findMany({
    where: selectedHotelId !== null
      ? { apartment: { hotelId: selectedHotelId } }
      : undefined,
    include: { apartment: { include: { hotel: { select: { name: true, settings: { select: { accentColor: true } } } } } } },
    orderBy: { startDate: 'asc' },
  });

  return (
    <main className="admin-page" style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif', background: 'var(--page-bg)', minHeight: '100vh' }}>
      <div style={{ maxWidth: 960, margin: '0 auto', display: 'grid', gap: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 32, letterSpacing: '-0.03em', color: '#0f172a' }}>Sperrzeiten</h1>
            <p style={{ margin: '6px 0 0', fontSize: 14, color: '#667085' }}>Zeiträume für Apartments sperren.</p>
          </div>
          <Link href="/admin/blocked-dates/new">
            <button style={{ padding: '10px 16px', border: 'none', background: 'var(--accent)', color: '#fff', cursor: 'pointer', borderRadius: 8, fontSize: 14, fontWeight: 600 }}>
              Neu anlegen
            </button>
          </Link>
        </div>

        {isSuperAdmin && (
          <form method="GET" style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#4b5563', letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
              Hotel
            </label>
            <select
              name="hotel"
              defaultValue={selectedHotelId !== null ? String(selectedHotelId) : ''}
              style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, background: '#fff', color: '#111' }}
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
              <a href="/admin/blocked-dates" style={{ fontSize: 13, color: '#6b7280', textDecoration: 'none' }}>
                Zurücksetzen
              </a>
            )}
          </form>
        )}

        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ background: '#fafafa', padding: '14px 20px', borderBottom: '1px solid #f3f4f6' }}>
            <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#111827' }}>
              {ranges.length} {ranges.length === 1 ? 'Sperrzeit' : 'Sperrzeiten'}
            </h2>
          </div>
          {ranges.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <p style={{ fontSize: 15, color: '#6b7280', marginBottom: 16 }}>Noch keine Sperrzeiten vorhanden.</p>
              <a href="/admin/blocked-dates/new" style={{ padding: '10px 20px', borderRadius: 8, background: 'var(--accent)', color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
                Neue Sperrzeit anlegen
              </a>
            </div>
          ) : (
            <div style={{ padding: '16px 20px', background: '#f9fafb' }}>
              <BlockedDateList ranges={ranges} deleteBlockedDate={deleteBlockedDate} isSuperAdmin={isSuperAdmin} />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
