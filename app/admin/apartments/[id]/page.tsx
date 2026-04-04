import { prisma } from '@/src/lib/prisma';
import { notFound } from 'next/navigation';

export default async function EditApartmentPage({
  params,
}: {
  params: { id: string };
}) {
  const apartment = await prisma.apartment.findUnique({
    where: { id: Number(params.id) },
    include: { images: true },
  });

  if (!apartment) return notFound();

  return (
    <main style={{ padding: 40, fontFamily: 'Arial', maxWidth: 600 }}>
      <h1>Apartment bearbeiten</h1>

      <form
        action={async (formData) => {
          'use server';

          await prisma.apartment.update({
            where: { id: apartment.id },
            data: {
              name: formData.get('name') as string,
              slug: formData.get('slug') as string,
              description: formData.get('description') as string,
              maxAdults: Number(formData.get('maxAdults')),
              maxChildren: Number(formData.get('maxChildren')),
              basePrice: Number(formData.get('basePrice')),
              cleaningFee: Number(formData.get('cleaningFee')),
              isActive: formData.get('isActive') === 'on',
            },
          });
        }}
        style={{ display: 'grid', gap: 16 }}
      >
        {/* NAME */}
        <div>
          <label>Name</label>
          <input name="name" defaultValue={apartment.name} />
        </div>

        {/* SLUG */}
        <div>
          <label>Slug</label>
          <input name="slug" defaultValue={apartment.slug} />
        </div>

        {/* DESCRIPTION */}
        <div>
          <label>Beschreibung</label>
          <textarea
            name="description"
            defaultValue={apartment.description || ''}
          />
        </div>

        {/* MAX ADULTS */}
        <div>
          <label>Max. Erwachsene</label>
          <input
            type="number"
            name="maxAdults"
            defaultValue={apartment.maxAdults}
          />
        </div>

        {/* MAX CHILDREN */}
        <div>
          <label>Max. Kinder</label>
          <input
            type="number"
            name="maxChildren"
            defaultValue={apartment.maxChildren}
          />
        </div>

        {/* PRICE */}
        <div>
          <label>Preis pro Nacht (€)</label>
          <input
            type="number"
            name="basePrice"
            defaultValue={apartment.basePrice || 0}
          />
        </div>

        {/* CLEANING */}
        <div>
          <label>Reinigungsgebühr (€)</label>
          <input
            type="number"
            name="cleaningFee"
            defaultValue={apartment.cleaningFee || 0}
          />
        </div>

        {/* IMAGE */}
        <div>
          <label>Bild URL</label>
          <input
            name="imageUrl"
            defaultValue={apartment.images[0]?.imageUrl || ''}
          />
        </div>

        <div>
          <label>Alt Text</label>
          <input
            name="altText"
            defaultValue={apartment.images[0]?.altText || ''}
          />
        </div>

        {/* ACTIVE */}
        <label style={{ display: 'flex', gap: 8 }}>
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={apartment.isActive}
          />
          Aktiv
        </label>

        <button
          type="submit"
          style={{
            padding: '14px 20px',
            borderRadius: 999,
            border: 'none',
            background: '#111',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          Änderungen speichern
        </button>
      </form>
    </main>
  );
}
