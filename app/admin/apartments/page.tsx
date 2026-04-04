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

  const original = await prisma.apartment.findUnique({
    where: { id },
    include: {
      images: {
        orderBy: {
          sortOrder: 'asc',
        },
      },
      priceSeasons: true,
      blockedRanges: true,
    },
  });

  if (!original) return;

  await prisma.apartment.create({
    data: {
      name: `${original.name} (Copy)`,
      slug: `${original.slug}-copy-${Date.now()}`,
      description: original.description,
      maxAdults: original.maxAdults,
      maxChildren: original.maxChildren,
      basePrice: original.basePrice,
      cleaningFee: original.cleaningFee,
      isActive: original.isActive,
      sortOrder: original.sortOrder,

      images: original.images.length
        ? {
            create: original.images.map((img) => ({
              imageUrl: img.imageUrl,
              altText: img.altText,
              sortOrder: img.sortOrder,
            })),
          }
        : undefined,

      priceSeasons: original.priceSeasons.length
        ? {
            create: original.priceSeasons.map((ps) => ({
              startDate: ps.startDate,
              endDate: ps.endDate,
              pricePerNight: ps.pricePerNight,
              minStay: ps.minStay,
            })),
          }
        : undefined,

      blockedRanges: original.blockedRanges.length
        ? {
            create: original.blockedRanges.map((br) => ({
              startDate: br.startDate,
              endDate: br.endDate,
              type: br.type,
              note: br.note,
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
      images: {
        orderBy: {
          sortOrder: 'asc',
        },
      },
    },
    orderBy: {
      sortOrder: 'asc',
    },
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
          {apartments.map((apartment) => (
            <div
              key={apartment.id}
              style={{
                border: '1px solid #ddd',
                borderRadius: 14,
                padding: 20,
                background: '#fff',
                color: '#111',
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: 8 }}>
                {apartment.name}
              </div>

              <div>
                <strong>Slug:</strong> {apartment.slug}
              </div>
              <div>
                <strong>Aktiv:</strong> {apartment.isActive ? 'Ja' : 'Nein'}
              </div>
              <div>
                <strong>Erwachsene:</strong> {apartment.maxAdults}
              </div>
              <div>
                <strong>Kinder:</strong> {apartment.maxChildren}
              </div>
              <div>
                <strong>Preis/Nacht:</strong>{' '}
                {apartment.basePrice != null ? `€${apartment.basePrice}` : '—'}
              </div>
              <div>
                <strong>Reinigung:</strong>{' '}
                {apartment.cleaningFee != null
                  ? `€${apartment.cleaningFee}`
                  : '—'}
              </div>
              <div>
                <strong>Bilder:</strong> {apartment.images.length}
              </div>

              {apartment.images[0] && (
                <div style={{ marginTop: 14 }}>
                  <img
                    src={apartment.images[0].imageUrl}
                    alt={apartment.images[0].altText || apartment.name}
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
                  href={`/admin/apartments/${apartment.id}`}
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
                  <input type="hidden" name="id" value={apartment.id} />
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
                  <input type="hidden" name="id" value={apartment.id} />
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
