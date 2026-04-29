'use client';

import { useState, useEffect, useRef } from 'react';

type Booking = { id: number; kind: 'booking'; startDate: string; endDate: string; label: string; requestId: number };
type Block   = { id: number; kind: 'blocked'; startDate: string; endDate: string; note: string | null; type: string };
type AptData = { id: number; name: string; bookings: Booking[]; blocks: Block[] };

const PLATFORM_COLORS: Record<string, { bg: string; text: string }> = {
  'Airbnb':      { bg: '#ff5a5f', text: '#fff' },
  'Booking.com': { bg: '#003580', text: '#fff' },
};

function parsePlatform(note: string | null | undefined): { platform: string; rest: string } | null {
  if (!note) return null;
  const m = note.match(/^\[(.+?)\]\s*(.*)/);
  return m ? { platform: m[1], rest: m[2] } : null;
}

function addDays(iso: string, n: number): string {
  const d = new Date(iso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function daysBetween(from: string, to: string): number {
  return Math.round((new Date(to + 'T00:00:00Z').getTime() - new Date(from + 'T00:00:00Z').getTime()) / 86400000);
}

function monthStart(iso: string): string {
  return iso.slice(0, 7) + '-01';
}

function monthEnd(iso: string): string {
  const d = new Date(iso.slice(0, 7) + '-01T00:00:00Z');
  d.setUTCMonth(d.getUTCMonth() + 1);
  d.setUTCDate(0);
  return d.toISOString().slice(0, 10);
}

function prevMonth(iso: string): string {
  const d = new Date(iso.slice(0, 7) + '-01T00:00:00Z');
  d.setUTCMonth(d.getUTCMonth() - 1);
  return d.toISOString().slice(0, 10);
}

function nextMonth(iso: string): string {
  const d = new Date(iso.slice(0, 7) + '-01T00:00:00Z');
  d.setUTCMonth(d.getUTCMonth() + 1);
  return d.toISOString().slice(0, 10);
}

function formatMonthLabel(iso: string): string {
  const d = new Date(iso + 'T00:00:00Z');
  return d.toLocaleDateString('de-AT', { month: 'long', year: 'numeric', timeZone: 'UTC' });
}

const COL_W = 36; // px per day
const ROW_H = 44;
const LABEL_W = 140;
const WEEKDAY_SHORT = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

export default function GanttView({ todayIso }: { todayIso: string }) {
  const [monthIso, setMonthIso] = useState(() => monthStart(todayIso));
  const [apartments, setApartments] = useState<AptData[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const from = monthStart(monthIso);
  const to = monthEnd(monthIso);

  // Build day array for current month
  const days: string[] = [];
  let cur = from;
  while (cur <= to) { days.push(cur); cur = addDays(cur, 1); }

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/belegungsplan?from=${from}&to=${to}`)
      .then((r) => r.json())
      .then((d) => { setApartments(d.apartments ?? []); setLoading(false); });
  }, [from, to]);

  // Scroll to today on mount
  useEffect(() => {
    if (!scrollRef.current || loading) return;
    const todayIdx = days.indexOf(todayIso);
    if (todayIdx >= 0) {
      scrollRef.current.scrollLeft = Math.max(0, todayIdx * COL_W - 100);
    }
  }, [loading]);

  function barStyle(startDate: string, endDate: string): React.CSSProperties | null {
    const s = startDate < from ? from : startDate;
    const e = endDate > to ? addDays(to, 1) : endDate;
    const startIdx = daysBetween(from, s);
    const span = daysBetween(s, e);
    if (span <= 0) return null;
    return {
      position: 'absolute',
      left: startIdx * COL_W + 2,
      width: span * COL_W - 4,
      top: 6,
      height: ROW_H - 12,
      borderRadius: 6,
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      paddingLeft: 8,
      fontSize: 11,
      fontWeight: 600,
      whiteSpace: 'nowrap',
      boxSizing: 'border-box',
    };
  }

  const totalW = days.length * COL_W;

  return (
    <div>
      {/* Month nav */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <button onClick={() => setMonthIso(prevMonth(monthIso))} style={{ padding: '6px 12px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>‹</button>
        <span style={{ fontWeight: 700, fontSize: 15, minWidth: 160, textAlign: 'center' }}>{formatMonthLabel(from)}</span>
        <button onClick={() => setMonthIso(nextMonth(monthIso))} style={{ padding: '6px 12px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>›</button>
        {monthIso !== monthStart(todayIso) && (
          <button onClick={() => setMonthIso(monthStart(todayIso))} style={{ marginLeft: 4, padding: '6px 12px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', fontSize: 13, cursor: 'pointer', color: '#374151' }}>Heute</button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af', fontSize: 14 }}>Lädt…</div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ display: 'flex' }}>
            {/* Apt label column */}
            <div style={{ width: LABEL_W, flexShrink: 0, borderRight: '1px solid #e5e7eb' }}>
              {/* Header spacer */}
              <div style={{ height: 40, borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }} />
              {apartments.map((apt, i) => (
                <div key={apt.id} style={{ height: ROW_H, display: 'flex', alignItems: 'center', padding: '0 14px', borderBottom: i < apartments.length - 1 ? '1px solid #f3f4f6' : 'none', fontSize: 13, fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {apt.name}
                </div>
              ))}
            </div>

            {/* Scrollable grid */}
            <div ref={scrollRef} style={{ overflowX: 'auto', flex: 1 }}>
              <div style={{ width: totalW, minWidth: '100%' }}>

                {/* Day headers */}
                <div style={{ display: 'flex', height: 40, borderBottom: '1px solid #e5e7eb', background: '#f9fafb', position: 'sticky', top: 0, zIndex: 2 }}>
                  {days.map((d) => {
                    const isToday = d === todayIso;
                    const dow = new Date(d + 'T12:00:00Z').getUTCDay();
                    const isWeekend = dow === 0 || dow === 6;
                    return (
                      <div key={d} style={{ width: COL_W, flexShrink: 0, textAlign: 'center', fontSize: 10, borderRight: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1, background: isToday ? 'var(--accent)' : 'transparent' }}>
                        <span style={{ fontWeight: 700, color: isToday ? '#fff' : isWeekend ? '#6366f1' : '#6b7280' }}>{d.slice(8)}</span>
                        <span style={{ fontSize: 9, color: isToday ? 'rgba(255,255,255,0.8)' : isWeekend ? '#6366f1' : '#9ca3af' }}>{WEEKDAY_SHORT[dow]}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Rows */}
                {apartments.map((apt, i) => (
                  <div key={apt.id} style={{ height: ROW_H, position: 'relative', borderBottom: i < apartments.length - 1 ? '1px solid #f3f4f6' : 'none', display: 'flex' }}>
                    {/* Day cells (background grid) */}
                    {days.map((d) => {
                      const dow = new Date(d + 'T12:00:00Z').getUTCDay();
                      const isWeekend = dow === 0 || dow === 6;
                      const isToday = d === todayIso;
                      return (
                        <div key={d} style={{ width: COL_W, flexShrink: 0, height: '100%', borderRight: '1px solid #f3f4f6', background: isToday ? 'color-mix(in srgb, var(--accent) 6%, transparent)' : isWeekend ? '#fafafa' : 'transparent' }} />
                      );
                    })}

                    {/* Booking bars */}
                    {apt.bookings.map((b) => {
                      const style = barStyle(b.startDate, b.endDate);
                      if (!style) return null;
                      return (
                        <a key={b.id} href={`/admin/requests/${b.requestId}`} title={`${b.label} · ${b.startDate} – ${b.endDate}`} style={{ ...style, background: '#bbf7d0', color: '#166534', textDecoration: 'none', cursor: 'pointer' }}>
                          {b.label}
                        </a>
                      );
                    })}

                    {/* Blocked bars */}
                    {apt.blocks.map((b) => {
                      const style = barStyle(b.startDate, b.endDate);
                      if (!style) return null;
                      const parsed = parsePlatform(b.note);
                      const ps = parsed ? (PLATFORM_COLORS[parsed.platform] ?? { bg: '#fcd34d', text: '#78350f' }) : { bg: '#fcd34d', text: '#78350f' };
                      const label = parsed ? parsed.platform + (parsed.rest ? ` · ${parsed.rest}` : '') : (b.note || 'Gesperrt');
                      return (
                        <div key={b.id} title={label} style={{ ...style, background: ps.bg, color: ps.text }}>
                          {label}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
