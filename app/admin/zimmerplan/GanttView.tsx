'use client';

import { useState, useEffect, useRef } from 'react';
import { useFocusTrap } from '@/app/admin/hooks/useFocusTrap';

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

function monthStart(iso: string): string { return iso.slice(0, 7) + '-01'; }

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
  return new Date(iso + 'T00:00:00Z').toLocaleDateString('de-AT', { month: 'long', year: 'numeric', timeZone: 'UTC' });
}

function formatDisplay(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y}`;
}

const COL_W = 36;
const ROW_H = 44;
const LABEL_W = 140;

function weekdayMon(iso: string): number {
  const dow = new Date(iso + 'T00:00:00Z').getUTCDay();
  return dow === 0 ? 6 : dow - 1;
}

type CalItem =
  | { kind: 'booking'; id: number; start: string; end: string; label: string; requestId: number }
  | { kind: 'blocked'; id: number; start: string; end: string; note: string | null; type: string };

function ApartmentCalendar({ apt, allApts, todayIso, initialMonth, onClose, onSelectItem }: { apt: AptData; allApts: AptData[]; todayIso: string; initialMonth: string; onClose: () => void; onSelectItem: (item: SelectedItem) => void }) {
  const [monthIso, setMonthIso] = useState(() => initialMonth);
  const [aptId, setAptId] = useState(apt.id);
  const [aptData, setAptData] = useState<AptData>(apt);
  const [loading, setLoading] = useState(false);

  const aptCalRef = useFocusTrap(true, onClose);

  const from = monthStart(monthIso);
  const to = monthEnd(monthIso);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/belegungsplan?from=${from}&to=${to}`)
      .then(r => r.json())
      .then(d => {
        const found = (d.apartments ?? []).find((a: AptData) => a.id === aptId);
        if (found) setAptData(found);
        setLoading(false);
      });
  }, [from, to, aptId]); // eslint-disable-line react-hooks/exhaustive-deps

  const gridStart = addDays(from, -weekdayMon(from));
  const gridEnd = addDays(to, 6 - weekdayMon(to));

  const weeks: string[][] = [];
  let cur = gridStart;
  while (cur <= gridEnd) {
    const week: string[] = [];
    for (let i = 0; i < 7; i++) { week.push(cur); cur = addDays(cur, 1); }
    weeks.push(week);
  }

  const isCurrentMonth = monthIso === monthStart(todayIso);

  const items: CalItem[] = [
    ...aptData.bookings.map(b => ({ kind: 'booking' as const, id: b.id, start: b.startDate, end: b.endDate, label: b.label, requestId: b.requestId })),
    ...aptData.blocks.map(b => ({ kind: 'blocked' as const, id: b.id, start: b.startDate, end: b.endDate, note: b.note, type: b.type })),
  ];

  const btnStyle: React.CSSProperties = { padding: '6px 12px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 18, lineHeight: 1 };

  return (
    <div
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 950, overflowY: 'auto', WebkitOverflowScrolling: 'touch', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '24px 16px' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={aptCalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="apt-cal-title"
        className="apt-calendar-modal"
        style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 460, boxShadow: '0 20px 60px rgba(0,0,0,0.18)', marginBottom: 24 }}
        onClick={(e) => e.stopPropagation()}
      >

        {/* Header + month nav */}
        <div style={{ borderRadius: '20px 20px 0 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #f3f4f6' }}>
            <div>
              <div id="apt-cal-title" style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Belegung</div>
              <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                <select
                  value={aptId}
                  onChange={(e) => setAptId(Number(e.target.value))}
                  style={{ fontSize: 16, fontWeight: 700, color: '#111', border: 'none', background: 'transparent', padding: '0 22px 0 0', cursor: 'pointer', appearance: 'none', outline: 'none', maxWidth: 260 }}
                >
                  {allApts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', right: 2, pointerEvents: 'none' }}>
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>
            </div>
            <button onClick={onClose} aria-label="Schließen" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 4, lineHeight: 1 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px', borderBottom: '1px solid #f3f4f6', flexWrap: 'wrap' }}>
            <button onClick={() => setMonthIso(prevMonth(monthIso))} style={btnStyle}>‹</button>
            <span style={{ fontWeight: 700, fontSize: 15, flex: 1, textAlign: 'center' }}>{formatMonthLabel(from)}</span>
            <button onClick={() => setMonthIso(nextMonth(monthIso))} style={btnStyle}>›</button>
            {!isCurrentMonth && (
              <button onClick={() => setMonthIso(monthStart(todayIso))} style={{ ...btnStyle, fontSize: 13, marginLeft: 4 }}>Heute</button>
            )}
          </div>
        </div>

        {/* Calendar grid — scrolls with the outer container */}
        <div style={{ padding: '12px 16px 20px' }}>
          {/* Weekday headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 4 }}>
            {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#9ca3af', paddingBottom: 6 }}>{d}</div>
            ))}
          </div>
          {loading && <div style={{ textAlign: 'center', padding: '24px 0', color: '#9ca3af', fontSize: 13 }}>Lädt…</div>}

          {weeks.map((week, wi) => {
            const weekStart = week[0];
            const weekEndExcl = addDays(week[6], 1);
            const weekItems = items.filter(item => item.start < weekEndExcl && item.end > weekStart);

            return (
              <div key={wi} style={{ marginBottom: 2 }}>
                {/* Day numbers */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
                  {week.map(day => {
                    const inMonth = day >= from && day <= to;
                    const isToday = day === todayIso;
                    const dow = new Date(day + 'T00:00:00Z').getUTCDay();
                    return (
                      <div key={day} style={{ textAlign: 'center', padding: '3px 0' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          width: 26, height: 26, borderRadius: '50%',
                          fontSize: 12, fontWeight: isToday ? 700 : 400,
                          color: isToday ? '#fff' : !inMonth ? '#d1d5db' : (dow === 0 || dow === 6) ? '#6366f1' : '#111',
                          background: isToday ? 'var(--accent)' : 'transparent',
                        }}>
                          {parseInt(day.slice(8), 10)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Event bars */}
                {weekItems.length > 0 && (
                  <div style={{ position: 'relative', height: weekItems.length * 22, marginBottom: 2 }}>
                    {weekItems.map((item, idx) => {
                      const clipStart = item.start > weekStart ? item.start : weekStart;
                      const clipEndExcl = item.end < weekEndExcl ? item.end : weekEndExcl;
                      const colStart = daysBetween(weekStart, clipStart);
                      const colSpan = daysBetween(clipStart, clipEndExcl);
                      if (colSpan <= 0) return null;

                      const isFirstSeg = item.start >= weekStart;
                      const isLastSeg = item.end <= weekEndExcl;
                      const parsed = item.kind === 'blocked' ? parsePlatform(item.note) : null;
                      const ps = parsed ? (PLATFORM_COLORS[parsed.platform] ?? { bg: '#fcd34d', text: '#78350f' }) : null;
                      const bg = item.kind === 'booking' ? '#bbf7d0' : (ps?.bg ?? '#fcd34d');
                      const fg = item.kind === 'booking' ? '#166534' : (ps?.text ?? '#78350f');
                      const label = item.kind === 'booking'
                        ? item.label
                        : parsed ? parsed.platform + (parsed.rest ? ` · ${parsed.rest}` : '') : (item.note || 'Gesperrt');

                      return (
                        <div
                          key={`${item.kind}-${item.id}`}
                          title={label}
                          onClick={() => {
                            if (item.kind === 'booking') {
                              onSelectItem({ kind: 'booking', data: { id: item.id, kind: 'booking', startDate: item.start, endDate: item.end, label: item.label, requestId: item.requestId, aptName: aptData.name } });
                            } else {
                              onSelectItem({ kind: 'blocked', data: { id: item.id, kind: 'blocked', startDate: item.start, endDate: item.end, note: item.note, type: item.type, aptName: aptData.name } });
                            }
                          }}
                          style={{
                            position: 'absolute',
                            top: idx * 22,
                            left: `calc(${colStart} * (100% / 7) + 1px)`,
                            width: `calc(${colSpan} * (100% / 7) - 2px)`,
                            height: 20,
                            background: bg, color: fg,
                            borderRadius: `${isFirstSeg ? 10 : 2}px ${isLastSeg ? 10 : 2}px ${isLastSeg ? 10 : 2}px ${isFirstSeg ? 10 : 2}px`,
                            fontSize: 10, fontWeight: 600,
                            padding: '0 6px',
                            display: 'flex', alignItems: 'center',
                            overflow: 'hidden', whiteSpace: 'nowrap',
                            cursor: 'pointer',
                          }}
                        >
                          {isFirstSeg ? label : ''}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
const WEEKDAY_SHORT = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

type TabType = 'blocked' | 'season' | 'booking';
const TAB_COLORS: Record<TabType, string> = { blocked: '#ef4444', season: '#3b82f6', booking: '#10b981' };
const TAB_LABELS: Record<TabType, string> = { blocked: 'Sperrzeit', season: 'Preiszeitraum', booking: 'Buchung' };

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '7px 10px', border: '1px solid #334155',
  borderRadius: 7, fontSize: 13, background: '#273548', color: '#f1f5f9', boxSizing: 'border-box',
};
const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, color: '#94a3b8',
  letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 3,
};
const fieldStyle: React.CSSProperties = { display: 'grid', gap: 3 };

type SelectedItem =
  | { kind: 'booking'; data: Booking & { aptName: string } }
  | { kind: 'blocked'; data: Block & { aptName: string } };

export default function GanttView({ todayIso, initialIso, hasPro }: { todayIso: string; initialIso?: string; hasPro: boolean }) {
  const [monthIso, setMonthIso] = useState(() => monthStart(initialIso ?? todayIso));
  const [apartments, setApartments] = useState<AptData[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [calApt, setCalApt] = useState<AptData | null>(null);

  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [dragAptId, setDragAptId] = useState<number | null>(null);
  const [dragAptName, setDragAptName] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<string | null>(null);
  const [dragEnd, setDragEnd] = useState<string | null>(null);

  // Create popup (after drag)
  const [selection, setSelection] = useState<{ aptId: number; aptName: string; start: string; end: string } | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('blocked');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);

  // Bar detail / edit popup (after click on bar)
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const from = monthStart(monthIso);
  const to = monthEnd(monthIso);

  const days: string[] = [];
  let cur = from;
  while (cur <= to) { days.push(cur); cur = addDays(cur, 1); }

  function refetch() {
    setLoading(true);
    fetch(`/api/admin/belegungsplan?from=${from}&to=${to}`)
      .then(r => r.json())
      .then(d => { setApartments(d.apartments ?? []); setLoading(false); });
  }

  useEffect(() => { refetch(); }, [from, to]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!scrollRef.current || loading) return;
    const todayIdx = days.indexOf(todayIso);
    if (todayIdx >= 0) scrollRef.current.scrollLeft = Math.max(0, todayIdx * COL_W - 100);
  }, [loading]); // eslint-disable-line react-hooks/exhaustive-deps

  // Global mouseup to finalize drag (catches release outside component)
  useEffect(() => {
    function onMouseUp() {
      if (!isDragging || !dragStart || !dragEnd || !dragAptId || !dragAptName) return;
      const [lo, hi] = dragStart <= dragEnd ? [dragStart, dragEnd] : [dragEnd, dragStart];
      setIsDragging(false);
      setDragStart(null);
      setDragEnd(null);
      setDragAptId(null);
      setDragAptName(null);
      setSelection({ aptId: dragAptId, aptName: dragAptName, start: lo, end: hi });
    }
    document.addEventListener('mouseup', onMouseUp);
    return () => document.removeEventListener('mouseup', onMouseUp);
  }, [isDragging, dragStart, dragEnd, dragAptId, dragAptName]);

  function dayFromMouseX(clientX: number): string | null {
    if (!scrollRef.current) return null;
    const rect = scrollRef.current.getBoundingClientRect();
    const x = clientX - rect.left + scrollRef.current.scrollLeft;
    const idx = Math.floor(x / COL_W);
    if (idx < 0 || idx >= days.length) return null;
    return days[idx];
  }

  function inDragHighlight(aptId: number, day: string): boolean {
    if (!isDragging || dragAptId !== aptId || !dragStart || !dragEnd) return false;
    const [lo, hi] = dragStart <= dragEnd ? [dragStart, dragEnd] : [dragEnd, dragStart];
    return day >= lo && day <= hi;
  }

  function barStyle(startDate: string, endDate: string): React.CSSProperties | null {
    const s = startDate < from ? from : startDate;
    const e = endDate > to ? addDays(to, 1) : endDate;
    const startIdx = daysBetween(from, s);
    const span = daysBetween(s, e);
    if (span <= 0) return null;
    return {
      position: 'absolute', left: startIdx * COL_W + 2, width: span * COL_W - 4,
      top: 6, height: ROW_H - 12, borderRadius: 6, overflow: 'hidden',
      display: 'flex', alignItems: 'center', paddingLeft: 8,
      fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap', boxSizing: 'border-box',
      cursor: 'pointer', zIndex: 1,
    };
  }

  async function handleFormSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const url = activeTab === 'blocked' ? '/api/admin/blocked-date' : activeTab === 'season' ? '/api/admin/price-season' : '/api/admin/booking';
    const body: Record<string, unknown> = activeTab === 'blocked'
      ? { apartmentId: selection!.aptId, startDate: data.startDate, endDate: data.endDate, type: data.type, note: data.note }
      : activeTab === 'season'
      ? { apartmentId: selection!.aptId, name: data.name, startDate: data.startDate, endDate: data.endDate, pricePerNight: Number(data.pricePerNight), minStay: Number(data.minStay) || 1 }
      : { apartmentId: selection!.aptId, arrival: data.arrival, departure: data.departure, adults: Number(data.adults), children: Number(data.children), salutation: data.salutation, firstname: data.firstname, lastname: data.lastname, email: data.email, status: data.status };
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const json = await res.json();
    if (!res.ok) { setFormError(json.error ?? 'Fehler beim Speichern'); return; }
    setFormSuccess(true);
    setTimeout(() => { setSelection(null); setFormSuccess(false); refetch(); }, 800);
  }

  const totalW = days.length * COL_W;

  const createModalRef = useFocusTrap(!!selection, () => { setSelection(null); setFormError(null); setFormSuccess(false); });
  const editModalRef   = useFocusTrap(!!selectedItem, () => setSelectedItem(null));

  return (
    <div style={{ position: 'relative' }}>
      {/* Month nav */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
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
              <div style={{ height: 40, borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }} />
              {apartments.map((apt, i) => (
                <div key={apt.id} onClick={() => setCalApt(apt)} className="gantt-apt-label" style={{ height: ROW_H, display: 'flex', alignItems: 'center', padding: '0 14px', borderBottom: i < apartments.length - 1 ? '1px solid #f3f4f6' : 'none', fontSize: 13, fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'pointer' }}>
                  {apt.name}
                </div>
              ))}
            </div>

            {/* Scrollable grid */}
            <div ref={scrollRef} className="gantt-scroll">
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
                  <div
                    key={apt.id}
                    style={{ height: ROW_H, position: 'relative', borderBottom: i < apartments.length - 1 ? '1px solid #f3f4f6' : 'none', display: 'flex', cursor: 'crosshair', userSelect: 'none' }}
                    onMouseDown={(e) => {
                      if ((e.target as HTMLElement).closest('[data-bar]')) return;
                      const day = dayFromMouseX(e.clientX);
                      if (!day) return;
                      setDragAptId(apt.id);
                      setDragAptName(apt.name);
                      setDragStart(day);
                      setDragEnd(day);
                      setIsDragging(true);
                      setSelection(null);
                    }}
                    onMouseMove={(e) => {
                      if (!isDragging || dragAptId !== apt.id) return;
                      const day = dayFromMouseX(e.clientX);
                      if (day) setDragEnd(day);
                    }}
                  >
                    {/* Background day cells */}
                    {days.map((d) => {
                      const dow = new Date(d + 'T12:00:00Z').getUTCDay();
                      const isWeekend = dow === 0 || dow === 6;
                      const isToday = d === todayIso;
                      const highlighted = inDragHighlight(apt.id, d);
                      return (
                        <div key={d} style={{ width: COL_W, flexShrink: 0, height: '100%', borderRight: '1px solid #f3f4f6', background: highlighted ? '#ede9fe' : isToday ? 'color-mix(in srgb, var(--accent) 6%, transparent)' : isWeekend ? '#fafafa' : 'transparent' }} />
                      );
                    })}

                    {/* Booking bars */}
                    {apt.bookings.map((b) => {
                      const style = barStyle(b.startDate, b.endDate);
                      if (!style) return null;
                      return (
                        <a
                          key={b.id}
                          data-bar="1"
                          href={`/admin/requests/${b.requestId}`}
                          title={`${b.label} · ${b.startDate} – ${b.endDate}`}
                          style={{ ...style, background: '#bbf7d0', color: '#166534', textDecoration: 'none' }}
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={(e) => {
                            e.preventDefault();
                            setSelectedItem({ kind: 'booking', data: { ...b, aptName: apt.name } });
                            setEditError(null);
                            setEditSuccess(false);
                            setConfirmDelete(false);
                          }}
                        >
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
                        <div
                          key={b.id}
                          data-bar="1"
                          title={label}
                          style={{ ...style, background: ps.bg, color: ps.text }}
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={() => {
                            setSelectedItem({ kind: 'blocked', data: { ...b, aptName: apt.name } });
                            setEditError(null);
                            setEditSuccess(false);
                            setConfirmDelete(false);
                          }}
                        >
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

      {/* ── Create popup (after drag) ── */}
      {selection && (
        <>
          <div aria-hidden="true" onClick={() => { setSelection(null); setFormError(null); setFormSuccess(false); }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 100 }} />
          <div ref={createModalRef} role="dialog" aria-modal="true" aria-labelledby="gantt-create-title" style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 'calc(100% - 32px)', maxWidth: 560, background: '#1e293b', border: '1px solid #334155', borderRadius: 16, boxShadow: '0 24px 64px rgba(0,0,0,0.4)', zIndex: 101, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #334155' }}>
              <div>
                <div id="gantt-create-title" style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>
                  {formatDisplay(selection.start)}{selection.start !== selection.end ? ` – ${formatDisplay(selection.end)}` : ''}
                </div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{selection.aptName}</div>
              </div>
              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                {(['blocked', 'season', 'booking'] as TabType[]).map((tab) => {
                  const locked = tab === 'season' && !hasPro;
                  return (
                    <button key={tab} onClick={() => { if (!locked) { setActiveTab(tab); setFormError(null); } }} disabled={locked} title={locked ? 'Pro-Feature' : undefined} style={{ padding: '4px 10px', borderRadius: 6, border: activeTab === tab ? 'none' : '1px solid #334155', cursor: locked ? 'default' : 'pointer', fontSize: 12, fontWeight: 600, background: activeTab === tab ? TAB_COLORS[tab] : 'transparent', color: activeTab === tab ? '#fff' : locked ? '#475569' : '#94a3b8', opacity: locked ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: 4 }}>
                      {TAB_LABELS[tab]}{locked && <span style={{ fontSize: 10, background: '#7c3aed', color: '#fff', borderRadius: 4, padding: '1px 5px', fontWeight: 700, opacity: 1 }}>Pro</span>}
                    </button>
                  );
                })}
                <button onClick={() => { setSelection(null); setFormError(null); setFormSuccess(false); }} aria-label="Schließen" style={{ marginLeft: 4, background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: '0 4px' }}>×</button>
              </div>
            </div>
            <form onSubmit={handleFormSubmit} style={{ padding: '20px', display: 'grid', gap: 18 }}>
              {formSuccess ? (
                <div style={{ textAlign: 'center', padding: '10px', color: '#4ade80', fontWeight: 600, fontSize: 14 }}>✓ Gespeichert</div>
              ) : (
                <>
                  <div className="gantt-form-2col">
                    <div style={fieldStyle}>
                      <label style={labelStyle}>{activeTab === 'booking' ? 'Anreise' : 'Von'}</label>
                      <input type="date" name={activeTab === 'booking' ? 'arrival' : 'startDate'} required style={inputStyle} defaultValue={selection.start} />
                    </div>
                    <div style={fieldStyle}>
                      <label style={labelStyle}>{activeTab === 'booking' ? 'Abreise' : 'Bis'}</label>
                      <input type="date" name={activeTab === 'booking' ? 'departure' : 'endDate'} required style={inputStyle} defaultValue={selection.end} />
                    </div>
                  </div>

                  {activeTab === 'blocked' && (
                    <div className="gantt-form-2col">
                      <div style={fieldStyle}>
                        <label style={labelStyle}>Grund</label>
                        <select name="type" style={inputStyle}>
                          <option value="manual">Eigennutzung</option>
                          <option value="other">Sonstiges</option>
                        </select>
                      </div>
                      <div style={fieldStyle}>
                        <label style={labelStyle}>Notiz</label>
                        <input type="text" name="note" style={inputStyle} placeholder="Optional" />
                      </div>
                    </div>
                  )}

                  {activeTab === 'season' && (
                    <div className="gantt-form-3col">
                      <div style={fieldStyle}>
                        <label style={labelStyle}>Bezeichnung</label>
                        <input type="text" name="name" style={inputStyle} placeholder="z. B. Hochsaison" />
                      </div>
                      <div style={fieldStyle}>
                        <label style={labelStyle}>Preis / Nacht (€)</label>
                        <input type="number" step="0.01" name="pricePerNight" required style={inputStyle} placeholder="0.00" />
                      </div>
                      <div style={fieldStyle}>
                        <label style={labelStyle}>Mindestaufenthalt</label>
                        <input type="number" name="minStay" defaultValue={1} min={1} style={inputStyle} />
                      </div>
                    </div>
                  )}

                  {activeTab === 'booking' && (
                    <>
                      <div className="gantt-form-salutation-row">
                        <div style={fieldStyle}>
                          <label style={labelStyle}>Anrede</label>
                          <select name="salutation" style={inputStyle}>
                            <option value="Herr">Herr</option>
                            <option value="Frau">Frau</option>
                            <option value="Divers">Divers</option>
                          </select>
                        </div>
                        <div style={fieldStyle}>
                          <label style={labelStyle}>Vorname</label>
                          <input type="text" name="firstname" style={inputStyle} />
                        </div>
                        <div style={fieldStyle}>
                          <label style={labelStyle}>Nachname</label>
                          <input type="text" name="lastname" required style={inputStyle} />
                        </div>
                      </div>
                      <div className="gantt-form-guest-row">
                        <div style={fieldStyle}>
                          <label style={labelStyle}>E-Mail</label>
                          <input type="email" name="email" required style={inputStyle} />
                        </div>
                        <div style={fieldStyle}>
                          <label style={labelStyle}>Erw.</label>
                          <input type="number" name="adults" min={1} defaultValue={2} style={{ ...inputStyle, width: 56 }} />
                        </div>
                        <div style={fieldStyle}>
                          <label style={labelStyle}>Kinder</label>
                          <input type="number" name="children" min={0} defaultValue={0} style={{ ...inputStyle, width: 56 }} />
                        </div>
                        <div style={fieldStyle}>
                          <label style={labelStyle}>Status</label>
                          <select name="status" style={inputStyle}>
                            <option value="booked">Gebucht</option>
                            <option value="new">Neu</option>
                            <option value="answered">Beantwortet</option>
                          </select>
                        </div>
                      </div>
                    </>
                  )}

                  {formError && <div role="alert" style={{ fontSize: 12, color: '#f87171' }}>{formError}</div>}
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="submit" style={{ padding: '7px 18px', background: TAB_COLORS[activeTab], color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                      Speichern
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </>
      )}

      {/* ── Apartment calendar ── */}
      {calApt && (
        <ApartmentCalendar
          apt={calApt}
          allApts={apartments}
          todayIso={todayIso}
          initialMonth={monthIso}
          onClose={() => setCalApt(null)}
          onSelectItem={(item) => {
            setCalApt(null);
            setSelectedItem(item);
            setEditError(null);
            setEditSuccess(false);
            setConfirmDelete(false);
          }}
        />
      )}

      {/* ── Bar detail / edit popup ── */}
      {selectedItem && (
        <>
          <div aria-hidden="true" onClick={() => setSelectedItem(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 100 }} />
          <div ref={editModalRef} role="dialog" aria-modal="true" aria-labelledby="gantt-edit-title" style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 'calc(100% - 32px)', maxWidth: 460, background: '#1e293b', border: '1px solid #334155', borderRadius: 16, boxShadow: '0 24px 64px rgba(0,0,0,0.4)', zIndex: 101, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #334155' }}>
              <span id="gantt-edit-title" style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>
                {selectedItem.kind === 'booking' ? '📋 Buchung' : '🚫 Sperrzeit'} · {selectedItem.data.aptName}
              </span>
              <button onClick={() => setSelectedItem(null)} aria-label="Schließen" style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: '0 4px' }}>×</button>
            </div>
            <div style={{ padding: '16px 16px 20px' }}>
              {editSuccess ? (
                <div style={{ textAlign: 'center', padding: '12px', color: '#4ade80', fontWeight: 600, fontSize: 14 }}>✓ Gespeichert</div>
              ) : selectedItem.kind === 'booking' ? (
                <div style={{ display: 'grid', gap: 12 }}>
                  <div style={{ display: 'grid', gap: 6 }}>
                    {[
                      { label: 'Gast', value: selectedItem.data.label },
                      { label: 'Zeitraum', value: `${formatDisplay(selectedItem.data.startDate)} – ${formatDisplay(selectedItem.data.endDate)}` },
                    ].map(({ label, value }) => (
                      <div key={label} style={{ display: 'flex', gap: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', width: 80, flexShrink: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
                        <span style={{ fontSize: 13, color: '#f1f5f9' }}>{value}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 4 }}>
                    <a href={`/admin/requests/${selectedItem.data.requestId}`} style={{ padding: '6px 16px', background: '#10b981', color: '#fff', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                      Anfrage ansehen →
                    </a>
                  </div>
                </div>
              ) : selectedItem.data.type === 'ical_sync' ? (
                (() => {
                  const parsed = parsePlatform(selectedItem.data.note);
                  const ps = parsed ? (PLATFORM_COLORS[parsed.platform] ?? { bg: '#6b7280', text: '#fff' }) : null;
                  return (
                    <div style={{ display: 'grid', gap: 14 }}>
                      {parsed && ps && (
                        <span style={{ display: 'inline-flex', alignSelf: 'start', fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 6, background: ps.bg, color: ps.text }}>
                          {parsed.platform}
                        </span>
                      )}
                      <div style={{ display: 'grid', gap: 6 }}>
                        {([
                          ['Von', formatDisplay(selectedItem.data.startDate)],
                          ['Bis', formatDisplay(selectedItem.data.endDate)],
                          ...(parsed?.rest ? [['Bezeichnung', parsed.rest]] : []),
                        ] as [string, string][]).map(([label, value]) => (
                          <div key={label} style={{ display: 'flex', gap: 10 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', width: 80, flexShrink: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
                            <span style={{ fontSize: 13, color: '#f1f5f9' }}>{value}</span>
                          </div>
                        ))}
                      </div>
                      <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Automatisch synchronisiert — wird beim nächsten iCal-Sync aktualisiert.</p>
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button type="button" onClick={() => setSelectedItem(null)} style={{ padding: '6px 16px', background: 'transparent', border: '1px solid #334155', color: '#94a3b8', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>Schließen</button>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setEditError(null);
                  const fd = new FormData(e.currentTarget);
                  const res = await fetch('/api/admin/blocked-date', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: selectedItem.data.id, startDate: fd.get('startDate'), endDate: fd.get('endDate'), type: fd.get('type'), note: fd.get('note') }) });
                  if (res.ok) { setEditSuccess(true); setTimeout(() => { setSelectedItem(null); setEditSuccess(false); refetch(); }, 800); }
                  else setEditError((await res.json()).error ?? 'Fehler');
                }} style={{ display: 'grid', gap: 14 }}>
                  <div className="gantt-form-2col" style={{ gap: 10 }}>
                    <div style={fieldStyle}>
                      <label style={labelStyle}>Von</label>
                      <input type="date" name="startDate" required style={inputStyle} defaultValue={selectedItem.data.startDate} />
                    </div>
                    <div style={fieldStyle}>
                      <label style={labelStyle}>Bis</label>
                      <input type="date" name="endDate" required style={inputStyle} defaultValue={selectedItem.data.endDate} />
                    </div>
                  </div>
                  <div className="gantt-form-2col" style={{ gap: 10 }}>
                    <div style={fieldStyle}>
                      <label style={labelStyle}>Grund</label>
                      <select name="type" style={inputStyle} defaultValue={selectedItem.data.type}>
                        <option value="manual">Eigennutzung</option>
                        <option value="other">Sonstiges</option>
                      </select>
                    </div>
                    <div style={fieldStyle}>
                      <label style={labelStyle}>Notiz</label>
                      <input type="text" name="note" style={inputStyle} defaultValue={selectedItem.data.note ?? ''} />
                    </div>
                  </div>
                  {editError && <div role="alert" style={{ fontSize: 12, color: '#f87171' }}>{editError}</div>}
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
                    {!confirmDelete ? (
                      <button type="button" onClick={() => setConfirmDelete(true)} style={{ padding: '6px 14px', background: '#7f1d1d', color: '#fca5a5', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Löschen</button>
                    ) : (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button type="button" onClick={() => setConfirmDelete(false)} style={{ padding: '6px 12px', background: 'transparent', border: '1px solid #334155', color: '#94a3b8', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>Abbrechen</button>
                        <button type="button" onClick={async () => {
                          const res = await fetch('/api/admin/blocked-date', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: selectedItem.data.id }) });
                          if (res.ok) { setEditSuccess(true); setTimeout(() => { setSelectedItem(null); setEditSuccess(false); refetch(); }, 800); }
                          else setEditError((await res.json()).error ?? 'Fehler');
                        }} style={{ padding: '6px 14px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Wirklich löschen</button>
                      </div>
                    )}
                    <button type="submit" style={{ padding: '6px 18px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Speichern</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
