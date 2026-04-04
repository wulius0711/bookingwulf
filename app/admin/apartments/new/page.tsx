import { prisma } from '@/src/lib/prisma';
import { redirect } from 'next/navigation';

async function createApartment(formData: FormData) {
  'use server';

  const name = String(formData.get('name') || '').trim();
  const slug = String(formData.get('slug') || '').trim();
  const description = String(formData.get('description') || '').trim();
  const maxAdults = Number(formData.get('maxAdults') || 2);
  const maxChildren = Number(formData.get('maxChildren') || 0);
  const basePriceRaw = String(formData.get('basePrice') || '').trim();
  const cleaningFeeRaw = String(formData.get('cleaningFee') || '').trim();
  const sortOrder = Number(formData.get('sortOrder') || 0);
  const isActive = formData.get('isActive') === 'on';

  if (!name || !slug) {
    throw new Error('Name und Slug sind erforderlich.');
  }

  const basePrice = basePriceRaw ? Number(basePriceRaw) : null;
  const cleaningFee = cleaningFeeRaw ? Number(cleaningFeeRaw) : null;

  const imageUrls = formData.getAll('imageUrl').map((v) => String(v).trim());
  const altTexts = formData.getAll('altText').map((v) => String(v).trim());

  const cleanedImages = imageUrls
    .map((url, index) => ({
      imageUrl: url,
      altText: altTexts[index] || null,
      sortOrder: index,
    }))
    .filter((img) => img.imageUrl.length > 0);

  await prisma.apartment.create({
    data: {
      name,
      slug,
      description: description || null,
      maxAdults,
      maxChildren,
      basePrice,
      cleaningFee,
      sortOrder,
      isActive,
      images:
        cleanedImages.length > 0
          ? {
              create: cleanedImages,
            }
          : undefined,
    },
  });

  redirect('/admin/apartments');
}

const row: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '180px 1fr',
  alignItems: 'start',
  gap: 16,
};

const labelStyle: React.CSSProperties = {
  fontSize: 14,
  color: '#666',
  paddingTop: 10,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #ddd',
  borderRadius: 6,
  fontSize: 14,
};

const buttonStyle: React.CSSProperties = {
  marginTop: 20,
  padding: '12px 18px',
  borderRadius: 999,
  border: 'none',
  background: '#111',
  color: '#fff',
  cursor: 'pointer',
  width: 'fit-content',
};

export default function NewApartmentPage() {
  return (
    <main style={{ padding: 40, fontFamily: 'Arial', maxWidth: 900 }}>
      <h1 style={{ marginBottom: 30 }}>Neues Apartment</h1>

      <form action={createApartment} style={{ display: 'grid', gap: 18 }}>
        <div style={row}>
          <label style={labelStyle}>Name</label>
          <input name="name" required style={inputStyle} />
        </div>

        <div style={row}>
          <label style={labelStyle}>Slug</label>
          <input name="slug" required style={inputStyle} />
        </div>

        <div style={row}>
          <label style={labelStyle}>Beschreibung</label>
          <textarea
            name="description"
            style={{ ...inputStyle, minHeight: 100 }}
          />
        </div>

        <div style={row}>
          <label style={labelStyle}>Max. Erwachsene</label>
          <input
            type="number"
            name="maxAdults"
            defaultValue={2}
            style={inputStyle}
          />
        </div>

        <div style={row}>
          <label style={labelStyle}>Max. Kinder</label>
          <input
            type="number"
            name="maxChildren"
            defaultValue={0}
            style={inputStyle}
          />
        </div>

        <div style={row}>
          <label style={labelStyle}>Preis pro Nacht (€)</label>
          <input
            type="number"
            step="0.01"
            name="basePrice"
            style={inputStyle}
          />
        </div>

        <div style={row}>
          <label style={labelStyle}>Reinigungsgebühr (€)</label>
          <input
            type="number"
            step="0.01"
            name="cleaningFee"
            style={inputStyle}
          />
        </div>

        <div style={row}>
          <label style={labelStyle}>Sortierung</label>
          <input
            type="number"
            name="sortOrder"
            defaultValue={0}
            style={inputStyle}
          />
        </div>

        <div style={row}>
          <label style={labelStyle}>Bilder</label>
          <div style={{ display: 'grid', gap: 12 }}>
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <div
                key={index}
                style={{
                  border: '1px solid #eee',
                  borderRadius: 8,
                  padding: 12,
                  display: 'grid',
                  gap: 10,
                }}
              >
                <input
                  name="imageUrl"
                  placeholder={`Bild URL ${index + 1}`}
                  style={inputStyle}
                />
                <input
                  name="altText"
                  placeholder={`Alt Text ${index + 1}`}
                  style={inputStyle}
                />
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...row, alignItems: 'center' }}>
          <label style={labelStyle}>Status</label>
          <label
            style={{
              display: 'flex',
              gap: 8,
              alignItems: 'center',
              paddingTop: 8,
            }}
          >
            <input type="checkbox" name="isActive" defaultChecked />
            Aktiv
          </label>
        </div>

        <button type="submit" style={buttonStyle}>
          Speichern
        </button>
      </form>
    </main>
  );
}
