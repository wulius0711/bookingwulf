import { prisma } from '@/src/lib/prisma';
import { notFound, redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

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

export default async function EditApartmentPage({ params }: PageProps) {
  const { id } = await params;
  const apartmentId = parseInt(id, 10);

  if (!Number.isInteger(apartmentId)) {
    notFound();
  }

  const apartment = await prisma.apartment.findFirst({
    where: { id: apartmentId },
    include: {
      images: {
        orderBy: {
          sortOrder: 'asc',
        },
      },
    },
  });

  if (!apartment) {
    notFound();
  }

  async function updateApartment(formData: FormData) {
    'use server';

    const name = String(formData.get('name') || '').trim();
    const slug = String(formData.get('slug') || '').trim();
    const description = String(formData.get('description') || '').trim();
    const maxAdults = Number(formData.get('maxAdults') || 2);
    const maxChildren = Number(formData.get('maxChildren') || 0);

    const bedroomsRaw = String(formData.get('bedrooms') || '').trim();
    const sizeRaw = String(formData.get('size') || '').trim();
    const view = String(formData.get('view') || '').trim();
    const amenitiesRaw = String(formData.get('amenities') || '').trim();

    const basePriceRaw = String(formData.get('basePrice') || '').trim();
    const cleaningFeeRaw = String(formData.get('cleaningFee') || '').trim();
    const isActive = formData.get('isActive') === 'on';

    if (!name || !slug) {
      throw new Error('Name und Slug sind erforderlich.');
    }

    const bedrooms = bedroomsRaw ? Number(bedroomsRaw) : null;
    const size = sizeRaw ? Number(sizeRaw) : null;
    const basePrice = basePriceRaw ? Number(basePriceRaw) : null;
    const cleaningFee = cleaningFeeRaw ? Number(cleaningFeeRaw) : null;

    const amenities = amenitiesRaw
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    await prisma.apartment.update({
      where: { id: apartmentId },
      data: {
        name,
        slug,
        description: description || null,
        maxAdults,
        maxChildren,
        bedrooms,
        size,
        view: view || null,
        amenities,
        basePrice,
        cleaningFee,
        isActive,
      },
    });

    const imageUrls = formData.getAll('imageUrl').map((v) => String(v).trim());
    const altTexts = formData.getAll('altText').map((v) => String(v).trim());

    const cleanedImages = imageUrls
      .map((url, index) => ({
        imageUrl: url,
        altText: altTexts[index] || null,
        sortOrder: index,
      }))
      .filter((img) => img.imageUrl.length > 0);

    await prisma.apartmentImage.deleteMany({
      where: { apartmentId },
    });

    if (cleanedImages.length > 0) {
      await prisma.apartmentImage.createMany({
        data: cleanedImages.map((img) => ({
          apartmentId,
          imageUrl: img.imageUrl,
          altText: img.altText,
          sortOrder: img.sortOrder,
        })),
      });
    }

    redirect('/admin/apartments');
  }

  return (
    <main style={{ padding: 40, fontFamily: 'Arial', maxWidth: 900 }}>
      <h1 style={{ marginBottom: 30 }}>Apartment bearbeiten</h1>

      <form action={updateApartment} style={{ display: 'grid', gap: 18 }}>
        <div style={row}>
          <label style={labelStyle}>Name</label>
          <input
            name="name"
            defaultValue={apartment.name}
            style={inputStyle}
            required
          />
        </div>

        <div style={row}>
          <label style={labelStyle}>Slug</label>
          <input
            name="slug"
            defaultValue={apartment.slug}
            style={inputStyle}
            required
          />
        </div>

        <div style={row}>
          <label style={labelStyle}>Max. Erwachsene</label>
          <input
            type="number"
            name="maxAdults"
            defaultValue={apartment.maxAdults}
            style={inputStyle}
          />
        </div>

        <div style={row}>
          <label style={labelStyle}>Max. Kinder</label>
          <input
            type="number"
            name="maxChildren"
            defaultValue={apartment.maxChildren}
            style={inputStyle}
          />
        </div>

        <div style={row}>
          <label style={labelStyle}>Schlafzimmer</label>
          <input
            type="number"
            name="bedrooms"
            min="0"
            defaultValue={apartment.bedrooms ?? ''}
            style={inputStyle}
          />
        </div>

        <div style={row}>
          <label style={labelStyle}>Größe (m²)</label>
          <input
            type="number"
            name="size"
            min="0"
            defaultValue={apartment.size ?? ''}
            style={inputStyle}
          />
        </div>

        <div style={row}>
          <label style={labelStyle}>Ausblick</label>
          <input
            name="view"
            defaultValue={apartment.view ?? ''}
            placeholder="z. B. Bergblick"
            style={inputStyle}
          />
        </div>

        <div style={row}>
          <label style={labelStyle}>Ausstattung</label>
          <textarea
            name="amenities"
            defaultValue={(apartment.amenities || []).join(', ')}
            placeholder="z. B. WLAN, Balkon, Geschirrspüler, Kaffeemaschine"
            style={{ ...inputStyle, minHeight: 100 }}
          />
        </div>

        <div style={row}>
          <label style={labelStyle}>Beschreibung</label>
          <textarea
            name="description"
            defaultValue={apartment.description || ''}
            style={{ ...inputStyle, minHeight: 100 }}
          />
        </div>

        <div style={row}>
          <label style={labelStyle}>Preis pro Nacht (€)</label>
          <input
            type="number"
            step="0.01"
            name="basePrice"
            defaultValue={apartment.basePrice ?? ''}
            style={inputStyle}
          />
        </div>

        <div style={row}>
          <label style={labelStyle}>Reinigungsgebühr (€)</label>
          <input
            type="number"
            step="0.01"
            name="cleaningFee"
            defaultValue={apartment.cleaningFee ?? ''}
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
                  defaultValue={apartment.images[index]?.imageUrl || ''}
                  style={inputStyle}
                />
                <input
                  name="altText"
                  placeholder={`Alt Text ${index + 1}`}
                  defaultValue={apartment.images[index]?.altText || ''}
                  style={inputStyle}
                />
                {apartment.images[index]?.imageUrl && (
                  <img
                    src={apartment.images[index].imageUrl}
                    alt={apartment.images[index].altText || `Bild ${index + 1}`}
                    style={{
                      width: 220,
                      height: 140,
                      objectFit: 'cover',
                      borderRadius: 8,
                      border: '1px solid #eee',
                    }}
                  />
                )}
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
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={apartment.isActive}
            />
            Aktiv
          </label>
        </div>

        <button type="submit" style={buttonStyle}>
          Änderungen speichern
        </button>
      </form>
    </main>
  );
}
