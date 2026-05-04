import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import { notFound, redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { ImageUploadField } from '@/app/admin/components/image-upload-field';
import IcalSection from './IcalSection';
import NukiLockSection from './NukiLockSection';
import { getNukiLocks } from '@/src/lib/nuki';
import { hasPlanAccess } from '@/src/lib/plan-gates';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

const card: React.CSSProperties = { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, overflow: 'hidden' };
const cardHeader: React.CSSProperties = { background: '#fafafa', padding: '14px 20px', borderBottom: '1px solid #f3f4f6' };
const cardTitle: React.CSSProperties = { margin: 0, fontSize: 14, fontWeight: 600, color: '#111827' };
const cardBody: React.CSSProperties = { padding: '20px 20px', display: 'grid', gap: 16 };

const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 700, color: '#4b5563', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 4 };
const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, color: '#111', background: '#f9fafb', boxSizing: 'border-box' };
const fieldWrap: React.CSSProperties = { display: 'grid', gap: 4 };

export default async function EditApartmentPage({ params }: PageProps) {
  const session = await verifySession();
  const { id } = await params;
  const apartmentId = parseInt(id, 10);

  if (!Number.isInteger(apartmentId)) {
    notFound();
  }

  const [apartment, hotels, nukiConfig] = await Promise.all([
    prisma.apartment.findFirst({
      where: {
        id: apartmentId,
        ...(session.hotelId !== null ? { hotelId: session.hotelId } : {}),
      },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        icalFeeds: { orderBy: { createdAt: 'asc' } },
        hotel: { select: { slug: true, plan: true } },
      },
    }),
    session.hotelId !== null
      ? prisma.hotel.findMany({
          where: { id: session.hotelId, isActive: true },
          select: { id: true, name: true, slug: true },
        })
      : prisma.hotel.findMany({
          where: { isActive: true },
          orderBy: { name: 'asc' },
          select: { id: true, name: true, slug: true },
        }),
    session.hotelId
      ? prisma.nukiConfig.findUnique({ where: { hotelId: session.hotelId }, select: { apiToken: true } })
      : null,
  ]);

  if (!apartment) {
    notFound();
  }

  const hotelPlan = apartment.hotel?.plan ?? 'starter';
  const showNuki = hasPlanAccess(hotelPlan, 'pro') && !!nukiConfig;
  let nukiLocks: { smartlockId: number; name: string }[] = [];
  if (showNuki && nukiConfig) {
    try { nukiLocks = await getNukiLocks(nukiConfig.apiToken); } catch { /* ignore */ }
  }

  async function saveNukiLock(formData: FormData) {
    'use server';
    const session = await verifySession();
    const aptId = Number(formData.get('apartmentId') || 0);
    const smartlockId = String(formData.get('nukiSmartlockId') || '').trim();
    if (!aptId) return;
    if (session.hotelId !== null) {
      const apt = await prisma.apartment.findUnique({ where: { id: aptId }, select: { hotelId: true } });
      if (!apt || apt.hotelId !== session.hotelId) return;
    }
    await prisma.apartment.update({
      where: { id: aptId },
      data: { nukiSmartlockId: smartlockId || null },
    });
    revalidatePath(`/admin/apartments/${aptId}`);
  }

  async function updateApartment(formData: FormData) {
    'use server';

    const session = await verifySession();
    const hotelId = Number(formData.get('hotelId') || 0);
    const name = String(formData.get('name') || '').trim();
    const slug = String(formData.get('slug') || '').trim();

    const maxAdults = Number(formData.get('maxAdults') || 2);
    const maxChildren = Number(formData.get('maxChildren') || 0);

    const bedroomsRaw = String(formData.get('bedrooms') || '').trim();
    const sizeRaw = String(formData.get('size') || '').trim();
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

    const bedrooms = bedroomsRaw ? Number(bedroomsRaw) : null;
    const size = sizeRaw ? Number(sizeRaw) : null;
    const basePrice = basePriceRaw ? Number(basePriceRaw) : null;
    const cleaningFee = cleaningFeeRaw ? Number(cleaningFeeRaw) : null;

    const amenities = amenitiesRaw
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean);

    await prisma.apartment.update({
      where: { id: apartmentId },
      data: {
        hotelId,
        name,
        slug,
        maxAdults,
        maxChildren,
        bedrooms,
        size,
        view: view || null,
        amenities,
        description: description || null,
        basePrice,
        cleaningFee,
        sortOrder,
        isActive,
      },
    });

    const imageUrls = formData.getAll('imageUrl').map((v) => String(v).trim());
    const altTexts = formData.getAll('altText').map((v) => String(v).trim());

    const cleanedImages = imageUrls
      .map((url, index) => ({
        imageUrl: url,
        altText: altTexts[index] || null,
        sortOrder: index,
      }))
      .filter((img) => img.imageUrl.length > 0);

    await prisma.apartmentImage.deleteMany({
      where: { apartmentId },
    });

    if (cleanedImages.length > 0) {
      await prisma.apartmentImage.createMany({
        data: cleanedImages.map((img) => ({
          apartmentId,
          imageUrl: img.imageUrl,
          altText: img.altText,
          sortOrder: img.sortOrder,
        })),
      });
    }

    redirect('/admin/apartments');
  }

  return (
    <main className="admin-page" style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', display: 'grid', gap: 24 }}>

        {/* Header */}
        <div>
          <h1 style={{ margin: 0, fontSize: 28, letterSpacing: '-0.02em', color: '#0f172a' }}>Apartment bearbeiten</h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: '#667085' }}>{apartment.name}</p>
        </div>

        <form action={updateApartment} style={{ display: 'grid', gap: 16 }}>
          <input type="hidden" name="hotelId" value={apartment.hotelId} />
          <input type="hidden" name="slug" value={apartment.slug} />

          {/* Allgemein */}
          <div style={card}>
            <div style={cardHeader}><h2 style={cardTitle}>Allgemein</h2></div>
            <div style={cardBody}>
              <div style={fieldWrap}>
                <label style={labelStyle}>Name</label>
                <input name="name" defaultValue={apartment.name} style={inputStyle} required />
              </div>
              <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 14, color: '#374151', cursor: 'pointer' }}>
                  <input type="checkbox" name="isActive" defaultChecked={apartment.isActive} />
                  Aktiv
                </label>
              </div>
              <div style={fieldWrap}>
                <label style={labelStyle}>Sortierung</label>
                <input type="number" name="sortOrder" defaultValue={apartment.sortOrder} style={inputStyle} />
              </div>
            </div>
          </div>

          {/* Kapazität */}
          <div style={card}>
            <div style={cardHeader}><h2 style={cardTitle}>Kapazität</h2></div>
            <div style={{ ...cardBody, gridTemplateColumns: '1fr 1fr' }}>
              <div style={fieldWrap}>
                <label style={labelStyle}>Max. Erwachsene</label>
                <input type="number" name="maxAdults" min="1" defaultValue={apartment.maxAdults} style={inputStyle} />
              </div>
              <div style={fieldWrap}>
                <label style={labelStyle}>Max. Kinder</label>
                <input type="number" name="maxChildren" min="0" defaultValue={apartment.maxChildren} style={inputStyle} />
              </div>
            </div>
          </div>

          {/* Details */}
          <div style={card}>
            <div style={cardHeader}><h2 style={cardTitle}>Details</h2></div>
            <div style={{ ...cardBody, gridTemplateColumns: '1fr 1fr' }}>
              <div style={fieldWrap}>
                <label style={labelStyle}>Größe (m²)</label>
                <input type="number" name="size" min="0" defaultValue={apartment.size ?? ''} style={inputStyle} />
              </div>
              <div style={fieldWrap}>
                <label style={labelStyle}>Schlafzimmer</label>
                <input type="number" name="bedrooms" min="0" defaultValue={apartment.bedrooms ?? ''} style={inputStyle} />
              </div>
              <div style={{ ...fieldWrap, gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Ausblick</label>
                <input name="view" defaultValue={apartment.view ?? ''} placeholder="z. B. Bergblick" style={inputStyle} />
              </div>
            </div>
          </div>

          {/* Preise */}
          <div style={card}>
            <div style={cardHeader}><h2 style={cardTitle}>Preise</h2></div>
            <div style={{ ...cardBody, gridTemplateColumns: '1fr 1fr' }}>
              <div style={fieldWrap}>
                <label style={labelStyle}>Preis pro Nacht (€)</label>
                <input type="number" step="0.01" name="basePrice" defaultValue={apartment.basePrice ?? ''} style={inputStyle} />
              </div>
              <div style={fieldWrap}>
                <label style={labelStyle}>Reinigungsgebühr (€)</label>
                <input type="number" step="0.01" name="cleaningFee" defaultValue={apartment.cleaningFee ?? ''} style={inputStyle} />
              </div>
            </div>
          </div>

          {/* Beschreibung & Ausstattung */}
          <div style={card}>
            <div style={cardHeader}><h2 style={cardTitle}>Beschreibung & Ausstattung</h2></div>
            <div style={cardBody}>
              <div style={fieldWrap}>
                <label style={labelStyle}>Beschreibung</label>
                <textarea name="description" defaultValue={apartment.description || ''} style={{ ...inputStyle, minHeight: 120, resize: 'vertical' }} />
              </div>
              <div style={fieldWrap}>
                <label style={labelStyle}>Ausstattung</label>
                <textarea
                  name="amenities"
                  defaultValue={(apartment.amenities || []).join('\n')}
                  placeholder={`WLAN\nBalkon\nKaffeemaschine`}
                  style={{ ...inputStyle, minHeight: 120, resize: 'vertical' }}
                />
                <span style={{ fontSize: 12, color: '#9ca3af' }}>Eine Ausstattung pro Zeile</span>
              </div>
            </div>
          </div>

          {/* Bilder */}
          <div style={card}>
            <div style={cardHeader}><h2 style={cardTitle}>Bilder</h2></div>
            <div style={cardBody}>
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <ImageUploadField
                  key={index}
                  index={index}
                  defaultUrl={apartment.images[index]?.imageUrl || ''}
                  defaultAlt={apartment.images[index]?.altText || ''}
                />
              ))}
            </div>
          </div>

          <div className="admin-form-actions">
            <a href="/admin/apartments" className="btn-cancel">Abbrechen</a>
            <button type="submit" className="btn-primary">Änderungen speichern</button>
          </div>
        </form>

      {showNuki && (
        <NukiLockSection
          apartmentId={apartmentId}
          currentSmartlockId={apartment.nukiSmartlockId ?? null}
          locks={nukiLocks}
          saveAction={saveNukiLock}
        />
      )}

      <IcalSection
        apartmentId={apartmentId}
        hotelSlug={apartment.hotel?.slug || ''}
        feeds={apartment.icalFeeds.map((f) => ({
          id: f.id,
          name: f.name,
          url: f.url,
          lastSyncAt: f.lastSyncAt?.toISOString() || null,
          lastError: f.lastError,
        }))}
        addFeedAction={async (formData: FormData) => {
          'use server';
          const session = await verifySession();
          const aptId = Number(formData.get('apartmentId') || 0);
          const name = String(formData.get('name') || '').trim();
          const url = String(formData.get('url') || '').trim();
          if (!aptId || !name || !url) return;
          if (session.hotelId !== null) {
            const apt = await prisma.apartment.findUnique({ where: { id: aptId }, select: { hotelId: true } });
            if (!apt || apt.hotelId !== session.hotelId) return;
          }
          await prisma.icalFeed.create({ data: { apartmentId: aptId, name, url } });
          revalidatePath(`/admin/apartments/${aptId}`);
          redirect(`/admin/apartments/${aptId}`);
        }}
        deleteFeedAction={async (formData: FormData) => {
          'use server';
          const session = await verifySession();
          const feedId = Number(formData.get('feedId') || 0);
          if (!feedId) return;
          const feed = await prisma.icalFeed.findUnique({ where: { id: feedId }, include: { apartment: { select: { hotelId: true, id: true } } } });
          if (!feed) return;
          if (session.hotelId !== null && feed.apartment.hotelId !== session.hotelId) return;
          await prisma.icalFeed.delete({ where: { id: feedId } });
          // Also remove synced blocked ranges for this feed
          await prisma.blockedRange.deleteMany({
            where: { apartmentId: feed.apartmentId, type: 'ical_sync', note: { startsWith: `[${feed.name}]` } },
          });
          revalidatePath(`/admin/apartments/${feed.apartment.id}`);
          redirect(`/admin/apartments/${feed.apartment.id}`);
        }}
      />
      </div>{/* /maxWidth */}
    </main>
  );
}
