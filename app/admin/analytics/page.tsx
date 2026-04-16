import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';

export const dynamic = 'force-dynamic';

type SearchParams = Promise<{ hotel?: string }>;
type PageProps = { searchParams: SearchParams };

const STATUS_COLORS: Record<string, string> = {
  new: '#3b82f6',
  answered: '#f59e0b',
  booked: '#10b981',
  cancelled: '#ef4444',
};

const STATUS_LABELS: Record<string, string> = {
  new: 'Neu',
  answered: 'Beantwortet',
  booked: 'Gebucht',
  cancelled: 'Storniert',
};

const MONTH_NAMES = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];

export default async function AnalyticsPage({ searchParams }: PageProps) {
  const session = await verifySession();
  const isSuperAdmin = session.hotelId === null;
  const { hotel } = await searchParams;

  const hotels = isSuperAdmin
    ? await prisma.hotel.findMany({ where: { isActive: true }, orderBy: { name: 'asc' }, select: { id: true, name: true, slug: true } })
    : await prisma.hotel.findMany({ where: { id: session.hotelId!, isActive: true }, select: { id: true, name: true, slug: true } });

  const selectedId = isSuperAdmin
    ? hotel && !Number.isNaN(Number(hotel)) ? Number(hotel) : null
    : session.hotelId!;

  const hotelFilter = selectedId ? { hotelId: selectedId } : {};

  // Last 12 months
  const now = new Date();
  const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

  const allRequests = await prisma.request.findMany({
    where: { ...hotelFilter, createdAt: { gte: twelveMonthsAgo } },
    select: {
      id: true,
      createdAt: true,
      status: true,
      nights: true,
      adults: true,
      children: true,
      selectedApartmentIds: true,
      extrasJson: true,
      hotel: { select: { name: true } },
    },
    orderBy: { createdAt: 'asc' },
  });

  // Monthly breakdown
  const monthlyMap = new Map<string, number>();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthlyMap.set(`${d.getFullYear()}-${d.getMonth()}`, 0);
  }
  for (const r of allRequests) {
    const key = `${r.createdAt.getFullYear()}-${r.createdAt.getMonth()}`;
    monthlyMap.set(key, (monthlyMap.get(key) ?? 0) + 1);
  }
  const monthlyData = Array.from(monthlyMap.entries()).map(([key, count]) => {
    const [year, month] = key.split('-').map(Number);
    return { label: `${MONTH_NAMES[month]} ${String(year).slice(2)}`, count };
  });
  const maxMonthly = Math.max(...monthlyData.map((d) => d.count), 1);

  // Status breakdown
  const statusMap: Record<string, number> = {};
  for (const r of allRequests) {
    statusMap[r.status] = (statusMap[r.status] ?? 0) + 1;
  }

  // Top apartments
  const apartmentMap = new Map<string, number>();
  for (const r of allRequests) {
    for (const idStr of r.selectedApartmentIds.split(',')) {
      const id = idStr.trim();
      if (id) apartmentMap.set(id, (apartmentMap.get(id) ?? 0) + 1);
    }
  }
  const apartmentIds = [...apartmentMap.keys()].map(Number).filter(Boolean);
  const apartmentNames = apartmentIds.length
    ? await prisma.apartment.findMany({
        where: { id: { in: apartmentIds } },
        select: { id: true, name: true },
      })
    : [];
  const topApartments = [...apartmentMap.entries()]
    .map(([id, count]) => ({
      name: apartmentNames.find((a) => a.id === Number(id))?.name ?? `#${id}`,
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
  const maxApt = Math.max(...topApartments.map((a) => a.count), 1);

  // Extras popularity
  type ExtraLine = { key: string; name: string; subtotal?: number };
  const extrasMap = new Map<string, { name: string; count: number; revenue: number }>();
  for (const r of allRequests) {
    if (!Array.isArray(r.extrasJson)) continue;
    for (const item of r.extrasJson as ExtraLine[]) {
      const existing = extrasMap.get(item.key) ?? { name: item.name, count: 0, revenue: 0 };
      extrasMap.set(item.key, {
        name: item.name,
        count: existing.count + 1,
        revenue: existing.revenue + (item.subtotal ?? 0),
      });
    }
  }
  const topExtras = [...extrasMap.values()].sort((a, b) => b.count - a.count);

  // KPIs
  const total = allRequests.length;
  const booked = allRequests.filter((r) => r.status === 'booked').length;
  const conversionRate = total > 0 ? ((booked / total) * 100).toFixed(1) : '0.0';
  const avgNights = total > 0
    ? (allRequests.reduce((s, r) => s + r.nights, 0) / total).toFixed(1)
    : '0.0';
  const avgGuests = total > 0
    ? (allRequests.reduce((s, r) => s + r.adults + r.children, 0) / total).toFixed(1)
    : '0.0';

  const cardStyle: React.CSSProperties = {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 16,
    padding: '20px 24px',
  };

  const sectionTitleStyle: React.CSSProperties = {
    margin: '0 0 16px',
    fontSize: 16,
    fontWeight: 600,
    color: '#111827',
    letterSpacing: '-0.01em',
  };

  return (
    <main style={{ padding: 32, background: '#f5f5f7', minHeight: '100vh', fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gap: 24 }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 32, letterSpacing: '-0.03em', color: '#0f172a' }}>Analytics</h1>
            <p style={{ margin: '6px 0 0', fontSize: 14, color: '#667085' }}>
              Letzte 12 Monate{selectedId ? ` · ${hotels.find((h) => h.id === selectedId)?.name}` : ' · Alle Hotels'}
            </p>
          </div>

          {isSuperAdmin && (
            <form method="GET" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <select name="hotel" defaultValue={String(selectedId ?? '')} style={{ padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, background: '#fff' }}>
                <option value="">Alle Hotels</option>
                {hotels.map((h) => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
              <button type="submit" style={{ padding: '9px 16px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', fontSize: 14, cursor: 'pointer' }}>
                Laden
              </button>
            </form>
          )}
        </div>

        {/* KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
          {[
            { label: 'Anfragen (12M)', value: total },
            { label: 'Gebucht', value: booked },
            { label: 'Conversion', value: `${conversionRate}%` },
            { label: 'Ø Nächte', value: avgNights },
            { label: 'Ø Gäste', value: avgGuests },
          ].map(({ label, value }) => (
            <div key={label} style={{ ...cardStyle, textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em' }}>{value}</div>
              <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Monthly chart + status */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16, alignItems: 'start' }}>

          {/* Monthly bar chart */}
          <div style={cardStyle}>
            <h2 style={sectionTitleStyle}>Anfragen pro Monat</h2>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 140 }}>
              {monthlyData.map(({ label, count }) => (
                <div key={label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: 10, color: '#9ca3af' }}>{count > 0 ? count : ''}</span>
                  <div
                    style={{
                      width: '100%',
                      background: '#3b82f6',
                      borderRadius: '4px 4px 0 0',
                      height: `${(count / maxMonthly) * 110}px`,
                      minHeight: count > 0 ? 4 : 0,
                      opacity: 0.85,
                    }}
                  />
                  <span style={{ fontSize: 9, color: '#9ca3af', whiteSpace: 'nowrap' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Status breakdown */}
          <div style={cardStyle}>
            <h2 style={sectionTitleStyle}>Status</h2>
            <div style={{ display: 'grid', gap: 10 }}>
              {Object.entries(statusMap).sort((a, b) => b[1] - a[1]).map(([status, count]) => (
                <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: STATUS_COLORS[status] ?? '#d1d5db', flexShrink: 0 }} />
                  <span style={{ fontSize: 14, color: '#374151', flex: 1 }}>{STATUS_LABELS[status] ?? status}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{count}</span>
                  <span style={{ fontSize: 12, color: '#9ca3af', width: 36, textAlign: 'right' }}>
                    {total > 0 ? `${((count / total) * 100).toFixed(0)}%` : ''}
                  </span>
                </div>
              ))}
              {Object.keys(statusMap).length === 0 && (
                <p style={{ margin: 0, fontSize: 14, color: '#9ca3af' }}>Keine Daten</p>
              )}
            </div>
          </div>
        </div>

        {/* Top Apartments + Extras */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>

          {/* Top apartments */}
          <div style={cardStyle}>
            <h2 style={sectionTitleStyle}>Top Apartments</h2>
            {topApartments.length === 0 ? (
              <p style={{ margin: 0, fontSize: 14, color: '#9ca3af' }}>Keine Daten</p>
            ) : (
              <div style={{ display: 'grid', gap: 10 }}>
                {topApartments.map(({ name, count }) => (
                  <div key={name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{name}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{count}×</span>
                    </div>
                    <div style={{ height: 6, background: '#f3f4f6', borderRadius: 99 }}>
                      <div style={{ height: '100%', width: `${(count / maxApt) * 100}%`, background: '#3b82f6', borderRadius: 99, opacity: 0.8 }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Extras popularity */}
          <div style={cardStyle}>
            <h2 style={sectionTitleStyle}>Extras Beliebtheit</h2>
            {topExtras.length === 0 ? (
              <p style={{ margin: 0, fontSize: 14, color: '#9ca3af' }}>
                Noch keine Extras in Buchungen erfasst.
              </p>
            ) : (
              <div style={{ display: 'grid', gap: 10 }}>
                {topExtras.map(({ name, count, revenue }) => (
                  <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f9fafb' }}>
                    <span style={{ fontSize: 14, color: '#374151', fontWeight: 500 }}>{name}</span>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{count}×</div>
                      {revenue > 0 && (
                        <div style={{ fontSize: 11, color: '#6b7280' }}>€ {revenue.toFixed(2)}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}
