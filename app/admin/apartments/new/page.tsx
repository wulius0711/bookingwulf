import { prisma } from '@/src/lib/prisma';
import { redirect } from 'next/navigation';

async function createApartment(formData: FormData) {
  'use server';

  const name = String(formData.get('name') || '');
  const slug = String(formData.get('slug') || '');
  const description = String(formData.get('description') || '');
  const maxAdults = Number(formData.get('maxAdults') || 2);
  const maxChildren = Number(formData.get('maxChildren') || 0);
  const sortOrder = Number(formData.get('sortOrder') || 0);
  const imageUrl = String(formData.get('imageUrl') || '');
  const altText = String(formData.get('altText') || '');
  const isActive = formData.get('isActive') === 'on';

  if (!name || !slug) {
    throw new Error('Name und Slug sind erforderlich.');
  }

  await prisma.apartment.create({
    data: {
      name,
      slug,
      description: description || null,
      maxAdults,
      maxChildren,
      sortOrder,
      isActive,
      images: imageUrl
        ? {
            create: [
              {
                imageUrl,
                altText: altText || null,
                sortOrder: 0,
              },
            ],
          }
        : undefined,
    },
  });

  redirect('/admin/apartments');
}

export default function NewApartmentPage() {
  return (
    <main
      style={{ padding: 40, fontFamily: 'Arial, sans-serif', maxWidth: 760 }}
    >
      <h1>Neues Apartment</h1>

      <form
        action={createApartment}
        style={{ display: 'grid', gap: 14, marginTop: 24 }}
      >
        <input name="name" placeholder="Name" required />
        <input name="slug" placeholder="slug-z-b-apartment-1" required />
        <textarea name="description" placeholder="Beschreibung" rows={4} />
        <input
          name="maxAdults"
          type="number"
          placeholder="Max Erwachsene"
          defaultValue={2}
        />
        <input
          name="maxChildren"
          type="number"
          placeholder="Max Kinder"
          defaultValue={0}
        />
        <input
          name="sortOrder"
          type="number"
          placeholder="Sortierung"
          defaultValue={0}
        />
        <input name="imageUrl" placeholder="Bild-URL" />
        <input name="altText" placeholder="Alt Text" />

        <label style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input name="isActive" type="checkbox" defaultChecked />
          Aktiv
        </label>

        <button
          type="submit"
          style={{
            width: 'fit-content',
            padding: '12px 20px',
            background: '#111',
            color: '#fff',
            border: 'none',
            borderRadius: 999,
          }}
        >
          Speichern
        </button>
      </form>
    </main>
  );
}
