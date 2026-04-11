import { prisma } from '@/src/lib/prisma';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

async function deleteApartment(formData: FormData) {
  'use server';

  const id = Number(formData.get('id'));
  if (!id) return;

  await prisma.apartment.delete({
    where: { id },
  });

  redirect('/admin/apartments');
}

async function duplicateApartment(formData: FormData) {
  'use server';

  const id = Number(formData.get('id'));
  if (!id) return;

  const apartment = await prisma.apartment.findUnique({
    where: { id },
    include: {
      images: {
        orderBy: {
          sortOrder: 'asc',
        },
      },
    },
  });

  if (!apartment) return;

  await prisma.apartment.create({
    data: {
      hotelId: apartment.hotelId,
      name: `${apartment.name} Copy`,
      slug: `${apartment.slug}-copy-${Date.now()}`,
      description: apartment.description,
      maxAdults: apartment.maxAdults,
      maxChildren: apartment.maxChildren,
      bedrooms: apartment.bedrooms,
      size: apartment.size,
      view: apartment.view,
      amenities: apartment.amenities,
      basePrice: apartment.basePrice,
      cleaningFee: apartment.cleaningFee,
      isActive: false,
      sortOrder: apartment.sortOrder + 1,
      images:
        apartment.images.length > 0
          ? {
              create: apartment.images.map((img, index) => ({
                imageUrl: img.imageUrl,
                altText: img.altText,
                sortOrder: index,
              })),
            }
          : undefined,
    },
  });

  redirect('/admin/apartments');
}

export default async function ApartmentsAdminPage() {
  const apartments = await prisma.apartment.findMany({
    include: {
      hotel: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      images: {
        orderBy: {
          sortOrder: 'asc',
        },
      },
    },
    orderBy: [{ hotelId: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }],
  });

  return (
    <main style={{ padding: 40, fontFamily: 'Arial, sans-serif' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <h1 style={{ margin: 0 }}>Apartments</h1>

        <Link
          href="/admin/apartments/new"
          style={{
            textDecoration: 'none',
            padding: '12px 18px',
            background: '#111',
            color: '#fff',
            borderRadius: 999,
          }}
        >
          Neues Apartment
        </Link>
      </div>

      {apartments.length === 0 ? (
        <p>Noch keine Apartments vorhanden.</p>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {apartments.map((a) => (
            <div
              key={a.id}
              style={{
                border: '1px solid #ddd',
                borderRadius: 14,
                padding: 20,
                background: '#fff',
                color: '#111',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 16,
                  alignItems: 'start',
                  flexWrap: 'wrap',
                  marginBottom: 8,
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 20 }}>{a.name}</div>

                <div
                  style={{
                    padding: '6px 10px',
                    borderRadius: 999,
                    background: '#f4f4f4',
                    fontSize: 12,
                    color: '#555',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {a.hotel?.name ?? 'Kein Hotel'}{' '}
                  {a.hotel?.slug ? `(${a.hotel.slug})` : ''}
                </div>
              </div>

              <div>
                <strong>ID:</strong> {a.id}
              </div>
              <div>
                <strong>Hotel ID:</strong> {a.hotelId}
              </div>
              <div>
                <strong>Slug:</strong> {a.slug}
              </div>
              <div>
                <strong>Aktiv:</strong> {a.isActive ? 'Ja' : 'Nein'}
              </div>
              <div>
                <strong>Erwachsene:</strong> {a.maxAdults}
              </div>
              <div>
                <strong>Kinder:</strong> {a.maxChildren}
              </div>
              <div>
                <strong>Schlafzimmer:</strong> {a.bedrooms ?? '—'}
              </div>
              <div>
                <strong>Größe:</strong> {a.size != null ? `${a.size} m²` : '—'}
              </div>
              <div>
                <strong>Ausblick:</strong> {a.view || '—'}
              </div>
              <div>
                <strong>Preis/Nacht:</strong>{' '}
                {a.basePrice != null ? `€${a.basePrice}` : '—'}
              </div>
              <div>
                <strong>Reinigung:</strong>{' '}
                {a.cleaningFee != null ? `€${a.cleaningFee}` : '—'}
              </div>
              <div>
                <strong>Sortierung:</strong> {a.sortOrder}
              </div>
              <div>
                <strong>Bilder:</strong> {a.images.length}
              </div>
              <div>
                <strong>Ausstattung:</strong>{' '}
                {a.amenities?.length ? a.amenities.join(', ') : '—'}
              </div>

              {a.description && (
                <div style={{ marginTop: 10, color: '#555', lineHeight: 1.5 }}>
                  <strong>Beschreibung:</strong> {a.description}
                </div>
              )}

              {a.images[0] && (
                <div style={{ marginTop: 14 }}>
                  <img
                    src={a.images[0].imageUrl}
                    alt={a.images[0].altText || a.name}
                    style={{
                      width: 220,
                      height: 140,
                      objectFit: 'cover',
                      borderRadius: 10,
                    }}
                  />
                </div>
              )}

              <div
                style={{
                  display: 'flex',
                  gap: 10,
                  marginTop: 16,
                  flexWrap: 'wrap',
                }}
              >
                <Link
                  href={`/admin/apartments/${a.id}`}
                  style={{
                    textDecoration: 'none',
                    padding: '10px 14px',
                    border: '1px solid #111',
                    borderRadius: 999,
                    color: '#111',
                    background: '#fff',
                  }}
                >
                  Bearbeiten
                </Link>

                <form action={duplicateApartment}>
                  <input type="hidden" name="id" value={a.id} />
                  <button
                    type="submit"
                    style={{
                      padding: '10px 14px',
                      border: '1px solid #111',
                      borderRadius: 999,
                      color: '#111',
                      background: '#fff',
                      cursor: 'pointer',
                    }}
                  >
                    Duplizieren
                  </button>
                </form>

                <form action={deleteApartment}>
                  <input type="hidden" name="id" value={a.id} />
                  <button
                    type="submit"
                    style={{
                      padding: '10px 14px',
                      border: '1px solid #c43c57',
                      borderRadius: 999,
                      color: '#c43c57',
                      background: '#fff',
                      cursor: 'pointer',
                    }}
                  >
                    Löschen
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
