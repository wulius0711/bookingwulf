import { prisma } from '@/src/lib/prisma';
import { notFound, redirect } from 'next/navigation';

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

async function updateBookingStatus(formData: FormData) {
  'use server';

  const id = Number(formData.get('id'));
  const status = String(formData.get('status') || '').trim();

  if (!id || !status) {
    return;
  }

  const allowedStatuses = ['new', 'answered', 'booked', 'cancelled'];

  if (!allowedStatuses.includes(status)) {
    return;
  }

  await prisma.request.update({
    where: { id },
    data: { status },
  });

  redirect(`/admin/requests/${id}`);
}

function getStatusBadgeColor(status: string) {
  switch (status) {
    case 'booked':
      return {
        background: '#e8f5e9',
        color: '#256029',
        border: '#b7dfba',
      };
    case 'answered':
      return {
        background: '#eaf2ff',
        color: '#2457a6',
        border: '#bfd4fb',
      };
    case 'cancelled':
      return {
        background: '#fdecec',
        color: '#a63b3b',
        border: '#f3c3c3',
      };
    default:
      return {
        background: '#f4f4f4',
        color: '#555',
        border: '#ddd',
      };
  }
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

  const badge = getStatusBadgeColor(request.status);

  return (
    <main
      style={{
        padding: 40,
        fontFamily: 'Arial, sans-serif',
        maxWidth: 860,
      }}
    >
      <h1 style={{ marginBottom: 24 }}>Buchung #{request.id}</h1>

      <div
        style={{
          display: 'grid',
          gap: 18,
          border: '1px solid #ddd',
          borderRadius: 12,
          padding: 24,
          background: '#fff',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 16,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <strong>Name:</strong> {request.firstname || ''} {request.lastname}
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
              fontSize: 13,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            {request.status}
          </div>
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
          <strong>Apartments:</strong> {apartmentNames || '—'}
        </div>

        {request.message && (
          <div>
            <strong>Mitteilung:</strong>
            <div style={{ marginTop: 6, lineHeight: 1.5 }}>
              {request.message}
            </div>
          </div>
        )}

        <div>
          <strong>Status ändern:</strong>
          <div
            style={{
              display: 'flex',
              gap: 10,
              flexWrap: 'wrap',
              marginTop: 10,
            }}
          >
            {[
              { value: 'new', label: 'Neu' },
              { value: 'answered', label: 'Beantwortet' },
              { value: 'booked', label: 'Gebucht' },
              { value: 'cancelled', label: 'Storniert' },
            ].map((item) => {
              const isActive = request.status === item.value;

              return (
                <form action={updateBookingStatus} key={item.value}>
                  <input type="hidden" name="id" value={request.id} />
                  <input type="hidden" name="status" value={item.value} />
                  <button
                    type="submit"
                    disabled={isActive}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 999,
                      border: isActive ? '1px solid #111' : '1px solid #ccc',
                      background: isActive ? '#111' : '#fff',
                      color: isActive ? '#fff' : '#111',
                      cursor: isActive ? 'default' : 'pointer',
                      opacity: isActive ? 0.9 : 1,
                    }}
                  >
                    {item.label}
                  </button>
                </form>
              );
            })}
          </div>
        </div>

        <div
          style={{
            marginTop: 8,
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
