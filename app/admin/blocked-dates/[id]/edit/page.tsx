import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import { redirect, notFound } from 'next/navigation';
import { pushBlockedRangeSync } from '@/src/lib/beds24';

type PageProps = { params: Promise<{ id: string }> };

export default async function EditBlockedDatePage({ params }: PageProps) {
  const session = await verifySession();
  const { id } = await params;
  const rangeId = Number(id);

  const range = await prisma.blockedRange.findUnique({
    where: { id: rangeId },
    include: { apartment: { select: { id: true, name: true, hotelId: true } } },
  });

  if (!range) notFound();
  const ownedByHotel = range.apartment?.hotelId === session.hotelId
    || (range.apartmentId === null && range.hotelId === session.hotelId);
  if (session.hotelId !== null && !ownedByHotel) notFound();

  const apartments = await prisma.apartment.findMany({
    where: {
      isActive: true,
      ...(session.hotelId !== null ? { hotelId: session.hotelId } : {}),
    },
    orderBy: { name: 'asc' },
  });

  async function updateBlockedDate(formData: FormData) {
    'use server';

    const session = await verifySession();
    const apartmentIdRaw = String(formData.get('apartmentId') || '');
    const apartmentId = apartmentIdRaw === 'all' ? null : Number(apartmentIdRaw);
    const startDate = new Date(String(formData.get('startDate')));
    const endDate = new Date(String(formData.get('endDate')));
    const type = String(formData.get('type') || 'manual');
    const note = String(formData.get('note') || '');

    if (!apartmentIdRaw || !startDate || !endDate) return;
    if (endDate <= startDate) throw new Error('Enddatum muss nach Startdatum liegen');

    let newHotelId = session.hotelId;
    if (apartmentId !== null) {
      const apt = await prisma.apartment.findUnique({ where: { id: apartmentId }, select: { hotelId: true } });
      if (!apt || (session.hotelId !== null && apt.hotelId !== session.hotelId)) throw new Error('Zugriff verweigert.');
      newHotelId = apt.hotelId;
    } else if (session.hotelId !== null && range?.hotelId !== session.hotelId) {
      throw new Error('Zugriff verweigert.');
    }

    const oldApartmentId = range!.apartmentId;
    const oldHotelId = range!.apartment?.hotelId ?? range!.hotelId;
    const oldStart = range!.startDate;
    const oldEnd = range!.endDate;

    await prisma.blockedRange.update({
      where: { id: rangeId },
      data: { apartmentId, startDate, endDate, type, note },
    });

    let syncError: string | null = null;
    if (oldApartmentId === apartmentId && oldHotelId !== null) {
      // Same target apartment/hotel-wide scope — one sync call over the union of old and new dates.
      const windowStart = oldStart < startDate ? oldStart : startDate;
      const windowEnd = oldEnd > endDate ? oldEnd : endDate;
      syncError = await pushBlockedRangeSync(oldHotelId, apartmentId, windowStart, windowEnd);
    } else {
      // The Sperrzeit moved to a different apartment (or in/out of hotel-wide) — reopen the old
      // target's old window, then block the new target's new window.
      if (oldHotelId !== null) await pushBlockedRangeSync(oldHotelId, oldApartmentId, oldStart, oldEnd);
      if (newHotelId !== null) syncError = await pushBlockedRangeSync(newHotelId, apartmentId, startDate, endDate);
    }
    await prisma.blockedRange.update({ where: { id: rangeId }, data: { beds24SyncError: syncError } });

    redirect('/admin/blocked-dates');
  }

  const fmt = (d: Date) => new Date(d).toISOString().slice(0, 10);

  const fieldStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid var(--border)',
    borderRadius: 8,
    fontSize: 14,
    background: 'var(--surface)',
    color: 'var(--text-primary)',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 700,
    color: 'var(--text-secondary)',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    marginBottom: 4,
    display: 'block',
  };

  const fieldWrap: React.CSSProperties = { display: 'grid', gap: 4 };

  return (
    <main style={{ padding: 40, fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif', maxWidth: 560 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 24 }}>Sperrzeit bearbeiten</h1>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '28px 28px', boxShadow: '0 4px 16px rgba(15,23,42,0.06)' }}>
      <form action={updateBlockedDate} style={{ display: 'grid', gap: 16 }}>
        <div style={fieldWrap}>
          <label style={labelStyle}>Apartment</label>
          <select name="apartmentId" required defaultValue={range.apartmentId ?? 'all'} style={fieldStyle}>
            {range.apartmentId === null && <option value="all">Alle Apartments (hotelweit)</option>}
            {apartments.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>

        <div style={fieldWrap}>
          <label style={labelStyle}>Von</label>
          <input type="date" name="startDate" required defaultValue={fmt(range.startDate)} style={fieldStyle} />
        </div>

        <div style={fieldWrap}>
          <label style={labelStyle}>Bis</label>
          <input type="date" name="endDate" required defaultValue={fmt(range.endDate)} style={fieldStyle} />
        </div>

        <div style={fieldWrap}>
          <label style={labelStyle}>Grund</label>
          {range.type === 'booking' ? (
            <>
              <input type="hidden" name="type" value="booking" />
              <div style={{ ...fieldStyle, color: 'var(--text-muted)', background: 'var(--surface-2)' }}>Buchung (automatisch)</div>
            </>
          ) : (
            <select name="type" defaultValue={range.type} style={fieldStyle}>
              <option value="manual">Eigennutzung</option>
              <option value="other">Sonstiges</option>
              {range.type === 'blocked' && <option value="blocked">Blockiert</option>}
            </select>
          )}
        </div>

        <div style={fieldWrap}>
          <label style={labelStyle}>Notiz</label>
          <input
            type="text"
            name="note"
            defaultValue={range.note ?? ''}
            placeholder="z. B. Eigennutzung"
            style={fieldStyle}
          />
        </div>

        <div className="admin-form-actions">
          <a href="/admin/blocked-dates" className="ui-btn ui-btn-secondary ui-btn-md">Abbrechen</a>
          <button type="submit" className="ui-btn ui-btn-primary ui-btn-md">Speichern</button>
        </div>
      </form>
      </div>
    </main>
  );
}
