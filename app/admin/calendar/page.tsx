import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

type SearchParams = Promise<{ year?: string; month?: string }>;
type PageProps = { searchParams: SearchParams };

const STATUS_COLORS: Record<string, string> = {
  new: '#3b82f6',
  answered: '#f59e0b',
  booked: '#10b981',
  cancelled: '#ef4444',
};

const STATUS_BG: Record<string, string> = {
  new: '#eff6ff',
  answered: '#fffbeb',
  booked: '#f0fdf4',
  cancelled: '#fef2f2',
};

const STATUS_LABELS: Record<string, string> = {
  new: 'Neu',
  answered: 'Beantwortet',
  booked: 'Gebucht',
  cancelled: 'Storniert',
};

const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
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

  // Build day → bookings map
  const dayBookings = new Map<string, typeof requests>();
  for (const req of requests) {
    const arrival = new Date(req.arrival);
    const departure = new Date(req.departure);
    const cur = new Date(arrival);
    while (cur < departure) {
      if (cur.getFullYear() === year && cur.getMonth() === month) {
        const key = dateKey(cur);
        if (!dayBookings.has(key)) dayBookings.set(key, []);
        dayBookings.get(key)!.push(req);
      }
      cur.setDate(cur.getDate() + 1);
    }
  }

  // Build calendar grid (Mon=0)
  const firstDayOfWeek = (firstDay.getDay() + 6) % 7;
  const totalDays = lastDay.getDate();
  const days: Array<Date | null> = [];
  for (let i = 0; i < firstDayOfWeek; i++) days.push(null);
  for (let d = 1; d <= totalDays; d++) days.push(new Date(year, month, d));
  while (days.length % 7 !== 0) days.push(null);

  const weeks: Array<Array<Date | null>> = [];
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
    <div style={{ padding: '32px', maxWidth: 1300, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111', margin: 0 }}>Kalender</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link href={prevLink} style={linkStyle}>←</Link>
          <span style={{ fontSize: 18, fontWeight: 600, color: '#111', minWidth: 210, textAlign: 'center' }}>
            {MONTH_NAMES[month]} {year}
          </span>
          <Link href={nextLink} style={linkStyle}>→</Link>
          <Link href={todayLink} style={{ ...linkStyle, marginLeft: 8 }}>Heute</Link>
        </div>
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
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        {/* Weekday headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '2px solid #e5e7eb' }}>
          {WEEKDAYS.map((day, i) => (
            <div key={day} style={{
              padding: '10px 8px',
              textAlign: 'center',
              fontSize: 11,
              fontWeight: 700,
              color: i >= 5 ? '#ef4444' : '#9ca3af',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}>
              {day}
            </div>
          ))}
        </div>

        {/* Weeks */}
        {weeks.map((week, wi) => (
          <div
            key={wi}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              borderBottom: wi < weeks.length - 1 ? '1px solid #f3f4f6' : 'none',
            }}
          >
            {week.map((day, di) => {
              if (!day) {
                return (
                  <div
                    key={di}
                    style={{
                      minHeight: 110,
                      background: '#fafafa',
                      borderRight: di < 6 ? '1px solid #f3f4f6' : 'none',
                    }}
                  />
                );
              }

              const key = dateKey(day);
              const bookings = dayBookings.get(key) ?? [];
              const isToday = key === todayKey;
              const isWeekend = di >= 5;

              return (
                <div
                  key={di}
                  style={{
                    minHeight: 110,
                    padding: '8px 6px',
                    background: isWeekend ? '#fafafa' : '#fff',
                    borderRight: di < 6 ? '1px solid #f3f4f6' : 'none',
                  }}
                >
                  {/* Day number */}
                  <div style={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    background: isToday ? '#111' : 'transparent',
                    color: isToday ? '#fff' : isWeekend ? '#ef4444' : '#374151',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: isToday ? 700 : 400,
                    marginBottom: 4,
                    flexShrink: 0,
                  }}>
                    {day.getDate()}
                  </div>

                  {/* Booking chips */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {bookings.slice(0, 3).map((req) => {
                      const aptIds = req.selectedApartmentIds.split(',').map(Number).filter(Boolean);
                      const aptName = aptIds.length > 0 ? (apartmentMap.get(aptIds[0]) ?? 'Apt') : '';
                      const isArrival = dateKey(new Date(req.arrival)) === key;
                      const name = `${req.firstname ? req.firstname[0] + '. ' : ''}${req.lastname}`;

                      return (
                        <Link
                          key={req.id}
                          href={`/admin/requests`}
                          style={{
                            display: 'block',
                            padding: '2px 5px',
                            borderRadius: 3,
                            background: STATUS_BG[req.status] ?? '#f3f4f6',
                            borderLeft: `3px solid ${STATUS_COLORS[req.status] ?? '#9ca3af'}`,
                            fontSize: 10,
                            color: '#111',
                            textDecoration: 'none',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            lineHeight: 1.5,
                          }}
                          title={`${name}${aptName ? ' · ' + aptName : ''} | ${req.nights} Nächte`}
                        >
                          {isArrival ? '↘ ' : ''}{name}{aptName ? ` · ${aptName}` : ''}
                        </Link>
                      );
                    })}
                    {bookings.length > 3 && (
                      <div style={{ fontSize: 10, color: '#9ca3af', paddingLeft: 5 }}>
                        +{bookings.length - 3} weitere
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {requests.length === 0 && cancelledCount === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#9ca3af', fontSize: 14 }}>
          Keine Anfragen in diesem Monat
        </div>
      )}
    </div>
  );
}
