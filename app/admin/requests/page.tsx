import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import Link from 'next/link';
import { DeleteAllRequestsButton } from './DeleteButtons';
import RequestList from './RequestList';

export const dynamic = 'force-dynamic';

type SearchParams = Promise<{
  hotel?: string;
}>;

type PageProps = {
  searchParams: SearchParams;
};

export default async function RequestsPage({ searchParams }: PageProps) {
  const session = await verifySession();
  const isSuperAdmin = session.hotelId === null;

  const { hotel } = await searchParams;
  const selectedHotelSlug = isSuperAdmin ? (hotel?.trim() || '') : '';

  const hotels = isSuperAdmin
    ? await prisma.hotel.findMany({
        where: { isActive: true },
        select: { id: true, name: true, slug: true, accentColor: true },
        orderBy: { name: 'asc' },
      })
    : await prisma.hotel.findMany({
        where: { id: session.hotelId!, isActive: true },
        select: { id: true, name: true, slug: true, accentColor: true },
      });

  const requests = await prisma.request.findMany({
    where: {
      ...(session.hotelId !== null ? { hotelId: session.hotelId } : {}),
      ...(isSuperAdmin && selectedHotelSlug ? { hotel: { slug: selectedHotelSlug } } : {}),
    },
    include: {
      hotel: {
        select: {
          name: true,
          slug: true,
          accentColor: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Collect unique hotelIds from requests so we can look up apartment names
  function isNumber(value: number | null): value is number {
    return value !== null;
  }
  const hotelIds = [...new Set(requests.map((r) => r.hotelId).filter(isNumber))];

  const apartments =
    hotelIds.length > 0
      ? await prisma.apartment.findMany({
          where: { hotelId: { in: hotelIds } },
          select: { id: true, name: true },
        })
      : [];

  return (
    <main className="admin-page" style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'end',
          gap: 20,
          flexWrap: 'wrap',
          marginBottom: 24,
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>Buchungen</h1>
          <div style={{ marginTop: 8, fontSize: 13, color: '#666' }}>
            {!isSuperAdmin
              ? hotels[0]?.name || ''
              : selectedHotelSlug
              ? `Gefiltert nach Hotel: ${hotels.find((h) => h.slug === selectedHotelSlug)?.name || selectedHotelSlug}`
              : 'Alle Hotels'}
          </div>
        </div>
        {isSuperAdmin && requests.length > 0 && (
          <DeleteAllRequestsButton hotelSlug={selectedHotelSlug} count={requests.length} />
        )}

        {isSuperAdmin && (
          <form method="GET">
            <label
              style={{
                display: 'grid',
                gap: 8,
                fontSize: 13,
                color: '#666',
              }}
            >
              Hotel filtern
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <select
                  name="hotel"
                  defaultValue={selectedHotelSlug}
                  style={{
                    minWidth: 0,
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: 10,
                    background: '#fff',
                    fontSize: 14,
                    color: '#111',
                  }}
                >
                  <option value="">Alle Hotels</option>
                  {hotels.map((h) => (
                    <option key={h.id} value={h.slug}>
                      {h.name}
                    </option>
                  ))}
                </select>

                <button
                  type="submit"
                  style={{
                    padding: '10px 14px',
                    borderRadius: 8,
                    border: '1px solid #fff',
                    background: '#111',
                    color: '#fff',
                    cursor: 'pointer',
                  }}
                >
                  Anwenden
                </button>

                {selectedHotelSlug ? (
                  <Link
                    href="/admin/requests"
                    style={{
                      padding: '10px 14px',
                      borderRadius: 8,
                      border: '1px solid #ccc',
                      background: '#fff',
                      color: '#111',
                      textDecoration: 'none',
                    }}
                  >
                    Reset
                  </Link>
                ) : null}
              </div>
            </label>
          </form>
        )}
      </div>

      {isSuperAdmin && hotels.length > 0 && (
        <div
          style={{
            display: 'flex',
            gap: 10,
            flexWrap: 'wrap',
            marginBottom: 20,
          }}
        >
          {hotels.map((h) => (
            <div
              key={h.id}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 10px',
                borderRadius: 8,
                border: '1px solid #eee',
                background: '#fff',
                fontSize: 12,
                color: '#444',
              }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 8,
                  background: h.accentColor || '#bbb',
                  display: 'inline-block',
                }}
              />
              {h.name}
            </div>
          ))}
        </div>
      )}

      {requests.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <p style={{ fontSize: 15, color: '#6b7280', marginBottom: 16 }}>Keine Buchungen vorhanden.</p>
          <p style={{ fontSize: 13, color: '#9ca3af' }}>
            Sobald Gäste eine Anfrage über das Widget senden, erscheint sie hier.
          </p>
        </div>
      ) : (
        <RequestList requests={requests} apartments={apartments} isSuperAdmin={isSuperAdmin} />
      )}
    </main>
  );
}
