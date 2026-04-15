import { prisma } from '@/src/lib/prisma';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

type SearchParams = Promise<{ hotel?: string }>;
type PageProps = { searchParams: SearchParams };

async function saveHotelSettings(formData: FormData) {
  'use server';

  const hotelId = Number(formData.get('hotelId') || 0);

  if (!hotelId) throw new Error('Hotel fehlt');

  const getBool = (name: string) => formData.get(name) === 'on';

  await prisma.hotelSettings.upsert({
    where: { hotelId },
    update: {
      showPrices: getBool('showPrices'),
      allowMultiSelect: getBool('allowMultiSelect'),
      showAmenities: getBool('showAmenities'),
      showExtrasStep: getBool('showExtrasStep'),
      showPhoneField: getBool('showPhoneField'),
      showMessageField: getBool('showMessageField'),
      enableImageSlider: getBool('enableImageSlider'),
      enableLightbox: getBool('enableLightbox'),

      accentColor: String(formData.get('accentColor') || '') || null,
      backgroundColor: String(formData.get('backgroundColor') || '') || null,
      cardBackground: String(formData.get('cardBackground') || '') || null,
      textColor: String(formData.get('textColor') || '') || null,
      mutedTextColor: String(formData.get('mutedTextColor') || '') || null,
      borderColor: String(formData.get('borderColor') || '') || null,

      cardRadius: Number(formData.get('cardRadius') || 0) || null,
      buttonRadius: Number(formData.get('buttonRadius') || 0) || null,
    },
    create: {
      hotelId,
      showPrices: getBool('showPrices'),
      allowMultiSelect: getBool('allowMultiSelect'),
      showAmenities: getBool('showAmenities'),
      showExtrasStep: getBool('showExtrasStep'),
      showPhoneField: getBool('showPhoneField'),
      showMessageField: getBool('showMessageField'),
      enableImageSlider: getBool('enableImageSlider'),
      enableLightbox: getBool('enableLightbox'),

      accentColor: String(formData.get('accentColor') || '') || null,
      backgroundColor: String(formData.get('backgroundColor') || '') || null,
      cardBackground: String(formData.get('cardBackground') || '') || null,
      textColor: String(formData.get('textColor') || '') || null,
      mutedTextColor: String(formData.get('mutedTextColor') || '') || null,
      borderColor: String(formData.get('borderColor') || '') || null,

      cardRadius: Number(formData.get('cardRadius') || 0) || null,
      buttonRadius: Number(formData.get('buttonRadius') || 0) || null,
    },
  });

  redirect(`/admin/settings?hotel=${hotelId}`);
}

/* ---------- STYLES ---------- */

const section = {
  border: '1px solid #ddd',
  borderRadius: 14,
  padding: 20,
  background: '#fff',
  display: 'grid',
  gap: 16,
};

const row = {
  display: 'grid',
  gridTemplateColumns: '220px 1fr',
  gap: 16,
};

const input = {
  padding: '10px 12px',
  border: '1px solid #ddd',
  borderRadius: 8,
  fontSize: 14,
  background: '#fff',
  color: '#111',
};

const button = {
  padding: '10px 16px',
  borderRadius: 999,
  background: '#111',
  color: '#fff',
  border: '1px solid #fff',
  cursor: 'pointer',
  fontSize: 14,
};

const buttonGhost = {
  padding: '10px 16px',
  borderRadius: 999,
  background: '#fff',
  color: '#111',
  border: '1px solid #ddd',
  cursor: 'pointer',
  fontSize: 14,
};

/* ---------- PAGE ---------- */

export default async function Page({ searchParams }: PageProps) {
  const { hotel } = await searchParams;

  const hotels = await prisma.hotel.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });

  const selectedId =
    hotel && !Number.isNaN(Number(hotel)) ? Number(hotel) : hotels[0]?.id;

  const selected = await prisma.hotel.findUnique({
    where: { id: selectedId },
    include: { settings: true },
  });

  if (!selected) return <p>Kein Hotel</p>;

  return (
    <main
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 40,
        padding: 40,
      }}
    >
      {/* LEFT */}
      <div>
        <h1>Hotel Settings</h1>

        <form action={saveHotelSettings} style={{ display: 'grid', gap: 20 }}>
          <input type="hidden" name="hotelId" value={selected.id} />

          {/* DESIGN */}
          <div style={section}>
            <h2>Design</h2>

            {[
              ['Accent', 'accentColor'],
              ['Background', 'backgroundColor'],
              ['Card', 'cardBackground'],
              ['Text', 'textColor'],
              ['Muted', 'mutedTextColor'],
              ['Border', 'borderColor'],
            ].map(([label, key]) => {
              const val = (selected.settings as any)?.[key] || '#ccc';

              return (
                <div style={row} key={key}>
                  <label>{label}</label>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <input type="color" defaultValue={val} />
                    <input
                      name={key}
                      defaultValue={val}
                      style={{ ...input, width: 120 }}
                    />
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        background: val,
                        border: '1px solid #ccc',
                      }}
                    />
                  </div>
                </div>
              );
            })}

            <div style={row}>
              <label>Card Radius</label>
              <input
                name="cardRadius"
                defaultValue={selected.settings?.cardRadius ?? ''}
                style={input}
              />
            </div>

            <div style={row}>
              <label>Button Radius</label>
              <input
                name="buttonRadius"
                defaultValue={selected.settings?.buttonRadius ?? ''}
                style={input}
              />
            </div>
          </div>

          {/* FEATURES */}
          <div style={section}>
            <h2>Features</h2>

            {[
              ['showPrices', 'Preise anzeigen'],
              ['allowMultiSelect', 'Multi Select'],
              ['showAmenities', 'Ausstattung'],
              ['showExtrasStep', 'Extras Step'],
              ['showPhoneField', 'Telefonfeld'],
              ['showMessageField', 'Nachricht'],
              ['enableImageSlider', 'Image Slider'],
              ['enableLightbox', 'Lightbox'],
            ].map(([key, label]) => (
              <label key={key} style={{ display: 'flex', gap: 10 }}>
                <input
                  type="checkbox"
                  name={key}
                  defaultChecked={(selected.settings as any)?.[key] ?? true}
                />
                {label}
              </label>
            ))}
          </div>

          {/* ACTIONS */}
          <div style={{ display: 'flex', gap: 12 }}>
            <button type="submit" style={button}>
              Speichern
            </button>

            <a
              href={`/admin/settings?hotel=${selected.id}`}
              style={buttonGhost}
            >
              Reset
            </a>
          </div>
        </form>
      </div>

      {/* RIGHT PREVIEW */}
      <div>
        <h2>Live Preview</h2>

        <iframe
          src={`/?hotel=${selected.slug}`}
          style={{
            width: '100%',
            height: 900,
            border: '1px solid #ddd',
            borderRadius: 12,
          }}
        />
      </div>
    </main>
  );
}
