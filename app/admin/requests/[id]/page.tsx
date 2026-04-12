import { prisma } from '@/src/lib/prisma';
import { notFound } from 'next/navigation';

type PageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = 'force-dynamic';

function parseApartmentIds(raw: string): number[] {
  return raw
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => Number(item))
    .filter((item) => Number.isInteger(item) && item > 0);
}

export default async function BookingDetailPage({ params }: PageProps) {
  const { id } = await params;
  const requestId = parseInt(id, 10);

  if (!Number.isInteger(requestId)) {
    notFound();
  }

  const request = await prisma.request.findUnique({
    where: { id: requestId },
  });

  if (!request) {
    notFound();
  }

  const apartmentIds = parseApartmentIds(request.selectedApartmentIds);

  const apartments =
    apartmentIds.length > 0
      ? await prisma.apartment.findMany({
          where: {
            id: { in: apartmentIds },
          },
          select: {
            id: true,
            name: true,
          },
        })
      : [];

  const apartmentNames = apartmentIds
    .map(
      (id) =>
        apartments.find((apartment) => apartment.id === id)?.name ||
        `Apartment #${id}`,
    )
    .join(', ');

  return (
    <main
      style={{
        padding: 40,
        fontFamily: 'Arial, sans-serif',
        maxWidth: 800,
      }}
    >
      <h1 style={{ marginBottom: 24 }}>Buchung #{request.id}</h1>

      <div
        style={{
          display: 'grid',
          gap: 12,
          border: '1px solid #ddd',
          borderRadius: 12,
          padding: 24,
          background: '#fff',
        }}
      >
        <div>
          <strong>Name:</strong> {request.firstname || ''} {request.lastname}
        </div>

        <div>
          <strong>Email:</strong> {request.email}
        </div>

        <div>
          <strong>Land:</strong> {request.country}
        </div>

        <div>
          <strong>Zeitraum:</strong>{' '}
          {new Date(request.arrival).toLocaleDateString()} –{' '}
          {new Date(request.departure).toLocaleDateString()}
        </div>

        <div>
          <strong>Nächte:</strong> {request.nights}
        </div>

        <div>
          <strong>Gäste:</strong> {request.adults} Erwachsene
          {request.children ? `, ${request.children} Kinder` : ''}
        </div>

        <div>
          <strong>Status:</strong> {request.status}
        </div>

        <div>
          <strong>Apartments:</strong> {apartmentNames || '—'}
        </div>

        {request.message && (
          <div>
            <strong>Mitteilung:</strong>
            <div style={{ marginTop: 6 }}>{request.message}</div>
          </div>
        )}

        <div
          style={{
            marginTop: 12,
            fontSize: 12,
            color: '#666',
          }}
        >
          Erstellt: {new Date(request.createdAt).toLocaleString()}
        </div>
      </div>
    </main>
  );
}
