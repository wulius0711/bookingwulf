import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import { saveGuestPortalSettings } from './actions';
import EmergencyNumbersEditor from '../settings/EmergencyNumbersEditor';
import SaveButton from '../components/SaveButton';
import ThingsToSeeManager from '../things-to-see/ThingsToSeeManager';
import CheckinImageManager from '../components/CheckinImageManager';

export const dynamic = 'force-dynamic';

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '11px 12px',
  border: '1px solid var(--border)',
  borderRadius: 10,
  fontSize: 14,
  background: 'var(--surface)',
  color: 'var(--text-primary)',
  outline: 'none',
};

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  color: 'var(--text-muted)',
  fontWeight: 700,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
};

const rowStyle: React.CSSProperties = { gap: 18 };

const sectionTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 20,
  lineHeight: 1.15,
  color: 'var(--text-primary)',
  letterSpacing: '-0.02em',
};

const sectionIntroStyle: React.CSSProperties = {
  margin: '4px 0 0',
  fontSize: 14,
  lineHeight: 1.5,
  color: 'var(--text-secondary)',
};

const caretSvg = (
  <span className="card-caret">
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </span>
);

export default async function GuestPortalSettingsPage() {
  const session = await verifySession();
  const isSuperAdmin = session.hotelId === null;

  const hotels = isSuperAdmin
    ? await prisma.hotel.findMany({ where: { isActive: true }, orderBy: { name: 'asc' }, select: { id: true, name: true } })
    : await prisma.hotel.findMany({ where: { id: session.hotelId!, isActive: true }, select: { id: true, name: true } });

  const selected = hotels[0]
    ? await prisma.hotel.findUnique({
        where: { id: hotels[0].id },
        select: { id: true, phone: true, settings: { select: { whatsappNumber: true, address: true, checkinTime: true, checkinInfo: true, checkoutInfo: true, wifiSsid: true, wifiPassword: true, parkingInfo: true, wasteInfo: true, houseRules: true, emergencyJson: true } } },
      })
    : null;

  if (!selected) return <p>Kein Hotel</p>;

  const [thingsToSee, apartments, checkinImages] = await Promise.all([
    prisma.thingsToSee.findMany({
      where: { hotelId: selected.id },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    }),
    prisma.apartment.findMany({
      where: { hotelId: selected.id },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
    prisma.checkinImage.findMany({
      where: { hotelId: selected.id, apartmentId: null },
      select: { id: true, imageUrl: true, caption: true, sortOrder: true },
      orderBy: { sortOrder: 'asc' },
    }),
  ]);

  return (
    <main className="admin-page" style={{ minHeight: '100vh', background: 'var(--page-bg)', fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>
      <div style={{ maxWidth: 800, display: 'grid', gap: 24 }}>

        <div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 600, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>Gäste-Lounge</h1>
          <p style={{ margin: '6px 0 0', fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Die Gäste-Lounge ist eine persönliche Webseite für Ihre Gäste — erreichbar über einen individuellen Link, der automatisch in der Buchungsbestätigung mitgeschickt wird. Dort finden Gäste alles Wichtige auf einen Blick: Ihre Kontaktdaten, WLAN-Zugangsdaten, Parkplatz- und Hausinfos sowie Tipps zur Umgebung.
          </p>
          <div style={{ marginTop: 12, padding: '10px 14px', background: 'var(--status-new-bg)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13, color: 'var(--status-new-text)', lineHeight: 1.5 }}>
            Die Gäste-Lounge funktioniert auch offline — Gäste können sie nach dem ersten Öffnen ohne Internetverbindung nutzen.
          </div>
        </div>

        <form action={saveGuestPortalSettings} style={{ display: 'grid', gap: 16 }}>
          <input type="hidden" name="hotelId" value={selected.id} />

          {/* KONTAKT */}
          <details className="settings-section" style={{ border: '1px solid var(--border)', borderRadius: 18, background: 'var(--surface-2)', display: 'block' }}>
            <summary style={{ padding: '22px 28px', cursor: 'pointer', listStyle: 'none', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, WebkitUserSelect: 'none', userSelect: 'none' }}>
              <div>
                <h2 style={sectionTitleStyle}>Kontakt & Erreichbarkeit</h2>
                <p style={sectionIntroStyle}>Werden in der Gäste-Lounge als Kontaktmöglichkeiten angezeigt.</p>
              </div>
              {caretSvg}
            </summary>
            <div style={{ padding: '0 28px 26px', display: 'grid', gap: 18 }}>
              <div className="settings-row" style={rowStyle}>
                <label style={labelStyle}>Telefonnummer</label>
                <input name="phone" type="tel" defaultValue={selected.phone ?? ''} placeholder="z. B. +43 512 123456" style={inputStyle} />
              </div>
              <div className="settings-row" style={rowStyle}>
                <label style={labelStyle}>
                  WhatsApp-Nummer
                  <span style={{ fontWeight: 400, color: 'var(--text-disabled)', marginLeft: 6 }}>(optional)</span>
                </label>
                <input name="whatsappNumber" type="tel" defaultValue={selected.settings?.whatsappNumber ?? ''} placeholder="z. B. +43512123456" style={inputStyle} />
              </div>
              <div className="settings-row" style={rowStyle}>
                <label style={labelStyle}>
                  Adresse
                  <span style={{ fontWeight: 400, color: 'var(--text-disabled)', marginLeft: 6 }}>(für Anreise-Button)</span>
                </label>
                <input name="address" type="text" defaultValue={selected.settings?.address ?? ''} placeholder="z. B. Musterstraße 1, 6020 Innsbruck" style={inputStyle} />
              </div>
            </div>
          </details>

          {/* ANREISE */}
          <details className="settings-section" style={{ border: '1px solid var(--border)', borderRadius: 18, background: 'var(--surface-2)', display: 'block' }}>
            <summary style={{ padding: '22px 28px', cursor: 'pointer', listStyle: 'none', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, WebkitUserSelect: 'none', userSelect: 'none' }}>
              <div>
                <h2 style={sectionTitleStyle}>Anreise</h2>
                <p style={sectionIntroStyle}>Check-in Zeit und Hinweise zur Schlüsselübergabe — erscheinen in der Gäste-Lounge unter dem Tab „Anreise".</p>
              </div>
              {caretSvg}
            </summary>
            <div style={{ padding: '0 28px 26px', display: 'grid', gap: 18 }}>
              <div className="settings-row" style={rowStyle}>
                <label style={labelStyle}>Check-in Zeit</label>
                <input name="checkinTime" type="text" defaultValue={selected.settings?.checkinTime ?? ''} placeholder="z. B. ab 15:00 Uhr" style={inputStyle} />
              </div>
              <div className="settings-row" style={rowStyle}>
                <label style={labelStyle}>
                  Schlüsselübergabe / Anreise-Info
                  <span style={{ fontWeight: 400, color: 'var(--text-disabled)', marginLeft: 6 }}>(optional)</span>
                </label>
                <textarea name="checkinInfo" rows={4} defaultValue={selected.settings?.checkinInfo ?? ''} placeholder="z. B. Der Schlüssel liegt in der Schlüsselbox beim Eingang. Code wird 24h vor Anreise per E-Mail zugeschickt." style={{ ...inputStyle, resize: 'vertical' } as React.CSSProperties} />
              </div>
              <div className="settings-row" style={rowStyle}>
                <label style={labelStyle}>Check-in Fotos</label>
                <CheckinImageManager
                  hotelId={selected.id}
                  initialImages={checkinImages}
                />
              </div>
            </div>
          </details>

          {/* ABREISE */}
          <details className="settings-section" style={{ border: '1px solid var(--border)', borderRadius: 18, background: 'var(--surface-2)', display: 'block' }}>
            <summary style={{ padding: '22px 28px', cursor: 'pointer', listStyle: 'none', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, WebkitUserSelect: 'none', userSelect: 'none' }}>
              <div>
                <h2 style={sectionTitleStyle}>Abreise</h2>
                <p style={sectionIntroStyle}>Hinweise zur Abreise — erscheinen in der Gäste-Lounge unter dem Tab „Abreise".</p>
              </div>
              {caretSvg}
            </summary>
            <div style={{ padding: '0 28px 26px', display: 'grid', gap: 18 }}>
              <div className="settings-row" style={rowStyle}>
                <label style={labelStyle}>
                  Abreise-Info
                  <span style={{ fontWeight: 400, color: 'var(--text-disabled)', marginLeft: 6 }}>(optional)</span>
                </label>
                <textarea name="checkoutInfo" rows={4} defaultValue={selected.settings?.checkoutInfo ?? ''} placeholder="z. B. Bitte hinterlassen Sie die Schlüssel im Schlüsselfach neben der Eingangstür. Kein Auschecken an der Rezeption nötig." style={{ ...inputStyle, resize: 'vertical' } as React.CSSProperties} />
              </div>
            </div>
          </details>

          {/* HAUSINFOS */}
          <details className="settings-section" style={{ border: '1px solid var(--border)', borderRadius: 18, background: 'var(--surface-2)', display: 'block' }}>
            <summary style={{ padding: '22px 28px', cursor: 'pointer', listStyle: 'none', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, WebkitUserSelect: 'none', userSelect: 'none' }}>
              <div>
                <h2 style={sectionTitleStyle}>Hausinfos / Gästemappe</h2>
                <p style={sectionIntroStyle}>WLAN, Parkplatz, Hausordnung und Notfallnummern — einmal einpflegen, immer in der Gäste-Lounge verfügbar.</p>
              </div>
              {caretSvg}
            </summary>
            <div style={{ padding: '0 28px 26px', display: 'grid', gap: 18 }}>
              <div className="settings-row" style={rowStyle}>
                <label style={labelStyle}>WLAN-Name (SSID)</label>
                <input name="wifiSsid" type="text" defaultValue={selected.settings?.wifiSsid ?? ''} placeholder="z. B. HotelGast" style={inputStyle} />
              </div>
              <div className="settings-row" style={rowStyle}>
                <label style={labelStyle}>WLAN-Passwort</label>
                <input name="wifiPassword" type="text" defaultValue={selected.settings?.wifiPassword ?? ''} placeholder="z. B. Willkommen2024!" style={inputStyle} />
              </div>
              <div className="settings-row" style={rowStyle}>
                <label style={labelStyle}>Parkplatz</label>
                <textarea name="parkingInfo" rows={3} defaultValue={selected.settings?.parkingInfo ?? ''} placeholder="z. B. Kostenloser Parkplatz direkt vor dem Hotel, Einfahrt links neben dem Eingang." style={{ ...inputStyle, resize: 'vertical' } as React.CSSProperties} />
              </div>
              <div className="settings-row" style={rowStyle}>
                <label style={labelStyle}>Müllentsorgung</label>
                <textarea name="wasteInfo" rows={3} defaultValue={selected.settings?.wasteInfo ?? ''} placeholder="z. B. Restmüll: gelbe Tonne neben dem Eingang. Glas: Container 50m links." style={{ ...inputStyle, resize: 'vertical' } as React.CSSProperties} />
              </div>
              <div className="settings-row" style={rowStyle}>
                <div>
                  <label style={labelStyle}>Hausordnung</label>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4, marginBottom: 6 }}>
                    ℹ️ Wird auch beim Online Check-in angezeigt — der Gast muss sie dort bestätigen.
                  </div>
                </div>
                <textarea name="houseRules" rows={5} defaultValue={selected.settings?.houseRules ?? ''} placeholder="z. B. Ruhezeiten 22–7 Uhr. Rauchen nur im Außenbereich. Haustiere auf Anfrage." style={{ ...inputStyle, resize: 'vertical' } as React.CSSProperties} />
              </div>
              <div className="settings-row" style={rowStyle}>
                <label style={labelStyle}>Notfallnummern</label>
                <EmergencyNumbersEditor initialJson={selected.settings?.emergencyJson ?? []} />
              </div>
            </div>
          </details>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <SaveButton label="Speichern" />
          </div>
        </form>

        {/* UMGEBUNG */}
        <details className="settings-section" style={{ border: '1px solid var(--border)', borderRadius: 18, background: 'var(--surface-2)', display: 'block' }}>
          <summary style={{ padding: '22px 28px', cursor: 'pointer', listStyle: 'none', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, WebkitUserSelect: 'none', userSelect: 'none' }}>
            <div>
              <h2 style={sectionTitleStyle}>Umgebung</h2>
              <p style={sectionIntroStyle}>Restaurants, Aktivitäten und Events — erscheinen in der Gäste-Lounge unter dem Tab „Umgebung".</p>
            </div>
            {caretSvg}
          </summary>
          <div style={{ padding: '0 28px 26px' }}>
            <ThingsToSeeManager
              hotelId={selected.id}
              initialItems={thingsToSee.map((i) => ({
                ...i,
                createdAt: i.createdAt.toISOString(),
                updatedAt: i.updatedAt.toISOString(),
              }))}
              apartments={apartments}
            />
          </div>
        </details>

      </div>
    </main>
  );
}
