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
        select: { id: true, plan: true, emailTemplates: true },
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
      const body = String(formData.get(`${type}_body`) || '').trim();
      if (!subject) continue;

      await prisma.emailTemplate.upsert({
        where: { hotelId_type: { hotelId: session.hotelId, type } },
        create: { hotelId: session.hotelId, type, subject, body },
        update: { subject, body },
      });
    }

    revalidatePath('/admin/email-templates');
  }

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
      <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111', marginBottom: 6 }}>E-Mail Templates</h1>
      <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 28 }}>
        Betreff und Fließtext der automatischen E-Mails anpassen.
      </p>

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
                  <div>
                    <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111', margin: '0 0 2px' }}>{label}</h2>
                    <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>{description}</p>
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
                    <div style={{ display: 'grid', gap: 4 }}>
                      <label style={labelStyle}>Fließtext</label>
                      <textarea
                        name={`${type}_body`}
                        defaultValue={saved?.body ?? defaultBody}
                        rows={4}
                        style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
                      />
                    </div>
                  )}
                </div>
              );
            })}

            <div>
              <button
                type="submit"
                style={{ padding: '11px 24px', background: '#111', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}
              >
                Speichern
              </button>
            </div>
          </form>
        </div>
        {!hasPro && <ProLockOverlay />}
      </div>
    </main>
  );
}
