import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import { notFound, redirect } from 'next/navigation';
import { ColorField } from '@/app/admin/settings/color-field';
import HungrywulfToggle from './HungrywulfToggle';

export const dynamic = 'force-dynamic';

type PageProps = { params: Promise<{ id: string }> };

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

export default async function EditHotelPage({ params }: PageProps) {
  const session = await verifySession();
  if (session.role !== 'super_admin') redirect('/admin');

  const { id } = await params;
  const hotelId = parseInt(id, 10);
  if (!Number.isInteger(hotelId)) notFound();

  const hotel = await prisma.hotel.findUnique({
    where: { id: hotelId },
    select: {
      id: true, name: true, slug: true, email: true, phone: true,
      accentColor: true, isActive: true,
      hungrywulfEnabled: true, hungrywulfRestaurantId: true,
    },
  });
  if (!hotel) notFound();

  async function updateHotel(formData: FormData) {
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

    const conflict = await prisma.hotel.findFirst({
      where: { slug, NOT: { id: hotelId } },
    });
    if (conflict) throw new Error(`Slug „${slug}" ist bereits vergeben.`);

    await prisma.hotel.update({
      where: { id: hotelId },
      data: { name, slug, email, phone, accentColor, isActive },
    });

    redirect('/admin/hotels');
  }

  return (
    <main style={{ padding: 40, fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif', maxWidth: 700 }}>
      <h1 style={{ marginBottom: 8, fontSize: 26, color: '#111' }}>Hotel bearbeiten</h1>
      <p style={{ marginBottom: 30, fontSize: 13, color: '#666' }}>{hotel.name}</p>

      <form action={updateHotel} style={{ display: 'grid', gap: 18 }}>
        <div style={row}>
          <label style={labelStyle}>Name *</label>
          <input name="name" required defaultValue={hotel.name} style={inputStyle} />
        </div>

        <div style={row}>
          <label style={labelStyle}>Slug *</label>
          <div>
            <input
              name="slug"
              required
              defaultValue={hotel.slug}
              style={inputStyle}
            />
            <div style={{ marginTop: 6, fontSize: 12, color: '#888' }}>
              Kleinbuchstaben, Bindestriche — wird als URL-Kennung verwendet.
            </div>
          </div>
        </div>

        <div style={row}>
          <label style={labelStyle}>E-Mail</label>
          <input
            name="email"
            type="email"
            defaultValue={hotel.email ?? ''}
            style={inputStyle}
            placeholder="info@hotel.at"
          />
        </div>

        <div style={row}>
          <label style={labelStyle}>Telefon</label>
          <input
            name="phone"
            defaultValue={hotel.phone ?? ''}
            style={inputStyle}
            placeholder="+43 1 234 5678"
          />
        </div>

        <ColorField
          label="Akzentfarbe"
          name="accentColor"
          defaultValue={hotel.accentColor ?? '#111827'}
          labelStyle={labelStyle}
        />

        <div style={{ ...row, alignItems: 'center' }}>
          <label style={labelStyle}>Status</label>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center', paddingTop: 8 }}>
            <input type="checkbox" name="isActive" defaultChecked={hotel.isActive} />
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
            Speichern
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

      {/* hungrywulf Integration */}
      <div style={{ marginTop: 48, paddingTop: 32, borderTop: '1px solid #e5e7eb' }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: '#111', marginBottom: 6 }}>hungrywulf</h2>
        <p style={{ fontSize: 13, color: '#666', marginBottom: 20 }}>
          Tischreservierungs-App für Restaurants.{' '}
          {hotel.hungrywulfRestaurantId && (
            <span style={{ color: '#6b7280' }}>Restaurant-ID: <code style={{ fontSize: 12 }}>{hotel.hungrywulfRestaurantId}</code></span>
          )}
        </p>
        <HungrywulfToggle hotelId={hotel.id} enabled={hotel.hungrywulfEnabled} />
      </div>
    </main>
  );
}
