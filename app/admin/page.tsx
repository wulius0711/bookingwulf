import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const session = await verifySession();

  const requests = await prisma.request.findMany({
    where: session.hotelId !== null ? { hotelId: session.hotelId } : undefined,
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <main style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ marginBottom: '24px' }}>Anfragen</h1>

      {requests.length === 0 ? (
        <p>Noch keine Anfragen vorhanden.</p>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {requests.map((request) => (
            <div
              key={request.id}
              style={{
                border: '1px solid #ddd',
                borderRadius: '12px',
                padding: '20px',
                background: '#fff',
                color: '#111',
              }}
            >
              <div style={{ marginBottom: '10px', fontWeight: 700 }}>
                Anfrage #{request.id}
              </div>

              <div>
                <strong>Name:</strong> {request.salutation} {request.lastname}
              </div>
              <div>
                <strong>E-Mail:</strong> {request.email}
              </div>
              <div>
                <strong>Land:</strong> {request.country}
              </div>
              <div>
                <strong>Apartment:</strong> {request.selectedApartmentIds}
              </div>
              <div>
                <strong>Anreise:</strong>{' '}
                {new Date(request.arrival).toLocaleDateString('de-AT')}
              </div>
              <div>
                <strong>Abreise:</strong>{' '}
                {new Date(request.departure).toLocaleDateString('de-AT')}
              </div>
              <div>
                <strong>Nächte:</strong> {request.nights}
              </div>
              <div>
                <strong>Erwachsene:</strong> {request.adults}
              </div>
              <div>
                <strong>Kinder:</strong> {request.children}
              </div>
              <div>
                <strong>Status:</strong> {request.status}
              </div>
              <div>
                <strong>Newsletter:</strong>{' '}
                {request.newsletter ? 'Ja' : 'Nein'}
              </div>
              <div>
                <strong>Gesendet am:</strong>{' '}
                {new Date(request.createdAt).toLocaleString('de-AT')}
              </div>

              {request.message && (
                <div style={{ marginTop: '12px' }}>
                  <strong>Nachricht:</strong>
                  <div style={{ marginTop: '6px', whiteSpace: 'pre-wrap' }}>
                    {request.message}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
