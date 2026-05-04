import { headers } from 'next/headers';
import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import { saveHotelSettings } from './actions';
import { ColorField } from './color-field';
import { RadiusField } from './RadiusField';
import { hasFullBranding, hasPlanAccess, hasAdvancedTypography } from '@/src/lib/plan-gates';
import { EmbedCode } from './EmbedCode';
import ContrastChecker from './ContrastChecker';
import SettingsPresets from './SettingsPresets';
import SettingsLivePreview from './SettingsLivePreview';
import ProLockOverlay from '../components/ProLockOverlay';
import WidgetConfigs from './WidgetConfigs';
import InfoTooltip from '../components/InfoTooltip';
import StandardButton from './StandardButton';
import SaveButton from '../components/SaveButton';
import FeatureToggles from './FeatureToggles';
import FontUploadRow from './FontUploadRow';
import PaymentSettings from './PaymentSettings';

export const dynamic = 'force-dynamic';

type SearchParams = Promise<{ hotel?: string; saved?: string }>;
type PageProps = { searchParams: SearchParams };

/* ---------- STYLES ---------- */

const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: 'var(--page-bg)',
  color: '#111111',
  fontFamily:
    'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
};

const shellStyle: React.CSSProperties = {
  maxWidth: 1440,
  margin: '0 auto',
  display: 'grid',
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
  display: 'grid',
  gap: 6,
};

const headlineStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 28,
  fontWeight: 600,
  letterSpacing: '-0.03em',
  color: '#0f172a',
};

const sublineStyle: React.CSSProperties = {
  margin: '6px 0 0',
  fontSize: 14,
  color: '#667085',
};

const selectorWrapStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  flexWrap: 'wrap',
  padding: '12px 0 4px',
};

const sectionStyle: React.CSSProperties = {
  border: '1px solid #e5e7eb',
  borderRadius: 18,
  background: '#f9fafb',
  padding: '26px 28px',
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
  gap: 18,
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
  width: '100%',
};

const actionRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: 12,
  alignItems: 'center',
  flexWrap: 'wrap',
  marginTop: 24,
  marginBottom: 48,
};



const secondaryButtonStyle: React.CSSProperties = {
  padding: '10px 16px',
  borderRadius: 8,
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
  height: 980,
  border: '1px solid #e5e7eb',
  borderRadius: 16,
  background: '#ffffff',
};


/* ---------- TYPES ---------- */

type ToggleKey =
  | 'showPrices'
  | 'showAmenities'
  | 'showExtrasStep'
  | 'showPhoneField'
  | 'showMessageField'
  | 'enableImageSlider'
  | 'enableInstantBooking'
  | 'hideRequestOption'

const featureToggles: [ToggleKey, string][] = [
  ['showPrices', 'Preise anzeigen'],
  ['showAmenities', 'Ausstattung anzeigen'],
  ['showExtrasStep', 'Zusatzleistungen anzeigen'],
  ['showPhoneField', 'Telefonfeld anzeigen'],
  ['showMessageField', 'Nachrichtenfeld anzeigen'],
  ['enableImageSlider', 'Image Slider aktivieren'],
  ['enableInstantBooking', 'Verbindliche Buchung anbieten'],
]

/* ---------- PAGE ---------- */

export default async function Page({ searchParams }: PageProps) {
  const session = await verifySession();
  const isSuperAdmin = session.hotelId === null;

  const { hotel, saved } = await searchParams;
  const headerStore = await headers();

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
        include: { settings: true, settingsPresets: { orderBy: { createdAt: 'asc' } }, widgetConfigs: { orderBy: { createdAt: 'asc' } } },
      })
    : null;

  if (!selected) return <p>Kein Hotel</p>;

  const fullBranding = isSuperAdmin || hasFullBranding(selected.plan ?? 'starter');
  const hasPro = isSuperAdmin || hasPlanAccess(selected.plan ?? 'starter', 'pro');
  const hasTypography = isSuperAdmin || hasAdvancedTypography(selected.plan ?? 'starter');

  return (
    <main className="admin-page" style={pageStyle}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={headlineStyle}>Widget &amp; Design</h1>
        <p style={sublineStyle}>
          Daten, Design und Funktionen für Ihr Hotel konfigurieren.
        </p>
        <p style={{ ...sublineStyle, marginTop: 4 }}>
          <a href="#embed-code" style={{ color: 'var(--accent)', textDecoration: 'underline', fontWeight: 500 }}>
            Hier finden Sie den Code zum Einbauen auf Ihre Website.
          </a>
        </p>
      </div>

      <div className="settings-shell" style={shellStyle}>
        {/* LEFT */}
        <div className="settings-left-panel" style={leftPanelStyle}>
          {isSuperAdmin && (
            <form method="GET" style={selectorWrapStyle}>
              <label style={{ ...labelStyle, whiteSpace: 'nowrap' }}>Hotel auswählen</label>

              <select
                name="hotel"
                defaultValue={String(selected.id)}
                style={{ ...inputStyle, width: '100%', maxWidth: 320 }}
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
            </form>
          )}

          <form id="settings-form" action={saveHotelSettings} style={{ display: 'grid', gap: 20 }}>
            <input type="hidden" name="hotelId" value={selected.id} />

            {/* BENACHRICHTIGUNGEN */}
            <details className="settings-section" open style={{ border: '1px solid #e5e7eb', borderRadius: 18, background: '#f9fafb', display: 'block' }}>
              <summary style={{ padding: '22px 28px', cursor: 'pointer', listStyle: 'none', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, WebkitUserSelect: 'none', userSelect: 'none' }}>
                <div>
                  <h2 style={sectionTitleStyle}>Benachrichtigungen</h2>
                  <p style={sectionIntroStyle}>E-Mail-Adresse, an die neue Buchungsanfragen gesendet werden.</p>
                </div>
                <span className="card-caret">▾</span>
              </summary>
              <div style={{ padding: '0 28px 26px', display: 'grid', gap: 18 }}>
                <div className="settings-row" style={rowStyle}>
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
            </details>

            {/* RECHTLICHES */}
            <details className="settings-section" style={{ border: '1px solid #e5e7eb', borderRadius: 18, background: '#f9fafb', display: 'block' }}>
              <summary style={{ padding: '22px 28px', cursor: 'pointer', listStyle: 'none', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, WebkitUserSelect: 'none', userSelect: 'none' }}>
                <div>
                  <h2 style={sectionTitleStyle}>Rechtliches</h2>
                  <p style={sectionIntroStyle}>Links zu Ihren Buchungsbedingungen und Datenschutzerklärung. Werden im Widget als Pflicht-Checkbox angezeigt.</p>
                </div>
                <span className="card-caret">▾</span>
              </summary>
              <div style={{ padding: '0 28px 26px', display: 'grid', gap: 18 }}>
                <div className="settings-row" style={rowStyle}>
                  <label style={labelStyle}>Buchungsbedingungen URL</label>
                  <input
                    name="bookingTermsUrl"
                    type="url"
                    defaultValue={selected.bookingTermsUrl ?? ''}
                    placeholder="https://hotel.at/buchungsbedingungen"
                    style={inputStyle}
                  />
                </div>
                <div className="settings-row" style={rowStyle}>
                  <label style={labelStyle}>Datenschutz URL</label>
                  <input
                    name="privacyPolicyUrl"
                    type="url"
                    defaultValue={selected.privacyPolicyUrl ?? ''}
                    placeholder="https://hotel.at/datenschutz"
                    style={inputStyle}
                  />
                </div>
              </div>
            </details>

            {/* ZAHLUNGSARTEN & BANKDATEN */}
            <details className="settings-section" style={{ border: '1px solid #e5e7eb', borderRadius: 18, background: '#f9fafb', display: 'block' }}>
              <summary style={{ padding: '22px 28px', cursor: 'pointer', listStyle: 'none', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, WebkitUserSelect: 'none', userSelect: 'none' }}>
                <div>
                  <h2 style={sectionTitleStyle}>Zahlungsarten & Bankdaten</h2>
                  <p style={sectionIntroStyle}>Lege fest welche Zahlungsmethoden im Widget angeboten werden. Die Bankdaten erscheinen ausschließlich in der Buchungsbestätigungsmail an den Gast.</p>
                </div>
                <span className="card-caret">▾</span>
              </summary>
              <div style={{ padding: '0 28px 26px' }}>
                <PaymentSettings
                  initialValues={{
                    bankTransferEnabled: selected.settings?.bankTransferEnabled ?? false,
                    paypalEnabled: selected.settings?.paypalEnabled ?? false,
                    paypalClientId: selected.settings?.paypalClientId ?? '',
                    paypalClientSecret: selected.settings?.paypalClientSecret ?? '',
                    stripeEnabled: selected.settings?.stripeEnabled ?? false,
                    stripePublishableKey: selected.settings?.stripePublishableKey ?? '',
                    stripeSecretKey: selected.settings?.stripeSecretKey ?? '',
                    depositEnabled: selected.settings?.depositEnabled ?? false,
                    depositType: selected.settings?.depositType ?? 'percent',
                    depositValue: selected.settings?.depositValue ?? 25,
                    depositDueDays: selected.settings?.depositDueDays ?? 7,
                    bankAccountHolder: selected.settings?.bankAccountHolder ?? '',
                    bankIban: selected.settings?.bankIban ?? '',
                    bankBic: selected.settings?.bankBic ?? '',
                  }}
                  inputStyle={inputStyle}
                  labelStyle={labelStyle}
                />
              </div>
            </details>

            {/* DESIGN */}
            <details className="settings-section" style={{ border: '1px solid #e5e7eb', borderRadius: 18, background: '#f9fafb', display: 'block' }}>
              <summary style={{ padding: '22px 28px', cursor: 'pointer', listStyle: 'none', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, WebkitUserSelect: 'none', userSelect: 'none' }}>
                <div>
                  <h2 style={sectionTitleStyle}>Design</h2>
                  <p style={sectionIntroStyle}>Farben und Formensprache für das Buchungssystem dieses Hotels.</p>
                </div>
                <span className="card-caret">▾</span>
              </summary>
              <div style={{ padding: '0 28px 26px', display: 'grid', gap: 18 }}>
              {(
                [
                  ['Accent',      'accentColor',     selected.settings?.accentColor     || '#111827', true],
                  ['Background',  'backgroundColor', selected.settings?.backgroundColor || '#ffffff', fullBranding],
                  ['Card',        'cardBackground',  selected.settings?.cardBackground  || '#ffffff', fullBranding],
                  ['Text',        'textColor',       selected.settings?.textColor       || '#111111', fullBranding],
                  ['Muted',       'mutedTextColor',  selected.settings?.mutedTextColor  || '#666666', fullBranding],
                  ['Border',      'borderColor',     selected.settings?.borderColor     || '#dddddd', fullBranding],
                  ['Button Text', 'buttonColor',     selected.settings?.buttonColor     || '#ffffff', hasPro],
                ] as [string, string, string, boolean][]
              ).map(([label, name, value, enabled]) => (
                <div key={name} style={{ position: 'relative' }}>
                  <div style={{ opacity: enabled ? 1 : 0.4 }}>
                    <ColorField
                      label={label}
                      name={enabled ? name : `_disabled_${name}`}
                      defaultValue={value}
                      labelStyle={labelStyle}
                      showOpacity={name === 'backgroundColor' || name === 'cardBackground'}
                    />
                  </div>
                  {!enabled && <ProLockOverlay />}
                </div>
              ))}

              <ContrastChecker
                defaultAccent={selected.settings?.accentColor || '#111827'}
                defaultBg={selected.settings?.backgroundColor || '#ffffff'}
                defaultText={selected.settings?.textColor || '#111111'}
                defaultButtonColor={selected.settings?.buttonColor || '#ffffff'}
              />

              <div style={{ position: 'relative' }}>
                <div style={{ opacity: fullBranding ? 1 : 0.4 }}>
                  <RadiusField
                    label="Card Radius"
                    name={fullBranding ? 'cardRadius' : '_disabled_cardRadius'}
                    defaultValue={selected.settings?.cardRadius}
                    labelStyle={labelStyle}
                  />
                </div>
                {!fullBranding && <ProLockOverlay />}
              </div>

              <div style={{ position: 'relative' }}>
                <div style={{ opacity: fullBranding ? 1 : 0.4 }}>
                  <RadiusField
                    label="Button Radius"
                    name={fullBranding ? 'buttonRadius' : '_disabled_buttonRadius'}
                    defaultValue={selected.settings?.buttonRadius}
                    labelStyle={labelStyle}
                  />
                </div>
                {!fullBranding && <ProLockOverlay />}
              </div>
              </div>
            </details>

            {/* TYPOGRAFIE */}
            <details className="settings-section" style={{ border: '1px solid #e5e7eb', borderRadius: 18, background: '#f9fafb', display: 'block' }}>
              <summary style={{ padding: '22px 28px', cursor: 'pointer', listStyle: 'none', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, WebkitUserSelect: 'none', userSelect: 'none' }}>
                <div>
                  <h2 style={sectionTitleStyle}>Typografie</h2>
                  <p style={sectionIntroStyle}>Schriftarten, Größen und Gewichtungen für das Widget.</p>
                </div>
                <span className="card-caret">▾</span>
              </summary>
              <div style={{ padding: '0 28px 26px', display: 'grid', gap: 18 }}>

              {/* Font Family - Pro */}
              {(['headlineFont', 'bodyFont'] as const).map((field) => {
                const label = field === 'headlineFont' ? 'Headline-Schrift' : 'Fließtext-Schrift';
                const currentVal = selected.settings?.[field] ?? '';
                return (
                  <div key={field} style={{ position: 'relative' }}>
                    <div style={{ opacity: fullBranding ? 1 : 0.4 }}>
                      <div className="settings-row" style={rowStyle}>
                        <label style={labelStyle}>{label}</label>
                        <select
                          name={fullBranding ? field : `_disabled_${field}`}
                          defaultValue={currentVal}
                          style={inputStyle}
                        >
                          <option value="">Standard (Inter)</option>
                          <optgroup label="Sans-serif">
                            {['Inter','Montserrat','Lato','Poppins','Raleway'].map(f => <option key={f} value={f}>{f}</option>)}
                          </optgroup>
                          <optgroup label="Serif">
                            {['Playfair Display','Merriweather','Lora','EB Garamond','Cormorant Garamond'].map(f => <option key={f} value={f}>{f}</option>)}
                          </optgroup>
                          <optgroup label="Kalligrafie">
                            {['Great Vibes','Dancing Script'].map(f => <option key={f} value={f}>{f}</option>)}
                          </optgroup>
                        </select>
                      </div>
                    </div>
                    {!fullBranding && <ProLockOverlay />}
                  </div>
                );
              })}

              {/* Custom Font Upload - Business */}
              {(['headline', 'body'] as const).map((field) => (
                <div key={`${field}-upload`} style={{ position: 'relative' }}>
                  <div style={{ opacity: hasTypography ? 1 : 0.4 }}>
                    {hasTypography ? (
                      <FontUploadRow
                        field={field}
                        initialUrl={field === 'headline' ? (selected.settings?.headlineFontUrl ?? null) : (selected.settings?.bodyFontUrl ?? null)}
                      />
                    ) : (
                      <div className="settings-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0' }}>
                        <span style={labelStyle}>
                          {field === 'headline' ? 'Eigene Schrift (Headline)' : 'Eigene Schrift (Fließtext)'}
                        </span>
                        <span style={{ fontSize: 13, color: '#9ca3af' }}>+ Schrift hochladen</span>
                      </div>
                    )}
                  </div>
                  {!hasTypography && <ProLockOverlay plan="business" />}
                </div>
              ))}

              {/* Font Size - Business */}
              {(['headlineFontSize', 'bodyFontSize'] as const).map((field) => {
                const label = field === 'headlineFontSize' ? 'Headline-Größe (px)' : 'Fließtext-Größe (px)';
                const currentVal = selected.settings?.[field] ?? '';
                const placeholder = field === 'headlineFontSize' ? '24' : '14';
                return (
                  <div key={field} style={{ position: 'relative' }}>
                    <div style={{ opacity: hasTypography ? 1 : 0.4 }}>
                      <div className="settings-row" style={rowStyle}>
                        <label style={labelStyle}>{label}</label>
                        <input
                          name={hasTypography ? field : `_disabled_${field}`}
                          type="number"
                          min={10}
                          max={72}
                          defaultValue={currentVal}
                          placeholder={placeholder}
                          style={{ ...smallInputStyle }}
                        />
                      </div>
                    </div>
                    {!hasTypography && <ProLockOverlay plan="business" />}
                  </div>
                );
              })}

              {/* Font Weight - Business */}
              {(['headlineFontWeight', 'bodyFontWeight'] as const).map((field) => {
                const label = field === 'headlineFontWeight' ? 'Headline-Gewicht' : 'Fließtext-Gewicht';
                const currentVal = selected.settings?.[field] ?? '';
                return (
                  <div key={field} style={{ position: 'relative' }}>
                    <div style={{ opacity: hasTypography ? 1 : 0.4 }}>
                      <div className="settings-row" style={rowStyle}>
                        <label style={labelStyle}>{label}</label>
                        <select
                          name={hasTypography ? field : `_disabled_${field}`}
                          defaultValue={String(currentVal)}
                          style={{ ...inputStyle, width: '100%' }}
                        >
                          <option value="">Standard</option>
                          <option value="300">300 – Light</option>
                          <option value="400">400 – Regular</option>
                          <option value="500">500 – Medium</option>
                          <option value="600">600 – Semibold</option>
                          <option value="700">700 – Bold</option>
                        </select>
                      </div>
                    </div>
                    {!hasTypography && <ProLockOverlay plan="business" />}
                  </div>
                );
              })}

              </div>
            </details>

            {/* PRESETS */}
            <details className="settings-section" style={{ border: '1px solid #e5e7eb', borderRadius: 18, background: '#f9fafb', display: 'block', position: 'relative' }}>
              <summary style={{ padding: '22px 28px', cursor: 'pointer', listStyle: 'none', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, WebkitUserSelect: 'none', userSelect: 'none' }}>
                <div>
                  <h2 style={sectionTitleStyle}>Design-Presets</h2>
                  <p style={sectionIntroStyle}>Aktuelle Branding-Einstellungen als Preset speichern und wiederverwenden. Max. 3 Stück.</p>
                </div>
                <span className="card-caret">▾</span>
              </summary>
              <div style={{ padding: '0 28px 26px', opacity: fullBranding ? 1 : 0.4 }}>
                {fullBranding
                  ? <SettingsPresets hotelId={selected.id} initialPresets={selected.settingsPresets} />
                  : <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>Noch keine Presets gespeichert.</p>
                }
              </div>
              {!fullBranding && <ProLockOverlay />}
            </details>

            {/* FEATURES */}
            <details className="settings-section" style={{ border: '1px solid #e5e7eb', borderRadius: 18, background: '#f9fafb', display: 'block' }}>
              <summary style={{ padding: '22px 28px', cursor: 'pointer', listStyle: 'none', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, WebkitUserSelect: 'none', userSelect: 'none' }}>
                <div>
                  <h2 style={sectionTitleStyle}>Features</h2>
                  <p style={sectionIntroStyle}>Verhalten und Umfang des Widgets pro Hotel steuern.</p>
                </div>
                <span className="card-caret">▾</span>
              </summary>
              <div style={{ padding: '0 28px 26px', display: 'grid', gap: 18 }}>
                <FeatureToggles
                  initialValues={{
                    showPrices: selected.settings?.showPrices ?? true,
                    showAmenities: selected.settings?.showAmenities ?? true,
                    showExtrasStep: selected.settings?.showExtrasStep ?? true,
                    showPhoneField: selected.settings?.showPhoneField ?? true,
                    showMessageField: selected.settings?.showMessageField ?? true,
                    enableImageSlider: selected.settings?.enableImageSlider ?? true,
                    enableInstantBooking: selected.settings?.enableInstantBooking ?? false,
                    hideRequestOption: selected.settings?.hideRequestOption ?? false,
                  }}
                />
              </div>
            </details>

            {/* ACTIONS */}
            <div style={{ ...actionRowStyle, justifyContent: 'flex-end' }}>
              <StandardButton hotelId={selected.id} style={secondaryButtonStyle} />

              <SaveButton />
            </div>

            {saved === '1' && (
              <div className="success-banner" style={{ padding: '12px 16px', background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: 10, fontSize: 14, color: '#16a34a' }}>
                Einstellungen gespeichert.
              </div>
            )}
          </form>

          {/* EMBED CODE */}
          <details id="embed-code" className="settings-section" style={{ border: '1px solid #e5e7eb', borderRadius: 18, background: '#f9fafb', display: 'block' }}>
            <summary style={{ padding: '22px 28px', cursor: 'pointer', listStyle: 'none', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, WebkitUserSelect: 'none', userSelect: 'none' }}>
              <div>
                <h2 style={sectionTitleStyle}>Embed-Code</h2>
                <p style={sectionIntroStyle}>
                  Diesen Code auf deiner Hotel-Website einfügen, z.&nbsp;B. auf der Seite &bdquo;Buchen&ldquo;. Verwende <code style={{ background: '#f1f5f9', padding: '1px 6px', borderRadius: 4, fontSize: 12 }}>data-lang="en"</code> für die englische Version.
                </p>
              </div>
              <span className="card-caret">▾</span>
            </summary>
            <div style={{ padding: '0 28px 26px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Deutsch</div>
                <EmbedCode
                  code={`<script src="https://${headerStore.get('host') || 'deine-domain.com'}/widget.js" data-hotel="${selected.slug}"></script>`}
                />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>English</div>
                <EmbedCode
                  code={`<script src="https://${headerStore.get('host') || 'deine-domain.com'}/widget.js" data-hotel="${selected.slug}" data-lang="en"></script>`}
                />
              </div>
            </div>
          </details>

          {/* MINI WIDGET */}
          <details className="settings-section" style={{ border: '1px solid #e5e7eb', borderRadius: 18, background: '#f9fafb', display: 'block' }}>
            <summary style={{ padding: '22px 28px', cursor: 'pointer', listStyle: 'none', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, WebkitUserSelect: 'none', userSelect: 'none' }}>
              <div>
                <h2 style={sectionTitleStyle}>Mini-Widget</h2>
                <p style={sectionIntroStyle}>
                  Kompakter Datepicker für Landing Pages — Gast wählt Datum und wird zum Buchungs-Widget weitergeleitet.
                </p>
              </div>
              <span className="card-caret">▾</span>
            </summary>
            <div style={{ padding: '0 28px 26px', display: 'grid', gap: 18 }}>
              <div>
                <label style={labelStyle}>Ziel-URL (wo das Buchungs-Widget eingebunden ist)</label>
                <input
                  name="miniWidgetTarget"
                  type="url"
                  defaultValue={selected.settings?.miniWidgetTarget ?? ''}
                  placeholder="https://deine-website.at/buchen"
                  style={{ ...inputStyle, marginTop: 8 }}
                />
                <p style={{ margin: '6px 0 0', fontSize: 12, color: '#9ca3af' }}>
                  Ohne Ziel-URL leiten Gäste auf bookingwulf.com/widget.html weiter.
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Embed-Code</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Deutsch</div>
                  <EmbedCode
                    code={`<script src="https://${headerStore.get('host') || 'bookingwulf.com'}/mini-widget.js" data-hotel="${selected.slug}"${selected.settings?.miniWidgetTarget ? ` data-target="${selected.settings.miniWidgetTarget}"` : ''}></script>`}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>English</div>
                  <EmbedCode
                    code={`<script src="https://${headerStore.get('host') || 'bookingwulf.com'}/mini-widget.js" data-hotel="${selected.slug}" data-lang="en"${selected.settings?.miniWidgetTarget ? ` data-target="${selected.settings.miniWidgetTarget}"` : ''}></script>`}
                  />
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Vorschau</div>
                <iframe
                  src={`/mini-widget.html?hotel=${encodeURIComponent(selected.slug)}`}
                  style={{ width: '100%', height: 180, border: '1px solid #e5e7eb', borderRadius: 12, background: '#fff', display: 'block' }}
                  scrolling="no"
                  title="Mini-Widget Vorschau"
                />
              </div>
            </div>
          </details>

          {/* Widget Configs */}
          <details className="settings-section" style={{ border: '1px solid #e5e7eb', borderRadius: 18, background: '#f9fafb', display: 'block', position: 'relative' }}>
            <summary style={{ padding: '22px 28px', cursor: 'pointer', listStyle: 'none', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, WebkitUserSelect: 'none', userSelect: 'none' }}>
              <div>
                <h2 style={sectionTitleStyle}>Widget-Konfigurationen</h2>
                <p style={sectionIntroStyle}>Erstelle eine weitere Variante des Widgets mit eigenen Einstellungen — z.B. eine für Anfragen, eine für Buchungen.</p>
              </div>
              <span className="card-caret">▾</span>
            </summary>
            <div style={{ padding: '0 28px 26px', opacity: hasPro ? 1 : 0.4 }}>
              {hasPro && (
                <WidgetConfigs
                  hotelId={selected.id}
                  hotelSlug={selected.slug}
                  configs={selected.widgetConfigs}
                  host={headerStore.get('host') || 'deine-domain.com'}
                />
              )}
            </div>
            {!hasPro && <ProLockOverlay />}
          </details>
        </div>

        {/* RIGHT PREVIEW */}
        <SettingsLivePreview />
        <div className="settings-preview" style={rightPanelStyle}>
          <h2 style={previewTitleStyle}>Live Preview</h2>
          <p style={previewSubStyle}>
            Vorschau des Widgets für {selected.name}.
          </p>

          <iframe
            key={selected.settings?.updatedAt?.toString() ?? 'default'}
            src={`/widget.html?hotel=${selected.slug}`}
            style={iframeStyle}
            className="settings-preview-iframe"
          />
        </div>
      </div>
    </main>
  );
}
