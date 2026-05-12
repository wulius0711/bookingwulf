import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import { redirect } from 'next/navigation';
import { ImageUploadField } from '@/app/admin/components/image-upload-field';
import { NameSlugFields } from '@/app/admin/components/NameSlugFields';
import { canAddApartment } from '@/src/lib/plan-gates';

async function createApartment(formData: FormData) {
  'use server';

  const session = await verifySession();
  const hotelId = Number(formData.get('hotelId') || 0);
  const name = String(formData.get('name') || '').trim();
  const slug = String(formData.get('slug') || '').trim();

  const maxAdults = Number(formData.get('maxAdults') || 2);
  const maxChildren = Number(formData.get('maxChildren') || 0);

  const sizeRaw = String(formData.get('size') || '').trim();
  const bedroomsRaw = String(formData.get('bedrooms') || '').trim();
  const view = String(formData.get('view') || '').trim();

  const basePriceRaw = String(formData.get('basePrice') || '').trim();
  const cleaningFeeRaw = String(formData.get('cleaningFee') || '').trim();

  const sortOrder = Number(formData.get('sortOrder') || 0);
  const isActive = formData.get('isActive') === 'on';

  const description = String(formData.get('description') || '').trim();
  const amenitiesRaw = String(formData.get('amenities') || '').trim();

  if (!hotelId || !name || !slug) {
    throw new Error('Hotel, Name und Slug sind erforderlich.');
  }

  if (session.hotelId !== null && hotelId !== session.hotelId) {
    throw new Error('Zugriff verweigert.');
  }

  const hotel = await prisma.hotel.findUnique({ where: { id: hotelId }, select: { plan: true, _count: { select: { apartments: true } } } });
  if (hotel && !canAddApartment(hotel.plan, hotel._count.apartments)) {
    throw new Error(`Apartment-Limit für Plan "${hotel.plan}" erreicht. Bitte upgraden.`);
  }

  const size = sizeRaw ? Number(sizeRaw) : null;
  const bedrooms = bedroomsRaw ? Number(bedroomsRaw) : null;
  const basePrice = basePriceRaw ? Number(basePriceRaw) : null;
  const cleaningFee = cleaningFeeRaw ? Number(cleaningFeeRaw) : null;

  const amenities = amenitiesRaw
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);

  const imageUrls = formData.getAll('imageUrl').map((v) => String(v).trim());
  const altTexts = formData.getAll('altText').map((v) => String(v).trim());

  const cleanedImages = imageUrls
    .map((url, index) => ({
      imageUrl: url,
      altText: altTexts[index] || null,
      sortOrder: index,
    }))
    .filter((img) => img.imageUrl.length > 0);

  await prisma.apartment.create({
    data: {
      hotelId,
      name,
      slug,
      maxAdults,
      maxChildren,
      size,
      bedrooms,
      view: view || null,
      basePrice,
      cleaningFee,
      sortOrder,
      isActive,
      description: description || null,
      amenities,
      images: cleanedImages.length > 0 ? { create: cleanedImages } : undefined,
    },
  });

  redirect('/admin/apartments');
}

const lbl: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  color: 'var(--text-muted)',
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  display: 'block',
  marginBottom: 4,
};

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

export default async function NewApartmentPage() {
  const session = await verifySession();

  const hotels = session.hotelId !== null
    ? await prisma.hotel.findMany({
        where: { id: session.hotelId, isActive: true },
        select: { id: true, name: true, slug: true },
      })
    : await prisma.hotel.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' },
        select: { id: true, name: true, slug: true },
      });

  return (
    <main className="admin-page">
      <div style={{ maxWidth: 720, display: 'grid', gap: 24 }}>

        <div>
          <h1 style={{ margin: 0, fontSize: 28, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>Neues Apartment</h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--text-secondary)' }}>Apartment anlegen und Basisdaten festlegen.</p>
        </div>

        <form action={createApartment} style={{ display: 'grid', gap: 24 }}>

          {/* Allgemein */}
          <div style={card}>
            <div style={cardHead}>
              <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Allgemein</h2>
            </div>
            <div style={cardBody}>
              {session.hotelId === null ? (
                <div style={fld}>
                  <label style={lbl}>Hotel *</label>
                  <select name="hotelId" required style={inp} defaultValue="">
                    <option value="" disabled>Hotel auswählen</option>
                    {hotels.map((h) => (
                      <option key={h.id} value={h.id}>{h.name} ({h.slug})</option>
                    ))}
                  </select>
                </div>
              ) : (
                <input type="hidden" name="hotelId" value={session.hotelId} />
              )}

              <NameSlugFields fieldStyle={fld} labelStyle={lbl} inputStyle={inp} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={fld}>
                  <label style={lbl}>Sortierung</label>
                  <input type="number" name="sortOrder" defaultValue={0} style={inp} />
                </div>
                <div style={fld}>
                  <label style={lbl}>Status</label>
                  <label className="form-toggle">
                    <input type="checkbox" name="isActive" defaultChecked />
                    <span className="toggle-track"><span className="toggle-thumb" /></span>
                    Aktiv
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Kapazität & Details */}
          <div style={card}>
            <div style={cardHead}>
              <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Kapazität & Details</h2>
            </div>
            <div style={cardBody}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={fld}>
                  <label style={lbl}>Max. Erwachsene</label>
                  <input type="number" name="maxAdults" defaultValue={2} min={1} style={inp} />
                </div>
                <div style={fld}>
                  <label style={lbl}>Max. Kinder</label>
                  <input type="number" name="maxChildren" defaultValue={0} min={0} style={inp} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div style={fld}>
                  <label style={lbl}>Schlafzimmer</label>
                  <input type="number" name="bedrooms" min={0} style={inp} />
                </div>
                <div style={fld}>
                  <label style={lbl}>Größe (m²)</label>
                  <input type="number" name="size" min={0} style={inp} />
                </div>
                <div style={fld}>
                  <label style={lbl}>Ausblick</label>
                  <input name="view" placeholder="z. B. Bergblick" style={inp} />
                </div>
              </div>
            </div>
          </div>

          {/* Preise */}
          <div style={card}>
            <div style={cardHead}>
              <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Preise</h2>
            </div>
            <div style={cardBody}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={fld}>
                  <label style={lbl}>Preis pro Nacht (€)</label>
                  <input type="number" step="0.01" name="basePrice" placeholder="0.00" style={inp} />
                </div>
                <div style={fld}>
                  <label style={lbl}>Reinigungsgebühr (€)</label>
                  <input type="number" step="0.01" name="cleaningFee" placeholder="0.00" style={inp} />
                </div>
              </div>
            </div>
          </div>

          {/* Beschreibung & Ausstattung */}
          <div style={card}>
            <div style={cardHead}>
              <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Beschreibung & Ausstattung</h2>
            </div>
            <div style={cardBody}>
              <div style={fld}>
                <label style={lbl}>Beschreibung</label>
                <textarea name="description" rows={4} style={{ ...inp, resize: 'vertical' }} />
              </div>
              <div style={fld}>
                <label style={lbl}>Ausstattung <span style={{ fontWeight: 400, textTransform: 'none', fontSize: 11, color: 'var(--text-disabled)' }}>(eine pro Zeile)</span></label>
                <textarea
                  name="amenities"
                  rows={6}
                  placeholder={'WLAN\nBalkon\nKaffeemaschine'}
                  style={{ ...inp, resize: 'vertical' }}
                />
              </div>
            </div>
          </div>

          {/* Bilder */}
          <div style={card}>
            <div style={cardHead}>
              <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Bilder</h2>
            </div>
            <div style={{ padding: '20px', display: 'grid', gap: 12 }}>
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <ImageUploadField key={index} index={index} />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="admin-form-actions">
            <a href="/admin/apartments" className="ui-btn ui-btn-secondary ui-btn-md">Abbrechen</a>
            <button type="submit" className="ui-btn ui-btn-primary ui-btn-md">Apartment anlegen</button>

          </div>

        </form>
      </div>
    </main>
  );
}
