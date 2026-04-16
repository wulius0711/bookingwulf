import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import { saveHotelSettings } from './actions';
import { ColorField } from './color-field';
import { hasFullBranding } from '@/src/lib/plan-gates';

export const dynamic = 'force-dynamic';

type SearchParams = Promise<{ hotel?: string }>;
type PageProps = { searchParams: SearchParams };

/* ---------- STYLES ---------- */

const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  padding: 32,
  background: '#f5f5f7',
  color: '#111111',
  fontFamily:
    'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
};

const shellStyle: React.CSSProperties = {
  maxWidth: 1440,
  margin: '0 auto',
  display: 'grid',
  gridTemplateColumns: 'minmax(620px, 760px) minmax(380px, 1fr)',
  gap: 28,
  alignItems: 'start',
};

const panelStyle: React.CSSProperties = {
  background: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: 22,
  boxShadow: '0 10px 30px rgba(15, 23, 42, 0.05)',
};

const leftPanelStyle: React.CSSProperties = {
  ...panelStyle,
  padding: 28,
  display: 'grid',
  gap: 22,
};

const rightPanelStyle: React.CSSProperties = {
  ...panelStyle,
  padding: 20,
  position: 'sticky',
  top: 24,
};

const topBarStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-end',
  gap: 18,
  flexWrap: 'wrap',
};

const headlineStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 34,
  lineHeight: 1.05,
  letterSpacing: '-0.03em',
  color: '#0f172a',
};

const sublineStyle: React.CSSProperties = {
  margin: '8px 0 0',
  fontSize: 15,
  lineHeight: 1.55,
  color: '#667085',
};

const selectorWrapStyle: React.CSSProperties = {
  display: 'grid',
  gap: 8,
  minWidth: 280,
};

const sectionStyle: React.CSSProperties = {
  border: '1px solid #eceef2',
  borderRadius: 18,
  background: '#ffffff',
  padding: 22,
  display: 'grid',
  gap: 18,
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

const rowStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '180px minmax(0, 1fr)',
  gap: 18,
  alignItems: 'center',
};

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  color: '#4b5563',
  fontWeight: 700,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '11px 12px',
  border: '1px solid #d1d5db',
  borderRadius: 10,
  fontSize: 14,
  background: '#ffffff',
  color: '#111111',
  outline: 'none',
};

const smallInputStyle: React.CSSProperties = {
  ...inputStyle,
  width: 120,
};

const checkboxRowStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '180px minmax(0, 1fr)',
  gap: 18,
  alignItems: 'center',
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
};

const actionRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: 12,
  alignItems: 'center',
  flexWrap: 'wrap',
};

const primaryButtonStyle: React.CSSProperties = {
  padding: '10px 16px',
  borderRadius: 999,
  background: '#111111',
  color: '#ffffff',
  border: '1px solid #ffffff',
  cursor: 'pointer',
  fontSize: 14,
  fontWeight: 600,
};

const secondaryButtonStyle: React.CSSProperties = {
  padding: '10px 16px',
  borderRadius: 999,
  background: '#ffffff',
  color: '#111111',
  border: '1px solid #d1d5db',
  cursor: 'pointer',
  fontSize: 14,
  fontWeight: 600,
  textDecoration: 'none',
};

const previewTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 22,
  lineHeight: 1.15,
  color: '#111827',
};

const previewSubStyle: React.CSSProperties = {
  margin: '8px 0 18px',
  fontSize: 14,
  lineHeight: 1.5,
  color: '#6b7280',
};

const iframeStyle: React.CSSProperties = {
  width: '100%',
  height: 920,
  border: '1px solid #e5e7eb',
  borderRadius: 16,
  background: '#ffffff',
};


/* ---------- TYPES ---------- */

type ToggleKey =
  | 'showPrices'
  | 'allowMultiSelect'
  | 'showAmenities'
  | 'showExtrasStep'
  | 'showPhoneField'
  | 'showMessageField'
  | 'enableImageSlider'
  | 'enableLightbox'

const featureToggles: [ToggleKey, string][] = [
  ['showPrices', 'Preise anzeigen'],
  ['allowMultiSelect', 'Multi Select Apartments'],
  ['showAmenities', 'Ausstattung anzeigen'],
  ['showExtrasStep', 'Zusatzleistungen anzeigen'],
  ['showPhoneField', 'Telefonfeld anzeigen'],
  ['showMessageField', 'Nachrichtenfeld anzeigen'],
  ['enableImageSlider', 'Image Slider aktivieren'],
  ['enableLightbox', 'Lightbox aktivieren'],
]

/* ---------- PAGE ---------- */

export default async function Page({ searchParams }: PageProps) {
  const session = await verifySession();
  const isSuperAdmin = session.hotelId === null;

  const { hotel } = await searchParams;

  const hotels = isSuperAdmin
    ? await prisma.hotel.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' },
        select: { id: true, name: true, slug: true },
      })
    : await prisma.hotel.findMany({
        where: { id: session.hotelId!, isActive: true },
        select: { id: true, name: true, slug: true },
      });

  const selectedId = isSuperAdmin
    ? hotel && !Number.isNaN(Number(hotel)) ? Number(hotel) : hotels[0]?.id
    : session.hotelId!;

  const selected = selectedId
    ? await prisma.hotel.findUnique({
        where: { id: selectedId },
        include: { settings: true },
      })
    : null;

  if (!selected) return <p>Kein Hotel</p>;

  const fullBranding = isSuperAdmin || hasFullBranding(selected.plan ?? 'starter');

  return (
    <main style={pageStyle}>
      <div style={shellStyle}>
        {/* LEFT */}
        <div style={leftPanelStyle}>
          <div style={topBarStyle}>
            <div>
              <h1 style={headlineStyle}>Hotel Settings</h1>
              <p style={sublineStyle}>
                Farben, Radius und Funktionen pro Hotel steuern – mit direkter
                Widget-Vorschau.
              </p>
            </div>

            {isSuperAdmin && (
              <form method="GET">
                <div style={selectorWrapStyle}>
                  <label style={labelStyle}>Hotel auswählen</label>

                  <div
                    style={{
                      display: 'flex',
                      gap: 10,
                      alignItems: 'center',
                      flexWrap: 'wrap',
                    }}
                  >
                    <select
                      name="hotel"
                      defaultValue={String(selected.id)}
                      style={{ ...inputStyle, minWidth: 280 }}
                    >
                      {hotels.map((hotelItem) => (
                        <option key={hotelItem.id} value={hotelItem.id}>
                          {hotelItem.name} ({hotelItem.slug})
                        </option>
                      ))}
                    </select>

                    <button type="submit" style={secondaryButtonStyle}>
                      Laden
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>

          <form action={saveHotelSettings} style={{ display: 'grid', gap: 20 }}>
            <input type="hidden" name="hotelId" value={selected.id} />

            {/* BENACHRICHTIGUNGEN */}
            <div style={sectionStyle}>
              <div>
                <h2 style={sectionTitleStyle}>Benachrichtigungen</h2>
                <p style={sectionIntroStyle}>
                  E-Mail-Adresse, an die neue Buchungsanfragen gesendet werden.
                </p>
              </div>

              <div style={rowStyle}>
                <label style={labelStyle}>Benachrichtigungs-E-Mail</label>
                <input
                  name="notificationEmail"
                  type="email"
                  defaultValue={selected.email ?? ''}
                  placeholder="z. B. info@hotel.at"
                  style={inputStyle}
                />
              </div>
            </div>

            {/* DESIGN */}
            <div style={sectionStyle}>
              <div>
                <h2 style={sectionTitleStyle}>Design</h2>
                <p style={sectionIntroStyle}>
                  Farben und Formensprache für das Booking Widget dieses Hotels.
                </p>
              </div>

              {(
                [
                  ['Accent',     'accentColor',     selected.settings?.accentColor     || '#dc143c', true],
                  ['Background', 'backgroundColor', selected.settings?.backgroundColor || '#FAEBD7', fullBranding],
                  ['Card',       'cardBackground',  selected.settings?.cardBackground  || '#ffffff', fullBranding],
                  ['Text',       'textColor',       selected.settings?.textColor       || '#111111', fullBranding],
                  ['Muted',      'mutedTextColor',  selected.settings?.mutedTextColor  || '#666666', fullBranding],
                  ['Border',     'borderColor',     selected.settings?.borderColor     || '#dddddd', fullBranding],
                ] as [string, string, string, boolean][]
              ).map(([label, name, value, enabled]) => (
                <div key={name} style={{ position: 'relative', opacity: enabled ? 1 : 0.4 }}>
                  <ColorField
                    label={label}
                    name={enabled ? name : `_disabled_${name}`}
                    defaultValue={value}
                    labelStyle={labelStyle}
                  />
                  {!enabled && (
                    <div
                      title="Ab Pro Plan verfügbar"
                      style={{
                        position: 'absolute',
                        inset: 0,
                        cursor: 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        paddingRight: 12,
                        fontSize: 12,
                        color: '#9ca3af',
                      }}
                    >
                      🔒 Pro
                    </div>
                  )}
                </div>
              ))}

              <div style={rowStyle}>
                <label style={labelStyle}>Card Radius</label>
                <input
                  name="cardRadius"
                  defaultValue={selected.settings?.cardRadius ?? ''}
                  style={{ ...inputStyle, maxWidth: 180 }}
                />
              </div>

              <div style={rowStyle}>
                <label style={labelStyle}>Button Radius</label>
                <input
                  name="buttonRadius"
                  defaultValue={selected.settings?.buttonRadius ?? ''}
                  style={{ ...inputStyle, maxWidth: 180 }}
                />
              </div>
            </div>

            {/* FEATURES */}
            <div style={sectionStyle}>
              <div>
                <h2 style={sectionTitleStyle}>Features</h2>
                <p style={sectionIntroStyle}>
                  Verhalten und Umfang des Widgets pro Hotel steuern.
                </p>
              </div>

              {featureToggles.map(([key, label]) => (
                <div key={key} style={checkboxRowStyle}>
                  <label style={labelStyle}>{label}</label>

                  <label style={checkboxBoxStyle}>
                    <input
                      key={String(selected.settings?.[key] ?? true)}
                      type="checkbox"
                      name={key}
                      defaultChecked={selected.settings?.[key] ?? true}
                    />
                    Aktiv
                  </label>
                </div>
              ))}
            </div>

            {/* ACTIONS */}
            <div style={actionRowStyle}>
              <button type="submit" style={primaryButtonStyle}>
                Speichern
              </button>

              <a
                href={`/admin/settings?hotel=${selected.id}`}
                style={secondaryButtonStyle}
              >
                Reset
              </a>
            </div>
          </form>
        </div>

        {/* RIGHT PREVIEW */}
        <div style={rightPanelStyle}>
          <h2 style={previewTitleStyle}>Live Preview</h2>
          <p style={previewSubStyle}>
            Vorschau des Widgets für {selected.name}.
          </p>

          <iframe src={`/?hotel=${selected.slug}`} style={iframeStyle} />
        </div>
      </div>
    </main>
  );
}
