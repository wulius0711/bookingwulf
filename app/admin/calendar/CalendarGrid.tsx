'use client';

import { useState, useCallback, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const STATUS_COLORS: Record<string, string> = {
  new: '#3b82f6',
  answered: '#f59e0b',
  booked: '#10b981',
  cancelled: '#ef4444',
};

const STATUS_BG: Record<string, string> = {
  new: '#dbeafe',
  answered: '#fef3c7',
  booked: '#bbf7d0',
  cancelled: '#fee2e2',
};

const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

export type BookingChip = {
  id: number;
  firstname: string | null;
  lastname: string;
  arrival: string;
  departure: string;
  nights: number;
  status: string;
  aptName: string;
  isArrival: boolean;
};

export type BlockedChip = { id: number; aptName: string; note: string; type: string; startDate: string; endDate: string };
export type ApartmentOption = { id: number; name: string };

type Props = {
  weeks: (string | null)[][];
  todayKey: string;
  dayBookings: Record<string, BookingChip[]>;
  dayBlocked: Record<string, BlockedChip[]>;
  apartments: ApartmentOption[];
  hasPro: boolean;
};

type TabType = 'blocked' | 'season' | 'booking';

function compareDates(a: string, b: string) {
  return a < b ? [a, b] : [b, a];
}

function formatDisplay(dateKey: string) {
  const [y, m, d] = dateKey.split('-');
  return `${d}.${m}.${y}`;
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '7px 10px', border: '1px solid #334155',
  borderRadius: 7, fontSize: 13, background: '#273548', color: '#f1f5f9',
  boxSizing: 'border-box',
};
const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, color: '#94a3b8',
  letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 3,
};
const field: React.CSSProperties = { display: 'grid', gap: 3 };

const TAB_COLORS: Record<TabType, string> = {
  blocked: '#ef4444',
  season: '#3b82f6',
  booking: '#10b981',
};
const TAB_LABELS: Record<TabType, string> = {
  blocked: 'Sperrzeit',
  season: 'Preiszeitraum',
  booking: 'Buchung',
};

export default function CalendarGrid({ weeks, todayKey, dayBookings, dayBlocked, apartments, hasPro }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [dragStart, setDragStart] = useState<string | null>(null);
  const [dragEnd, setDragEnd] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selection, setSelection] = useState<{ start: string; end: string } | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('blocked');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  type SelectedItem =
    | { kind: 'booking'; data: BookingChip }
    | { kind: 'blocked'; data: BlockedChip };
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const inSelection = useCallback(
    (key: string) => {
      const anchor = dragStart ?? selection?.start;
      const tip = isDragging ? dragEnd : selection?.end;
      if (!anchor || !tip) return false;
      const [lo, hi] = compareDates(anchor, tip);
      return key >= lo && key <= hi;
    },
    [dragStart, dragEnd, isDragging, selection]
  );

  function handleMouseDown(key: string) {
    setDragStart(key);
    setDragEnd(key);
    setIsDragging(true);
    setSelection(null);
    setError(null);
    setSuccess(false);
  }

  function handleMouseEnter(key: string) {
    if (isDragging) setDragEnd(key);
  }

  function handleMouseUp(key: string) {
    if (!dragStart) return;
    const [lo, hi] = compareDates(dragStart, key);
    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
    setSelection({ start: lo, end: hi });
  }

  function closePopup() {
    setSelection(null);
    setError(null);
    setSuccess(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const data = Object.fromEntries(new FormData(e.currentTarget));

    let url = '';
    let body: Record<string, unknown> = {};

    if (activeTab === 'blocked') {
      url = '/api/admin/blocked-date';
      body = { apartmentId: Number(data.apartmentId), startDate: data.startDate, endDate: data.endDate, type: data.type, note: data.note };
    } else if (activeTab === 'season') {
      url = '/api/admin/price-season';
      body = { apartmentId: Number(data.apartmentId), name: data.name, startDate: data.startDate, endDate: data.endDate, pricePerNight: Number(data.pricePerNight), minStay: Number(data.minStay) || 1 };
    } else {
      url = '/api/admin/booking';
      body = { apartmentId: Number(data.apartmentId), arrival: data.arrival, departure: data.departure, adults: Number(data.adults), children: Number(data.children), salutation: data.salutation, firstname: data.firstname, lastname: data.lastname, email: data.email, status: data.status, message: data.message };
    }

    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const json = await res.json();

    if (!res.ok) {
      setError(json.error ?? 'Fehler beim Speichern');
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      closePopup();
      startTransition(() => router.refresh());
    }, 800);
  }

  const anchor = isDragging ? dragStart : selection?.start;
  const tip = isDragging ? dragEnd : selection?.end;
  const [selLo, selHi] = anchor && tip ? compareDates(anchor, tip) : [null, null];

  return (
    <div style={{ position: 'relative' }}>
      <div
        className="calendar-scroll"
        style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb' }}
        onMouseLeave={() => {
          if (isDragging && dragStart && dragEnd) {
            const [lo, hi] = compareDates(dragStart, dragEnd);
            setIsDragging(false);
            setDragStart(null);
            setDragEnd(null);
            setSelection({ start: lo, end: hi });
          }
        }}
      >
        <div className="calendar-grid">
          {/* Weekday headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '2px solid #e5e7eb' }}>
            {WEEKDAYS.map((day, i) => (
              <div key={day} style={{ padding: '10px 8px', textAlign: 'center', fontSize: 11, fontWeight: 700, color: i >= 5 ? '#ef4444' : '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {day}
              </div>
            ))}
          </div>

          {/* Weeks */}
          {weeks.map((week, wi) => (
            <div key={wi} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: wi < weeks.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
              {week.map((key, di) => {
                if (!key) return (
                  <div key={di} className="calendar-cell-empty" style={{ background: '#fafafa', borderRight: di < 6 ? '1px solid #f3f4f6' : 'none' }} />
                );

                const bookings = dayBookings[key] ?? [];
                const blocked = dayBlocked[key] ?? [];
                const isToday = key === todayKey;
                const isWeekend = di >= 5;
                const selected = inSelection(key);
                const dayNum = parseInt(key.split('-')[2]);

                return (
                  <div
                    key={di}
                    className="calendar-cell"
                    onMouseDown={() => handleMouseDown(key)}
                    onMouseEnter={() => handleMouseEnter(key)}
                    onMouseUp={() => handleMouseUp(key)}
                    style={{ background: selected ? '#ede9fe' : isWeekend ? '#fafafa' : '#fff', borderRight: di < 6 ? '1px solid #f3f4f6' : 'none', cursor: 'pointer', userSelect: 'none', outline: selected ? '1px solid #a78bfa' : 'none', outlineOffset: -1 }}
                  >
                    <div style={{ width: 26, height: 26, borderRadius: '50%', background: isToday ? '#111' : 'transparent', color: isToday ? '#fff' : isWeekend ? '#ef4444' : '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: isToday ? 700 : 400, marginBottom: 4, flexShrink: 0 }}>
                      {dayNum}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {[...bookings].sort((a, b) => {
                        const p: Record<string, number> = { booked: 0, answered: 1, new: 2 };
                        return (p[a.status] ?? 3) - (p[b.status] ?? 3);
                      }).slice(0, 4).map((req) => (
                        <button key={req.id} onMouseDown={(e) => e.stopPropagation()} onMouseUp={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); setSelectedItem({ kind: 'booking', data: req }); setEditError(null); setEditSuccess(false); setConfirmDelete(false); }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '2px 5px', borderRadius: 3, background: STATUS_BG[req.status] ?? '#f3f4f6', borderLeft: `3px solid ${STATUS_COLORS[req.status] ?? '#9ca3af'}`, border: 'none', borderLeftWidth: 3, borderLeftStyle: 'solid', borderLeftColor: STATUS_COLORS[req.status] ?? '#9ca3af', fontSize: 10, color: '#111', cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.5 }} title={`${req.firstname ? req.firstname[0] + '. ' : ''}${req.lastname}${req.aptName ? ' · ' + req.aptName : ''} | ${req.nights} Nächte`}>
                          <span className="calendar-chip-label">{req.isArrival ? '↘ ' : ''}{req.firstname ? req.firstname[0] + '. ' : ''}{req.lastname}{req.aptName ? ` · ${req.aptName}` : ''}</span>
                        </button>
                      ))}
                      {bookings.length > 4 && <div className="calendar-chip-label" style={{ fontSize: 10, color: '#9ca3af', paddingLeft: 5 }}>+{bookings.length - 4} weitere</div>}
                      {blocked.map((b) => (
                        <button key={b.id} onMouseDown={(e) => e.stopPropagation()} onMouseUp={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); setSelectedItem({ kind: 'blocked', data: b }); setEditError(null); setEditSuccess(false); setConfirmDelete(false); }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '2px 5px', borderRadius: 3, background: '#fee2e2', border: 'none', borderLeftWidth: 3, borderLeftStyle: 'solid', borderLeftColor: '#ef4444', fontSize: 10, color: '#7f1d1d', cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.5 }} title={`Gesperrt${b.aptName ? ' · ' + b.aptName : ''}${b.note ? ' · ' + b.note : ''}`}>
                          <span className="calendar-chip-label">🚫 {b.aptName || 'Gesperrt'}{b.note ? ` · ${b.note}` : ''}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Backdrop + modal */}
      {selLo && selHi && !isDragging && (
        <>
          <div onClick={closePopup} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 100 }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 'calc(100% - 32px)', maxWidth: 620, background: '#1e293b', border: '1px solid #334155', borderRadius: 16, boxShadow: '0 24px 64px rgba(0,0,0,0.4)', zIndex: 101, overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #334155' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>
              {formatDisplay(selLo)}{selLo !== selHi ? ` – ${formatDisplay(selHi)}` : ''}
            </span>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              {(['blocked', 'season', 'booking'] as TabType[]).map((tab) => {
                const isSeasonLocked = tab === 'season' && !hasPro;
                return (
                  <button key={tab} onClick={() => { if (!isSeasonLocked) { setActiveTab(tab); setError(null); } }} disabled={isSeasonLocked} title={isSeasonLocked ? 'Pro-Feature' : undefined} style={{ padding: '4px 10px', borderRadius: 6, border: activeTab === tab ? 'none' : '1px solid #334155', cursor: isSeasonLocked ? 'default' : 'pointer', fontSize: 12, fontWeight: 600, background: activeTab === tab ? TAB_COLORS[tab] : 'transparent', color: activeTab === tab ? '#fff' : isSeasonLocked ? '#475569' : '#94a3b8', transition: 'all 0.15s', opacity: isSeasonLocked ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: 4 }}>
                    {TAB_LABELS[tab]}{isSeasonLocked && <span style={{ fontSize: 10, background: '#7c3aed', color: '#fff', borderRadius: 4, padding: '1px 5px', fontWeight: 700 }}>Pro</span>}
                  </button>
                );
              })}
              <button onClick={closePopup} style={{ marginLeft: 4, background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: '0 4px' }}>×</button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'grid', gap: 18 }}>
            {success ? (
              <div style={{ textAlign: 'center', padding: '10px', color: '#16a34a', fontWeight: 600, fontSize: 14 }}>✓ Gespeichert</div>
            ) : (
              <>
                {/* Row 1: Apartment + Dates */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                  <div style={field}>
                    <label style={labelStyle}>Apartment</label>
                    <select name="apartmentId" required style={inputStyle}>
                      <option value="">Auswählen</option>
                      {apartments.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>
                  <div style={field}>
                    <label style={labelStyle}>{activeTab === 'booking' ? 'Anreise' : 'Von'}</label>
                    <input type="date" name={activeTab === 'booking' ? 'arrival' : 'startDate'} required style={inputStyle} defaultValue={selLo} />
                  </div>
                  <div style={field}>
                    <label style={labelStyle}>{activeTab === 'booking' ? 'Abreise' : 'Bis'}</label>
                    <input type="date" name={activeTab === 'booking' ? 'departure' : 'endDate'} required style={inputStyle} defaultValue={selHi} />
                  </div>
                </div>

                {/* Tab-specific fields */}
                {activeTab === 'blocked' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div style={field}>
                      <label style={labelStyle}>Grund</label>
                      <select name="type" style={inputStyle}>
                        <option value="manual">Eigennutzung</option>
                        <option value="other">Sonstiges</option>
                      </select>
                    </div>
                    <div style={field}>
                      <label style={labelStyle}>Notiz</label>
                      <input type="text" name="note" style={inputStyle} placeholder="Optional" />
                    </div>
                  </div>
                )}

                {activeTab === 'season' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                    <div style={field}>
                      <label style={labelStyle}>Bezeichnung</label>
                      <input type="text" name="name" style={inputStyle} placeholder="z. B. Hochsaison" />
                    </div>
                    <div style={field}>
                      <label style={labelStyle}>Preis / Nacht (€)</label>
                      <input type="number" step="0.01" name="pricePerNight" required style={inputStyle} placeholder="0.00" />
                    </div>
                    <div style={field}>
                      <label style={labelStyle}>Mindestaufenthalt</label>
                      <input type="number" name="minStay" defaultValue={1} min={1} style={inputStyle} />
                    </div>
                  </div>
                )}

                {activeTab === 'booking' && (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr', gap: 8 }}>
                      <div style={field}>
                        <label style={labelStyle}>Anrede</label>
                        <select name="salutation" style={inputStyle}>
                          <option value="Herr">Herr</option>
                          <option value="Frau">Frau</option>
                          <option value="Divers">Divers</option>
                        </select>
                      </div>
                      <div style={field}>
                        <label style={labelStyle}>Vorname</label>
                        <input type="text" name="firstname" style={inputStyle} />
                      </div>
                      <div style={field}>
                        <label style={labelStyle}>Nachname</label>
                        <input type="text" name="lastname" required style={inputStyle} />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 8 }}>
                      <div style={field}>
                        <label style={labelStyle}>E-Mail</label>
                        <input type="email" name="email" required style={inputStyle} />
                      </div>
                      <div style={field}>
                        <label style={labelStyle}>Erw.</label>
                        <input type="number" name="adults" min={1} defaultValue={2} style={{ ...inputStyle, width: 56 }} />
                      </div>
                      <div style={field}>
                        <label style={labelStyle}>Kinder</label>
                        <input type="number" name="children" min={0} defaultValue={0} style={{ ...inputStyle, width: 56 }} />
                      </div>
                      <div style={field}>
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

                {error && <div style={{ fontSize: 12, color: '#dc2626' }}>{error}</div>}

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" disabled={isPending} style={{ padding: '7px 18px', background: TAB_COLORS[activeTab], color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: isPending ? 'wait' : 'pointer', opacity: isPending ? 0.7 : 1 }}>
                    {isPending ? 'Speichern…' : 'Speichern'}
                  </button>
                </div>
              </>
            )}
          </form>
          </div>
        </>
      )}
      {/* Edit / delete popup */}
      {selectedItem && (
        <>
          <div onClick={() => setSelectedItem(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 100 }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 'calc(100% - 32px)', maxWidth: 480, background: '#1e293b', border: '1px solid #334155', borderRadius: 16, boxShadow: '0 24px 64px rgba(0,0,0,0.4)', zIndex: 101, overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #334155' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>
                {selectedItem.kind === 'booking' ? '📋 Buchung' : '🚫 Sperrzeit'}
              </span>
              <button onClick={() => setSelectedItem(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: '0 4px' }}>×</button>
            </div>

            <div style={{ padding: '16px 16px 20px' }}>
              {editSuccess ? (
                <div style={{ textAlign: 'center', padding: '12px', color: '#4ade80', fontWeight: 600, fontSize: 14 }}>✓ Gespeichert</div>
              ) : selectedItem.kind === 'booking' ? (
                /* Booking detail */
                <div style={{ display: 'grid', gap: 12 }}>
                  <div style={{ display: 'grid', gap: 6 }}>
                    {[
                      { label: 'Gast', value: `${selectedItem.data.firstname ? selectedItem.data.firstname + ' ' : ''}${selectedItem.data.lastname}` },
                      { label: 'Zeitraum', value: `${new Date(selectedItem.data.arrival).toLocaleDateString('de-AT')} – ${new Date(selectedItem.data.departure).toLocaleDateString('de-AT')} (${selectedItem.data.nights} Nächte)` },
                      { label: 'Apartment', value: selectedItem.data.aptName || '–' },
                      { label: 'Status', value: ({ new: 'Neu', answered: 'Beantwortet', booked: 'Gebucht', cancelled: 'Storniert' } as Record<string,string>)[selectedItem.data.status] ?? selectedItem.data.status },
                    ].map(({ label, value }) => (
                      <div key={label} style={{ display: 'flex', gap: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', width: 80, flexShrink: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
                        <span style={{ fontSize: 13, color: '#f1f5f9' }}>{value}</span>
                      </div>
                    ))}
                  </div>
                  {editError && <div style={{ fontSize: 12, color: '#f87171' }}>{editError}</div>}
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', paddingTop: 4 }}>
                    <a href={`/admin/requests`} style={{ fontSize: 13, color: '#94a3b8', textDecoration: 'underline', lineHeight: '32px' }}>Zur Anfragenübersicht →</a>
                    {!confirmDelete ? (
                      <button onClick={() => setConfirmDelete(true)} style={{ padding: '6px 14px', background: '#7f1d1d', color: '#fca5a5', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Löschen</button>
                    ) : (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => setConfirmDelete(false)} style={{ padding: '6px 12px', background: 'transparent', border: '1px solid #334155', color: '#94a3b8', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>Abbrechen</button>
                        <button onClick={async () => {
                          const res = await fetch('/api/admin/booking', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: selectedItem.data.id }) });
                          if (res.ok) { setEditSuccess(true); setTimeout(() => { setSelectedItem(null); setEditSuccess(false); startTransition(() => router.refresh()); }, 800); }
                          else setEditError((await res.json()).error ?? 'Fehler');
                        }} style={{ padding: '6px 14px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Wirklich löschen</button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Blocked date edit form */
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setEditError(null);
                  const fd = new FormData(e.currentTarget);
                  const res = await fetch('/api/admin/blocked-date', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: selectedItem.data.id, startDate: fd.get('startDate'), endDate: fd.get('endDate'), type: fd.get('type'), note: fd.get('note') }) });
                  if (res.ok) { setEditSuccess(true); setTimeout(() => { setSelectedItem(null); setEditSuccess(false); startTransition(() => router.refresh()); }, 800); }
                  else setEditError((await res.json()).error ?? 'Fehler');
                }} style={{ display: 'grid', gap: 14 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div style={field}>
                      <label style={labelStyle}>Von</label>
                      <input type="date" name="startDate" required style={inputStyle} defaultValue={selectedItem.data.startDate} />
                    </div>
                    <div style={field}>
                      <label style={labelStyle}>Bis</label>
                      <input type="date" name="endDate" required style={inputStyle} defaultValue={selectedItem.data.endDate} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div style={field}>
                      <label style={labelStyle}>Grund</label>
                      <select name="type" style={inputStyle} defaultValue={selectedItem.data.type}>
                        <option value="manual">Eigennutzung</option>
                        <option value="other">Sonstiges</option>
                      </select>
                    </div>
                    <div style={field}>
                      <label style={labelStyle}>Notiz</label>
                      <input type="text" name="note" style={inputStyle} defaultValue={selectedItem.data.note} />
                    </div>
                  </div>
                  {editError && <div style={{ fontSize: 12, color: '#f87171' }}>{editError}</div>}
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
                    {!confirmDelete ? (
                      <button type="button" onClick={() => setConfirmDelete(true)} style={{ padding: '6px 14px', background: '#7f1d1d', color: '#fca5a5', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Löschen</button>
                    ) : (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button type="button" onClick={() => setConfirmDelete(false)} style={{ padding: '6px 12px', background: 'transparent', border: '1px solid #334155', color: '#94a3b8', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>Abbrechen</button>
                        <button type="button" onClick={async () => {
                          const res = await fetch('/api/admin/blocked-date', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: selectedItem.data.id }) });
                          if (res.ok) { setEditSuccess(true); setTimeout(() => { setSelectedItem(null); setEditSuccess(false); startTransition(() => router.refresh()); }, 800); }
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
