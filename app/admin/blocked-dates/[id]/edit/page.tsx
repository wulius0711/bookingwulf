import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import { redirect, notFound } from 'next/navigation';

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
  if (session.hotelId !== null && range.apartment?.hotelId !== session.hotelId) notFound();

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
    const apartmentId = Number(formData.get('apartmentId'));
    const startDate = new Date(String(formData.get('startDate')));
    const endDate = new Date(String(formData.get('endDate')));
    const type = String(formData.get('type') || 'manual');
    const note = String(formData.get('note') || '');

    if (!apartmentId || !startDate || !endDate) return;
    if (endDate <= startDate) throw new Error('Enddatum muss nach Startdatum liegen');

    if (session.hotelId !== null) {
      const apt = await prisma.apartment.findUnique({ where: { id: apartmentId }, select: { hotelId: true } });
      if (!apt || apt.hotelId !== session.hotelId) throw new Error('Zugriff verweigert.');
    }

    await prisma.blockedRange.update({
      where: { id: rangeId },
      data: { apartmentId, startDate, endDate, type, note },
    });

    redirect('/admin/blocked-dates');
  }

  const fmt = (d: Date) => new Date(d).toISOString().slice(0, 10);

  const fieldStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: 8,
    fontSize: 14,
    background: '#ffffff',
    color: '#111',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 700,
    color: '#4b5563',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    marginBottom: 4,
    display: 'block',
  };

  const fieldWrap: React.CSSProperties = { display: 'grid', gap: 4 };

  return (
    <main style={{ padding: 40, fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif', maxWidth: 560 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111', marginBottom: 24 }}>Sperrzeit bearbeiten</h1>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '28px 28px', boxShadow: '0 4px 16px rgba(15,23,42,0.06)' }}>
      <form action={updateBlockedDate} style={{ display: 'grid', gap: 16 }}>
        <div style={fieldWrap}>
          <label style={labelStyle}>Apartment</label>
          <select name="apartmentId" required defaultValue={range.apartmentId ?? ''} style={fieldStyle}>
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
              <div style={{ ...fieldStyle, color: '#6b7280', background: '#f9fafb' }}>Buchung (automatisch)</div>
            </>
          ) : (
            <select name="type" defaultValue={range.type} style={fieldStyle}>
              <option value="manual">Eigennutzung</option>
              <option value="other">Sonstiges</option>
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
          <a href="/admin/blocked-dates" className="btn-cancel">Abbrechen</a>
          <button type="submit" className="btn-primary">Speichern</button>
        </div>
      </form>
      </div>
    </main>
  );
}
