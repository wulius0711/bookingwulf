import { prisma } from '@/src/lib/prisma';
import { notFound, redirect } from 'next/navigation';

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditApartmentPage({ params }: PageProps) {
  const { id } = await params;
  const apartmentId = Number(id);

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

    const name = String(formData.get('name') || '');
    const slug = String(formData.get('slug') || '');
    const description = String(formData.get('description') || '');
    const maxAdults = Number(formData.get('maxAdults') || 2);
    const maxChildren = Number(formData.get('maxChildren') || 0);
    const basePrice = formData.get('basePrice')
      ? Number(formData.get('basePrice'))
      : null;
    const cleaningFee = formData.get('cleaningFee')
      ? Number(formData.get('cleaningFee'))
      : null;
    const sortOrder = Number(formData.get('sortOrder') || 0);
    const imageUrl = String(formData.get('imageUrl') || '');
    const altText = String(formData.get('altText') || '');
    const isActive = formData.get('isActive') === 'on';

    if (!name || !slug) {
      throw new Error('Name und Slug sind erforderlich.');
    }

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
        sortOrder,
        isActive,
      },
    });

    const currentApartment = await prisma.apartment.findUnique({
      where: { id: apartmentId },
      include: {
        images: {
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
    });

    if (!currentApartment) {
      throw new Error('Apartment nicht gefunden.');
    }

    const existingImage = currentApartment.images[0];

    if (imageUrl && existingImage) {
      await prisma.apartmentImage.update({
        where: { id: existingImage.id },
        data: {
          imageUrl,
          altText: altText || null,
        },
      });
    } else if (imageUrl && !existingImage) {
      await prisma.apartmentImage.create({
        data: {
          apartmentId,
          imageUrl,
          altText: altText || null,
          sortOrder: 0,
        },
      });
    } else if (!imageUrl && existingImage) {
      await prisma.apartmentImage.delete({
        where: { id: existingImage.id },
      });
    }

    redirect('/admin/apartments');
  }

  return (
    <main
      style={{ padding: 40, fontFamily: 'Arial, sans-serif', maxWidth: 760 }}
    >
      <h1>Apartment bearbeiten</h1>

      <form
        action={updateApartment}
        style={{ display: 'grid', gap: 14, marginTop: 24 }}
      >
        <input
          name="name"
          placeholder="Name"
          defaultValue={apartment.name}
          required
        />
        <input
          name="slug"
          placeholder="slug"
          defaultValue={apartment.slug}
          required
        />
        <textarea
          name="description"
          placeholder="Beschreibung"
          rows={4}
          defaultValue={apartment.description || ''}
        />
        <input
          name="maxAdults"
          type="number"
          placeholder="Max Erwachsene"
          defaultValue={apartment.maxAdults}
        />
        <input
          name="maxChildren"
          type="number"
          placeholder="Max Kinder"
          defaultValue={apartment.maxChildren}
        />
        <input
          name="basePrice"
          type="number"
          step="0.01"
          placeholder="Preis pro Nacht"
          defaultValue={apartment.basePrice ?? ''}
        />
        <input
          name="cleaningFee"
          type="number"
          step="0.01"
          placeholder="Reinigungsgebühr"
          defaultValue={apartment.cleaningFee ?? ''}
        />
        <input
          name="sortOrder"
          type="number"
          placeholder="Sortierung"
          defaultValue={apartment.sortOrder}
        />
        <input
          name="imageUrl"
          placeholder="Bild-URL"
          defaultValue={apartment.images[0]?.imageUrl || ''}
        />
        <input
          name="altText"
          placeholder="Alt Text"
          defaultValue={apartment.images[0]?.altText || ''}
        />

        <label style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input
            name="isActive"
            type="checkbox"
            defaultChecked={apartment.isActive}
          />
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
            cursor: 'pointer',
          }}
        >
          Änderungen speichern
        </button>
      </form>
    </main>
  );
}
