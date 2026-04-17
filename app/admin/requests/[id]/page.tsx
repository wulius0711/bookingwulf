import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import { getResend, getFromEmail, buildEmailHtml, buildDivider, buildInfoBlock } from '@/src/lib/email';
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

const STATUS_MESSAGES: Record<string, { subject: string; title: string; message: string }> = {
  booked: {
    subject: 'Ihre Buchung wurde bestätigt',
    title: 'Buchung bestätigt',
    message: 'Ihre Buchungsanfrage wurde bestätigt. Wir freuen uns auf Ihren Besuch und melden uns in Kürze mit den weiteren Details.',
  },
  cancelled: {
    subject: 'Ihre Buchung wurde storniert',
    title: 'Buchung storniert',
    message: 'Ihre Buchungsanfrage wurde leider storniert. Bei Fragen stehen wir Ihnen gerne zur Verfügung.',
  },
  answered: {
    subject: 'Update zu Ihrer Buchungsanfrage',
    title: 'Anfrage bearbeitet',
    message: 'Wir haben Ihre Buchungsanfrage bearbeitet. Bei Fragen stehen wir Ihnen gerne zur Verfügung.',
  },
};

async function updateBookingStatus(formData: FormData) {
  'use server';

  const session = await verifySession();
  const id = Number(formData.get('id'));
  const status = String(formData.get('status') || '').trim();

  if (!id || !status) return;

  const allowed = ['new', 'answered', 'booked', 'cancelled'];
  if (!allowed.includes(status)) return;

  const request = await prisma.request.findUnique({
    where: { id },
    include: { hotel: { select: { id: true, name: true, accentColor: true } } },
  });
  if (!request) return;
  if (session.hotelId !== null && request.hotelId !== session.hotelId) return;

  await prisma.request.update({ where: { id }, data: { status } });

  // Send status notification email to guest
  const statusMsg = STATUS_MESSAGES[status];
  if (statusMsg && request.email) {
    try {
      const resend = getResend();
      if (resend) {
        const arrivalDate = new Intl.DateTimeFormat('de-AT', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(request.arrival);
        const departureDate = new Intl.DateTimeFormat('de-AT', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(request.departure);

        await resend.emails.send({
          from: getFromEmail(),
          to: request.email,
          subject: `${statusMsg.subject} — ${request.hotel?.name || 'Hotel'}`,
          html: buildEmailHtml({
            hotelName: request.hotel?.name || 'Hotel',
            accentColor: request.hotel?.accentColor || undefined,
            title: statusMsg.title,
            body: `
              <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 20px;">
                ${request.firstname ? `Hallo ${request.firstname},` : 'Hallo,'}<br/><br/>
                ${statusMsg.message}
              </p>
              ${buildDivider()}
              ${buildInfoBlock('Zeitraum', `${arrivalDate} — ${departureDate} (${request.nights} Nächte)`)}
              ${buildInfoBlock('Gäste', `${request.adults} Erwachsene${request.children ? `, ${request.children} Kinder` : ''}`)}
              <p style="font-size:15px;color:#374151;line-height:1.6;margin:24px 0 0;">
                Mit freundlichen Grüßen<br/>
                <strong>${request.hotel?.name || 'Hotel'}</strong>
              </p>
            `,
            footer: `<p style="margin:0;font-size:12px;color:#6b7280;">Buchungs-ID: #${request.id}</p>`,
          }),
        });
      }
    } catch (e) {
      console.error('Status mail error:', e);
    }
  }

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
  const session = await verifySession();
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
  if (session.hotelId !== null && request.hotelId !== session.hotelId) notFound();

  const settings = request.hotelId
    ? await prisma.hotelSettings.findFirst({
        where: { hotelId: request.hotelId },
      })
    : null;

  const cardRadius: number = settings?.cardRadius ?? 12;
  const buttonRadius: number = settings?.buttonRadius ?? 999;

  const cardBackground = '#fff';
  const isSuperAdmin = session.hotelId === null;
  const textColor = settings?.textColor || '#111';
  const borderColor = settings?.borderColor || '#ddd';

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
        fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
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
          borderRadius: buttonRadius,
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
          border: `1px solid ${borderColor}`,
          borderRadius: cardRadius,
          padding: 24,
          background: cardBackground,
          color: textColor,
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
          {isSuperAdmin && (
            <div
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                background: request.hotel?.accentColor || '#f5f5f5',
                fontSize: 12,
                fontWeight: 600,
                color: '#fafafa',
              }}
            >
              {request.hotel?.name || '—'}
            </div>
          )}

          {/* Status Badge */}
          <div
            style={{
              padding: '8px 12px',
              borderRadius: 8,
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
                      borderRadius: 8,
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
