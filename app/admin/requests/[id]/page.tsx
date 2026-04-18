import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import { getResend, getFromEmail, buildEmailHtml, buildDivider, buildInfoBlock } from '@/src/lib/email';
import { bookingIcalUrl, generateBookingToken } from '@/src/lib/booking-token';
import { hasPlanAccess, FEATURE_PLAN_GATES } from '@/src/lib/plan-gates';
import { PlanKey } from '@/src/lib/plans';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import StatusButtons from './StatusButtons';

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

        const icalUrl = status === 'booked' ? bookingIcalUrl(request.id, request.createdAt) : null;

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
              ${icalUrl ? `
              <div style="margin-top:24px;">
                <a href="${icalUrl}"
                   style="display:inline-block;padding:11px 22px;background:#111827;color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;">
                  📅 Zum Kalender hinzufügen (.ics)
                </a>
              </div>` : ''}
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

async function sendAdminMessage(formData: FormData) {
  'use server';

  const session = await verifySession();
  const id = Number(formData.get('requestId'));
  const body = String(formData.get('body') || '').trim();
  if (!id || !body) return;

  const request = await prisma.request.findUnique({
    where: { id },
    include: { hotel: { select: { name: true, accentColor: true, email: true } } },
  });
  if (!request) return;
  if (session.hotelId !== null && request.hotelId !== session.hotelId) return;

  await prisma.requestMessage.create({
    data: { requestId: id, sender: 'hotel', body },
  });

  // Email guest with reply link
  try {
    const resend = getResend();
    if (resend && request.email) {
      const token = generateBookingToken(id, request.createdAt);
      const base = process.env.NEXT_PUBLIC_BASE_URL || `https://${process.env.VERCEL_URL}`;
      const replyUrl = `${base}/nachrichten?id=${id}&token=${token}`;
      const hotelName = request.hotel?.name || 'Hotel';

      await resend.emails.send({
        from: getFromEmail(),
        to: request.email,
        subject: `Neue Nachricht zu Ihrer Buchungsanfrage — ${hotelName}`,
        html: buildEmailHtml({
          hotelName,
          accentColor: request.hotel?.accentColor || undefined,
          title: 'Neue Nachricht',
          body: `
            <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 16px;">
              ${request.firstname ? `Hallo ${request.firstname},` : 'Hallo,'}<br/><br/>
              Sie haben eine neue Nachricht zu Ihrer Buchungsanfrage erhalten:
            </p>
            <div style="padding:16px;background:#f9fafb;border-left:3px solid #e5e7eb;border-radius:4px;font-size:15px;color:#374151;line-height:1.6;white-space:pre-wrap;">${body}</div>
            <div style="margin-top:24px;">
              <a href="${replyUrl}"
                 style="display:inline-block;padding:11px 22px;background:#111827;color:#fff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;">
                Antworten
              </a>
            </div>
          `,
          footer: `<p style="margin:0;font-size:12px;color:#6b7280;">Buchungs-ID: #${id}</p>`,
        }),
      });
    }
  } catch (e) {
    console.error('Admin message email error:', e);
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
      messages: { orderBy: { createdAt: 'asc' } },
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

  const hotelPlan = isSuperAdmin
    ? 'business'
    : ((await prisma.hotel.findUnique({ where: { id: session.hotelId! }, select: { plan: true } }))?.plan as PlanKey ?? 'starter');
  const canUseMessages = hasPlanAccess(hotelPlan, FEATURE_PLAN_GATES.messages);

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
      className="admin-page"
      style={{
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
          borderRadius: 8,
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
          <StatusButtons
            requestId={request.id}
            currentStatus={request.status}
            guestEmail={request.email}
            action={updateBookingStatus}
          />
        </div>

        {request.status === 'booked' && (() => {
          const icsUrl = bookingIcalUrl(request.id, request.createdAt);
          return (
            <div style={{ paddingTop: 4 }}>
              <strong style={{ fontSize: 13 }}>Kalender-Export für Gast:</strong>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                <a
                  href={icsUrl}
                  download={`buchung-${request.id}.ics`}
                  style={{
                    display: 'inline-block',
                    padding: '8px 16px',
                    borderRadius: 8,
                    background: '#111',
                    color: '#fff',
                    textDecoration: 'none',
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  📅 .ics herunterladen
                </a>
                <span style={{ fontSize: 12, color: '#9ca3af', wordBreak: 'break-all' }}>{icsUrl}</span>
              </div>
            </div>
          );
        })()}

        <div style={{ fontSize: 12, color: '#666' }}>
          Erstellt: {new Date(request.createdAt).toLocaleString()}
        </div>
      </div>

      {/* ─── Nachrichtenthread ─── */}
      {!canUseMessages ? (
        <div style={{ marginTop: 24, padding: '16px 20px', border: `1px solid ${borderColor}`, borderRadius: 8, background: '#fafafa', fontSize: 13, color: '#9ca3af' }}>
          🔒 Direktnachrichten sind ab dem <strong style={{ color: '#111' }}>Business-Plan</strong> verfügbar.{' '}
          <a href="/admin/billing" style={{ color: '#111', fontWeight: 600 }}>Jetzt upgraden →</a>
        </div>
      ) : (
      <div style={{
        marginTop: 24,
        border: `1px solid ${borderColor}`,
        borderRadius: cardRadius,
        background: cardBackground,
        overflow: 'hidden',
      }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #f3f4f6' }}>
          <strong style={{ fontSize: 15 }}>Nachrichten</strong>
          {request.messages.length > 0 && (
            <span style={{ marginLeft: 8, fontSize: 12, color: '#9ca3af' }}>
              {request.messages.length} Nachricht{request.messages.length !== 1 ? 'en' : ''}
            </span>
          )}
        </div>

        {/* Thread */}
        <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 12, minHeight: 80 }}>
          {request.messages.length === 0 && (
            <p style={{ color: '#9ca3af', fontSize: 13, margin: 0 }}>
              Noch keine Nachrichten — schreiben Sie dem Gast direkt.
            </p>
          )}
          {request.messages.map((msg) => {
            const isHotel = msg.sender === 'hotel';
            const senderLabel = isHotel
              ? (request.hotel?.name || 'Hotel')
              : ([request.firstname, request.lastname].filter(Boolean).join(' ') || 'Gast');
            return (
              <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isHotel ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '75%',
                  padding: '10px 14px',
                  borderRadius: isHotel ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                  background: isHotel ? '#111' : '#f3f4f6',
                  color: isHotel ? '#fff' : '#111',
                  fontSize: 14,
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}>
                  {msg.body}
                </div>
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 3 }}>
                  {senderLabel} · {new Intl.DateTimeFormat('de-AT', {
                    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
                  }).format(new Date(msg.createdAt))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Send form */}
        <div style={{ padding: '0 24px 20px' }}>
          <form action={sendAdminMessage} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input type="hidden" name="requestId" value={request.id} />
            <textarea
              name="body"
              required
              placeholder="Nachricht an den Gast…"
              rows={3}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: `1px solid ${borderColor}`,
                borderRadius: 8,
                fontSize: 14,
                fontFamily: 'inherit',
                resize: 'vertical',
                boxSizing: 'border-box',
                color: textColor,
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, color: '#9ca3af' }}>
                Gast erhält eine E-Mail mit Antwort-Link.
              </span>
              <button
                type="submit"
                style={{
                  padding: '9px 20px',
                  borderRadius: 8,
                  border: 'none',
                  background: '#111',
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Senden
              </button>
            </div>
          </form>
        </div>
      </div>
      )}
    </main>
  );
}
