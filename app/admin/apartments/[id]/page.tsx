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
  alignItems: 'center',
  gap: 16,
};

const labelStyle: React.CSSProperties = {
  fontSize: 14,
  color: '#666',
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
    const basePriceRaw = String(formData.get('basePrice') || '').trim();
    const cleaningFeeRaw = String(formData.get('cleaningFee') || '').trim();
    const imageUrl = String(formData.get('imageUrl') || '').trim();
    const altText = String(formData.get('altText') || '').trim();
    const isActive = formData.get('isActive') === 'on';

    if (!name || !slug) {
      throw new Error('Name und Slug sind erforderlich.');
    }

    const basePrice = basePriceRaw ? Number(basePriceRaw) : null;
    const cleaningFee = cleaningFeeRaw ? Number(cleaningFeeRaw) : null;

    await prisma.apartment.update({
      where: { id: apartmentId },
      data: {
        name,
        slug,
        description: description || null,
        maxAdults,
        maxChildren,
        basePrice,
        cleaningFee,
        isActive,
      },
    });

    const currentImage = await prisma.apartmentImage.findFirst({
      where: { apartmentId },
      orderBy: { sortOrder: 'asc' },
    });

    if (imageUrl && currentImage) {
      await prisma.apartmentImage.update({
        where: { id: currentImage.id },
        data: {
          imageUrl,
          altText: altText || null,
        },
      });
    } else if (imageUrl && !currentImage) {
      await prisma.apartmentImage.create({
        data: {
          apartmentId,
          imageUrl,
          altText: altText || null,
          sortOrder: 0,
        },
      });
    } else if (!imageUrl && currentImage) {
      await prisma.apartmentImage.delete({
        where: { id: currentImage.id },
      });
    }

    redirect('/admin/apartments');
  }

  return (
    <main style={{ padding: 40, fontFamily: 'Arial', maxWidth: 800 }}>
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
          <label style={labelStyle}>Beschreibung</label>
          <textarea
            name="description"
            defaultValue={apartment.description || ''}
            style={{ ...inputStyle, minHeight: 100 }}
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
          <label style={labelStyle}>Bild URL</label>
          <input
            name="imageUrl"
            defaultValue={apartment.images[0]?.imageUrl || ''}
            style={inputStyle}
          />
        </div>

        <div style={row}>
          <label style={labelStyle}>Alt Text</label>
          <input
            name="altText"
            defaultValue={apartment.images[0]?.altText || ''}
            style={inputStyle}
          />
        </div>

        <div style={{ ...row, alignItems: 'center' }}>
          <label style={labelStyle}>Status</label>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
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
