import { prisma } from '@/src/lib/prisma';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

type SearchParams = Promise<{
  hotel?: string;
}>;

type PageProps = {
  searchParams: SearchParams;
};

async function saveHotelSettings(formData: FormData) {
  'use server';

  const hotelId = Number(formData.get('hotelId') || 0);

  if (!hotelId) {
    throw new Error('Hotel ist erforderlich.');
  }

  const showPrices = formData.get('showPrices') === 'on';
  const allowMultiSelect = formData.get('allowMultiSelect') === 'on';
  const showAmenities = formData.get('showAmenities') === 'on';
  const showExtrasStep = formData.get('showExtrasStep') === 'on';
  const showPhoneField = formData.get('showPhoneField') === 'on';
  const showMessageField = formData.get('showMessageField') === 'on';
  const enableImageSlider = formData.get('enableImageSlider') === 'on';
  const enableLightbox = formData.get('enableLightbox') === 'on';

  const accentColor = String(formData.get('accentColor') || '').trim();
  const backgroundColor = String(formData.get('backgroundColor') || '').trim();
  const cardBackground = String(formData.get('cardBackground') || '').trim();
  const textColor = String(formData.get('textColor') || '').trim();
  const mutedTextColor = String(formData.get('mutedTextColor') || '').trim();
  const borderColor = String(formData.get('borderColor') || '').trim();

  const cardRadiusRaw = String(formData.get('cardRadius') || '').trim();
  const buttonRadiusRaw = String(formData.get('buttonRadius') || '').trim();

  const cardRadius = cardRadiusRaw ? Number(cardRadiusRaw) : null;
  const buttonRadius = buttonRadiusRaw ? Number(buttonRadiusRaw) : null;

  await prisma.hotelSettings.upsert({
    where: { hotelId },
    update: {
      showPrices,
      allowMultiSelect,
      showAmenities,
      showExtrasStep,
      showPhoneField,
      showMessageField,
      enableImageSlider,
      enableLightbox,
      accentColor: accentColor || null,
      backgroundColor: backgroundColor || null,
      cardBackground: cardBackground || null,
      textColor: textColor || null,
      mutedTextColor: mutedTextColor || null,
      borderColor: borderColor || null,
      cardRadius,
      buttonRadius,
    },
    create: {
      hotelId,
      showPrices,
      allowMultiSelect,
      showAmenities,
      showExtrasStep,
      showPhoneField,
      showMessageField,
      enableImageSlider,
      enableLightbox,
      accentColor: accentColor || null,
      backgroundColor: backgroundColor || null,
      cardBackground: cardBackground || null,
      textColor: textColor || null,
      mutedTextColor: mutedTextColor || null,
      borderColor: borderColor || null,
      cardRadius,
      buttonRadius,
    },
  });

  redirect(`/admin/settings?hotel=${hotelId}`);
}

const sectionStyle: React.CSSProperties = {
  border: '1px solid #ddd',
  borderRadius: 14,
  padding: 20,
  background: '#fff',
  display: 'grid',
  gap: 16,
};

const row: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '220px 1fr',
  alignItems: 'start',
  gap: 16,
};

const labelStyle: React.CSSProperties = {
  fontSize: 14,
  color: '#555',
  paddingTop: 10,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #ddd',
  borderRadius: 8,
  fontSize: 14,
  background: '#fff',
};

const checkboxWrap: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  minHeight: 40,
};

const buttonStyle: React.CSSProperties = {
  marginTop: 8,
  padding: '12px 18px',
  borderRadius: 999,
  border: 'none',
  background: '#111',
  color: '#fff',
  cursor: 'pointer',
  width: 'fit-content',
};

export default async function AdminSettingsPage({ searchParams }: PageProps) {
  const { hotel } = await searchParams;

  const hotels = await prisma.hotel.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });

  const selectedHotelId =
    hotel && !Number.isNaN(Number(hotel))
      ? Number(hotel)
      : hotels[0]?.id || null;

  const selectedHotel = selectedHotelId
    ? await prisma.hotel.findUnique({
        where: { id: selectedHotelId },
        include: {
          settings: true,
        },
      })
    : null;

  return (
    <main
      style={{ padding: 40, fontFamily: 'Arial, sans-serif', maxWidth: 980 }}
    >
      <h1 style={{ marginBottom: 24 }}>Hotel Settings</h1>

      {hotels.length === 0 ? (
        <p>Keine Hotels vorhanden.</p>
      ) : (
        <>
          <form method="GET" style={{ marginBottom: 24 }}>
            <div
              style={{
                display: 'flex',
                gap: 12,
                alignItems: 'end',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'grid', gap: 8 }}>
                <label style={{ fontSize: 13, color: '#666' }}>
                  Hotel auswählen
                </label>
                <select
                  name="hotel"
                  defaultValue={String(selectedHotelId || '')}
                  style={{ ...inputStyle, minWidth: 260 }}
                >
                  {hotels.map((hotelItem) => (
                    <option key={hotelItem.id} value={hotelItem.id}>
                      {hotelItem.name} ({hotelItem.slug})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                style={{
                  padding: '12px 16px',
                  borderRadius: 999,
                  border: '1px solid #111',
                  background: '#111',
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                Laden
              </button>
            </div>
          </form>

          {selectedHotel ? (
            <form
              action={saveHotelSettings}
              style={{ display: 'grid', gap: 20 }}
            >
              <input type="hidden" name="hotelId" value={selectedHotel.id} />

              <div style={sectionStyle}>
                <h2 style={{ margin: 0, fontSize: 20 }}>
                  Allgemein – {selectedHotel.name}
                </h2>

                <div style={row}>
                  <label style={labelStyle}>Accent Color</label>
                  <input
                    name="accentColor"
                    defaultValue={selectedHotel.settings?.accentColor || ''}
                    placeholder="#CBA135"
                    style={inputStyle}
                  />
                </div>

                <div style={row}>
                  <label style={labelStyle}>Background App</label>
                  <input
                    name="backgroundColor"
                    defaultValue={selectedHotel.settings?.backgroundColor || ''}
                    placeholder="#FAEBD7"
                    style={inputStyle}
                  />
                </div>

                <div style={row}>
                  <label style={labelStyle}>Background Cards</label>
                  <input
                    name="cardBackground"
                    defaultValue={selectedHotel.settings?.cardBackground || ''}
                    placeholder="#FFFFFF"
                    style={inputStyle}
                  />
                </div>

                <div style={row}>
                  <label style={labelStyle}>Text Color</label>
                  <input
                    name="textColor"
                    defaultValue={selectedHotel.settings?.textColor || ''}
                    placeholder="#111111"
                    style={inputStyle}
                  />
                </div>

                <div style={row}>
                  <label style={labelStyle}>Muted Text Color</label>
                  <input
                    name="mutedTextColor"
                    defaultValue={selectedHotel.settings?.mutedTextColor || ''}
                    placeholder="#666666"
                    style={inputStyle}
                  />
                </div>

                <div style={row}>
                  <label style={labelStyle}>Border Color</label>
                  <input
                    name="borderColor"
                    defaultValue={selectedHotel.settings?.borderColor || ''}
                    placeholder="#DDDDDD"
                    style={inputStyle}
                  />
                </div>

                <div style={row}>
                  <label style={labelStyle}>Card Radius</label>
                  <input
                    type="number"
                    name="cardRadius"
                    defaultValue={selectedHotel.settings?.cardRadius ?? ''}
                    placeholder="12"
                    style={inputStyle}
                  />
                </div>

                <div style={row}>
                  <label style={labelStyle}>Button Radius</label>
                  <input
                    type="number"
                    name="buttonRadius"
                    defaultValue={selectedHotel.settings?.buttonRadius ?? ''}
                    placeholder="999"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={sectionStyle}>
                <h2 style={{ margin: 0, fontSize: 20 }}>Feature Toggles</h2>

                <div style={row}>
                  <label style={labelStyle}>Preise anzeigen</label>
                  <label style={checkboxWrap}>
                    <input
                      type="checkbox"
                      name="showPrices"
                      defaultChecked={
                        selectedHotel.settings?.showPrices ?? true
                      }
                    />
                    Aktiv
                  </label>
                </div>

                <div style={row}>
                  <label style={labelStyle}>Multi Select erlauben</label>
                  <label style={checkboxWrap}>
                    <input
                      type="checkbox"
                      name="allowMultiSelect"
                      defaultChecked={
                        selectedHotel.settings?.allowMultiSelect ?? false
                      }
                    />
                    Aktiv
                  </label>
                </div>

                <div style={row}>
                  <label style={labelStyle}>Ausstattung anzeigen</label>
                  <label style={checkboxWrap}>
                    <input
                      type="checkbox"
                      name="showAmenities"
                      defaultChecked={
                        selectedHotel.settings?.showAmenities ?? true
                      }
                    />
                    Aktiv
                  </label>
                </div>

                <div style={row}>
                  <label style={labelStyle}>Extras Step anzeigen</label>
                  <label style={checkboxWrap}>
                    <input
                      type="checkbox"
                      name="showExtrasStep"
                      defaultChecked={
                        selectedHotel.settings?.showExtrasStep ?? true
                      }
                    />
                    Aktiv
                  </label>
                </div>

                <div style={row}>
                  <label style={labelStyle}>Telefonfeld anzeigen</label>
                  <label style={checkboxWrap}>
                    <input
                      type="checkbox"
                      name="showPhoneField"
                      defaultChecked={
                        selectedHotel.settings?.showPhoneField ?? true
                      }
                    />
                    Aktiv
                  </label>
                </div>

                <div style={row}>
                  <label style={labelStyle}>Mitteilungsfeld anzeigen</label>
                  <label style={checkboxWrap}>
                    <input
                      type="checkbox"
                      name="showMessageField"
                      defaultChecked={
                        selectedHotel.settings?.showMessageField ?? true
                      }
                    />
                    Aktiv
                  </label>
                </div>

                <div style={row}>
                  <label style={labelStyle}>Image Slider aktivieren</label>
                  <label style={checkboxWrap}>
                    <input
                      type="checkbox"
                      name="enableImageSlider"
                      defaultChecked={
                        selectedHotel.settings?.enableImageSlider ?? true
                      }
                    />
                    Aktiv
                  </label>
                </div>

                <div style={row}>
                  <label style={labelStyle}>Lightbox aktivieren</label>
                  <label style={checkboxWrap}>
                    <input
                      type="checkbox"
                      name="enableLightbox"
                      defaultChecked={
                        selectedHotel.settings?.enableLightbox ?? true
                      }
                    />
                    Aktiv
                  </label>
                </div>
              </div>

              <button type="submit" style={buttonStyle}>
                Settings speichern
              </button>
            </form>
          ) : null}
        </>
      )}
    </main>
  );
}
