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
import CopyLinkButton from '../../components/CopyLinkButton';
import InfoTooltip from '../../components/InfoTooltip';

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

async function sendCheckinEmail(formData: FormData) {
  'use server';
  const session = await verifySession();
  const id = Number(formData.get('requestId'));
  if (!id) return;

  const req = await prisma.request.findUnique({
    where: { id },
    select: {
      id: true, email: true, firstname: true, lastname: true,
      arrival: true, departure: true, nights: true, hotelId: true,
      checkinToken: true, nukiCode: true,
      hotel: {
        select: {
          name: true,
          accentColor: true,
          emailTemplates: { where: { type: 'checkin_guest' } },
        },
      },
    },
  });

  if (!req || !req.email) return;
  if (session.hotelId !== null && req.hotelId !== session.hotelId) return;

  const r = req;
  const template = r.hotel?.emailTemplates?.[0];
  const hotelName = r.hotel?.name ?? '';
  const accent = r.hotel?.accentColor ?? '#111827';
  const guestName = r.firstname || r.lastname;
  const fmt = (d: Date) => new Intl.DateTimeFormat('de-AT', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(d));
  const portalUrl = r.checkinToken ? `${process.env.NEXT_PUBLIC_BASE_URL || ''}/gast/${r.checkinToken}` : '';

  function fill(str: string) {
    return str
      .replace(/\{\{guestName\}\}/g, guestName)
      .replace(/\{\{guestLastName\}\}/g, r.lastname)
      .replace(/\{\{hotelName\}\}/g, hotelName)
      .replace(/\{\{arrival\}\}/g, fmt(r.arrival))
      .replace(/\{\{departure\}\}/g, fmt(r.departure))
      .replace(/\{\{nights\}\}/g, String(r.nights))
      .replace(/\{\{bookingId\}\}/g, String(r.id))
      .replace(/\{\{nukiCode\}\}/g, r.nukiCode ?? '')
      .replace(/\{\{portalUrl\}\}/g, portalUrl);
  }

  const subject = fill(template?.subject ?? `Ihre Check-in Infos — ${hotelName}`);
  const greeting = fill(template?.greeting ?? `Hallo ${guestName},`);
  const bodyText = fill(template?.body ?? '');
  const signoff = fill(template?.signoff ?? 'Mit freundlichen Grüßen');

  const bodyHtml = `
    <p style="font-size:15px;color:#374151;line-height:1.7;margin:0 0 20px;">${greeting}</p>
    <p style="font-size:15px;color:#374151;line-height:1.8;margin:0 0 20px;white-space:pre-wrap;">${bodyText.replace(/\n/g, '<br/>')}</p>
    <p style="font-size:15px;color:#374151;line-height:1.7;margin:0 0 4px;">${signoff},</p>
    <p style="font-size:15px;font-weight:700;color:#111827;margin:0 0 24px;">${hotelName}</p>
    ${portalUrl ? `<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;text-align:center;"><p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">Ihre Gästemappe</p><a href="${portalUrl}" style="font-size:14px;font-weight:700;color:${accent};text-decoration:none;word-break:break-all;">${portalUrl}</a></div>` : ''}
  `;

  const html = buildEmailHtml({
    hotelName,
    accentColor: accent,
    title: subject,
    preheader: `Check-in Infos für Ihren Aufenthalt vom ${fmt(req.arrival)}`,
    body: bodyHtml,
    autoReplyText: '',
  });

  const resend = getResend();
  if (resend) {
    await resend.emails.send({ from: getFromEmail(), to: req.email, subject, html });
  }

  await prisma.request.update({ where: { id }, data: { checkinEmailSentAt: new Date() } });
  redirect(`/admin/requests/${id}?saved=checkin-email`);
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
    case 'booked':     return { label: 'Gebucht',     bg: 'var(--status-booked-bg)',    color: 'var(--status-booked-text)',    border: 'transparent' };
    case 'answered':   return { label: 'Beantwortet', bg: 'var(--status-new-bg)',        color: 'var(--status-new-text)',        border: 'transparent' };
    case 'cancelled':  return { label: 'Storniert',   bg: 'var(--status-cancelled-bg)', color: 'var(--status-cancelled-text)', border: 'transparent' };
    default:           return { label: 'Neu',          bg: 'var(--status-pending-bg)',   color: 'var(--status-pending-text)',   border: 'transparent' };
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
          emailTemplates: { where: { type: 'checkin_guest' }, select: { subject: true } },
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

  const cardBackground = 'var(--surface)';
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

  const rowLabel: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.04em', textTransform: 'uppercase', paddingTop: 2 };
  const rowValue: React.CSSProperties = { fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.5 };

  return (
    <main
      className="admin-page"
      style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif', maxWidth: 760 }}
    >
      {/* Back + delete */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <Link href="/admin/requests" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border)', textDecoration: 'none', color: 'var(--text-muted)', background: 'var(--surface)', fontSize: 13, fontWeight: 500 }}>
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
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 16px rgba(15,23,42,0.06)' }}>

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
            ...(request.paymentMethod ? [{ label: 'Zahlung', value: request.paymentMethod }] : []),
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 8, alignItems: 'start' }}>
              <span style={rowLabel}>{label}</span>
              <span style={rowValue}>{value}</span>
            </div>
          ))}

          {/* Pricing */}
          {(() => {
            const pricing = request.pricingJson as {
              source?: string;
              total?: number;
              apartments?: { apartmentName: string; totalPrice: number; cleaningFee: number }[];
              extrasTotal?: number;
              ortstaxeTotal?: number;
              beds24Items?: { type: string; description: string; amount: number }[];
            } | null;
            if (!pricing?.total) return null;
            const fmtEur = (n: number) => `€ ${n.toFixed(2).replace('.', ',')}`;
            const isBeds24 = pricing.source === 'beds24';
            const apts = pricing.apartments ?? [];
            const roomTotal = apts.reduce((s, a) => s + (a.totalPrice - a.cleaningFee), 0);
            const cleaningTotal = apts.reduce((s, a) => s + a.cleaningFee, 0);
            return (
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 8, alignItems: 'start' }}>
                <span style={rowLabel}>Preis</span>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px', display: 'grid', gap: 6 }}>
                  {isBeds24 && pricing.beds24Items && pricing.beds24Items.length > 0 ? (
                    <>
                      {pricing.beds24Items.map((item, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                          <span style={{ color: 'var(--text-muted)' }}>{item.description || item.type}</span>
                          <span style={{ fontWeight: 500 }}>{fmtEur(item.amount)}</span>
                        </div>
                      ))}
                    </>
                  ) : (
                    <>
                      {roomTotal > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                          <span style={{ color: 'var(--text-muted)' }}>Zimmerpreis</span>
                          <span style={{ fontWeight: 500 }}>{fmtEur(roomTotal)}</span>
                        </div>
                      )}
                      {cleaningTotal > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                          <span style={{ color: 'var(--text-muted)' }}>Reinigung</span>
                          <span style={{ fontWeight: 500 }}>{fmtEur(cleaningTotal)}</span>
                        </div>
                      )}
                      {(pricing.extrasTotal ?? 0) > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                          <span style={{ color: 'var(--text-muted)' }}>Extras</span>
                          <span style={{ fontWeight: 500 }}>{fmtEur(pricing.extrasTotal!)}</span>
                        </div>
                      )}
                      {(pricing.ortstaxeTotal ?? 0) > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                          <span style={{ color: 'var(--text-muted)' }}>Ortstaxe</span>
                          <span style={{ fontWeight: 500 }}>{fmtEur(pricing.ortstaxeTotal!)}</span>
                        </div>
                      )}
                    </>
                  )}
                  <div style={{ borderTop: '1px solid var(--border)', marginTop: 4, paddingTop: 6, display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Gesamt</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{fmtEur(pricing.total)}</span>
                  </div>
                </div>
              </div>
            );
          })()}

          {request.message && (
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 8, alignItems: 'start' }}>
              <span style={rowLabel}>Mitteilung</span>
              <span style={{ ...rowValue, background: 'var(--surface-2)', padding: '10px 12px', borderRadius: 8, whiteSpace: 'pre-wrap' }}>{request.message}</span>
            </div>
          )}

          {request.checkinToken && (
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 8, alignItems: 'start' }}>
              <span style={rowLabel}>Check-in</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                {request.checkinCompletedAt ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 8, background: 'var(--status-booked-bg)', color: 'var(--status-booked-text)', fontSize: 12, fontWeight: 700 }}>
                    ✓ Ausgefüllt {new Intl.DateTimeFormat('de-AT', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(request.checkinCompletedAt))}
                    {request.checkinArrivalTime && ` · Ankunft: ${request.checkinArrivalTime}`}
                  </span>
                ) : (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 8, background: 'var(--status-pending-bg)', color: 'var(--status-pending-text)', fontSize: 12, fontWeight: 700 }}>
                    ⏳ Ausstehend
                  </span>
                )}
                <a
                  href={`${process.env.NEXT_PUBLIC_BASE_URL || ''}/checkin/${request.checkinToken}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'underline' }}
                >
                  Link öffnen
                </a>
              </div>
              {request.checkinNotes && (
                <div style={{ gridColumn: '2', marginTop: 4, fontSize: 13, color: 'var(--text-muted)', background: 'var(--surface-2)', padding: '8px 10px', borderRadius: 8, whiteSpace: 'pre-wrap' }}>
                  {request.checkinNotes}
                </div>
              )}
              {(request.checkinBirthdate || request.checkinNationality || request.checkinDocNumber) && (
                <div style={{ gridColumn: '2', marginTop: 8, fontSize: 13, color: 'var(--text-primary)', background: 'var(--status-new-bg)', border: '1px solid var(--primitive-blue-100)', padding: '10px 12px', borderRadius: 8, display: 'grid', gap: 4 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--status-new-text)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Meldedaten</div>
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

          {request.checkinToken && (
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 8, alignItems: 'center', padding: '6px 0' }}>
              <span style={{ ...rowLabel, display: 'flex', alignItems: 'center', gap: 4 }}>
                Gäste-Lounge
                <InfoTooltip text="Persönliche Lounge des Gastes mit Hausinfos, Extras, Nachrichten und Check-out. Link manuell teilen — z.B. per Airbnb-Chat oder WhatsApp." />
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <a
                  href={`/gast/${request.checkinToken}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'underline' }}
                >
                  Link öffnen
                </a>
                <CopyLinkButton url={`${process.env.NEXT_PUBLIC_BASE_URL || ''}/gast/${request.checkinToken}`} />
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 8, alignItems: 'start' }}>
            <span style={rowLabel}>Erstellt</span>
            <span style={{ ...rowValue, color: 'var(--text-disabled)' }}>{new Intl.DateTimeFormat('de-AT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(request.createdAt))}</span>
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid var(--border)' }} />

        {/* Actions */}
        <div style={{ padding: '20px 28px', display: 'grid', gap: 20 }}>

          {/* Mail language */}
          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 8, alignItems: 'center' }}>
            <span style={rowLabel}>Mail-Sprache</span>
            <form action={updateLanguage} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="hidden" name="id" value={request.id} />
              <select name="language" defaultValue={request.language || 'de'} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, background: 'var(--surface-2)', color: 'var(--text-primary)' }}>
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
              <button type="submit" style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', fontSize: 13, cursor: 'pointer', color: 'var(--text-muted)', fontWeight: 500 }}>
                Speichern
              </button>
              {saved === 'language' && <span style={{ fontSize: 12, color: 'var(--status-booked-text)' }}>✓ Gespeichert</span>}
            </form>
          </div>

          {/* Status */}
          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 8, alignItems: 'start' }}>
            <span style={{ ...rowLabel, paddingTop: 8 }}>Status</span>
            <StatusButtons requestId={request.id} currentStatus={request.status} guestEmail={request.email} action={updateBookingStatus} />
          </div>
        </div>
      </div>

      {/* ─── Check-in E-Mail ─── */}
      {request.email && (
        <div style={{ marginTop: 16, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '14px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <div>
              <strong style={{ fontSize: 14 }}>Check-in E-Mail</strong>
              <span style={{ marginLeft: 10, fontSize: 12, color: 'var(--text-disabled)' }}>
                {request.checkinEmailSentAt
                  ? `Gesendet am ${new Intl.DateTimeFormat('de-AT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(request.checkinEmailSentAt))}`
                  : 'Noch nicht gesendet'}
              </span>
            </div>
            {!request.hotel?.emailTemplates?.length && (
              <a href="/admin/email-templates" style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'underline' }}>
                Vorlage einrichten →
              </a>
            )}
          </div>
          <div style={{ padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              An: <strong style={{ color: 'var(--text-primary)' }}>{request.email}</strong>
            </span>
            <form action={sendCheckinEmail}>
              <input type="hidden" name="requestId" value={request.id} />
              <button
                type="submit"
                className="btn-shine"
                style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: 'var(--accent)', color: 'var(--text-on-accent)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                {request.checkinEmailSentAt ? 'Erneut senden' : 'Jetzt senden'}
              </button>
            </form>
          </div>
          {saved === 'checkin-email' && (
            <div style={{ padding: '0 24px 14px', fontSize: 13, color: 'var(--status-booked-text)', fontWeight: 500 }}>✓ E-Mail wurde gesendet</div>
          )}
        </div>
      )}

      {/* ─── Nachrichtenthread ─── */}
      {!canUseMessages ? (
        <div style={{ marginTop: 24, padding: '16px 20px', border: `1px solid ${borderColor}`, borderRadius: 8, background: 'var(--surface-2)', fontSize: 13, color: 'var(--text-secondary)' }}>
          🔒 Direktnachrichten sind ab dem <strong style={{ color: 'var(--text-primary)' }}>Business-Plan</strong> verfügbar.{' '}
          <a href="/admin/billing" style={{ color: 'var(--accent)', fontWeight: 600 }}>Jetzt upgraden →</a>
        </div>
      ) : (
      <div style={{
        marginTop: 24,
        border: `1px solid ${borderColor}`,
        borderRadius: cardRadius,
        background: cardBackground,
        overflow: 'hidden',
      }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)' }}>
          <strong style={{ fontSize: 15 }}>Nachrichten</strong>
          {request.messages.length > 0 && (
            <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--text-disabled)' }}>
              {request.messages.length} Nachricht{request.messages.length !== 1 ? 'en' : ''}
            </span>
          )}
        </div>

        {/* Thread */}
        <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 12, minHeight: 80 }}>
          {request.messages.length === 0 && (
            <p style={{ color: 'var(--text-disabled)', fontSize: 13, margin: 0 }}>
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
                  background: isHotel ? 'var(--primitive-gray-900)' : 'var(--surface-3)',
                  color: isHotel ? '#fff' : 'var(--text-primary)',
                  fontSize: 14,
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}>
                  {msg.body}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-disabled)', marginTop: 3 }}>
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
              <span style={{ fontSize: 12, color: 'var(--text-disabled)' }}>
                Gast erhält eine E-Mail mit Antwort-Link.
              </span>
              <button
                type="submit"
                className="btn-shine"
                style={{
                  padding: '9px 20px',
                  borderRadius: 8,
                  border: 'none',
                  background: 'var(--accent)',
                  color: 'var(--text-on-accent)',
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
