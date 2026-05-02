import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import { writeAuditLog } from '@/src/lib/audit';
import { hasPlanAccess } from '@/src/lib/plan-gates';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import PriceSeasonList from './PriceSeasonList';
import ProLockOverlay from '../components/ProLockOverlay';
import { createChildPriceRange, deleteChildPriceRange } from '../child-pricing/actions';
import OrtstaxeForm from './OrtstaxeForm';

export const dynamic = 'force-dynamic';


async function deleteSeason(formData: FormData) {
  'use server';

  const session = await verifySession();
  const id = Number(formData.get('id'));
  if (!id) return;

  const season = await prisma.priceSeason.findUnique({
    where: { id },
    include: { apartment: { select: { hotelId: true, name: true } } },
  });
  if (!season) return;
  if (session.hotelId !== null && season.apartment?.hotelId !== session.hotelId) return;

  await prisma.priceSeason.delete({ where: { id } });

  if (season.apartment) {
    await writeAuditLog(season.apartment.hotelId, {
      price_season_deleted: `${season.name || 'Saison'} | ${season.apartment.name} | ${season.startDate.toISOString().slice(0, 10)}–${season.endDate.toISOString().slice(0, 10)} | €${season.pricePerNight}/Nacht`,
    }, {
      price_season_deleted: null,
    });
  }
}

async function saveOrtstaxe(formData: FormData) {
  'use server';
  const session = await verifySession();
  const hotelId = Number(formData.get('hotelId') || 0);
  if (!hotelId) return;
  if (session.hotelId !== null && hotelId !== session.hotelId) return;

  const mode = String(formData.get('ortstaxeMode') || 'off');
  const ortstaxeData = {
    ortstaxeMode: mode,
    ortstaxePerPersonPerNight: mode === 'custom' ? (parseFloat(String(formData.get('ortstaxePerPersonPerNight') || '0')) || null) : null,
    ortstaxeMinAge: mode === 'custom' ? (parseInt(String(formData.get('ortstaxeMinAge') || '0')) || null) : null,
  };

  await prisma.hotelSettings.upsert({
    where: { hotelId },
    update: ortstaxeData,
    create: { hotelId, ...ortstaxeData },
  });
}

async function saveTaxRates(formData: FormData) {
  'use server';
  const session = await verifySession();
  const hotelId = Number(formData.get('hotelId') || 0);
  if (!hotelId) return;
  if (session.hotelId !== null && hotelId !== session.hotelId) return;

  const taxData = {
    taxRateRoom: parseFloat(String(formData.get('taxRateRoom') || '')) || null,
    taxRateCleaning: parseFloat(String(formData.get('taxRateCleaning') || '')) || null,
  };

  await prisma.hotelSettings.upsert({
    where: { hotelId },
    update: taxData,
    create: { hotelId, ...taxData },
  });

  revalidatePath('/admin/price-seasons');
}

async function saveDynamicPricing(formData: FormData) {
  'use server';
  const session = await verifySession();
  const hotelId = Number(formData.get('hotelId') || 0);
  if (!hotelId) return;
  if (session.hotelId !== null && hotelId !== session.hotelId) return;

  await prisma.hotelSettings.upsert({
    where: { hotelId },
    update: {
      lastMinuteDiscountPercent: parseInt(String(formData.get('lastMinuteDiscountPercent') || '0')) || 0,
      lastMinuteDiscountDays: parseInt(String(formData.get('lastMinuteDiscountDays') || '7')) || 7,
      occupancySurchargePercent: parseInt(String(formData.get('occupancySurchargePercent') || '0')) || 0,
      occupancySurchargeThreshold: parseInt(String(formData.get('occupancySurchargeThreshold') || '70')) || 70,
      showUrgencySignals: formData.get('showUrgencySignals') === 'on',
      urgencyThreshold: parseInt(String(formData.get('urgencyThreshold') || '40')) || 40,
      gapNightDiscount: parseInt(String(formData.get('gapNightDiscount') || '0')) || null,
      gapNightMaxLength: parseInt(String(formData.get('gapNightMaxLength') || '0')) || null,
    },
    create: {
      hotelId,
      lastMinuteDiscountPercent: parseInt(String(formData.get('lastMinuteDiscountPercent') || '0')) || 0,
      lastMinuteDiscountDays: parseInt(String(formData.get('lastMinuteDiscountDays') || '7')) || 7,
      occupancySurchargePercent: parseInt(String(formData.get('occupancySurchargePercent') || '0')) || 0,
      occupancySurchargeThreshold: parseInt(String(formData.get('occupancySurchargeThreshold') || '70')) || 70,
      showUrgencySignals: formData.get('showUrgencySignals') === 'on',
      urgencyThreshold: parseInt(String(formData.get('urgencyThreshold') || '40')) || 40,
      gapNightDiscount: parseInt(String(formData.get('gapNightDiscount') || '0')) || null,
      gapNightMaxLength: parseInt(String(formData.get('gapNightMaxLength') || '0')) || null,
    },
  });

  revalidatePath('/admin/price-seasons');
}

export default async function PriceSeasonsPage() {
  const session = await verifySession();

  const isSuperAdmin = session.hotelId === null;
  const selectedHotelId = session.hotelId;

  const hotelData = selectedHotelId !== null
    ? await prisma.hotel.findUnique({ where: { id: selectedHotelId }, select: { plan: true, settings: { select: { lastMinuteDiscountPercent: true, lastMinuteDiscountDays: true, occupancySurchargePercent: true, occupancySurchargeThreshold: true, showUrgencySignals: true, urgencyThreshold: true, gapNightDiscount: true, gapNightMaxLength: true, ortstaxeMode: true, ortstaxePerPersonPerNight: true, ortstaxeMinAge: true, taxRateRoom: true, taxRateCleaning: true } } } })
    : null;

  const hasPro = isSuperAdmin || hasPlanAccess(hotelData?.plan ?? 'starter', 'pro');
  const hasBusiness = isSuperAdmin || hasPlanAccess(hotelData?.plan ?? 'starter', 'business');
  const s = hotelData?.settings;

  const childRanges = selectedHotelId !== null
    ? await prisma.childPriceRange.findMany({ where: { hotelId: selectedHotelId }, orderBy: [{ sortOrder: 'asc' }, { minAge: 'asc' }] })
    : [];

  const seasons = await prisma.priceSeason.findMany({
    where: selectedHotelId !== null
      ? { apartment: { hotelId: selectedHotelId } }
      : undefined,
    include: { apartment: { include: { hotel: { select: { name: true, settings: { select: { accentColor: true } } } } } } },
    orderBy: { startDate: 'asc' },
  });

  return (
    <main className="admin-page" style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif', background: 'var(--page-bg)', minHeight: '100vh' }}>
      <div style={{ maxWidth: 960, margin: '0 auto', display: 'grid', gap: 24 }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 32, letterSpacing: '-0.03em', color: '#0f172a' }}>Preisanpassungen</h1>
        <p style={{ margin: '6px 0 0', fontSize: 14, color: '#667085' }}>Saisonale Preise, dynamische Rabatte und Abgaben.</p>
      </div>

      {/* Seasons list */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ background: '#fafafa', padding: '14px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#111827' }}>
            Preiszeiträume · {seasons.length} {seasons.length === 1 ? 'Eintrag' : 'Einträge'}
          </h2>
          <Link href="/admin/price-seasons/new">
            <button style={{ padding: '7px 14px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
              Neu anlegen
            </button>
          </Link>
        </div>
        {seasons.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <p style={{ fontSize: 15, color: '#6b7280', marginBottom: 16 }}>Keine Preiszeiträume vorhanden.</p>
            <a href="/admin/price-seasons/new" style={{ padding: '10px 20px', borderRadius: 8, background: 'var(--accent)', color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
              Neuen Preiszeitraum anlegen
            </a>
          </div>
        ) : (
          <div style={{ padding: '16px 20px' }}>
            <PriceSeasonList seasons={seasons} deleteSeason={deleteSeason} isSuperAdmin={isSuperAdmin} />
          </div>
        )}
      </div>

      {/* ORTSTAXE */}
      {selectedHotelId !== null && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ background: '#fafafa', padding: '14px 20px', borderBottom: '1px solid #f3f4f6' }}>
            <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#111827' }}>Ortstaxe / Kurtaxe</h2>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#9ca3af' }}>Wird automatisch zur Buchungssumme addiert und im Widget ausgewiesen.</p>
          </div>
          <div style={{ padding: '20px' }}>
            <OrtstaxeForm
              action={saveOrtstaxe}
              hotelId={selectedHotelId}
              initialMode={s?.ortstaxeMode ?? 'off'}
              initialRate={Number(s?.ortstaxePerPersonPerNight ?? 0)}
              initialMinAge={s?.ortstaxeMinAge ?? null}
            />
          </div>
        </div>
      )}

      {/* KINDERPREISE */}
      {selectedHotelId !== null && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ background: '#fafafa', padding: '14px 20px', borderBottom: '1px solid #f3f4f6' }}>
            <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#111827' }}>Kinderpreise</h2>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#9ca3af' }}>Preis pro Kind und Nacht nach Altersgruppe — ohne Saisonbindung.</p>
          </div>
          <div style={{ padding: '0 0 16px' }}>
            {childRanges.length === 0 ? (
              <div style={{ padding: '24px 20px', fontSize: 13, color: '#9ca3af' }}>
                Noch keine Altersgruppen. Kinder sind standardmäßig kostenlos.
              </div>
            ) : (
              <div>
                {childRanges.map(r => (
                  <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px', borderBottom: '1px solid #f9fafb', flexWrap: 'wrap' }}>
                    <span style={{ flex: '1 1 120px', fontSize: 14, color: '#374151' }}>{r.label || <span style={{ color: '#9ca3af' }}>—</span>}</span>
                    <span style={{ fontSize: 13, color: '#6b7280' }}>{r.minAge}–{r.maxAge} Jahre</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: Number(r.pricePerNight) === 0 ? '#16a34a' : '#111827', minWidth: 100 }}>
                      {Number(r.pricePerNight) === 0 ? 'Gratis' : `€ ${Number(r.pricePerNight).toFixed(2)} / Nacht`}
                    </span>
                    <form action={deleteChildPriceRange}>
                      <input type="hidden" name="id" value={r.id} />
                      <button type="submit" style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #fecaca', background: '#fff', fontSize: 12, cursor: 'pointer', color: '#dc2626' }}>
                        Löschen
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            )}
            <form action={createChildPriceRange} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end', padding: '16px 20px 0', borderTop: childRanges.length > 0 ? '1px solid #f3f4f6' : undefined }}>
              <input type="hidden" name="hotelId" value={selectedHotelId} />
              <div style={{ display: 'grid', gap: 4, flex: '2 1 120px' }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bezeichnung</label>
                <input name="label" placeholder="z. B. Kleinkind" style={{ padding: '7px 10px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13 }} />
              </div>
              <div style={{ display: 'grid', gap: 4, flex: '1 1 60px' }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Von</label>
                <input name="minAge" type="number" min="0" max="17" required placeholder="0" style={{ padding: '7px 10px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13 }} />
              </div>
              <div style={{ display: 'grid', gap: 4, flex: '1 1 60px' }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bis</label>
                <input name="maxAge" type="number" min="0" max="17" required placeholder="6" style={{ padding: '7px 10px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13 }} />
              </div>
              <div style={{ display: 'grid', gap: 4, flex: '1 1 80px' }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>€ / Nacht</label>
                <input name="pricePerNight" type="number" min="0" step="0.01" required placeholder="0.00" style={{ padding: '7px 10px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13 }} />
              </div>
              <button type="submit" style={{ padding: '8px 16px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', alignSelf: 'flex-end' }}>
                Hinzufügen
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DYNAMIC PRICING */}
      {selectedHotelId !== null && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ background: '#fafafa', padding: '14px 20px', borderBottom: '1px solid #f3f4f6' }}>
            <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#111827' }}>Dynamische Preise</h2>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#9ca3af' }}>Automatische Rabatte und Aufschläge.</p>
          </div>
          <div style={{ padding: '20px' }}>
          <form action={saveDynamicPricing} style={{ display: 'grid', gap: 16 }}>
            <input type="hidden" name="hotelId" value={selectedHotelId} />

            <div style={{ position: 'relative', padding: '16px 18px', background: '#f9fafb', borderRadius: 12, border: '1px solid #f0f0f0', display: 'grid', gap: 12 }}>
              {!hasPro && <ProLockOverlay />}
              <div style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>Last-Minute Rabatt</div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ display: 'grid', gap: 6, flex: '1 1 100px' }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280' }}>Rabatt %</label>
                  <input name="lastMinuteDiscountPercent" type="number" min="0" max="100"
                    defaultValue={s?.lastMinuteDiscountPercent ?? 0}
                    style={{ padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14 }} />
                </div>
                <div style={{ display: 'grid', gap: 6, flex: '1 1 100px' }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280' }}>Tage vor Anreise</label>
                  <input name="lastMinuteDiscountDays" type="number" min="1" max="90"
                    defaultValue={s?.lastMinuteDiscountDays ?? 7}
                    style={{ padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14 }} />
                </div>
              </div>
              <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>0% = deaktiviert. Gilt wenn Anreise innerhalb der angegebenen Tage liegt.</p>
            </div>

            <div style={{ position: 'relative', background: '#f9fafb', borderRadius: 12, border: '1px solid #f0f0f0' }}>
              {!hasBusiness && <ProLockOverlay plan="business" />}
              <div style={{ padding: '16px 18px', display: 'grid', gap: 12, opacity: hasBusiness ? 1 : 0.45, filter: hasBusiness ? 'none' : 'grayscale(0.3)' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>Nachfrageaufschlag</div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ display: 'grid', gap: 6, flex: '1 1 100px' }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280' }}>Aufschlag %</label>
                    <input name="occupancySurchargePercent" type="number" min="0" max="100"
                      defaultValue={s?.occupancySurchargePercent ?? 0}
                      style={{ padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14 }} />
                  </div>
                  <div style={{ display: 'grid', gap: 6, flex: '1 1 100px' }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280' }}>Ab Auslastung %</label>
                    <input name="occupancySurchargeThreshold" type="number" min="1" max="100"
                      defaultValue={s?.occupancySurchargeThreshold ?? 70}
                      style={{ padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14 }} />
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>0% = deaktiviert. Aufschlag greift wenn die Auslastung den Schwellwert überschreitet.</p>
              </div>
            </div>

            {/* LÜCKEN-RABATT */}
            <div style={{ position: 'relative', padding: '16px 18px', background: '#f9fafb', borderRadius: 12, border: '1px solid #f0f0f0', display: 'grid', gap: 12 }}>
              {!hasPro && <ProLockOverlay />}
              <div style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>Lücken-Rabatt</div>
              <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>Kurze freie Lücken zwischen zwei Buchungen automatisch vergünstigen.</p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ display: 'grid', gap: 6, flex: '1 1 100px' }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280' }}>Rabatt %</label>
                  <input name="gapNightDiscount" type="number" min="1" max="80"
                    defaultValue={s?.gapNightDiscount ?? ''}
                    placeholder="leer = aus"
                    style={{ padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14 }} />
                </div>
                <div style={{ display: 'grid', gap: 6, flex: '1 1 100px' }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280' }}>Max. Lückenlänge (Nächte)</label>
                  <input name="gapNightMaxLength" type="number" min="1" max="14"
                    defaultValue={s?.gapNightMaxLength ?? ''}
                    placeholder="leer = aus"
                    style={{ padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14 }} />
                </div>
              </div>
            </div>

            {/* VERFÜGBARKEITS-HINWEISE */}
            <div style={{ padding: '16px 18px', background: '#f9fafb', borderRadius: 12, border: '1px solid #f0f0f0', display: 'grid', gap: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>Verfügbarkeits-Hinweise (🔥 Banner)</div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                <input type="checkbox" name="showUrgencySignals" defaultChecked={s?.showUrgencySignals ?? false}
                  style={{ width: 15, height: 15, accentColor: 'var(--accent)' }} />
                Aktivieren
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', whiteSpace: 'nowrap' }}>Schwellenwert %</label>
                <input name="urgencyThreshold" type="number" min="10" max="90" step="5"
                  defaultValue={s?.urgencyThreshold ?? 40}
                  style={{ padding: '6px 10px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, width: 80 }} />
                <span style={{ fontSize: 12, color: '#9ca3af' }}>Banner wenn weniger als X % der Nächte im angezeigten Monat frei sind</span>
              </div>
            </div>

            <div>
              <button type="submit" style={{ padding: '10px 20px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                Speichern
              </button>
            </div>
          </form>
          </div>
        </div>
      )}
      {/* STEUEREINSTELLUNGEN */}
      {selectedHotelId !== null && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ background: '#fafafa', padding: '14px 20px', borderBottom: '1px solid #f3f4f6' }}>
            <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#111827' }}>Steuer / Buchhaltung</h2>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#9ca3af' }}>MwSt.-Sätze für den Buchhaltungsexport (CSV). AT: Zimmer 10 %, Reinigung 20 %. DE: Zimmer 7 %, Reinigung 19 %.</p>
          </div>
          <div style={{ padding: '20px' }}>
            <form action={saveTaxRates} style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <input type="hidden" name="hotelId" value={selectedHotelId} />
              <div style={{ display: 'grid', gap: 6, flex: '1 1 140px' }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280' }}>MwSt. Zimmerpreis %</label>
                <input
                  name="taxRateRoom"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  defaultValue={Number(s?.taxRateRoom ?? '') || ''}
                  placeholder="z. B. 10"
                  style={{ padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14 }}
                />
              </div>
              <div style={{ display: 'grid', gap: 6, flex: '1 1 140px' }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280' }}>MwSt. Reinigung %</label>
                <input
                  name="taxRateCleaning"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  defaultValue={Number(s?.taxRateCleaning ?? '') || ''}
                  placeholder="z. B. 20"
                  style={{ padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14 }}
                />
              </div>
              <button type="submit" style={{ padding: '10px 20px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                Speichern
              </button>
            </form>
          </div>
        </div>
      )}
      </div>
    </main>
  );
}
