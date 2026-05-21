import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import HotelList, { type HotelRow } from './HotelList';

export const dynamic = 'force-dynamic';

async function toggleHotelActive(formData: FormData) {
  'use server';

  const session = await verifySession();
  if (session.role !== 'super_admin') return;

  const id = Number(formData.get('id'));
  const current = formData.get('isActive') === 'true';
  if (!id) return;

  await prisma.hotel.update({ where: { id }, data: { isActive: !current } });
  redirect('/admin/hotels');
}

async function resetTrial(formData: FormData) {
  'use server';

  const session = await verifySession();
  if (session.role !== 'super_admin') return;

  const id = Number(formData.get('id'));
  if (!id) return;

  await prisma.hotel.update({
    where: { id },
    data: {
      subscriptionStatus: 'trialing',
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      trialResetCount: { increment: 1 },
    },
  });
  redirect('/admin/hotels');
}

async function deleteHotel(formData: FormData) {
  'use server';

  const session = await verifySession();
  if (session.role !== 'super_admin') return;

  const id = Number(formData.get('id'));
  if (!id) return;

  await prisma.adminUser.deleteMany({ where: { hotelId: id } });
  await prisma.hotel.delete({ where: { id } });
  redirect('/admin/hotels');
}

function trialDaysLeft(trialEndsAt: Date | null): number | null {
  if (!trialEndsAt) return null;
  return Math.ceil((trialEndsAt.getTime() - Date.now()) / 86400000);
}

function relativeDate(date: Date): string {
  const days = Math.floor((Date.now() - date.getTime()) / 86400000);
  if (days === 0) return 'heute';
  if (days === 1) return 'gestern';
  if (days < 7) return `vor ${days} Tagen`;
  if (days < 30) return `vor ${Math.floor(days / 7)} Wochen`;
  return `vor ${Math.floor(days / 30)} Monaten`;
}

export default async function HotelsPage() {
  const session = await verifySession();
  if (session.role !== 'super_admin') redirect('/admin');

  const raw = await prisma.hotel.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { apartments: true, requests: true } },
      settings: { select: { bankTransferEnabled: true, paypalEnabled: true, stripeEnabled: true } },
      requests: { orderBy: { createdAt: 'desc' }, take: 1, select: { createdAt: true } },
    },
  });

  const hotels: HotelRow[] = raw.map((h) => ({
    id: h.id,
    name: h.name,
    slug: h.slug,
    email: h.email,
    accentColor: h.accentColor,
    isActive: h.isActive,
    subscriptionStatus: h.subscriptionStatus,
    apartmentCount: h._count.apartments,
    requestCount: h._count.requests,
    hasApartment: h._count.apartments > 0,
    hasPayment: !!(h.settings?.bankTransferEnabled || h.settings?.paypalEnabled || h.settings?.stripeEnabled),
    lastBookingText: h.requests[0] ? relativeDate(h.requests[0].createdAt) : null,
    trialDaysLeft: trialDaysLeft(h.trialEndsAt),
    trialResetCount: h.trialResetCount,
  }));

  return (
    <main className="admin-page" style={{ maxWidth: 960 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, gap: 16 }}>
        <div>
          <h1 className="page-title">Hotels</h1>
          <p className="page-subtitle">Hotels anlegen und verwalten</p>
        </div>
        <Link href="/admin/hotels/new" className="ui-btn ui-btn-primary ui-btn-md" style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
          Neues Hotel
        </Link>
      </div>

      {hotels.length === 0 ? (
        <p>Noch keine Hotels vorhanden.</p>
      ) : (
        <HotelList hotels={hotels} onToggle={toggleHotelActive} onResetTrial={resetTrial} onDelete={deleteHotel} />
      )}
    </main>
  );
}
