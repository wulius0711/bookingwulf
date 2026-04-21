import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import { hasPlanAccess } from '@/src/lib/plan-gates';
import Link from 'next/link';
import CalendarGrid, { type BookingChip, type BlockedChip } from './CalendarGrid';

export const dynamic = 'force-dynamic';

type SearchParams = Promise<{ year?: string; month?: string }>;
type PageProps = { searchParams: SearchParams };

const STATUS_LABELS: Record<string, string> = {
  new: 'Neu',
  answered: 'Beantwortet',
  booked: 'Gebucht',
  cancelled: 'Storniert',
};

const STATUS_COLORS: Record<string, string> = {
  new: '#3b82f6',
  answered: '#f59e0b',
  booked: '#10b981',
  cancelled: '#ef4444',
};

const MONTH_NAMES = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
];

function dateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default async function CalendarPage({ searchParams }: PageProps) {
  const session = await verifySession();
  const { year: yearStr, month: monthStr } = await searchParams;

  const now = new Date();
  const year = yearStr ? parseInt(yearStr) : now.getFullYear();
  const month = monthStr ? parseInt(monthStr) - 1 : now.getMonth(); // 0-indexed

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const prevDate = new Date(year, month - 1, 1);
  const nextDate = new Date(year, month + 1, 1);
  const prevLink = `/admin/calendar?year=${prevDate.getFullYear()}&month=${prevDate.getMonth() + 1}`;
  const nextLink = `/admin/calendar?year=${nextDate.getFullYear()}&month=${nextDate.getMonth() + 1}`;
  const todayLink = `/admin/calendar?year=${now.getFullYear()}&month=${now.getMonth() + 1}`;

  const isSuperAdmin = session.hotelId === null;
  const hotelData = session.hotelId
    ? await prisma.hotel.findUnique({ where: { id: session.hotelId }, select: { plan: true } })
    : null;
  const hasPro = isSuperAdmin || hasPlanAccess(hotelData?.plan ?? 'starter', 'pro');

  const requests = await prisma.request.findMany({
    where: {
      ...(session.hotelId ? { hotelId: session.hotelId } : {}),
      arrival: { lte: lastDay },
      departure: { gt: firstDay },
      status: { not: 'cancelled' },
    },
    select: {
      id: true,
      firstname: true,
      lastname: true,
      arrival: true,
      departure: true,
      nights: true,
      adults: true,
      children: true,
      selectedApartmentIds: true,
      status: true,
      hotel: { select: { name: true } },
    },
    orderBy: { arrival: 'asc' },
  });

  const cancelledCount = await prisma.request.count({
    where: {
      ...(session.hotelId ? { hotelId: session.hotelId } : {}),
      arrival: { lte: lastDay },
      departure: { gt: firstDay },
      status: 'cancelled',
    },
  });

  const apartments = await prisma.apartment.findMany({
    where: session.hotelId ? { hotelId: session.hotelId } : {},
    select: { id: true, name: true },
  });

  const apartmentMap = new Map(apartments.map((a) => [a.id, a.name]));

  // Build day → bookings map (serializable for client component)
  const dayBookingsMap = new Map<string, BookingChip[]>();
  for (const req of requests) {
    const arrival = new Date(req.arrival);
    const departure = new Date(req.departure);
    const cur = new Date(arrival);
    while (cur < departure) {
      if (cur.getFullYear() === year && cur.getMonth() === month) {
        const key = dateKey(cur);
        if (!dayBookingsMap.has(key)) dayBookingsMap.set(key, []);
        const aptIds = req.selectedApartmentIds.split(',').map(Number).filter(Boolean);
        dayBookingsMap.get(key)!.push({
          id: req.id,
          firstname: req.firstname,
          lastname: req.lastname,
          arrival: req.arrival.toISOString(),
          departure: req.departure.toISOString(),
          nights: req.nights,
          status: req.status,
          aptName: aptIds.length > 0 ? (apartmentMap.get(aptIds[0]) ?? '') : '',
          isArrival: dateKey(arrival) === key,
        });
      }
      cur.setDate(cur.getDate() + 1);
    }
  }
  const dayBookings = Object.fromEntries(dayBookingsMap);

  // Build day → blocked ranges map
  const blockedRanges = await prisma.blockedRange.findMany({
    where: {
      ...(session.hotelId ? { apartment: { hotelId: session.hotelId } } : {}),
      startDate: { lte: lastDay },
      endDate: { gt: firstDay },
    },
    include: { apartment: { select: { name: true } } },
  });

  const dayBlockedMap = new Map<string, BlockedChip[]>();
  for (const r of blockedRanges) {
    const cur = new Date(r.startDate);
    while (cur < r.endDate) {
      if (cur.getFullYear() === year && cur.getMonth() === month) {
        const key = dateKey(cur);
        if (!dayBlockedMap.has(key)) dayBlockedMap.set(key, []);
        dayBlockedMap.get(key)!.push({ id: r.id, aptName: r.apartment?.name ?? '', note: r.note ?? '', type: r.type, startDate: r.startDate.toISOString().slice(0,10), endDate: r.endDate.toISOString().slice(0,10) });
      }
      cur.setDate(cur.getDate() + 1);
    }
  }
  const dayBlocked = Object.fromEntries(dayBlockedMap);

  // Build calendar grid (Mon=0) — serializable as (string | null)[][]
  const firstDayOfWeek = (firstDay.getDay() + 6) % 7;
  const totalDays = lastDay.getDate();
  const days: Array<string | null> = [];
  for (let i = 0; i < firstDayOfWeek; i++) days.push(null);
  for (let d = 1; d <= totalDays; d++) days.push(dateKey(new Date(year, month, d)));
  while (days.length % 7 !== 0) days.push(null);

  const weeks: Array<Array<string | null>> = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));

  const todayKey = dateKey(now);

  // KPIs for the month
  const bookedCount = requests.filter((r) => r.status === 'booked').length;
  const totalNights = requests
    .filter((r) => r.status === 'booked')
    .reduce((sum, r) => sum + r.nights, 0);

  const linkStyle: React.CSSProperties = {
    padding: '8px 14px',
    borderRadius: 8,
    border: '1px solid #e5e7eb',
    background: '#fff',
    color: '#374151',
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: 500,
    lineHeight: 1,
  };

  return (
    <div className="calendar-page">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111', margin: 0 }}>Kalender</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link href={prevLink} style={linkStyle}>←</Link>
          <span className="calendar-nav-title" style={{ fontSize: 18, fontWeight: 600, color: '#111', textAlign: 'center' }}>
            {MONTH_NAMES[month]} {year}
          </span>
          <Link href={nextLink} style={linkStyle}>→</Link>
          <Link href={todayLink} style={{ ...linkStyle, marginLeft: 8 }}>Heute</Link>
        </div>
      </div>

      {/* Drag-select hint */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 13, color: '#6b7280', marginBottom: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 16 }}>💡</span>
        <span>Zeitraum im Kalender per Drag markieren, dann:</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <span style={{ background: '#10b981', color: '#fff', borderRadius: 6, padding: '2px 8px', fontSize: 12, fontWeight: 600 }}>Buchung</span>
          <span style={{ background: '#3b82f6', color: '#fff', borderRadius: 6, padding: '2px 8px', fontSize: 12, fontWeight: 600 }}>Preiszeitraum</span>
          <span style={{ background: '#ef4444', color: '#fff', borderRadius: 6, padding: '2px 8px', fontSize: 12, fontWeight: 600 }}>Sperrzeit</span>
          anlegen
        </span>
      </div>

      {/* KPI row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { label: 'Anfragen', value: requests.length + cancelledCount },
          { label: 'Gebucht', value: bookedCount },
          { label: 'Gebuchte Nächte', value: totalNights },
          { label: 'Storniert', value: cancelledCount },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 20px', minWidth: 110 }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#111' }}>{value}</div>
            <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{label}</div>
          </div>
        ))}
        <div style={{ flex: 1 }} />
        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          {Object.entries(STATUS_LABELS).filter(([s]) => s !== 'cancelled').map(([status, label]) => (
            <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6b7280' }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: STATUS_COLORS[status] }} />
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Calendar grid */}
      <CalendarGrid weeks={weeks} todayKey={todayKey} dayBookings={dayBookings} dayBlocked={dayBlocked} apartments={apartments.map(a => ({ id: a.id, name: a.name }))} hasPro={hasPro} />

      {requests.length === 0 && cancelledCount === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#9ca3af', fontSize: 14 }}>
          Keine Anfragen in diesem Monat
        </div>
      )}
    </div>
  );
}
