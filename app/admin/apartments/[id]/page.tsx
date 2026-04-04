import { prisma } from '@/src/lib/prisma';
import { notFound } from 'next/navigation';

type PageProps = {
  params: {
    id: string;
  };
};

export const dynamic = 'force-dynamic';

async function updateApartment(formData: FormData) {
  'use server';

  const id = Number(formData.get('id'));

  await prisma.apartment.update({
    where: { id },
    data: {
      name: String(formData.get('name')),
      slug: String(formData.get('slug')),
      description: String(formData.get('description') || ''),
      maxAdults: Number(formData.get('maxAdults')),
      maxChildren: Number(formData.get('maxChildren')),
      basePrice: Number(formData.get('basePrice')),
      cleaningFee: Number(formData.get('cleaningFee')),
      isActive: formData.get('isActive') === 'on',
    },
  });
}

export default async function EditApartmentPage({ params }: PageProps) {
  const apartmentId = Number(params.id);

  if (!Number.isInteger(apartmentId)) {
    notFound();
  }

  const apartment = await prisma.apartment.findUnique({
    where: { id: apartmentId },
    include: { images: true },
  });

  if (!apartment) {
    notFound();
  }

  return (
    <main style={{ padding: 40, fontFamily: 'Arial', maxWidth: 800 }}>
      <h1 style={{ marginBottom: 30 }}>Apartment bearbeiten</h1>

      <form action={updateApartment} style={{ display: 'grid', gap: 18 }}>
        <input type="hidden" name="id" value={apartment.id} />

        {/* Name */}
        <div style={row}>
          <label style={label}>Name</label>
          <input style={input} name="name" defaultValue={apartment.name} />
        </div>

        {/* Slug */}
        <div style={row}>
          <label style={label}>Slug</label>
          <input style={input} name="slug" defaultValue={apartment.slug} />
        </div>

        {/* Beschreibung */}
        <div style={row}>
          <label style={label}>Beschreibung</label>
          <textarea
            style={{ ...input, minHeight: 100 }}
            name="description"
            defaultValue={apartment.description || ''}
          />
        </div>

        {/* Erwachsene */}
        <div style={row}>
          <label style={label}>Max. Erwachsene</label>
          <input
            style={input}
            type="number"
            name="maxAdults"
            defaultValue={apartment.maxAdults}
          />
        </div>

        {/* Kinder */}
        <div style={row}>
          <label style={label}>Max. Kinder</label>
          <input
            style={input}
            type="number"
            name="maxChildren"
            defaultValue={apartment.maxChildren}
          />
        </div>

        {/* Preis */}
        <div style={row}>
          <label style={label}>Preis / Nacht (€)</label>
          <input
            style={input}
            type="number"
            name="basePrice"
            defaultValue={apartment.basePrice || 0}
          />
        </div>

        {/* Reinigung */}
        <div style={row}>
          <label style={label}>Reinigung (€)</label>
          <input
            style={input}
            type="number"
            name="cleaningFee"
            defaultValue={apartment.cleaningFee || 0}
          />
        </div>

        {/* Aktiv */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={apartment.isActive}
          />
          <span>Aktiv</span>
        </div>

        {/* Button */}
        <button style={button}>Änderungen speichern</button>
      </form>
    </main>
  );
}

const row = {
  display: 'grid',
  gridTemplateColumns: '180px 1fr',
  alignItems: 'center',
  gap: 12,
};

const label = {
  fontSize: 14,
  color: '#555',
};

const input = {
  border: '1px solid #ddd',
  padding: '10px 12px',
  borderRadius: 6,
  fontSize: 14,
};

const button = {
  marginTop: 20,
  padding: '12px 18px',
  borderRadius: 999,
  border: 'none',
  background: '#111',
  color: '#fff',
  cursor: 'pointer',
};
