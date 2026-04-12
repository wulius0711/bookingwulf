import { prisma } from '@/src/lib/prisma';
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

export default async function RequestsPage() {
  const requests = await prisma.request.findMany({
    include: {
      hotel: {
        select: {
          name: true,
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
      <h1 style={{ marginBottom: 24 }}>Buchungen</h1>

      {requests.length === 0 ? (
        <p>Noch keine Buchungen vorhanden.</p>
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
                    <div style={{ fontWeight: 600 }}>
                      {r.firstname || ''} {r.lastname}
                    </div>

                    <div
                      style={{
                        display: 'inline-block',
                        marginTop: 4,
                        padding: '4px 10px',
                        borderRadius: 999,
                        background: r.hotel?.accentColor || '#eee',
                        color: '#fafafa',
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    >
                      {r.hotel?.name}
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
