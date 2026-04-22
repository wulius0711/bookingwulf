import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import { redirect } from 'next/navigation';

type PageProps = { searchParams: Promise<{ start?: string; end?: string }> };

export default async function NewRequestPage({ searchParams }: PageProps) {
  const session = await verifySession();
  const { start, end } = await searchParams;

  const apartments = await prisma.apartment.findMany({
    where: {
      isActive: true,
      ...(session.hotelId !== null ? { hotelId: session.hotelId } : {}),
    },
    orderBy: { name: 'asc' },
  });

  async function createRequest(formData: FormData) {
    'use server';
    const session = await verifySession();

    const hotelId = session.hotelId;
    const apartmentId = Number(formData.get('apartmentId'));
    const arrival = new Date(String(formData.get('arrival')));
    const departure = new Date(String(formData.get('departure')));
    const salutation = String(formData.get('salutation') || 'Herr');
    const firstname = String(formData.get('firstname') || '').trim() || null;
    const lastname = String(formData.get('lastname') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const adults = Number(formData.get('adults') || 2);
    const children = Number(formData.get('children') || 0);
    const message = String(formData.get('message') || '').trim() || null;
    const status = String(formData.get('status') || 'booked');

    if (!apartmentId || !lastname || !email || !arrival || !departure) throw new Error('Pflichtfelder fehlen');
    if (departure <= arrival) throw new Error('Abreise muss nach Anreise liegen');

    if (session.hotelId !== null) {
      const apt = await prisma.apartment.findUnique({ where: { id: apartmentId }, select: { hotelId: true } });
      if (!apt || apt.hotelId !== session.hotelId) throw new Error('Zugriff verweigert');
    }

    const nights = Math.round((departure.getTime() - arrival.getTime()) / 86400000);

    const hotel = hotelId
      ? await prisma.hotel.findUnique({ where: { id: hotelId }, select: { id: true } })
      : null;

    await prisma.request.create({
      data: {
        hotelId: hotel?.id ?? null,
        arrival,
        departure,
        nights,
        adults,
        children,
        selectedApartmentIds: String(apartmentId),
        salutation,
        firstname,
        lastname,
        email,
        country: 'AT',
        message,
        status,
      },
    });

    redirect('/admin/requests');
  }

  const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 700, color: '#4b5563', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 4 };
  const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, background: '#f9fafb', color: '#111', boxSizing: 'border-box' };
  const field: React.CSSProperties = { display: 'grid', gap: 4 };

  return (
    <main className="admin-page" style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>
      <div style={{ maxWidth: 560, margin: '0 auto', display: 'grid', gap: 24 }}>

        <div>
          <h1 style={{ margin: 0, fontSize: 28, letterSpacing: '-0.02em', color: '#0f172a' }}>Buchung anlegen</h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: '#667085' }}>Manuelle Buchung erfassen.</p>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ background: '#fafafa', padding: '14px 20px', borderBottom: '1px solid #f3f4f6' }}>
            <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#111827' }}>Details</h2>
          </div>
          <div style={{ padding: '20px' }}>
            <form action={createRequest} style={{ display: 'grid', gap: 16 }}>

              <div style={field}>
                <label style={labelStyle}>Apartment</label>
                <select name="apartmentId" required style={inputStyle}>
                  <option value="">Bitte auswählen</option>
                  {apartments.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={field}>
                  <label style={labelStyle}>Anreise</label>
                  <input type="date" name="arrival" required style={inputStyle} defaultValue={start ?? ''} />
                </div>
                <div style={field}>
                  <label style={labelStyle}>Abreise</label>
                  <input type="date" name="departure" required style={inputStyle} defaultValue={end ?? ''} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={field}>
                  <label style={labelStyle}>Erwachsene</label>
                  <input type="number" name="adults" min={1} defaultValue={2} style={inputStyle} />
                </div>
                <div style={field}>
                  <label style={labelStyle}>Kinder</label>
                  <input type="number" name="children" min={0} defaultValue={0} style={inputStyle} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr', gap: 12 }}>
                <div style={field}>
                  <label style={labelStyle}>Anrede</label>
                  <select name="salutation" style={inputStyle}>
                    <option value="Herr">Herr</option>
                    <option value="Frau">Frau</option>
                    <option value="Divers">Divers</option>
                  </select>
                </div>
                <div style={field}>
                  <label style={labelStyle}>Vorname</label>
                  <input type="text" name="firstname" style={inputStyle} />
                </div>
                <div style={field}>
                  <label style={labelStyle}>Nachname</label>
                  <input type="text" name="lastname" required style={inputStyle} />
                </div>
              </div>

              <div style={field}>
                <label style={labelStyle}>E-Mail</label>
                <input type="email" name="email" required style={inputStyle} placeholder="gast@beispiel.at" />
              </div>

              <div style={field}>
                <label style={labelStyle}>Status</label>
                <select name="status" style={inputStyle}>
                  <option value="booked">Gebucht</option>
                  <option value="new">Neu</option>
                  <option value="answered">Beantwortet</option>
                </select>
              </div>

              <div style={field}>
                <label style={labelStyle}>Notiz</label>
                <textarea name="message" rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Interne Notiz oder Gästewunsch …" />
              </div>

              <div style={{ paddingTop: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button type="submit" style={{ padding: '11px 24px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
                  Speichern
                </button>
                <a href="/admin/requests" style={{ padding: '11px 20px', background: '#fff', color: '#374151', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                  Abbrechen
                </a>
              </div>

            </form>
          </div>
        </div>

      </div>
    </main>
  );
}
