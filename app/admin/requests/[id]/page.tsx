import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import { getResend, getFromEmail, buildEmailHtml, buildDivider, buildInfoBlock } from '@/src/lib/email';
import { getEmailTranslations, dateLocale, type Lang } from '@/src/lib/email-i18n';
import { bookingIcalUrl, generateBookingToken } from '@/src/lib/booking-token';
import { hasPlanAccess, FEATURE_PLAN_GATES } from '@/src/lib/plan-gates';
import { PlanKey } from '@/src/lib/plans';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import StatusButtons from './StatusButtons';
import { DeleteRequestButton } from '../DeleteButtons';

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
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

async function updateLanguage(formData: FormData) {
  'use server';
  const session = await verifySession();
  const id = Number(formData.get('id'));
  const language = String(formData.get('language') || 'de').trim();
  if (!id) return;
  const allowed = ['de', 'en', 'it', 'fr', 'nl', 'ru', 'pl', 'cs', 'es'];
  if (!allowed.includes(language)) return;
  const request = await prisma.request.findUnique({ where: { id }, select: { hotelId: true } });
  if (!request) return;
  if (session.hotelId !== null && request.hotelId !== session.hotelId) return;
  await prisma.request.update({ where: { id }, data: { language } });
  redirect(`/admin/requests/${id}?saved=language`);
}

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
    include: {
      hotel: {
        select: {
          id: true, name: true, accentColor: true, email: true,
          emailTemplates: { select: { type: true, subject: true, greeting: true, body: true, signoff: true } },
        },
      },
    },
  });
  if (!request) return;
  if (session.hotelId !== null && request.hotelId !== session.hotelId) return;

  // Generate checkin token when booking is confirmed
  let checkinToken: string | null = null;
  if (status === 'booked' && !request.checkinToken) {
    const hotelSettings = request.hotelId
      ? await prisma.hotelSettings.findUnique({ where: { hotelId: request.hotelId }, select: { preArrivalEnabled: true } })
      : null;
    if (hotelSettings?.preArrivalEnabled) {
      checkinToken = crypto.randomUUID();
    }
  }

  await prisma.request.update({ where: { id }, data: { status, ...(checkinToken ? { checkinToken } : {}) } });

  const lang = (request.language || 'de') as Lang;
  const i18n = getEmailTranslations(lang);
  const locale = dateLocale[lang];
  const statusMsg = status !== 'answered'
    ? i18n.statusMessages[status as keyof typeof i18n.statusMessages]
    : null;

  if (statusMsg && request.email) {
    try {
      const resend = getResend();
      if (resend) {
        const arrivalDate = new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: 'numeric' }).format(request.arrival);
        const departureDate = new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: 'numeric' }).format(request.departure);
        const icalUrl = status === 'booked' ? bookingIcalUrl(request.id, request.createdAt) : null;
        const base = process.env.NEXT_PUBLIC_BASE_URL || `https://${process.env.VERCEL_URL}`;
        const checkinUrl = (status === 'booked' && checkinToken) ? `${base}/checkin/${checkinToken}` : null;
        const hotelName = request.hotel?.name || 'Hotel';

        const tplVars: Record<string, string> = {
          '{{guestName}}': request.firstname || '',
          '{{guestLastName}}': request.lastname,
          '{{hotelName}}': hotelName,
          '{{arrival}}': arrivalDate,
          '{{departure}}': departureDate,
          '{{nights}}': String(request.nights),
          '{{bookingId}}': String(request.id),
        };
        const fillTpl = (str: string) => Object.entries(tplVars).reduce((s, [k, v]) => s.replaceAll(k, v), str);
        const cancelTpl = status === 'cancelled'
          ? request.hotel?.emailTemplates.find(t => t.type === 'cancellation_guest')
          : null;

        const subject = cancelTpl
          ? fillTpl(cancelTpl.subject)
          : `${statusMsg.subject} — ${hotelName}`;
        const greeting = cancelTpl?.greeting
          ? fillTpl(cancelTpl.greeting)
          : i18n.greeting(request.firstname || '');
        const bodyText = cancelTpl
          ? fillTpl(cancelTpl.body)
          : statusMsg.message;
        const signoff = cancelTpl?.signoff
          ? fillTpl(cancelTpl.signoff)
          : i18n.signoff;

        await resend.emails.send({
          from: getFromEmail(),
          to: request.email,
          subject,
          html: buildEmailHtml({
            hotelName,
            accentColor: request.hotel?.accentColor || undefined,
            title: statusMsg.title,
            autoReplyText: i18n.autoReply,
            body: `
              <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 20px;">
                ${greeting}<br/><br/>
                ${bodyText}
              </p>
              ${buildDivider()}
              ${buildInfoBlock(i18n.period, `${arrivalDate} — ${departureDate} (${i18n.nights(request.nights)})`)}
              ${buildInfoBlock(i18n.guests, i18n.adults(request.adults) + (request.children ? i18n.children(request.children) : ''))}
              ${icalUrl ? `
              <div style="margin-top:24px;">
                <a href="${icalUrl}" style="display:inline-block;padding:11px 22px;background:#111827;color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;">
                  📅 ${i18n.addToCalendar}
                </a>
              </div>` : ''}
              ${checkinUrl ? `
              <div style="margin-top:16px;padding:16px;background:#f9fafb;border-radius:10px;border:1px solid #e5e7eb;">
                <p style="margin:0 0 12px;font-size:14px;color:#374151;font-weight:600;">Online Check-in</p>
                <p style="margin:0 0 14px;font-size:13px;color:#6b7280;line-height:1.5;">Füllen Sie bitte vorab das Online Check-in Formular aus — das spart Zeit bei der Ankunft.</p>
                <a href="${checkinUrl}" style="display:inline-block;padding:10px 20px;background:${request.hotel?.accentColor || '#111827'};color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;">
                  Jetzt einchecken →
                </a>
              </div>` : ''}
              <p style="font-size:15px;color:#374151;line-height:1.6;margin:24px 0 0;">
                ${signoff}<br/>
                <strong>${hotelName}</strong>
              </p>
              ${request.hotel?.email ? `<p style="font-size:13px;color:#6b7280;margin:8px 0 0;">${i18n.contactLine(request.hotel.email)}</p>` : ''}
            `,
            footer: `<p style="margin:0;font-size:12px;color:#6b7280;">${i18n.bookingId(request.id)}</p>`,
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

  try {
    const resend = getResend();
    if (resend && request.email) {
      const lang = (request.language || 'de') as Lang;
      const i18n = getEmailTranslations(lang);
      const token = generateBookingToken(id, request.createdAt);
      const base = process.env.NEXT_PUBLIC_BASE_URL || `https://${process.env.VERCEL_URL}`;
      const replyUrl = `${base}/nachrichten?id=${id}&token=${token}`;
      const hotelName = request.hotel?.name || 'Hotel';

      await resend.emails.send({
        from: getFromEmail(),
        to: request.email,
        subject: i18n.newMessageSubject(hotelName),
        html: buildEmailHtml({
          hotelName,
          accentColor: request.hotel?.accentColor || undefined,
          title: i18n.newMessage,
          autoReplyText: i18n.autoReply,
          body: `
            <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 16px;">
              ${i18n.newMessageIntro(request.firstname || '')}
            </p>
            <div style="padding:16px;background:#f9fafb;border-left:3px solid #e5e7eb;border-radius:4px;font-size:15px;color:#374151;line-height:1.6;white-space:pre-wrap;">${body}</div>
            <div style="margin-top:24px;">
              <a href="${replyUrl}" style="display:inline-block;padding:11px 22px;background:#111827;color:#fff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;">
                ${i18n.reply}
              </a>
            </div>
            ${request.hotel?.email ? `<p style="font-size:13px;color:#6b7280;margin:16px 0 0;">${i18n.contactLine(request.hotel.email)}</p>` : ''}
          `,
          footer: `<p style="margin:0;font-size:12px;color:#6b7280;">${i18n.bookingId(id)}</p>`,
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

export default async function BookingDetailPage({ params, searchParams }: PageProps) {
  const session = await verifySession();
  const { id } = await params;
  const { saved } = await searchParams;
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

  const fmtDate = (d: Date) =>
    new Intl.DateTimeFormat('de-AT', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(d));

  const rowLabel: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: '#9ca3af', letterSpacing: '0.04em', textTransform: 'uppercase', paddingTop: 2 };
  const rowValue: React.CSSProperties = { fontSize: 14, color: '#111', lineHeight: 1.5 };

  return (
    <main
      className="admin-page"
      style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif', maxWidth: 760 }}
    >
      {/* Back + delete */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <Link href="/admin/requests" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: '1px solid #e5e7eb', textDecoration: 'none', color: '#374151', background: '#fff', fontSize: 13, fontWeight: 500 }}>
          ← Alle Anfragen
        </Link>
        {isSuperAdmin && <DeleteRequestButton requestId={request.id} />}
      </div>

      {/* Title row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Buchung #{request.id}</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isSuperAdmin && (
            <div style={{ padding: '4px 10px', borderRadius: 6, background: request.hotel?.accentColor || '#f5f5f5', fontSize: 12, fontWeight: 600, color: '#fff' }}>
              {request.hotel?.name || '—'}
            </div>
          )}
          <div style={{ padding: '5px 12px', borderRadius: 999, background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`, fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            {badge.label}
          </div>
        </div>
      </div>

      {/* Main card */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 16px rgba(15,23,42,0.06)' }}>

        {/* Info grid */}
        <div style={{ padding: '24px 28px', display: 'grid', gap: 16 }}>
          {[
            { label: 'Name', value: `${request.firstname || ''} ${request.lastname}`.trim() },
            { label: 'E-Mail', value: request.email },
            ...(request.country ? [{ label: 'Land', value: request.country }] : []),
            { label: 'Zeitraum', value: `${fmtDate(request.arrival)} – ${fmtDate(request.departure)}` },
            { label: 'Nächte', value: String(request.nights) },
            { label: 'Gäste', value: `${request.adults} Erwachsene${request.children ? `, ${request.children} Kinder` : ''}` },
            { label: 'Apartment', value: apartmentNames || '—' },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 8, alignItems: 'start' }}>
              <span style={rowLabel}>{label}</span>
              <span style={rowValue}>{value}</span>
            </div>
          ))}

          {request.message && (
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 8, alignItems: 'start' }}>
              <span style={rowLabel}>Mitteilung</span>
              <span style={{ ...rowValue, background: '#f9fafb', padding: '10px 12px', borderRadius: 8, whiteSpace: 'pre-wrap' }}>{request.message}</span>
            </div>
          )}

          {request.checkinToken && (
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 8, alignItems: 'start' }}>
              <span style={rowLabel}>Check-in</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                {request.checkinCompletedAt ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 8, background: '#dcfce7', color: '#15803d', fontSize: 12, fontWeight: 700 }}>
                    ✓ Ausgefüllt {new Intl.DateTimeFormat('de-AT', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(request.checkinCompletedAt))}
                    {request.checkinArrivalTime && ` · Ankunft: ${request.checkinArrivalTime}`}
                  </span>
                ) : (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 8, background: '#fef3c7', color: '#92400e', fontSize: 12, fontWeight: 700 }}>
                    ⏳ Ausstehend
                  </span>
                )}
                <a
                  href={`${process.env.NEXT_PUBLIC_BASE_URL || ''}/checkin/${request.checkinToken}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: 12, color: '#6b7280', textDecoration: 'underline' }}
                >
                  Link öffnen
                </a>
              </div>
              {request.checkinNotes && (
                <div style={{ gridColumn: '2', marginTop: 4, fontSize: 13, color: '#374151', background: '#f9fafb', padding: '8px 10px', borderRadius: 8, whiteSpace: 'pre-wrap' }}>
                  {request.checkinNotes}
                </div>
              )}
              {(request.checkinBirthdate || request.checkinNationality || request.checkinDocNumber) && (
                <div style={{ gridColumn: '2', marginTop: 8, fontSize: 13, color: '#374151', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '10px 12px', borderRadius: 8, display: 'grid', gap: 4 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Meldedaten</div>
                  {(request.salutation || request.firstname || request.lastname) && (
                    <div>Name: <strong>{[request.salutation, request.firstname, request.lastname].filter(Boolean).join(' ')}</strong></div>
                  )}
                  {request.checkinBirthdate && <div>Geburtsdatum: <strong>{request.checkinBirthdate}</strong></div>}
                  {request.checkinNationality && <div>Staatsangehörigkeit: <strong>{request.checkinNationality}</strong></div>}
                  {request.country && <div>Herkunftsland: <strong>{request.country}</strong></div>}
                  {request.checkinDocNumber && <div>Ausweis-/Reisepassnr.: <strong>{request.checkinDocNumber}</strong></div>}
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 8, alignItems: 'start' }}>
            <span style={rowLabel}>Erstellt</span>
            <span style={{ ...rowValue, color: '#9ca3af' }}>{new Intl.DateTimeFormat('de-AT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(request.createdAt))}</span>
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid #f3f4f6' }} />

        {/* Actions */}
        <div style={{ padding: '20px 28px', display: 'grid', gap: 20 }}>

          {/* Mail language */}
          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 8, alignItems: 'center' }}>
            <span style={rowLabel}>Mail-Sprache</span>
            <form action={updateLanguage} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="hidden" name="id" value={request.id} />
              <select name="language" defaultValue={request.language || 'de'} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13, background: '#fff', color: '#111' }}>
                <option value="de">Deutsch</option>
                <option value="en">English</option>
                <option value="it">Italiano</option>
                <option value="fr">Français</option>
                <option value="nl">Nederlands</option>
                <option value="es">Español</option>
                <option value="pl">Polski</option>
                <option value="cs">Čeština</option>
                <option value="ru">Русский</option>
              </select>
              <button type="submit" style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', fontSize: 13, cursor: 'pointer', color: '#374151', fontWeight: 500 }}>
                Speichern
              </button>
              {saved === 'language' && <span style={{ fontSize: 12, color: '#16a34a' }}>✓ Gespeichert</span>}
            </form>
          </div>

          {/* Status */}
          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 8, alignItems: 'start' }}>
            <span style={{ ...rowLabel, paddingTop: 8 }}>Status</span>
            <StatusButtons requestId={request.id} currentStatus={request.status} guestEmail={request.email} action={updateBookingStatus} />
          </div>
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
