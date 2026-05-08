'use client';

import { useState } from 'react';
import GanttView from './GanttView';

type ApartmentStatus =
  | { kind: 'frei' }
  | { kind: 'belegt'; guestName: string; arrival: string; departure: string; requestId: number; checkoutToday: boolean }
  | { kind: 'blockiert'; note?: string | null; endDate: string };

type ApartmentCard = {
  id: number;
  name: string;
  status: ApartmentStatus;
};

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatDate(iso: string) {
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y}`;
}

function formatDayLabel(iso: string) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('de-AT', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
}

function shiftDay(iso: string, delta: number) {
  const d = new Date(iso + 'T12:00:00');
  d.setDate(d.getDate() + delta);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function ZimmerplanClient({ initialDate, initialCards, hasPro }: { initialDate: string; initialCards: ApartmentCard[]; hasPro: boolean }) {
  const [view, setView] = useState<'tag' | 'gantt'>('gantt');
  const [date, setDate] = useState(initialDate);
  const [cards, setCards] = useState(initialCards);
  const [loading, setLoading] = useState(false);

  async function loadDate(newDate: string) {
    setLoading(true);
    const res = await fetch(`/api/admin/zimmerplan?date=${newDate}`);
    const data = await res.json();
    setCards(data.apartments);
    setLoading(false);
  }

  function handleDateChange(newDate: string) {
    setDate(newDate);
    if (newDate) loadDate(newDate);
  }

  const freieCount = cards.filter((c) => c.status.kind === 'frei').length;
  const belegtCount = cards.filter((c) => c.status.kind === 'belegt').length;
  const blockiertCount = cards.filter((c) => c.status.kind === 'blockiert').length;
  const isToday = date === todayIso();

  return (
    <div className="admin-page" style={{ maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0 }}>Zimmerplan</h1>
          <p className="page-subtitle">
            Belegungsstatus aller Apartments auf einen Blick
          </p>
        </div>
        <div className="gantt-controls">
          {/* View toggle */}
          <div style={{ display: 'flex', border: '1px solid #d1d5db', borderRadius: 8, overflow: 'hidden' }}>
            <button onClick={() => setView('gantt')} style={{ padding: '8px 14px', fontSize: 13, cursor: 'pointer', border: 'none', background: view === 'gantt' ? 'var(--accent)' : '#fff', color: view === 'gantt' ? '#fff' : '#374151', fontWeight: view === 'gantt' ? 600 : 400 }}>Belegungsplan</button>
            <button onClick={() => setView('tag')} style={{ padding: '8px 14px', fontSize: 13, cursor: 'pointer', border: 'none', borderLeft: '1px solid #d1d5db', background: view === 'tag' ? 'var(--accent)' : '#fff', color: view === 'tag' ? '#fff' : '#374151', fontWeight: view === 'tag' ? 600 : 400 }}>Tagesansicht</button>
          </div>
        </div>
      </div>

      {/* Gantt view */}
      {view === 'gantt' && <GanttView todayIso={initialDate} initialIso={date} hasPro={hasPro} />}

      {/* Tag-Navigation */}
      {view === 'tag' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <button onClick={() => handleDateChange(shiftDay(date, -1))} style={{ padding: '6px 12px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>‹</button>
          <span style={{ fontWeight: 700, fontSize: 15, textAlign: 'center' }}>{formatDayLabel(date)}</span>
          <button onClick={() => handleDateChange(shiftDay(date, 1))} style={{ padding: '6px 12px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>›</button>
          {!isToday && (
            <button onClick={() => handleDateChange(todayIso())} style={{ marginLeft: 4, padding: '6px 12px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', fontSize: 13, cursor: 'pointer', color: '#374151' }}>Heute</button>
          )}
          <input type="date" value={date} onChange={(e) => handleDateChange(e.target.value)} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13, background: '#fff', color: '#111827', cursor: 'pointer' }} />
        </div>
      )}

      {/* Card wrapper */}
      {view === 'tag' && <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '24px 24px 28px', boxShadow: '0 4px 16px rgba(15,23,42,0.06)' }}>
        {/* Summary badges */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          <Badge color="#dcfce7" text="#16a34a" label={`${freieCount} Frei`} />
          <Badge color="#fee2e2" text="#dc2626" label={`${belegtCount} Belegt`} />
          <Badge color="#fef3c7" text="#d97706" label={`${blockiertCount} Blockiert`} />
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 80, color: '#9ca3af', fontSize: 14 }}>Lädt…</div>
        ) : cards.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 80, color: '#9ca3af', fontSize: 14 }}>Keine Apartments gefunden.</div>
        ) : (
          <div className="zimmerplan-grid">
            {cards.map((card) => (
              <ApartmentCardEl key={card.id} card={card} date={date} />
            ))}
          </div>
        )}
      </div>}
    </div>
  );
}

const PLATFORM_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  'Airbnb':       { bg: '#ff5a5f', color: '#fff', label: 'Airbnb' },
  'Booking.com':  { bg: '#003580', color: '#fff', label: 'Booking.com' },
};

function parsePlatform(note: string | null | undefined): { platform: string; rest: string } | null {
  if (!note) return null;
  const m = note.match(/^\[(.+?)\]\s*(.*)/);
  if (!m) return null;
  return { platform: m[1], rest: m[2] };
}

function PlatformBadge({ platform }: { platform: string }) {
  const style = PLATFORM_STYLES[platform] ?? { bg: '#6b7280', color: '#fff', label: platform };
  return (
    <span style={{ display: 'inline-block', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 5, background: style.bg, color: style.color, letterSpacing: '0.02em' }}>
      {style.label}
    </span>
  );
}

function Badge({ color, text, label }: { color: string; text: string; label: string }) {
  return (
    <span style={{ background: color, color: text, fontSize: 13, fontWeight: 600, padding: '4px 12px', borderRadius: 20 }}>
      {label}
    </span>
  );
}

function ApartmentCardEl({ card, date }: { card: ApartmentCard; date: string }) {
  const s = card.status;

  const borderColor = s.kind === 'frei' ? '#86efac' : s.kind === 'belegt' ? '#fca5a5' : '#fcd34d';
  const bgColor = s.kind === 'frei' ? '#f0fdf4' : s.kind === 'belegt' ? '#fff5f5' : '#fffbeb';
  const dotColor = s.kind === 'frei' ? '#16a34a' : s.kind === 'belegt' ? '#dc2626' : '#d97706';
  const statusLabel = s.kind === 'frei' ? 'Frei' : s.kind === 'belegt' ? 'Belegt' : 'Blockiert';

  return (
    <div style={{
      background: bgColor,
      border: `2px solid ${borderColor}`,
      borderRadius: 12,
      padding: '18px 18px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      minHeight: 140,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontWeight: 700, fontSize: 15, color: '#111827', lineHeight: 1.3 }}>{card.name}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: dotColor, whiteSpace: 'nowrap' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: dotColor, display: 'inline-block' }} />
          {statusLabel}
        </span>
      </div>

      {s.kind === 'belegt' && (
        <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.5 }}>
          <div style={{ fontWeight: 600 }}>
            {s.guestName}
            {!s.checkoutToday && (
              <span style={{ fontWeight: 400, color: '#6b7280', marginLeft: 6 }}>
                — noch {Math.ceil((new Date(s.departure).getTime() - new Date(date + 'T12:00:00').getTime()) / 86400000)} Tage
              </span>
            )}
          </div>
          <div style={{ color: '#6b7280' }}>{formatDate(s.arrival)} – {formatDate(s.departure)}</div>
          {s.checkoutToday && (
            <div style={{ marginTop: 6, background: '#fef9c3', color: '#854d0e', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 6, display: 'inline-block' }}>
              Check-out heute
            </div>
          )}
          <a
            href={`/admin/requests/${s.requestId}`}
            style={{ display: 'inline-block', marginTop: 8, fontSize: 12, color: '#4f46e5', textDecoration: 'none', fontWeight: 500 }}
          >
            Anfrage ansehen →
          </a>
        </div>
      )}

      {s.kind === 'blockiert' && (
        <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.5, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div>noch {Math.ceil((new Date(s.endDate).getTime() - new Date(date + 'T12:00:00').getTime()) / 86400000)} Tage</div>
          {(() => {
            const parsed = parsePlatform(s.note);
            if (parsed) return (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <PlatformBadge platform={parsed.platform} />
                {parsed.rest && <span>{parsed.rest}</span>}
              </div>
            );
            if (s.note) return <div>{s.note}</div>;
            return null;
          })()}
        </div>
      )}

      {s.kind === 'frei' && (
        <div style={{ fontSize: 13, color: '#16a34a', fontWeight: 500 }}>Verfügbar</div>
      )}
    </div>
  );
}
