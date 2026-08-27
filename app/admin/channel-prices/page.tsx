import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import { writeAuditLog } from '@/src/lib/audit';
import { hasPlanAccess } from '@/src/lib/plan-gates';
import { pushChannelPriceSync } from '@/src/lib/beds24';
import { CHANNEL_DISPLAY_NAME } from '@/src/lib/beds24Channels';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import ChannelPriceList from './ChannelPriceList';
import NewChannelPriceForm from './NewChannelPriceForm';
import { EmptyState } from '../components/ui';

export const dynamic = 'force-dynamic';

async function createChannelPrice(formData: FormData) {
  'use server';
  const session = await verifySession();
  if (!session.hotelId) return;

  const apartmentId = Number(formData.get('apartmentId'));
  const channel = String(formData.get('channel') || '');
  const startDate = new Date(String(formData.get('startDate')));
  const endDate = new Date(String(formData.get('endDate')));
  const pricePerNight = Number(formData.get('pricePerNight'));
  const name = (formData.get('name') as string) || null;
  if (!apartmentId || !channel || endDate <= startDate || !Number.isFinite(pricePerNight)) return;

  const apt = await prisma.apartment.findUnique({ where: { id: apartmentId }, select: { hotelId: true, name: true } });
  if (!apt || apt.hotelId !== session.hotelId) return;

  const overlap = await prisma.channelPriceRange.findFirst({
    where: { apartmentId, channel, startDate: { lt: endDate }, endDate: { gt: startDate } },
    select: { id: true },
  });
  if (overlap) return;

  const range = await prisma.channelPriceRange.create({ data: { apartmentId, channel, startDate, endDate, pricePerNight, name } });
  const syncError = await pushChannelPriceSync(apt.hotelId, apartmentId, channel, startDate, endDate);
  if (syncError) await prisma.channelPriceRange.update({ where: { id: range.id }, data: { beds24SyncError: syncError } });

  await writeAuditLog(apt.hotelId, { channel_price_created: null }, {
    channel_price_created: `${CHANNEL_DISPLAY_NAME[channel as keyof typeof CHANNEL_DISPLAY_NAME] ?? channel} | ${apt.name} | ${startDate.toISOString().slice(0, 10)}–${endDate.toISOString().slice(0, 10)} | €${pricePerNight}/Nacht`,
  });
  revalidatePath('/admin/channel-prices');
}

async function updateChannelPrice(formData: FormData) {
  'use server';
  const session = await verifySession();
  if (!session.hotelId) return;

  const id = Number(formData.get('id'));
  const startDate = new Date(String(formData.get('startDate')));
  const endDate = new Date(String(formData.get('endDate')));
  const pricePerNight = Number(formData.get('pricePerNight'));
  const name = (formData.get('name') as string) || null;
  if (!id || endDate <= startDate || !Number.isFinite(pricePerNight)) return;

  const existing = await prisma.channelPriceRange.findUnique({
    where: { id },
    include: { apartment: { select: { hotelId: true, name: true } } },
  });
  if (!existing || existing.apartment.hotelId !== session.hotelId) return;

  const overlap = await prisma.channelPriceRange.findFirst({
    where: { apartmentId: existing.apartmentId, channel: existing.channel, startDate: { lt: endDate }, endDate: { gt: startDate }, id: { not: id } },
    select: { id: true },
  });
  if (overlap) return;

  await prisma.channelPriceRange.update({ where: { id }, data: { startDate, endDate, pricePerNight, name } });
  const windowStart = existing.startDate < startDate ? existing.startDate : startDate;
  const windowEnd = existing.endDate > endDate ? existing.endDate : endDate;
  const syncError = await pushChannelPriceSync(existing.apartment.hotelId, existing.apartmentId, existing.channel, windowStart, windowEnd);
  await prisma.channelPriceRange.update({ where: { id }, data: { beds24SyncError: syncError } });

  await writeAuditLog(existing.apartment.hotelId, {
    channel_price_updated: `${CHANNEL_DISPLAY_NAME[existing.channel as keyof typeof CHANNEL_DISPLAY_NAME] ?? existing.channel} | ${existing.apartment.name} | ${existing.startDate.toISOString().slice(0, 10)}–${existing.endDate.toISOString().slice(0, 10)} | €${existing.pricePerNight}/Nacht`,
  }, {
    channel_price_updated: `${CHANNEL_DISPLAY_NAME[existing.channel as keyof typeof CHANNEL_DISPLAY_NAME] ?? existing.channel} | ${existing.apartment.name} | ${startDate.toISOString().slice(0, 10)}–${endDate.toISOString().slice(0, 10)} | €${pricePerNight}/Nacht`,
  });
  revalidatePath('/admin/channel-prices');
}

async function deleteChannelPrice(formData: FormData) {
  'use server';
  const session = await verifySession();
  if (!session.hotelId) return;

  const id = Number(formData.get('id'));
  const range = await prisma.channelPriceRange.findUnique({ where: { id }, include: { apartment: { select: { hotelId: true, name: true } } } });
  if (!range || range.apartment.hotelId !== session.hotelId) return;

  await prisma.channelPriceRange.delete({ where: { id } });
  await pushChannelPriceSync(range.apartment.hotelId, range.apartmentId, range.channel, range.startDate, range.endDate);

  await writeAuditLog(range.apartment.hotelId, {
    channel_price_deleted: `${CHANNEL_DISPLAY_NAME[range.channel as keyof typeof CHANNEL_DISPLAY_NAME] ?? range.channel} | ${range.apartment.name} | ${range.startDate.toISOString().slice(0, 10)}–${range.endDate.toISOString().slice(0, 10)}`,
  }, { channel_price_deleted: null });
  revalidatePath('/admin/channel-prices');
}

export default async function ChannelPricesPage() {
  const session = await verifySession();
  if (!session.hotelId) redirect('/admin');

  const hotel = await prisma.hotel.findUnique({ where: { id: session.hotelId }, select: { plan: true } });
  if (!hasPlanAccess(hotel?.plan ?? 'starter', 'pro')) redirect('/admin/billing');

  const apartments = await prisma.apartment.findMany({
    where: { hotelId: session.hotelId, isActive: true },
    select: { id: true, name: true },
    orderBy: { sortOrder: 'asc' },
  });

  const beds24Mappings = await prisma.beds24ApartmentMapping.findMany({
    where: { apartmentId: { in: apartments.map((a) => a.id) } },
    select: { apartmentId: true, channelOfferIds: true },
  });
  const channelOfferIds = Object.fromEntries(
    beds24Mappings.map((m) => [m.apartmentId, (m.channelOfferIds as Record<string, number> | null) ?? {}])
  );

  const ranges = await prisma.channelPriceRange.findMany({
    where: { apartment: { hotelId: session.hotelId } },
    include: { apartment: { select: { name: true } } },
    orderBy: { startDate: 'asc' },
  });

  return (
    <main className="admin-page" style={{ maxWidth: 960 }}>
      <div style={{ display: 'grid', gap: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h1 style={{ margin: 0, fontSize: 32, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>Kanalpreise</h1>
          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 99, background: '#f3e8ff', color: '#7c3aed' }}>Pro</span>
        </div>
        <p style={{ margin: '-12px 0 0', fontSize: 14, color: 'var(--text-secondary)' }}>
          Preise pro OTA-Kanal (Airbnb, Booking.com, ...), getrennt von der eigenen Direktpreis-Berechnung.
          Setup pro Apartment unter <a href="/admin/beds24" style={{ color: 'var(--text-primary)' }}>Beds24-Einstellungen</a>.
        </p>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16 }}>
          <div style={{ background: 'var(--surface-2)', padding: '14px 20px', borderBottom: '1px solid var(--border)', borderRadius: '16px 16px 0 0' }}>
            <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
              {ranges.length} {ranges.length === 1 ? 'Eintrag' : 'Einträge'}
            </h2>
          </div>
          {ranges.length === 0 ? (
            <div className="ui-card-empty">
              <EmptyState title="Noch keine Kanalpreise angelegt." />
            </div>
          ) : (
            <div style={{ padding: '16px 20px', background: 'var(--surface-2)' }}>
              <ChannelPriceList ranges={ranges} updateChannelPrice={updateChannelPrice} deleteChannelPrice={deleteChannelPrice} />
            </div>
          )}

          <NewChannelPriceForm apartments={apartments} channelOfferIds={channelOfferIds} createChannelPrice={createChannelPrice} />
        </div>
      </div>
    </main>
  );
}
