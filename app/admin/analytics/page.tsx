import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';

export const dynamic = 'force-dynamic';

type SearchParams = Promise<{ hotel?: string; period?: string }>;
type PageProps = { searchParams: SearchParams };

const PERIODS: { value: string; label: string; months: number | null }[] = [
  { value: '1',  label: 'Letzter Monat',    months: 1  },
  { value: '3',  label: 'Letzte 3 Monate',  months: 3  },
  { value: '6',  label: 'Letzte 6 Monate',  months: 6  },
  { value: '12', label: 'Letzte 12 Monate', months: 12 },
  { value: '24', label: 'Letzte 2 Jahre',   months: 24 },
  { value: 'all', label: 'Gesamter Zeitraum', months: null },
];

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

function calcApartmentPrice(
  basePrice: number | null,
  cleaningFee: number | null,
  nights: number,
  arrival: Date,
  seasons: { startDate: Date; endDate: Date; pricePerNight: number }[]
): number {
  let total = 0;
  for (let i = 0; i < nights; i++) {
    const d = new Date(arrival);
    d.setDate(d.getDate() + i);
    const season = seasons.find(s => d >= s.startDate && d <= s.endDate);
    total += Number(season?.pricePerNight ?? basePrice ?? 0);
  }
  return total + Number(cleaningFee ?? 0);
}

export default async function AnalyticsPage({ searchParams }: PageProps) {
  const session = await verifySession();
  const isSuperAdmin = session.hotelId === null;
  const { period: periodParam } = await searchParams;
  const periodKey = PERIODS.find(p => p.value === periodParam) ? periodParam! : '12';
  const periodDef = PERIODS.find(p => p.value === periodKey)!;

  const selectedId = session.hotelId ?? null;

  const hotelFilter = selectedId ? { hotelId: selectedId } : {};

  const now = new Date();
  const periodStart = periodDef.months === null
    ? new Date(2020, 0, 1)
    : new Date(now.getFullYear(), now.getMonth() - (periodDef.months - 1), 1);
  const twelveMonthsAgo = periodStart; // alias used throughout

  const [allRequests, allApartments, blockedRanges] = await Promise.all([
    prisma.request.findMany({
      where: { ...hotelFilter, createdAt: { gte: twelveMonthsAgo } },
      select: {
        id: true, createdAt: true, status: true, nights: true,
        adults: true, children: true, selectedApartmentIds: true,
        extrasJson: true, arrival: true, departure: true, country: true,
        hotel: { select: { name: true } },
      },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.apartment.findMany({
      where: selectedId ? { hotelId: selectedId } : {},
      select: {
        id: true, name: true, basePrice: true, cleaningFee: true,
        priceSeasons: { select: { startDate: true, endDate: true, pricePerNight: true } },
      },
    }),
    prisma.blockedRange.findMany({
      where: {
        ...(selectedId ? { apartment: { hotelId: selectedId } } : {}),
        type: 'booking',
        startDate: { gte: twelveMonthsAgo },
      },
      select: { apartmentId: true, startDate: true, endDate: true },
    }),
  ]);

  // Monthly breakdown
  const chartMonths = periodDef.months === null
    ? (now.getFullYear() - 2020) * 12 + now.getMonth() + 1
    : periodDef.months;
  const monthlyMap = new Map<string, number>();
  for (let i = chartMonths - 1; i >= 0; i--) {
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
  for (const r of allRequests) statusMap[r.status] = (statusMap[r.status] ?? 0) + 1;

  // Top apartments
  const apartmentMap = new Map<string, number>();
  for (const r of allRequests) {
    for (const idStr of r.selectedApartmentIds.split(',')) {
      const id = idStr.trim();
      if (id) apartmentMap.set(id, (apartmentMap.get(id) ?? 0) + 1);
    }
  }
  const topApartments = [...apartmentMap.entries()]
    .map(([id, count]) => ({
      name: allApartments.find((a) => a.id === Number(id))?.name ?? `#${id}`,
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
      extrasMap.set(item.key, { name: item.name, count: existing.count + 1, revenue: existing.revenue + (item.subtotal ?? 0) });
    }
  }
  const topExtras = [...extrasMap.values()].sort((a, b) => b.count - a.count);

  // Revenue calculation
  let totalRevenue = 0;
  for (const r of allRequests) {
    const aptIds = r.selectedApartmentIds.split(',').map(Number).filter(Boolean);
    for (const aptId of aptIds) {
      const apt = allApartments.find(a => a.id === aptId);
      if (apt && r.arrival && r.nights) {
        totalRevenue += calcApartmentPrice(apt.basePrice, apt.cleaningFee, r.nights, r.arrival, apt.priceSeasons);
      }
    }
    if (Array.isArray(r.extrasJson)) {
      for (const item of r.extrasJson as ExtraLine[]) {
        totalRevenue += item.subtotal ?? 0;
      }
    }
  }
  const avgBookingValue = allRequests.length > 0 ? totalRevenue / allRequests.length : 0;

  // Occupancy per apartment (last 12 months)
  const availableNights = 365;
  const occupancyData = allApartments.map(apt => {
    const bookedNights = blockedRanges
      .filter(b => b.apartmentId === apt.id)
      .reduce((sum, b) => {
        const nights = Math.round((new Date(b.endDate).getTime() - new Date(b.startDate).getTime()) / 86400000);
        return sum + Math.max(0, nights);
      }, 0);
    const pct = Math.min(100, Math.round((bookedNights / availableNights) * 100));
    return { name: apt.name, bookedNights, pct };
  }).sort((a, b) => b.pct - a.pct);

  // Countries
  const countryMap = new Map<string, number>();
  for (const r of allRequests) {
    if (r.country?.trim()) {
      const c = r.country.trim();
      countryMap.set(c, (countryMap.get(c) ?? 0) + 1);
    }
  }
  const topCountries = [...countryMap.entries()]
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
  const maxCountry = Math.max(...topCountries.map(c => c.count), 1);

  // KPIs
  const total = allRequests.length;
  const booked = allRequests.filter((r) => r.status === 'booked').length;
  const conversionRate = total > 0 ? ((booked / total) * 100).toFixed(1) : '0.0';
  const avgNights = total > 0 ? (allRequests.reduce((s, r) => s + r.nights, 0) / total).toFixed(1) : '0.0';
  const avgGuests = total > 0 ? (allRequests.reduce((s, r) => s + r.adults + r.children, 0) / total).toFixed(1) : '0.0';

  const sectionTitleStyle: React.CSSProperties = { margin: '0 0 16px', fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.01em' };

  return (
    <main className="admin-page" style={{ background: 'var(--page-bg)', minHeight: '100vh', fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>
      <div style={{ maxWidth: 1100, display: 'grid', gap: 24 }}>

        {/* Header */}
        <div className="analytics-header">
          <div>
            <h1 style={{ margin: 0, fontSize: 32, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>Analytics</h1>
            <p style={{ margin: '6px 0 0', fontSize: 14, color: 'var(--text-secondary)' }}>
              {periodDef.label}
            </p>
          </div>
          <form method="GET" className="analytics-period-form">
            <select name="period" defaultValue={periodKey} style={{ padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, background: 'var(--surface)' }}>
              {PERIODS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
            <button type="submit" style={{ padding: '9px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 14, cursor: 'pointer', whiteSpace: 'nowrap' }}>Laden</button>
          </form>
        </div>

        {/* KPI Cards */}
        <div className="analytics-kpi">
          {[
            { label: 'Anfragen', value: total },
            { label: 'Gebucht', value: booked },
            { label: 'Conversion', value: `${conversionRate}%` },
            { label: 'Ø Nächte', value: avgNights },
            { label: 'Ø Gäste', value: avgGuests },
            { label: 'Umsatz', value: `€ ${totalRevenue.toLocaleString('de-AT', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` },
            { label: 'Ø Buchungswert', value: `€ ${avgBookingValue.toLocaleString('de-AT', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` },
          ].map(({ label, value }) => (
            <div key={label} className="analytics-card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Monthly chart + status */}
        <div className="analytics-chart-row" style={{ display: 'grid', gap: 16, alignItems: 'start' }}>
          <div className="analytics-card">
            <h2 style={sectionTitleStyle}>Anfragen pro Monat</h2>
            <div style={{ overflowX: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 140, minWidth: 480 }}>
                {monthlyData.map(({ label, count }) => (
                  <div key={label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end', minWidth: 0 }}>
                    <span style={{ fontSize: 10, color: 'var(--text-disabled)' }}>{count > 0 ? count : ''}</span>
                    <div style={{ width: '100%', background: '#3b82f6', borderRadius: '4px 4px 0 0', height: `${(count / maxMonthly) * 110}px`, minHeight: count > 0 ? 4 : 0, opacity: 0.85 }} />
                    <span style={{ fontSize: 9, color: 'var(--text-disabled)', whiteSpace: 'nowrap' }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="analytics-card">
            <h2 style={sectionTitleStyle}>Status</h2>
            <div style={{ display: 'grid', gap: 10 }}>
              {Object.entries(statusMap).sort((a, b) => b[1] - a[1]).map(([status, count]) => (
                <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: STATUS_COLORS[status] ?? '#d1d5db', flexShrink: 0 }} />
                  <span style={{ fontSize: 14, color: 'var(--text-muted)', flex: 1 }}>{STATUS_LABELS[status] ?? status}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{count}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-disabled)', width: 36, textAlign: 'right' }}>
                    {total > 0 ? `${((count / total) * 100).toFixed(0)}%` : ''}
                  </span>
                </div>
              ))}
              {Object.keys(statusMap).length === 0 && <p style={{ margin: 0, fontSize: 14, color: 'var(--text-disabled)' }}>Keine Daten</p>}
            </div>
          </div>
        </div>

        {/* Top Apartments + Extras */}
        <div className="analytics-two-col" style={{ display: 'grid', gap: 16, alignItems: 'start' }}>
          <div className="analytics-card">
            <h2 style={sectionTitleStyle}>Top Apartments</h2>
            {topApartments.length === 0 ? (
              <p style={{ margin: 0, fontSize: 14, color: 'var(--text-disabled)' }}>Keine Daten</p>
            ) : (
              <div style={{ display: 'grid', gap: 10 }}>
                {topApartments.map(({ name, count }) => (
                  <div key={name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>{name}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{count}×</span>
                    </div>
                    <div style={{ height: 6, background: 'var(--border)', borderRadius: 99 }}>
                      <div style={{ height: '100%', width: `${(count / maxApt) * 100}%`, background: '#3b82f6', borderRadius: 99, opacity: 0.8 }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="analytics-card">
            <h2 style={sectionTitleStyle}>Extras Beliebtheit</h2>
            {topExtras.length === 0 ? (
              <p style={{ margin: 0, fontSize: 14, color: 'var(--text-disabled)' }}>Noch keine Extras in Buchungen erfasst.</p>
            ) : (
              <div style={{ display: 'grid', gap: 10 }}>
                {topExtras.map(({ name, count, revenue }) => (
                  <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>{name}</span>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{count}×</div>
                      {revenue > 0 && <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>€ {revenue.toFixed(2)}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Auslastung + Länder */}
        <div className="analytics-two-col" style={{ display: 'grid', gap: 16, alignItems: 'start' }}>

          {/* Occupancy */}
          <div className="analytics-card">
            <h2 style={sectionTitleStyle}>Auslastung (12M)</h2>
            <p style={{ margin: '-8px 0 16px', fontSize: 12, color: 'var(--text-disabled)' }}>Gebuchte Nächte von 365 verfügbaren</p>
            {occupancyData.length === 0 ? (
              <p style={{ margin: 0, fontSize: 14, color: 'var(--text-disabled)' }}>Keine Apartments</p>
            ) : (
              <div style={{ display: 'grid', gap: 12 }}>
                {occupancyData.map(({ name, bookedNights, pct }) => (
                  <div key={name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>{name}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{bookedNights} N. · {pct}%</span>
                    </div>
                    <div style={{ height: 8, background: 'var(--border)', borderRadius: 99 }}>
                      <div style={{
                        height: '100%',
                        width: `${pct}%`,
                        borderRadius: 99,
                        background: pct >= 70 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#3b82f6',
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Countries */}
          <div className="analytics-card">
            <h2 style={sectionTitleStyle}>Herkunftsländer</h2>
            {topCountries.length === 0 ? (
              <p style={{ margin: 0, fontSize: 14, color: 'var(--text-disabled)' }}>Keine Länderdaten erfasst.</p>
            ) : (
              <div style={{ display: 'grid', gap: 10 }}>
                {topCountries.map(({ country, count }) => (
                  <div key={country}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>{country}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{count}</span>
                    </div>
                    <div style={{ height: 6, background: 'var(--border)', borderRadius: 99 }}>
                      <div style={{ height: '100%', width: `${(count / maxCountry) * 100}%`, background: '#8b5cf6', borderRadius: 99, opacity: 0.8 }} />
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
