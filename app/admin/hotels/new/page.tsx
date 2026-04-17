import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import { redirect } from 'next/navigation';
import { ColorField } from '@/app/admin/settings/color-field';

export const dynamic = 'force-dynamic';

const row: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '160px 1fr',
  alignItems: 'start',
  gap: 16,
};

const labelStyle: React.CSSProperties = {
  fontSize: 14,
  color: '#555',
  paddingTop: 10,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #d1d5db',
  borderRadius: 8,
  fontSize: 14,
  background: '#fff',
  color: '#111',
};

export default async function NewHotelPage() {
  const session = await verifySession();
  if (session.role !== 'super_admin') redirect('/admin');

  async function createHotel(formData: FormData) {
    'use server';

    const session = await verifySession();
    if (session.role !== 'super_admin') return;

    const name = formData.get('name')?.toString().trim() ?? '';
    const slug = formData.get('slug')?.toString().trim().toLowerCase() ?? '';
    const email = formData.get('email')?.toString().trim() || null;
    const phone = formData.get('phone')?.toString().trim() || null;
    const accentColor = formData.get('accentColor')?.toString().trim() || null;
    const isActive = formData.get('isActive') === 'on';

    if (!name || !slug) throw new Error('Name und Slug sind erforderlich.');

    const exists = await prisma.hotel.findUnique({ where: { slug } });
    if (exists) throw new Error(`Slug „${slug}" ist bereits vergeben.`);

    await prisma.hotel.create({
      data: { name, slug, email, phone, accentColor, isActive },
    });

    redirect('/admin/hotels');
  }

  return (
    <main style={{ padding: 40, fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif', maxWidth: 700 }}>
      <h1 style={{ marginBottom: 8, fontSize: 26, color: '#111' }}>Neues Hotel</h1>
      <p style={{ marginBottom: 30, fontSize: 13, color: '#666' }}>
        Grunddaten für ein neues Hotel anlegen.
      </p>

      <form action={createHotel} style={{ display: 'grid', gap: 18 }}>
        <div style={row}>
          <label style={labelStyle}>Name *</label>
          <input name="name" required style={inputStyle} placeholder="z. B. Hotel Bergblick" />
        </div>

        <div style={row}>
          <label style={labelStyle}>Slug *</label>
          <div>
            <input
              name="slug"
              required
              style={inputStyle}
              placeholder="z. B. hotel-bergblick"
            />
            <div style={{ marginTop: 6, fontSize: 12, color: '#888' }}>
              Kleinbuchstaben, Bindestriche — wird als URL-Kennung verwendet.
            </div>
          </div>
        </div>

        <div style={row}>
          <label style={labelStyle}>E-Mail</label>
          <input name="email" type="email" style={inputStyle} placeholder="info@hotel.at" />
        </div>

        <div style={row}>
          <label style={labelStyle}>Telefon</label>
          <input name="phone" style={inputStyle} placeholder="+43 1 234 5678" />
        </div>

        <ColorField
          label="Akzentfarbe"
          name="accentColor"
          defaultValue="#111827"
          labelStyle={labelStyle}
        />

        <div style={{ ...row, alignItems: 'center' }}>
          <label style={labelStyle}>Status</label>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center', paddingTop: 8 }}>
            <input type="checkbox" name="isActive" defaultChecked />
            Aktiv
          </label>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <button
            type="submit"
            style={{
              padding: '12px 20px',
              borderRadius: 8,
              background: '#111',
              color: '#fff',
              border: 'none',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Hotel anlegen
          </button>
          <a
            href="/admin/hotels"
            style={{
              padding: '12px 20px',
              borderRadius: 8,
              border: '1px solid #d1d5db',
              background: '#fff',
              color: '#111',
              fontSize: 14,
              textDecoration: 'none',
            }}
          >
            Abbrechen
          </a>
        </div>
      </form>
    </main>
  );
}
