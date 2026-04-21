import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import { redirect } from 'next/navigation';

export default async function NewBlockedDatePage() {
  const session = await verifySession();

  const apartments = await prisma.apartment.findMany({
    where: {
      isActive: true,
      ...(session.hotelId !== null ? { hotelId: session.hotelId } : {}),
    },
    orderBy: { name: 'asc' },
  });

  async function createBlockedDate(formData: FormData) {
    'use server';

    const session = await verifySession();
    const apartmentId = Number(formData.get('apartmentId'));
    const startDate = new Date(String(formData.get('startDate')));
    const endDate = new Date(String(formData.get('endDate')));
    const type = String(formData.get('type') || 'manual');
    const note = String(formData.get('note') || '');

    if (!apartmentId || !startDate || !endDate) return;

    if (session.hotelId !== null) {
      const apt = await prisma.apartment.findUnique({ where: { id: apartmentId }, select: { hotelId: true } });
      if (!apt || apt.hotelId !== session.hotelId) return;
    }

    if (endDate <= startDate) throw new Error('Enddatum muss nach Startdatum liegen');

    await prisma.blockedRange.create({ data: { apartmentId, startDate, endDate, type, note } });
    redirect('/admin/blocked-dates');
  }

  const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 700, color: '#4b5563', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 4 };
  const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, background: '#f9fafb', color: '#111', boxSizing: 'border-box' };
  const fieldWrap: React.CSSProperties = { display: 'grid', gap: 4 };

  return (
    <main className="admin-page" style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>
      <div style={{ maxWidth: 560, margin: '0 auto', display: 'grid', gap: 24 }}>

        <div>
          <h1 style={{ margin: 0, fontSize: 28, letterSpacing: '-0.02em', color: '#0f172a' }}>Neue Blockierung</h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: '#667085' }}>Zeitraum für ein Apartment sperren.</p>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ background: '#fafafa', padding: '14px 20px', borderBottom: '1px solid #f3f4f6' }}>
            <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#111827' }}>Details</h2>
          </div>
          <div style={{ padding: '20px', display: 'grid', gap: 16 }}>
            <form action={createBlockedDate} style={{ display: 'grid', gap: 16 }}>
              <div style={fieldWrap}>
                <label style={labelStyle}>Apartment</label>
                <select name="apartmentId" required style={inputStyle}>
                  <option value="">Bitte auswählen</option>
                  {apartments.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={fieldWrap}>
                  <label style={labelStyle}>Startdatum</label>
                  <input type="date" name="startDate" required style={inputStyle} />
                </div>
                <div style={fieldWrap}>
                  <label style={labelStyle}>Enddatum</label>
                  <input type="date" name="endDate" required style={inputStyle} />
                </div>
              </div>
              <div style={fieldWrap}>
                <label style={labelStyle}>Grund</label>
                <select name="type" style={inputStyle}>
                  <option value="manual">Eigennutzung</option>
                  <option value="other">Sonstiges</option>
                </select>
              </div>
              <div style={fieldWrap}>
                <label style={labelStyle}>Notiz</label>
                <input type="text" name="note" placeholder="z. B. Familienurlaub" style={inputStyle} />
              </div>
              <div style={{ paddingTop: 4 }}>
                <button type="submit" style={{ padding: '11px 24px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
                  Speichern
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </main>
  );
}
