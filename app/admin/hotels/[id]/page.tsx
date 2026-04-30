import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import { notFound, redirect } from 'next/navigation';
import { ColorField } from '@/app/admin/settings/color-field';
import HungrywulfToggle from './HungrywulfToggle';
import EventwulfToggle from './EventwulfToggle';

export const dynamic = 'force-dynamic';

type PageProps = { params: Promise<{ id: string }> };

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
      eventwulfEnabled: true, eventwulfOrgId: true,
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

    const conflict = await prisma.hotel.findFirst({ where: { slug, NOT: { id: hotelId } } });
    if (conflict) throw new Error(`Slug „${slug}" ist bereits vergeben.`);

    await prisma.hotel.update({ where: { id: hotelId }, data: { name, slug, email, phone, accentColor, isActive } });
    redirect('/admin/hotels');
  }

  const s = {
    page: { padding: '32px 40px', fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif', maxWidth: 820 } satisfies React.CSSProperties,
    backLink: { display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6b7280', textDecoration: 'none', marginBottom: 20 } satisfies React.CSSProperties,
    header: { marginBottom: 28 } satisfies React.CSSProperties,
    title: { fontSize: 22, fontWeight: 700, color: '#111', margin: 0 } satisfies React.CSSProperties,
    sub: { fontSize: 13, color: '#6b7280', marginTop: 4 } satisfies React.CSSProperties,
    card: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '24px 28px', marginBottom: 24 } satisfies React.CSSProperties,
    cardTitle: { fontSize: 13, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: 20 },
    field: { display: 'grid', gridTemplateColumns: '140px 1fr', alignItems: 'start', gap: 12, marginBottom: 16 } satisfies React.CSSProperties,
    label: { fontSize: 14, color: '#374151', paddingTop: 9, fontWeight: 500 } satisfies React.CSSProperties,
    input: { width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, background: '#fff', color: '#111', boxSizing: 'border-box' as const },
    hint: { fontSize: 12, color: '#9ca3af', marginTop: 4 } satisfies React.CSSProperties,
    btnPrimary: { padding: '9px 20px', borderRadius: 8, background: '#111', color: '#fff', border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer' } satisfies React.CSSProperties,
    btnSecondary: { padding: '9px 20px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', color: '#374151', fontSize: 14, fontWeight: 500, textDecoration: 'none', display: 'inline-block' } satisfies React.CSSProperties,
    integGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 } satisfies React.CSSProperties,
    integCard: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '20px 24px' } satisfies React.CSSProperties,
    integIcon: { width: 36, height: 36, borderRadius: 10, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', marginBottom: 12 } satisfies React.CSSProperties,
    integName: { fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 4 } satisfies React.CSSProperties,
    integDesc: { fontSize: 13, color: '#6b7280', marginBottom: 4 } satisfies React.CSSProperties,
    integId: { fontSize: 11, color: '#9ca3af', fontFamily: 'monospace', marginBottom: 16, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const } satisfies React.CSSProperties,
  };

  return (
    <main style={s.page} className="hotel-edit-page">
      <style>{`
        @media (max-width: 640px) {
          .hotel-edit-page { padding: 16px !important; }
          .hotel-edit-page .he-card { padding: 16px !important; }
          .hotel-edit-page .he-field { grid-template-columns: 1fr !important; gap: 4px !important; }
          .hotel-edit-page .he-field label,
          .hotel-edit-page .he-field span { padding-top: 0 !important; }
          .hotel-edit-page .he-integ-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <a href="/admin/hotels" style={s.backLink}>← Hotels</a>

      <div style={s.header}>
        <h1 className="page-title">Hotel bearbeiten</h1>
        <p className="page-subtitle">{hotel.name} · ID {hotel.id}</p>
      </div>

      {/* Form card */}
      <div style={s.card} className="he-card">
        <div style={s.cardTitle}>Stammdaten</div>
        <form action={updateHotel}>
          <div style={s.field} className="he-field">
            <label style={s.label}>Name *</label>
            <input name="name" required defaultValue={hotel.name} style={s.input} />
          </div>

          <div style={s.field} className="he-field">
            <label style={s.label}>Slug *</label>
            <div>
              <input name="slug" required defaultValue={hotel.slug} style={s.input} />
              <p style={s.hint}>Kleinbuchstaben, Bindestriche — URL-Kennung</p>
            </div>
          </div>

          <div style={s.field} className="he-field">
            <label style={s.label}>E-Mail</label>
            <input name="email" type="email" defaultValue={hotel.email ?? ''} style={s.input} placeholder="info@hotel.at" />
          </div>

          <div style={s.field} className="he-field">
            <label style={s.label}>Telefon</label>
            <input name="phone" defaultValue={hotel.phone ?? ''} style={s.input} placeholder="+43 1 234 5678" />
          </div>

          <div style={s.field} className="he-field">
            <span style={s.label}>Akzentfarbe</span>
            <ColorField label="" name="accentColor" defaultValue={hotel.accentColor ?? '#111827'} labelStyle={{ display: 'none' }} />
          </div>

          <div style={{ ...s.field, alignItems: 'center', marginBottom: 0 }} className="he-field">
            <label style={s.label}>Status</label>
            <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 14, color: '#374151' }}>
              <input type="checkbox" name="isActive" defaultChecked={hotel.isActive} />
              Aktiv
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, paddingTop: 20, borderTop: '1px solid #f3f4f6' }}>
            <button type="submit" style={s.btnPrimary}>Speichern</button>
            <a href="/admin/hotels" style={s.btnSecondary}>Abbrechen</a>
          </div>
        </form>
      </div>

      {/* Integrations */}
      <div style={s.cardTitle}>Integrationen</div>
      <div style={s.integGrid} className="he-integ-grid">
        <div style={s.integCard}>
          <div style={s.integIcon}>🍽</div>
          <div style={s.integName}>hungrywulf</div>
          <div style={s.integDesc}>Tischreservierungs-App für Restaurants</div>
          {hotel.hungrywulfRestaurantId && (
            <span style={s.integId}>ID: {hotel.hungrywulfRestaurantId}</span>
          )}
          <HungrywulfToggle hotelId={hotel.id} enabled={hotel.hungrywulfEnabled} />
        </div>

        <div style={s.integCard}>
          <div style={s.integIcon}>📅</div>
          <div style={s.integName}>eventwulf</div>
          <div style={s.integDesc}>Eventbuchungs-App</div>
          {hotel.eventwulfOrgId && (
            <span style={s.integId}>ID: {hotel.eventwulfOrgId}</span>
          )}
          <EventwulfToggle hotelId={hotel.id} enabled={hotel.eventwulfEnabled} />
        </div>
      </div>
    </main>
  );
}
