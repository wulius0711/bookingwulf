import { prisma } from '@/src/lib/prisma';
import { notFound, redirect } from 'next/navigation';

type PageProps = {
  params: {
    id: string;
  };
};

export default async function EditApartmentPage({ params }: PageProps) {
  const apartmentId = Number(params.id);

  if (!Number.isFinite(apartmentId)) {
    notFound();
  }

  const apartment = await prisma.apartment.findUnique({
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

  const row = {
    display: 'grid',
    gridTemplateColumns: '180px 1fr',
    alignItems: 'center',
    gap: 16,
  };

  const labelStyle = {
    fontSize: 14,
    color: '#666',
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #ddd',
    borderRadius: 6,
    fontSize: 14,
  };

  const buttonStyle = {
    marginTop: 20,
    padding: '12px 18px',
    borderRadius: 999,
    border: 'none',
    background: '#111',
    color: '#fff',
    cursor: 'pointer',
    width: 'fit-content',
  };

  return (
    <main style={{ padding: 40, fontFamily: 'Arial', maxWidth: 800 }}>
      <h1 style={{ marginBottom: 30 }}>Apartment bearbeiten</h1>

      <form action={updateApartment} style={{ display: 'grid', gap: 18 }}>
        {/* ROW STYLE */}
        {[
          ['Name', 'name', apartment.name],
          ['Slug', 'slug', apartment.slug],
        ].map(([label, name, value]) => (
          <div key={name} style={row}>
            <label style={labelStyle}>{label}</label>
            <input
              name={name as string}
              defaultValue={value as string}
              style={inputStyle}
            />
          </div>
        ))}

        {/* DESCRIPTION */}
        <div style={row}>
          <label style={labelStyle}>Beschreibung</label>
          <textarea
            name="description"
            defaultValue={apartment.description || ''}
            style={{ ...inputStyle, minHeight: 100 }}
          />
        </div>

        {/* NUMBERS */}
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
          <label style={labelStyle}>Preis (€)</label>
          <input
            type="number"
            name="basePrice"
            defaultValue={apartment.basePrice ?? ''}
            style={inputStyle}
          />
        </div>

        <div style={row}>
          <label style={labelStyle}>Cleaning (€)</label>
          <input
            type="number"
            name="cleaningFee"
            defaultValue={apartment.cleaningFee ?? ''}
            style={inputStyle}
          />
        </div>

        {/* IMAGE */}
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

        {/* CHECKBOX */}
        <div style={{ ...row, alignItems: 'center' }}>
          <label style={labelStyle}>Status</label>
          <label style={{ display: 'flex', gap: 8 }}>
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={apartment.isActive}
            />
            Aktiv
          </label>
        </div>

        <button style={buttonStyle}>Änderungen speichern</button>
      </form>
    </main>
  );
}
