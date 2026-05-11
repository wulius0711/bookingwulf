import { verifySession } from '@/src/lib/session';
import { prisma } from '@/src/lib/prisma';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { hasPlanAccess } from '@/src/lib/plan-gates';
import Beds24Client from './Beds24Client';

export const dynamic = 'force-dynamic';

export default async function Beds24Page() {
  const session = await verifySession();
  const isSuperAdmin = session.role === 'super_admin';

  if (!session.hotelId) {
    if (isSuperAdmin) return (
      <main className="admin-page">
        <h1>Beds24 Channel Manager</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Bitte zuerst eine Anlage in der Sidebar auswählen.</p>
      </main>
    );
    redirect('/admin');
  }

  const hotel = await prisma.hotel.findUnique({
    where: { id: session.hotelId },
    select: {
      plan: true,
      beds24Config: { select: { isEnabled: true } },
      apartments: { select: { id: true, name: true }, where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
    },
  });

  if (!hotel || (!isSuperAdmin && !hasPlanAccess(hotel.plan ?? 'starter', 'pro'))) {
    redirect('/admin/billing');
  }

  const mappings = await prisma.beds24ApartmentMapping.findMany({
    where: { apartment: { hotelId: session.hotelId } },
    select: { apartmentId: true, beds24RoomId: true },
  });

  const mappingMap = Object.fromEntries(mappings.map((m) => [m.apartmentId, m.beds24RoomId]));

  const headerStore = await headers();
  const host = `https://${headerStore.get('host') ?? 'bookingwulf.com'}`;

  return (
    <main className="admin-page w-md">
      <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
        <h1 style={{ margin: 0 }}>Beds24 Channel Manager</h1>
        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 99, background: '#f3e8ff', color: '#7c3aed' }}>Pro</span>
      </div>
      <p style={{ margin: '0 0 24px', fontSize: 14, color: 'var(--text-secondary)' }}>
        Verbinden Sie Ihren Beds24-Account, um Buchungen automatisch mit Airbnb und Booking.com zu synchronisieren.
      </p>

      <Beds24Client
        initialConnected={!!hotel.beds24Config}
        initialEnabled={hotel.beds24Config?.isEnabled ?? false}
        apartments={hotel.apartments}
        initialMappings={mappingMap}
        host={host}
      />
    </main>
  );
}
