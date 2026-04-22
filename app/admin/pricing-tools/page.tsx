import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import { hasPlanAccess } from '@/src/lib/plan-gates';
import ProLockOverlay from '../components/ProLockOverlay';
import { savePricingTools } from './actions';

export const dynamic = 'force-dynamic';

type SearchParams = Promise<{ hotel?: string; saved?: string }>;
type PageProps = { searchParams: SearchParams };

const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: 'var(--page-bg)',
  color: '#111111',
  fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
};

const shellStyle: React.CSSProperties = {
  maxWidth: 760,
  margin: '0 auto',
  padding: '40px 24px 80px',
  display: 'grid',
  gap: 28,
};

const panelStyle: React.CSSProperties = {
  background: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: 22,
  boxShadow: '0 10px 30px rgba(15, 23, 42, 0.05)',
  padding: '28px 32px',
  display: 'grid',
  gap: 20,
};

const sectionStyle: React.CSSProperties = {
  border: '1px solid #e5e7eb',
  borderRadius: 18,
  background: '#f9fafb',
  padding: '24px 28px',
  display: 'grid',
  gap: 18,
  position: 'relative',
};

const sectionTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 20,
  lineHeight: 1.15,
  color: '#111827',
  letterSpacing: '-0.02em',
};

const sectionIntroStyle: React.CSSProperties = {
  margin: '4px 0 0',
  fontSize: 14,
  lineHeight: 1.5,
  color: '#6b7280',
};

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  color: '#4b5563',
  fontWeight: 700,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
};

const inputStyle: React.CSSProperties = {
  padding: '8px 12px',
  border: '1px solid #e5e7eb',
  borderRadius: 8,
  fontSize: 14,
  background: '#fff',
};

const checkboxBoxStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  minHeight: 44,
  padding: '10px 12px',
  border: '1px solid #e5e7eb',
  borderRadius: 12,
  background: '#fafafa',
  color: '#111827',
  fontSize: 14,
  cursor: 'pointer',
};

export default async function Page({ searchParams }: PageProps) {
  const session = await verifySession();
  const isSuperAdmin = session.hotelId === null;

  const { hotel, saved } = await searchParams;

  const hotels = isSuperAdmin
    ? await prisma.hotel.findMany({ where: { isActive: true }, orderBy: { name: 'asc' }, select: { id: true, name: true, slug: true } })
    : await prisma.hotel.findMany({ where: { id: session.hotelId!, isActive: true }, select: { id: true, name: true, slug: true } });

  const selectedId = isSuperAdmin
    ? hotel && !Number.isNaN(Number(hotel)) ? Number(hotel) : hotels[0]?.id
    : session.hotelId!;

  const selected = selectedId
    ? await prisma.hotel.findUnique({ where: { id: selectedId }, include: { settings: true } })
    : null;

  if (!selected) return <p>Kein Hotel</p>;

  const hasPro = isSuperAdmin || hasPlanAccess(selected.plan ?? 'starter', 'pro');

  return (
    <main style={pageStyle}>
      <div style={shellStyle}>
        <div>
          <h1 style={{ margin: 0, fontSize: 34, lineHeight: 1.05, letterSpacing: '-0.03em', color: '#0f172a' }}>Preistools</h1>
          <p style={{ margin: '8px 0 0', fontSize: 15, color: '#667085', lineHeight: 1.55 }}>
            Dynamische Preisanpassungen, Verfügbarkeits-Hinweise und Abgaben konfigurieren.
          </p>
        </div>

        {isSuperAdmin && (
          <form method="GET" style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <label style={{ ...labelStyle, whiteSpace: 'nowrap' }}>Hotel auswählen</label>
            <select name="hotel" defaultValue={String(selected.id)} style={{ ...inputStyle, width: '100%', maxWidth: 320 }}>
              {hotels.map((h) => (
                <option key={h.id} value={h.id}>{h.name} ({h.slug})</option>
              ))}
            </select>
            <button type="submit" style={{ padding: '8px 14px', borderRadius: 8, background: '#fff', border: '1px solid #d1d5db', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Laden</button>
          </form>
        )}

        <form action={savePricingTools} style={{ display: 'grid', gap: 20 }}>
          <input type="hidden" name="hotelId" value={selected.id} />

          {/* URGENCY SIGNALS */}
          <div style={sectionStyle}>
            <div>
              <h2 style={sectionTitleStyle}>Verfügbarkeits-Hinweise</h2>
              <p style={sectionIntroStyle}>
                Zeigt im Widget einen 🔥-Banner wenn im gewählten Monat weniger als X % der Nächte frei sind — erzeugt sanften Buchungsdruck.
              </p>
            </div>
            <label style={checkboxBoxStyle}>
              <input
                type="checkbox"
                name="showUrgencySignals"
                defaultChecked={selected.settings?.showUrgencySignals ?? false}
                style={{ width: 16, height: 16, accentColor: 'var(--accent)' }}
              />
              <span style={{ fontWeight: 500 }}>Verfügbarkeits-Hinweise aktivieren</span>
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <label style={{ ...labelStyle, marginBottom: 0, whiteSpace: 'nowrap' }}>Schwellenwert (%)</label>
              <input
                type="number"
                name="urgencyThreshold"
                min="10"
                max="90"
                step="5"
                defaultValue={selected.settings?.urgencyThreshold ?? 40}
                style={{ ...inputStyle, width: 90 }}
              />
              <span style={{ fontSize: 12, color: '#9ca3af' }}>Banner erscheint wenn weniger als X % der Nächte frei sind</span>
            </div>
          </div>

          {/* LÜCKEN-RABATT */}
          <div style={sectionStyle}>
            {!hasPro && <ProLockOverlay />}
            <div>
              <h2 style={sectionTitleStyle}>Lücken-Rabatt</h2>
              <p style={sectionIntroStyle}>
                Kurze freie Lücken zwischen zwei Buchungen werden automatisch vergünstigt — das Widget zeigt den Sonderpreis an.
              </p>
            </div>
            <div style={{ display: 'grid', gap: 16 }}>
              <div style={{ display: 'grid', gap: 6 }}>
                <label style={labelStyle}>Rabatt (%)</label>
                <input
                  type="number"
                  name="gapNightDiscount"
                  min="1"
                  max="80"
                  step="1"
                  defaultValue={selected.settings?.gapNightDiscount ?? ''}
                  placeholder="z. B. 20 (leer = deaktiviert)"
                  style={{ ...inputStyle, width: 200 }}
                />
              </div>
              <div style={{ display: 'grid', gap: 6 }}>
                <label style={labelStyle}>Max. Lückenlänge (Nächte)</label>
                <input
                  type="number"
                  name="gapNightMaxLength"
                  min="1"
                  max="14"
                  step="1"
                  defaultValue={selected.settings?.gapNightMaxLength ?? ''}
                  placeholder="z. B. 3 (leer = deaktiviert)"
                  style={{ ...inputStyle, width: 200 }}
                />
              </div>
            </div>
          </div>

          {/* ORTSTAXE */}
          <div style={sectionStyle}>
            <div>
              <h2 style={sectionTitleStyle}>Ortstaxe / Kurtaxe</h2>
              <p style={sectionIntroStyle}>
                Wird pro Person und Nacht zur Buchungssumme addiert und in der Buchungsübersicht sowie den E-Mails ausgewiesen.
              </p>
            </div>
            <div style={{ display: 'grid', gap: 16 }}>
              <div style={{ display: 'grid', gap: 6 }}>
                <label style={labelStyle}>Betrag pro Person / Nacht (€)</label>
                <input
                  type="number"
                  name="ortstaxePerPersonPerNight"
                  min="0"
                  step="0.01"
                  defaultValue={Number(selected.settings?.ortstaxePerPersonPerNight ?? 0) || ''}
                  placeholder="z. B. 2.50"
                  style={{ ...inputStyle, width: 160 }}
                />
              </div>
              <div style={{ display: 'grid', gap: 6 }}>
                <label style={labelStyle}>Mindestalter (Kinder darunter frei)</label>
                <input
                  type="number"
                  name="ortstaxeMinAge"
                  min="0"
                  step="1"
                  defaultValue={selected.settings?.ortstaxeMinAge ?? ''}
                  placeholder="z. B. 14 (leer = alle zahlen)"
                  style={{ ...inputStyle, width: 200 }}
                />
              </div>
            </div>
          </div>

          {/* ACTIONS */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 8 }}>
            <button
              type="submit"
              style={{ padding: '10px 20px', borderRadius: 8, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}
            >
              Speichern
            </button>
          </div>

          {saved === '1' && (
            <div style={{ padding: '12px 16px', background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: 10, fontSize: 14, color: '#16a34a' }}>
              Einstellungen gespeichert.
            </div>
          )}
        </form>
      </div>
    </main>
  );
}
