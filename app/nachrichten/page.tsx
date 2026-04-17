import { prisma } from '@/src/lib/prisma';
import { verifyBookingToken } from '@/src/lib/booking-token';
import { getResend, getFromEmail, buildEmailHtml } from '@/src/lib/email';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

type SearchParams = Promise<{ id?: string; token?: string }>;

async function sendGuestReply(formData: FormData) {
  'use server';

  const id = Number(formData.get('requestId'));
  const token = String(formData.get('token') || '');
  const body = String(formData.get('body') || '').trim();

  if (!id || !body) return;

  const request = await prisma.request.findUnique({
    where: { id },
    include: { hotel: { select: { name: true, email: true, accentColor: true } } },
  });
  if (!request) return;
  if (!verifyBookingToken(id, request.createdAt, token)) return;

  await prisma.requestMessage.create({
    data: { requestId: id, sender: 'guest', body },
  });

  // Notify hotel by email
  try {
    const resend = getResend();
    if (resend && request.hotel?.email) {
      const guestName = [request.firstname, request.lastname].filter(Boolean).join(' ') || 'Gast';
      await resend.emails.send({
        from: getFromEmail(),
        to: request.hotel.email,
        subject: `Neue Nachricht von ${guestName} — Buchung #${id}`,
        html: buildEmailHtml({
          hotelName: request.hotel.name,
          accentColor: request.hotel.accentColor || undefined,
          title: 'Neue Gast-Nachricht',
          body: `
            <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 16px;">
              <strong>${guestName}</strong> hat auf Buchung #${id} geantwortet:
            </p>
            <div style="padding:16px;background:#f9fafb;border-left:3px solid #e5e7eb;border-radius:4px;font-size:15px;color:#374151;line-height:1.6;white-space:pre-wrap;">${body}</div>
            <div style="margin-top:20px;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL || `https://${process.env.VERCEL_URL}`}/admin/requests/${id}"
                 style="display:inline-block;padding:10px 20px;background:#111827;color:#fff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;">
                Zur Buchung
              </a>
            </div>
          `,
        }),
      });
    }
  } catch (e) {
    console.error('Guest reply notification error:', e);
  }

  redirect(`/nachrichten?id=${id}&token=${token}&sent=1`);
}

export default async function NachrichtenPage({ searchParams }: { searchParams: SearchParams }) {
  const { id: idStr, token = '', sent } = await searchParams as Awaited<SearchParams> & { sent?: string };
  const id = Number(idStr || 0);

  if (!id || !token) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
        <p style={{ color: '#6b7280' }}>Ungültiger Link.</p>
      </div>
    );
  }

  const request = await prisma.request.findUnique({
    where: { id },
    include: {
      hotel: { select: { name: true, accentColor: true } },
      messages: { orderBy: { createdAt: 'asc' } },
    },
  });

  if (!request || !verifyBookingToken(id, request.createdAt, token)) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
        <p style={{ color: '#6b7280' }}>Link ungültig oder abgelaufen.</p>
      </div>
    );
  }

  const accent = request.hotel?.accentColor || '#111827';
  const hotelName = request.hotel?.name || 'Hotel';
  const guestName = [request.firstname, request.lastname].filter(Boolean).join(' ') || 'Gast';

  const fmt = (d: Date) =>
    new Intl.DateTimeFormat('de-AT', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f5f5f7',
      fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
      padding: '32px 16px',
    }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          background: accent,
          borderRadius: '16px 16px 0 0',
          padding: '24px 28px',
        }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>{hotelName}</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 4 }}>
            Buchung #{id} · {fmt(request.arrival)} – {fmt(request.departure)}
          </div>
        </div>

        {/* Thread */}
        <div style={{
          background: '#fff',
          padding: '24px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          minHeight: 200,
        }}>
          {request.messages.length === 0 && (
            <p style={{ color: '#9ca3af', fontSize: 14, textAlign: 'center', margin: '24px 0' }}>
              Noch keine Nachrichten.
            </p>
          )}

          {request.messages.map((msg) => {
            const isHotel = msg.sender === 'hotel';
            return (
              <div key={msg.id} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isHotel ? 'flex-start' : 'flex-end',
              }}>
                <div style={{
                  maxWidth: '80%',
                  padding: '10px 14px',
                  borderRadius: isHotel ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
                  background: isHotel ? '#f3f4f6' : accent,
                  color: isHotel ? '#111' : '#fff',
                  fontSize: 14,
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}>
                  {msg.body}
                </div>
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
                  {isHotel ? hotelName : guestName} · {new Intl.DateTimeFormat('de-AT', {
                    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
                  }).format(new Date(msg.createdAt))}
                </div>
              </div>
            );
          })}

          {sent === '1' && (
            <div style={{ padding: '10px 14px', background: '#dcfce7', borderRadius: 8, fontSize: 13, color: '#16a34a', textAlign: 'center' }}>
              Nachricht gesendet.
            </div>
          )}
        </div>

        {/* Reply form */}
        <div style={{
          background: '#fff',
          borderTop: '1px solid #f3f4f6',
          borderRadius: '0 0 16px 16px',
          padding: '20px 28px',
        }}>
          <form action={sendGuestReply}>
            <input type="hidden" name="requestId" value={id} />
            <input type="hidden" name="token" value={token} />
            <textarea
              name="body"
              required
              placeholder="Ihre Antwort…"
              rows={4}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: 8,
                fontSize: 14,
                fontFamily: 'inherit',
                resize: 'vertical',
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              style={{
                marginTop: 10,
                padding: '10px 24px',
                background: accent,
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                float: 'right',
              }}
            >
              Senden
            </button>
            <div style={{ clear: 'both' }} />
          </form>
        </div>
      </div>
    </div>
  );
}
