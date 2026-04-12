import { prisma } from '@/src/lib/prisma';
import Link from 'next/link';
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

  if (!id || !status) return;

  const allowed = ['new', 'answered', 'booked', 'cancelled'];
  if (!allowed.includes(status)) return;

  await prisma.request.update({
    where: { id },
    data: { status },
  });

  redirect(`/admin/requests/${id}`);
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'booked':
      return {
        label: 'Gebucht',
        bg: '#e8f5e9',
        color: '#256029',
        border: '#b7dfba',
      };
    case 'answered':
      return {
        label: 'Beantwortet',
        bg: '#eaf2ff',
        color: '#2457a6',
        border: '#bfd4fb',
      };
    case 'cancelled':
      return {
        label: 'Storniert',
        bg: '#fdecec',
        color: '#a63b3b',
        border: '#f3c3c3',
      };
    default:
      return {
        label: 'Neu',
        bg: '#f4f4f4',
        color: '#555',
        border: '#ddd',
      };
  }
}

export default async function BookingDetailPage({ params }: PageProps) {
  const { id } = await params;
  const requestId = parseInt(id, 10);

  if (!Number.isInteger(requestId)) notFound();

  const request = await prisma.request.findUnique({
    where: { id: requestId },
    include: {
      hotel: {
        select: {
          name: true,
          accentColor: true,
        },
      },
    },
  });

  if (!request) notFound();

  const apartmentIds = parseApartmentIds(request.selectedApartmentIds);

  const apartments =
    apartmentIds.length > 0
      ? await prisma.apartment.findMany({
          where: { id: { in: apartmentIds } },
          select: { id: true, name: true },
        })
      : [];

  const apartmentNames = apartmentIds
    .map(
      (id) => apartments.find((a) => a.id === id)?.name || `Apartment #${id}`,
    )
    .join(', ');

  const badge = getStatusBadge(request.status);

  return (
    <main
      style={{
        padding: 40,
        fontFamily: 'Arial, sans-serif',
        maxWidth: 900,
      }}
    >
      {/* 🔙 Back */}
      <Link
        href="/admin/requests"
        style={{
          display: 'inline-block',
          marginBottom: 20,
          padding: '8px 14px',
          borderRadius: 999,
          border: '1px solid #ccc',
          textDecoration: 'none',
          color: '#111',
          background: '#fff',
        }}
      >
        ← Zurück zur Übersicht
      </Link>

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
        {/* 🔥 HEADER ROW */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          {/* Name */}
          <div>
            <strong>Name:</strong> {request.firstname || ''} {request.lastname}
          </div>

          {/* Hotel Badge */}
          <div
            style={{
              padding: '6px 12px',
              borderRadius: 999,
              background: request.hotel?.accentColor || '#f5f5f5',
              fontSize: 12,
              fontWeight: 600,
              color: '#fafafa',
            }}
          >
            {request.hotel?.name || '—'}
          </div>

          {/* Status Badge */}
          <div
            style={{
              padding: '8px 12px',
              borderRadius: 999,
              background: badge.bg,
              color: badge.color,
              border: `1px solid ${badge.border}`,
              fontSize: 12,
              fontWeight: 700,
              textTransform: 'uppercase',
            }}
          >
            {badge.label}
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
            <div style={{ marginTop: 6 }}>{request.message}</div>
          </div>
        )}

        {/* 🔘 Status Buttons */}
        <div>
          <strong>Status ändern:</strong>

          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            {[
              { value: 'new', label: 'Neu' },
              { value: 'answered', label: 'Beantwortet' },
              { value: 'booked', label: 'Gebucht' },
              { value: 'cancelled', label: 'Storniert' },
            ].map((s) => {
              const active = request.status === s.value;

              return (
                <form key={s.value} action={updateBookingStatus}>
                  <input type="hidden" name="id" value={request.id} />
                  <input type="hidden" name="status" value={s.value} />

                  <button
                    type="submit"
                    disabled={active}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 999,
                      border: active ? '1px solid #111' : '1px solid #ccc',
                      background: active ? '#111' : '#fff',
                      color: active ? '#fff' : '#111',
                      cursor: active ? 'default' : 'pointer',
                    }}
                  >
                    {s.label}
                  </button>
                </form>
              );
            })}
          </div>
        </div>

        <div style={{ fontSize: 12, color: '#666' }}>
          Erstellt: {new Date(request.createdAt).toLocaleString()}
        </div>
      </div>
    </main>
  );
}
