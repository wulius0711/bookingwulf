import { prisma } from '@/src/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function RequestsPage() {
  const requests = await prisma.request.findMany({
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
          {requests.map((r) => (
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
                <div style={{ fontWeight: 600, marginBottom: 8 }}>
                  {r.firstname || ''} {r.lastname}
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

                <div>
                  <strong>Status:</strong> {r.status}
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
          ))}
        </div>
      )}
    </main>
  );
}
