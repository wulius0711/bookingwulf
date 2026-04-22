import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import { revalidatePath } from 'next/cache';
import { hasPlanAccess } from '@/src/lib/plan-gates';
import ProLockOverlay from '../components/ProLockOverlay';

export const dynamic = 'force-dynamic';

const TEMPLATE_TYPES = [
  {
    type: 'request_guest',
    label: 'Buchungsanfrage — Bestätigung an Gast',
    description: 'Wird gesendet wenn ein Gast eine Anfrage abschickt.',
    defaultSubject: 'Ihre Buchungsanfrage bei {{hotelName}}',
    defaultBody: 'vielen Dank für Ihre Buchungsanfrage. Wir haben Ihre Daten erhalten und melden uns in Kürze mit den weiteren Details.',
  },
  {
    type: 'booking_guest',
    label: 'Verbindliche Buchung — Bestätigung an Gast',
    description: 'Wird gesendet wenn ein Gast verbindlich bucht.',
    defaultSubject: 'Buchungsbestätigung bei {{hotelName}}',
    defaultBody: 'Ihre Buchung ist bestätigt. Wir freuen uns auf Ihren Besuch!',
  },
  {
    type: 'cancellation_guest',
    label: 'Stornobestätigung — Bestätigung an Gast',
    description: 'Wird gesendet wenn eine Buchung storniert wird.',
    defaultSubject: 'Ihre Buchung wurde storniert — {{hotelName}}',
    defaultBody: 'Ihre Buchungsanfrage wurde leider storniert. Bei Fragen stehen wir Ihnen gerne zur Verfügung.',
  },
  {
    type: 'request_hotel',
    label: 'Neue Anfrage — Benachrichtigung an Hotel',
    description: 'Wird an die Hotel-E-Mail gesendet bei jeder neuen Anfrage.',
    defaultSubject: 'Neue Buchungsanfrage #{{bookingId}} — {{arrival}} bis {{departure}}',
    defaultBody: '',
  },
] as const;

const PLACEHOLDERS = [
  { key: '{{guestName}}', desc: 'Vorname des Gastes' },
  { key: '{{guestLastName}}', desc: 'Nachname des Gastes' },
  { key: '{{hotelName}}', desc: 'Name des Hotels' },
  { key: '{{arrival}}', desc: 'Anreisedatum' },
  { key: '{{departure}}', desc: 'Abreisedatum' },
  { key: '{{nights}}', desc: 'Anzahl Nächte' },
  { key: '{{apartmentName}}', desc: 'Apartment-Name(n)' },
  { key: '{{bookingId}}', desc: 'Buchungs-ID' },
];

export default async function EmailTemplatesPage() {
  const session = await verifySession();
  const isSuperAdmin = session.hotelId === null;

  const hotel = isSuperAdmin
    ? null
    : await prisma.hotel.findUnique({
        where: { id: session.hotelId! },
        select: { id: true, plan: true, emailTemplates: true, settings: { select: { preArrivalEnabled: true, preArrivalReminderDays: true, preArrivalHouseRules: true } } },
      });

  const hasPro = isSuperAdmin || hasPlanAccess(hotel?.plan ?? 'starter', 'pro');

  const templates = hotel?.emailTemplates ?? [];
  const getTemplate = (type: string) => templates.find((t) => t.type === type);

  async function saveTemplates(formData: FormData) {
    'use server';
    const session = await verifySession();
    if (session.hotelId === null) return;

    const hotel = await prisma.hotel.findUnique({
      where: { id: session.hotelId },
      select: { plan: true },
    });
    if (!hasPlanAccess(hotel?.plan ?? 'starter', 'pro')) return;

    for (const { type } of TEMPLATE_TYPES) {
      const subject = String(formData.get(`${type}_subject`) || '').trim();
      const greeting = String(formData.get(`${type}_greeting`) || '').trim() || null;
      const body = String(formData.get(`${type}_body`) || '').trim();
      const signoff = String(formData.get(`${type}_signoff`) || '').trim() || null;
      if (!subject) continue;

      await prisma.emailTemplate.upsert({
        where: { hotelId_type: { hotelId: session.hotelId, type } },
        create: { hotelId: session.hotelId, type, subject, greeting, body, signoff },
        update: { subject, greeting, body, signoff },
      });
    }

    revalidatePath('/admin/email-templates');
  }

  async function saveCheckinSettings(formData: FormData) {
    'use server';
    const session = await verifySession();
    if (session.hotelId === null) return;
    await prisma.hotelSettings.upsert({
      where: { hotelId: session.hotelId },
      update: {
        preArrivalEnabled: formData.get('preArrivalEnabled') === 'on',
        preArrivalReminderDays: parseInt(String(formData.get('preArrivalReminderDays') || '3')) || 3,
        preArrivalHouseRules: String(formData.get('preArrivalHouseRules') || '').trim() || null,
      },
      create: {
        hotelId: session.hotelId,
        preArrivalEnabled: formData.get('preArrivalEnabled') === 'on',
        preArrivalReminderDays: parseInt(String(formData.get('preArrivalReminderDays') || '3')) || 3,
        preArrivalHouseRules: String(formData.get('preArrivalHouseRules') || '').trim() || null,
      },
    });
    revalidatePath('/admin/email-templates');
  }

  const s = hotel?.settings;

  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 700,
    color: '#4b5563',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    display: 'block',
    marginBottom: 4,
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: 8,
    fontSize: 14,
    background: '#fff',
    color: '#111',
    boxSizing: 'border-box',
  };

  return (
    <main className="admin-page" style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif', maxWidth: 720 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111', marginBottom: 6 }}>Benachrichtigungen</h1>
      <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 28 }}>
        E-Mail-Vorlagen und automatische Gäste-Benachrichtigungen konfigurieren.
      </p>


      {/* Language hint */}
      <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '12px 18px', marginBottom: 16, fontSize: 13, color: '#92400e' }}>
        Templates werden auf Deutsch bearbeitet. Die Sprache der Gast-Mails lässt sich pro Buchung in der Buchungsdetailansicht einstellen.
      </div>

      {/* Placeholder reference */}
      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '14px 18px', marginBottom: 28 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 10px' }}>Verfügbare Platzhalter</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px' }}>
          {PLACEHOLDERS.map(({ key, desc }) => (
            <span key={key} style={{ fontSize: 13, color: '#374151' }}>
              <code style={{ background: '#e2e8f0', borderRadius: 4, padding: '1px 6px', fontFamily: 'monospace', fontSize: 12 }}>{key}</code>
              {' '}{desc}
            </span>
          ))}
        </div>
      </div>

      <div style={{ position: 'relative' }}>
        <div style={{ opacity: hasPro ? 1 : 0.4, pointerEvents: hasPro ? 'auto' : 'none' }}>
          <form action={saveTemplates} style={{ display: 'grid', gap: 24 }}>
            {TEMPLATE_TYPES.map(({ type, label, description, defaultSubject, defaultBody }) => {
              const saved = getTemplate(type);
              return (
                <div key={type} style={{ border: '1px solid #e5e7eb', borderRadius: 14, padding: '22px 24px', background: '#fff', display: 'grid', gap: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    <div>
                      <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111', margin: '0 0 2px' }}>{label}</h2>
                      <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>{description}</p>
                    </div>
                    <a
                      href={`/api/admin/email-preview?type=${type}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ padding: '6px 14px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#374151', textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}
                    >
                      Vorschau
                    </a>
                  </div>

                  <div style={{ display: 'grid', gap: 4 }}>
                    <label style={labelStyle}>Betreff</label>
                    <input
                      name={`${type}_subject`}
                      type="text"
                      defaultValue={saved?.subject ?? defaultSubject}
                      style={inputStyle}
                    />
                  </div>

                  {type !== 'request_hotel' && (
                    <>
                      <div style={{ display: 'grid', gap: 4 }}>
                        <label style={labelStyle}>Begrüßung</label>
                        <input
                          name={`${type}_greeting`}
                          type="text"
                          defaultValue={saved?.greeting ?? 'Hallo {{guestName}},'}
                          style={inputStyle}
                        />
                      </div>

                      <div style={{ display: 'grid', gap: 4 }}>
                        <label style={labelStyle}>Fließtext</label>
                        <textarea
                          name={`${type}_body`}
                          defaultValue={saved?.body ?? defaultBody}
                          rows={4}
                          style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
                        />
                      </div>

                      <div style={{ display: 'grid', gap: 4 }}>
                        <label style={labelStyle}>Verabschiedung</label>
                        <input
                          name={`${type}_signoff`}
                          type="text"
                          defaultValue={saved?.signoff ?? 'Mit freundlichen Grüßen'}
                          style={inputStyle}
                        />
                      </div>
                    </>
                  )}
                </div>
              );
            })}

            <div>
              <button
                type="submit"
                style={{ padding: '11px 24px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}
              >
                Speichern
              </button>
            </div>
          </form>
        </div>
        {!hasPro && <ProLockOverlay />}
      </div>

      {/* ONLINE CHECK-IN */}
      {hotel && (
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 14, padding: '22px 24px', background: '#fff', marginTop: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111', margin: '0 0 4px' }}>Online Check-in</h2>
          <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 18px' }}>
            Gäste erhalten nach der Buchungsbestätigung einen persönlichen Check-in-Link.
            Automatische Erinnerung X Tage vor Anreise falls noch nicht ausgefüllt.
          </p>
          <form action={saveCheckinSettings} style={{ display: 'grid', gap: 14 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <input type="checkbox" name="preArrivalEnabled" defaultChecked={s?.preArrivalEnabled ?? false}
                style={{ width: 16, height: 16, accentColor: 'var(--accent)' }} />
              <span style={{ fontSize: 14, fontWeight: 500, color: '#111' }}>Online Check-in aktivieren</span>
            </label>
            <div style={{ display: 'grid', gap: 4 }}>
              <label style={labelStyle}>Erinnerung X Tage vor Anreise</label>
              <input type="number" name="preArrivalReminderDays" min="1" max="14"
                defaultValue={s?.preArrivalReminderDays ?? 3}
                style={{ ...inputStyle, width: 120 }} />
            </div>
            <div style={{ display: 'grid', gap: 4 }}>
              <label style={labelStyle}>Hausordnung <span style={{ fontWeight: 400, textTransform: 'none', color: '#9ca3af', fontSize: 11 }}>(optional — Gast muss bestätigen)</span></label>
              <textarea name="preArrivalHouseRules" rows={5}
                defaultValue={s?.preArrivalHouseRules ?? ''}
                placeholder="z. B. Rauchen verboten, Ruhezeiten 22–8 Uhr, …"
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} />
            </div>
            <div>
              <button type="submit" style={{ padding: '10px 20px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
                Speichern
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
