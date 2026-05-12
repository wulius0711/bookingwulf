import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import { redirect } from 'next/navigation';
import { ColorField } from '@/app/admin/settings/color-field';
import { Button } from '../../components/ui';

export const dynamic = 'force-dynamic';

const inp: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid var(--border)',
  borderRadius: 8,
  fontSize: 14,
  background: 'var(--surface-2)',
  color: 'var(--text-primary)',
  boxSizing: 'border-box',
};

const lbl: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  color: 'var(--text-muted)',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  marginBottom: 4,
  display: 'block',
};

const fld: React.CSSProperties = { display: 'grid', gap: 4 };

const card: React.CSSProperties = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 16,
  overflow: 'hidden',
};

const cardHead: React.CSSProperties = {
  background: 'var(--surface-2)',
  padding: '14px 20px',
  borderBottom: '1px solid var(--border)',
};

const cardBody: React.CSSProperties = { padding: '20px', display: 'grid', gap: 16 };

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
    <main className="admin-page">
      <div style={{ maxWidth: 640, display: 'grid', gap: 24 }}>

        <div>
          <h1 style={{ margin: 0, fontSize: 28, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>Neues Hotel</h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--text-secondary)' }}>Grunddaten für ein neues Hotel anlegen.</p>
        </div>

        <form action={createHotel} style={{ display: 'grid', gap: 20 }}>

          <div style={card}>
            <div style={cardHead}>
              <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Stammdaten</h2>
            </div>
            <div style={cardBody}>
              <div style={fld}>
                <label style={lbl}>Name *</label>
                <input name="name" required style={inp} placeholder="z. B. Hotel Bergblick" />
              </div>
              <div style={fld}>
                <label style={lbl}>Slug *</label>
                <input name="slug" required style={inp} placeholder="z. B. hotel-bergblick" />
                <span style={{ fontSize: 12, color: 'var(--text-disabled)', marginTop: 2 }}>Kleinbuchstaben, Bindestriche — wird als URL-Kennung verwendet.</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={fld}>
                  <label style={lbl}>E-Mail</label>
                  <input name="email" type="email" style={inp} placeholder="info@hotel.at" />
                </div>
                <div style={fld}>
                  <label style={lbl}>Telefon</label>
                  <input name="phone" style={inp} placeholder="+43 1 234 5678" />
                </div>
              </div>
            </div>
          </div>

          <div style={card}>
            <div style={cardHead}>
              <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Design & Status</h2>
            </div>
            <div style={cardBody}>
              <ColorField label="Akzentfarbe" name="accentColor" defaultValue="#111827" labelStyle={lbl} />
              <label className="form-toggle">
                <input type="checkbox" name="isActive" defaultChecked />
                <span className="toggle-track"><span className="toggle-thumb" /></span>
                Aktiv
              </label>
            </div>
          </div>

          <div className="admin-form-actions">
            <a href="/admin/hotels" className="ui-btn ui-btn-secondary ui-btn-md">Abbrechen</a>
            <Button variant="primary" type="submit">Hotel anlegen</Button>
          </div>

        </form>
      </div>
    </main>
  );
}
