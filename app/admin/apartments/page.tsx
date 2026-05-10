import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import ApartmentCard from './ApartmentCard';
import { EmptyState } from '../components/ui';

export const dynamic = 'force-dynamic';

async function deleteApartment(formData: FormData) {
  'use server';

  const session = await verifySession();
  const id = Number(formData.get('id'));
  if (!id) return;

  if (session.hotelId !== null) {
    const apt = await prisma.apartment.findUnique({ where: { id }, select: { hotelId: true } });
    if (!apt || apt.hotelId !== session.hotelId) return;
  }

  await prisma.apartment.delete({ where: { id } });
  redirect('/admin/apartments');
}

async function duplicateApartment(formData: FormData) {
  'use server';

  const session = await verifySession();
  const id = Number(formData.get('id'));
  if (!id) return;

  const apartment = await prisma.apartment.findUnique({
    where: { id },
    include: { images: { orderBy: { sortOrder: 'asc' } } },
  });

  if (!apartment) return;
  if (session.hotelId !== null && apartment.hotelId !== session.hotelId) return;

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
  const session = await verifySession();
  const isSuperAdmin = session.hotelId === null;

  const hotelName = session.hotelId
    ? (await prisma.hotel.findUnique({ where: { id: session.hotelId }, select: { name: true } }))?.name || ''
    : '';

  const apartments = await prisma.apartment.findMany({
    where: session.hotelId !== null ? { hotelId: session.hotelId } : undefined,
    include: {
      hotel: { select: { id: true, name: true, slug: true, accentColor: true } },
      images: { orderBy: { sortOrder: 'asc' } },
    },
    orderBy: [{ hotelId: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }],
  });

  return (
    <main className="admin-page" style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'end',
          marginBottom: 24,
          gap: 20,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>Apartments</h1>
          <p className="page-subtitle" style={{ margin: '6px 0 0' }}>
            {isSuperAdmin ? 'Alle Hotels' : hotelName}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'end', flexWrap: 'wrap' }}>
          {apartments.length > 0 && (
            <Link
              className="ui-btn ui-btn-primary ui-btn-md"
              href="/admin/apartments/new"
              style={{ textDecoration: 'none' }}
            >
              Neues Apartment
            </Link>
          )}
        </div>
      </div>

      {apartments.length === 0 ? (
        <div className="ui-card-empty">
          <EmptyState
            title="Noch keine Apartments vorhanden."
            description="Lege dein erstes Apartment an."
          />
          <Link href="/admin/apartments/new" className="ui-btn ui-btn-primary ui-btn-md" style={{ textDecoration: 'none' }}>
            Neues Apartment anlegen
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {apartments.map((a) => (
            <ApartmentCard
              key={a.id}
              apartment={a}
              showHotelBadge={isSuperAdmin}
              duplicateAction={duplicateApartment}
              deleteAction={deleteApartment}
            />
          ))}
        </div>
      )}
    </main>
  );
}
