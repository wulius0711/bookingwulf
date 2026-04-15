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

  const cardRadius = Number(formData.get('cardRadius') || 0) || null;
  const buttonRadius = Number(formData.get('buttonRadius') || 0) || null;

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
  gap: 16,
};

const labelStyle: React.CSSProperties = {
  fontSize: 14,
  color: '#555',
  paddingTop: 10,
};

const inputStyle: React.CSSProperties = {
  padding: '10px 12px',
  border: '1px solid #ddd',
  borderRadius: 8,
  fontSize: 14,
};

export default async function AdminSettingsPage({ searchParams }: PageProps) {
  const { hotel } = await searchParams;

  const hotels = await prisma.hotel.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
    select: { id: true, name: true, slug: true },
  });

  const selectedHotelId =
    hotel && !Number.isNaN(Number(hotel))
      ? Number(hotel)
      : hotels[0]?.id || null;

  const selectedHotel = selectedHotelId
    ? await prisma.hotel.findUnique({
        where: { id: selectedHotelId },
        include: { settings: true },
      })
    : null;

  const widgetUrl = selectedHotel ? `/?hotel=${selectedHotel.slug}` : '/';

  return (
    <main
      style={{
        padding: 40,
        fontFamily: 'Arial',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 30,
      }}
    >
      {/* LEFT: SETTINGS */}
      <div>
        <h1>Hotel Settings</h1>

        {selectedHotel && (
          <form action={saveHotelSettings} style={{ display: 'grid', gap: 20 }}>
            <input type="hidden" name="hotelId" value={selectedHotel.id} />

            <div style={sectionStyle}>
              <h2>Design</h2>

              {[
                ['Accent', 'accentColor'],
                ['Background', 'backgroundColor'],
                ['Card', 'cardBackground'],
                ['Text', 'textColor'],
                ['Muted', 'mutedTextColor'],
                ['Border', 'borderColor'],
              ].map(([label, key]) => {
                const value =
                  (selectedHotel.settings as any)?.[key] || '#cccccc';

                return (
                  <div style={row} key={key}>
                    <label style={labelStyle}>{label}</label>

                    <div style={{ display: 'flex', gap: 10 }}>
                      <input type="color" defaultValue={value} />
                      <input
                        name={key}
                        defaultValue={value}
                        style={{ ...inputStyle, width: 120 }}
                      />
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          background: value,
                          border: '1px solid #ccc',
                        }}
                      />
                    </div>
                  </div>
                );
              })}

              <div style={row}>
                <label style={labelStyle}>Card Radius</label>
                <input
                  type="number"
                  name="cardRadius"
                  defaultValue={selectedHotel.settings?.cardRadius ?? ''}
                  style={inputStyle}
                />
              </div>

              <div style={row}>
                <label style={labelStyle}>Button Radius</label>
                <input
                  type="number"
                  name="buttonRadius"
                  defaultValue={selectedHotel.settings?.buttonRadius ?? ''}
                  style={inputStyle}
                />
              </div>
            </div>

            <button
              type="submit"
              style={{
                padding: 14,
                borderRadius: 999,
                background: '#111',
                color: '#fff',
              }}
            >
              Speichern
            </button>
          </form>
        )}
      </div>

      {/* RIGHT: LIVE PREVIEW */}
      <div>
        <h2>Live Preview</h2>

        <iframe
          src={widgetUrl}
          style={{
            width: '100%',
            height: 900,
            border: '1px solid #ddd',
            borderRadius: 12,
            background: '#fff',
          }}
        />
      </div>
    </main>
  );
}
