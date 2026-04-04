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

  if (!apartmentId) {
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
    <main style={{ padding: 40, fontFamily: 'Arial', maxWidth: 700 }}>
      <h1 style={{ marginBottom: 24 }}>Apartment bearbeiten</h1>

      <form action={updateApartment} style={{ display: 'grid', gap: 16 }}>
        <div>
          <label style={{ display: 'block', marginBottom: 6 }}>Name</label>
          <input
            name="name"
            defaultValue={apartment.name}
            required
            style={{ width: '100%', padding: 12 }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 6 }}>Slug</label>
          <input
            name="slug"
            defaultValue={apartment.slug}
            required
            style={{ width: '100%', padding: 12 }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 6 }}>
            Beschreibung
          </label>
          <textarea
            name="description"
            defaultValue={apartment.description || ''}
            rows={5}
            style={{ width: '100%', padding: 12 }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 6 }}>
            Max. Erwachsene
          </label>
          <input
            type="number"
            name="maxAdults"
            defaultValue={apartment.maxAdults}
            style={{ width: '100%', padding: 12 }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 6 }}>
            Max. Kinder
          </label>
          <input
            type="number"
            name="maxChildren"
            defaultValue={apartment.maxChildren}
            style={{ width: '100%', padding: 12 }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 6 }}>
            Preis pro Nacht (€)
          </label>
          <input
            type="number"
            step="0.01"
            name="basePrice"
            defaultValue={apartment.basePrice ?? ''}
            style={{ width: '100%', padding: 12 }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 6 }}>
            Reinigungsgebühr (€)
          </label>
          <input
            type="number"
            step="0.01"
            name="cleaningFee"
            defaultValue={apartment.cleaningFee ?? ''}
            style={{ width: '100%', padding: 12 }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 6 }}>Bild URL</label>
          <input
            name="imageUrl"
            defaultValue={apartment.images[0]?.imageUrl || ''}
            style={{ width: '100%', padding: 12 }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 6 }}>Alt Text</label>
          <input
            name="altText"
            defaultValue={apartment.images[0]?.altText || ''}
            style={{ width: '100%', padding: 12 }}
          />
        </div>

        <label style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
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
