import { prisma } from '@/src/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

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
          </div>
        ))}
      </div>
    </main>
  );
}
