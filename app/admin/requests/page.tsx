import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

function getStatusBadge(status: string) {
  switch (status) {
    case 'booked':
      return {
        label: 'Gebucht',
        background: '#e8f5e9',
        color: '#256029',
        border: '#b7dfba',
      };
    case 'answered':
      return {
        label: 'Beantwortet',
        background: '#eaf2ff',
        color: '#2457a6',
        border: '#bfd4fb',
      };
    case 'cancelled':
      return {
        label: 'Storniert',
        background: '#fdecec',
        color: '#a63b3b',
        border: '#f3c3c3',
      };
    default:
      return {
        label: 'Neu',
        background: '#f4f4f4',
        color: '#555',
        border: '#ddd',
      };
  }
}

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

  return (
    <main style={{ padding: 40, fontFamily: 'Arial, sans-serif' }}>
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
                    minWidth: 220,
                    padding: '10px 12px',
                    border: '1px solid #ddd',
                    borderRadius: 10,
                    background: '#fff',
                    fontSize: 14,
                  }}
                >
                  <option value="">Alle Hotels</option>
                  {hotels.map((hotel) => (
                    <option key={hotel.id} value={hotel.slug}>
                      {hotel.name}
                    </option>
                  ))}
                </select>

                <button
                  type="submit"
                  style={{
                    padding: '10px 14px',
                    borderRadius: 999,
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
                      borderRadius: 999,
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
          {hotels.map((hotel) => (
            <div
              key={hotel.id}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 10px',
                borderRadius: 999,
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
                  borderRadius: 999,
                  background: hotel.accentColor || '#bbb',
                  display: 'inline-block',
                }}
              />
              {hotel.name}
            </div>
          ))}
        </div>
      )}

      {requests.length === 0 ? (
        <p>Keine Buchungen vorhanden.</p>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {requests.map((r) => {
            const badge = getStatusBadge(r.status);

            return (
              <Link
                key={r.id}
                href={`/admin/requests/${r.id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div
                  style={{
                    border: '1px solid #ddd',
                    borderRadius: 12,
                    padding: 16,
                    background: '#fff',
                    color: '#111',
                    cursor: 'pointer',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 16,
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      marginBottom: 8,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600 }}>
                        {r.firstname || ''} {r.lastname}
                      </div>

                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 8,
                          marginTop: 4,
                          padding: '4px 10px',
                          borderRadius: 999,
                          background: r.hotel?.accentColor || '#eee',
                          color: '#fafafa',
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 999,
                            background: 'rgba(255,255,255,0.9)',
                            display: 'inline-block',
                          }}
                        />
                        {r.hotel?.name}
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '8px 12px',
                        borderRadius: 999,
                        background: badge.background,
                        color: badge.color,
                        border: `1px solid ${badge.border}`,
                        fontSize: 12,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {badge.label}
                    </div>
                  </div>

                  <div>
                    <strong>ID:</strong> {r.id}
                  </div>

                  <div>
                    <strong>Email:</strong> {r.email}
                  </div>

                  <div>
                    <strong>Zeitraum:</strong>{' '}
                    {new Date(r.arrival).toLocaleDateString()} –{' '}
                    {new Date(r.departure).toLocaleDateString()}
                  </div>

                  <div>
                    <strong>Nächte:</strong> {r.nights}
                  </div>

                  <div>
                    <strong>Gäste:</strong> {r.adults} Erwachsene
                    {r.children ? `, ${r.children} Kinder` : ''}
                  </div>

                  {r.message && (
                    <div style={{ marginTop: 10 }}>
                      <strong>Mitteilung:</strong>
                      <div style={{ marginTop: 4 }}>{r.message}</div>
                    </div>
                  )}

                  <div style={{ marginTop: 10, fontSize: 12, color: '#666' }}>
                    {new Date(r.createdAt).toLocaleString()}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
