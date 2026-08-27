'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '../components/ui';
import { CHANNEL_DISPLAY_NAME, type Beds24ChannelKey } from '@/src/lib/beds24Channels';
import { getChannelColor } from '@/src/lib/channelColors';

const COL_W = 36;
const ROW_H = 36;
const LABEL_W = 140;
const WEEKDAY_SHORT = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

const DARK_MODAL_VARS: React.CSSProperties = {
  background: '#1e293b',
  border: '1px solid #334155',
  ['--text-primary' as string]: '#f0f4ff',
  ['--text-secondary' as string]: '#b4c0d8',
};
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '7px 10px', border: '1px solid #334155',
  borderRadius: 7, fontSize: 13, background: '#273548', color: '#f1f5f9', boxSizing: 'border-box',
};
const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, color: '#94a3b8',
  letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 3,
};
const field: React.CSSProperties = { display: 'grid', gap: 3 };

function addDays(iso: string, n: number): string {
  const d = new Date(iso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
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
function compareDates(a: string, b: string) { return a < b ? [a, b] : [b, a]; }

type RangeInfo = { id: number; startDate: string; endDate: string; pricePerNight: number; name: string | null; beds24SyncError: string | null };
type AptGrid = { id: number; name: string; days: Record<string, { rangeId: number; price: number }>; ranges: Record<number, RangeInfo> };

export default function PriceGridView({ todayIso, initialIso, availableChannels, channelOfferIds }: { todayIso: string; initialIso?: string; availableChannels: string[]; channelOfferIds: Record<number, Record<string, number>> }) {
  const [monthIso, setMonthIso] = useState(() => monthStart(initialIso ?? todayIso));
  const [channel, setChannel] = useState(availableChannels[0] ?? '');
  const [apartments, setApartments] = useState<AptGrid[]>([]);
  const [loading, setLoading] = useState(true);

  const [isDragging, setIsDragging] = useState(false);
  const [dragAptId, setDragAptId] = useState<number | null>(null);
  const [dragStart, setDragStart] = useState<string | null>(null);
  const [dragEnd, setDragEnd] = useState<string | null>(null);
  const [selection, setSelection] = useState<{ aptId: number; aptName: string; start: string; end: string } | null>(null);
  const [selectedRange, setSelectedRange] = useState<{ aptId: number; aptName: string; range: RangeInfo } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const from = monthStart(monthIso);
  const to = monthEnd(monthIso);
  const days: string[] = [];
  for (let d = from; d <= to; d = addDays(d, 1)) days.push(d);

  function refetch() {
    if (!channel) { setApartments([]); setLoading(false); return; }
    setLoading(true);
    fetch(`/api/admin/channel-price-grid?from=${from}&to=${to}&channel=${channel}`)
      .then((r) => r.json())
      .then((d) => { setApartments(d.apartments ?? []); setLoading(false); });
  }

  useEffect(() => { refetch(); }, [from, to, channel]); // eslint-disable-line react-hooks/exhaustive-deps

  // Global mouseup to finalize drag (catches release outside a cell)
  useEffect(() => {
    function onMouseUp() {
      if (!isDragging || !dragStart || !dragEnd || !dragAptId) return;
      const [lo, hi] = dragStart <= dragEnd ? [dragStart, dragEnd] : [dragEnd, dragStart];
      setIsDragging(false);
      setDragStart(null);
      setDragEnd(null);
      const apt = apartments.find((a) => a.id === dragAptId);
      setDragAptId(null);
      if (apt) {
        setSelection({ aptId: apt.id, aptName: apt.name, start: lo, end: addDays(hi, 1) });
        setFormError(null);
        setFormSuccess(false);
      }
    }
    document.addEventListener('mouseup', onMouseUp);
    return () => document.removeEventListener('mouseup', onMouseUp);
  }, [isDragging, dragStart, dragEnd, dragAptId, apartments]);

  function inDragHighlight(aptId: number, day: string): boolean {
    if (!isDragging || dragAptId !== aptId || !dragStart || !dragEnd) return false;
    const [lo, hi] = dragStart <= dragEnd ? [dragStart, dragEnd] : [dragEnd, dragStart];
    return day >= lo && day <= hi;
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    if (!selection) return;
    const fd = new FormData(e.currentTarget);
    const res = await fetch('/api/admin/channel-price', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apartmentId: selection.aptId, channel, startDate: selection.start, endDate: selection.end, pricePerNight: Number(fd.get('pricePerNight')), name: fd.get('name') }),
    });
    const json = await res.json();
    if (!res.ok) { setFormError(json.error ?? 'Fehler beim Speichern'); return; }
    setFormSuccess(true);
    setTimeout(() => { setSelection(null); setFormSuccess(false); refetch(); }, 800);
  }

  async function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    if (!selectedRange) return;
    const fd = new FormData(e.currentTarget);
    const res = await fetch('/api/admin/channel-price', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: selectedRange.range.id, startDate: fd.get('startDate'), endDate: fd.get('endDate'), pricePerNight: Number(fd.get('pricePerNight')), name: fd.get('name') }),
    });
    const json = await res.json();
    if (!res.ok) { setFormError(json.error ?? 'Fehler beim Speichern'); return; }
    setFormSuccess(true);
    setTimeout(() => { setSelectedRange(null); setFormSuccess(false); refetch(); }, 800);
  }

  async function handleDelete() {
    if (!selectedRange) return;
    const res = await fetch('/api/admin/channel-price', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: selectedRange.range.id }),
    });
    const json = await res.json();
    if (res.ok) {
      if (json.beds24SyncError) alert(`Gelöscht, aber nicht an Beds24 übertragen: ${json.beds24SyncError}`);
      setFormSuccess(true);
      setTimeout(() => { setSelectedRange(null); setFormSuccess(false); setConfirmDelete(false); refetch(); }, 800);
    } else setFormError(json.error ?? 'Fehler');
  }

  const createModalRef = useRef<HTMLDivElement>(null);
  const editModalRef = useRef<HTMLDivElement>(null);

  if (!availableChannels.length) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 14, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16 }}>
        Noch keine Kanalpreise eingerichtet — siehe <a href="/admin/beds24" style={{ color: 'var(--text-primary)' }}>Beds24-Einstellungen</a>.
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <button onClick={() => setMonthIso(prevMonth(monthIso))} style={{ padding: '6px 12px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--surface)', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>‹</button>
        <span style={{ fontWeight: 700, fontSize: 15, minWidth: 160, textAlign: 'center' }}>{formatMonthLabel(from)}</span>
        <button onClick={() => setMonthIso(nextMonth(monthIso))} style={{ padding: '6px 12px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--surface)', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>›</button>
        {monthIso !== monthStart(todayIso) && (
          <button onClick={() => setMonthIso(monthStart(todayIso))} style={{ marginLeft: 4, padding: '6px 12px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--surface)', fontSize: 13, cursor: 'pointer', color: 'var(--text-muted)' }}>Heute</button>
        )}
        <div style={{ flex: 1 }} />
        <select value={channel} onChange={(e) => setChannel(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 13, cursor: 'pointer' }}>
          {availableChannels.map((c) => (
            <option key={c} value={c}>{CHANNEL_DISPLAY_NAME[c as Beds24ChannelKey] ?? c}</option>
          ))}
        </select>
      </div>
      <p style={{ margin: '0 0 12px', fontSize: 12, color: 'var(--text-secondary)' }}>
        💡 Zeitraum in einer Zeile per Drag markieren, um einen Preis anzulegen. Auf einen bestehenden Preis klicken, um ihn zu bearbeiten oder zu löschen.
      </p>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-secondary)', fontSize: 14 }}>Lädt…</div>
      ) : (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ display: 'flex' }}>
            <div style={{ width: LABEL_W, flexShrink: 0, borderRight: '1px solid var(--border)' }}>
              <div style={{ height: 40, borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }} />
              {apartments.map((apt, i) => {
                const eligible = !!channelOfferIds[apt.id]?.[channel];
                return (
                  <div key={apt.id} style={{ height: ROW_H, display: 'flex', alignItems: 'center', padding: '0 14px', borderBottom: i < apartments.length - 1 ? '1px solid var(--border)' : 'none', fontSize: 13, fontWeight: 600, color: eligible ? 'var(--text-primary)' : 'var(--text-disabled)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={eligible ? undefined : 'Kanal für dieses Apartment nicht eingerichtet'}>
                    {apt.name}
                  </div>
                );
              })}
            </div>

            <div className="gantt-scroll">
              <div style={{ width: days.length * COL_W, minWidth: '100%' }}>
                <div style={{ display: 'flex', height: 40, borderBottom: '1px solid var(--border)', background: 'var(--surface-2)', position: 'sticky', top: 0, zIndex: 2 }}>
                  {days.map((d) => {
                    const isToday = d === todayIso;
                    const dow = new Date(d + 'T12:00:00Z').getUTCDay();
                    const isWeekend = dow === 0 || dow === 6;
                    return (
                      <div key={d} style={{ width: COL_W, flexShrink: 0, textAlign: 'center', fontSize: 10, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1, background: isToday ? 'var(--accent)' : 'transparent' }}>
                        <span style={{ fontWeight: 700, color: isToday ? 'var(--text-on-accent)' : isWeekend ? '#6366f1' : '#6b7280' }}>{d.slice(8)}</span>
                        <span style={{ fontSize: 9, color: isToday ? 'var(--text-on-accent)' : isWeekend ? '#6366f1' : 'var(--text-secondary)' }}>{WEEKDAY_SHORT[dow]}</span>
                      </div>
                    );
                  })}
                </div>

                {apartments.map((apt, i) => {
                  const eligible = !!channelOfferIds[apt.id]?.[channel];
                  return (
                    <div
                      key={apt.id}
                      style={{ display: 'flex', height: ROW_H, borderBottom: i < apartments.length - 1 ? '1px solid var(--border)' : 'none', cursor: eligible ? 'crosshair' : 'not-allowed' }}
                    >
                      {days.map((d) => {
                        const dow = new Date(d + 'T12:00:00Z').getUTCDay();
                        const isWeekend = dow === 0 || dow === 6;
                        const isToday = d === todayIso;
                        const highlighted = inDragHighlight(apt.id, d);
                        const cell = apt.days[d];
                        return (
                          <div
                            key={d}
                            onMouseDown={(e) => { if (!eligible || cell) return; e.stopPropagation(); setDragAptId(apt.id); setDragStart(d); setDragEnd(d); setIsDragging(true); }}
                            onMouseEnter={() => { if (isDragging && dragAptId === apt.id) setDragEnd(d); }}
                            onClick={() => {
                              if (isDragging) return;
                              if (cell) {
                                const range = apt.ranges[cell.rangeId];
                                if (range) { setSelectedRange({ aptId: apt.id, aptName: apt.name, range }); setFormError(null); setFormSuccess(false); setConfirmDelete(false); }
                              }
                            }}
                            style={{
                              width: COL_W, flexShrink: 0, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              borderRight: '1px solid var(--border)',
                              background: highlighted ? '#ede9fe' : cell ? 'color-mix(in srgb, var(--accent) 12%, transparent)' : isToday ? 'color-mix(in srgb, var(--accent) 6%, transparent)' : isWeekend ? 'var(--surface-2)' : 'transparent',
                              fontSize: 10, fontWeight: 600, color: cell ? 'var(--text-primary)' : 'var(--text-disabled)',
                              cursor: eligible ? (cell ? 'pointer' : 'crosshair') : 'not-allowed',
                            }}
                            title={cell?.rangeId ? apt.ranges[cell.rangeId]?.beds24SyncError ? `⚠️ ${apt.ranges[cell.rangeId]?.beds24SyncError}` : undefined : undefined}
                          >
                            {cell ? Math.round(cell.price) : (eligible ? '' : '–')}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create popup */}
      {selection && (
        <>
          <div aria-hidden="true" onClick={() => { setSelection(null); setFormError(null); setFormSuccess(false); }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 100 }} />
          <div ref={createModalRef} role="dialog" aria-modal="true" style={{ ...DARK_MODAL_VARS, position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 'calc(100% - 32px)', maxWidth: 420, borderRadius: 16, boxShadow: '0 24px 64px rgba(0,0,0,0.4)', zIndex: 101, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #334155' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>
                {formatDisplay(selection.start)}{addDays(selection.end, -1) !== selection.start ? ` – ${formatDisplay(addDays(selection.end, -1))}` : ''}
              </div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{selection.aptName} · {CHANNEL_DISPLAY_NAME[channel as Beds24ChannelKey] ?? channel}</div>
            </div>
            <form onSubmit={handleCreate} style={{ padding: '20px', display: 'grid', gap: 14 }}>
              {formSuccess ? (
                <div role="status" style={{ textAlign: 'center', padding: '10px', color: '#4ade80', fontWeight: 600, fontSize: 14 }}>✓ Gespeichert</div>
              ) : (
                <>
                  <div style={field}>
                    <label htmlFor="pg-price" style={labelStyle}>Preis / Nacht (€)</label>
                    <input id="pg-price" type="number" step="0.01" name="pricePerNight" required style={inputStyle} placeholder="0.00" />
                  </div>
                  <div style={field}>
                    <label htmlFor="pg-name" style={labelStyle}>Bezeichnung</label>
                    <input id="pg-name" type="text" name="name" style={inputStyle} placeholder="Optional" />
                  </div>
                  {formError && <div role="alert" style={{ fontSize: 12, color: '#f87171' }}>{formError}</div>}
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button type="submit" style={{ background: '#ec4899' }}>Speichern</Button>
                  </div>
                </>
              )}
            </form>
          </div>
        </>
      )}

      {/* Edit/delete popup */}
      {selectedRange && (
        <>
          <div aria-hidden="true" onClick={() => setSelectedRange(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 100 }} />
          <div ref={editModalRef} role="dialog" aria-modal="true" style={{ ...DARK_MODAL_VARS, position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 'calc(100% - 32px)', maxWidth: 420, borderRadius: 16, boxShadow: '0 24px 64px rgba(0,0,0,0.4)', zIndex: 101, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #334155' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>💶 Kanalpreis</span>
              <button onClick={() => setSelectedRange(null)} aria-label="Schließen" style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: '0 4px' }}>×</button>
            </div>
            <div style={{ padding: '16px 16px 20px' }}>
              {formSuccess ? (
                <div role="status" style={{ textAlign: 'center', padding: '12px', color: '#4ade80', fontWeight: 600, fontSize: 14 }}>✓ Gespeichert</div>
              ) : (
                <form onSubmit={handleEdit} style={{ display: 'grid', gap: 14 }}>
                  <span style={{ display: 'inline-flex', alignSelf: 'start', alignItems: 'center', fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 6, background: getChannelColor(CHANNEL_DISPLAY_NAME[channel as Beds24ChannelKey] ?? channel).bg, color: getChannelColor(CHANNEL_DISPLAY_NAME[channel as Beds24ChannelKey] ?? channel).text }}>
                    {CHANNEL_DISPLAY_NAME[channel as Beds24ChannelKey] ?? channel} · {selectedRange.aptName}
                  </span>
                  {selectedRange.range.beds24SyncError && (
                    <div style={{ fontSize: 12, color: '#fbbf24', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: 8, padding: '8px 10px' }}>
                      ⚠️ Nicht an Beds24 übertragen: {selectedRange.range.beds24SyncError}
                    </div>
                  )}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div style={field}>
                      <label htmlFor="pg-e-from" style={labelStyle}>Von</label>
                      <input id="pg-e-from" type="date" name="startDate" required style={inputStyle} defaultValue={selectedRange.range.startDate} />
                    </div>
                    <div style={field}>
                      <label htmlFor="pg-e-to" style={labelStyle}>Bis</label>
                      <input id="pg-e-to" type="date" name="endDate" required style={inputStyle} defaultValue={selectedRange.range.endDate} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div style={field}>
                      <label htmlFor="pg-e-price" style={labelStyle}>Preis / Nacht (€)</label>
                      <input id="pg-e-price" type="number" step="0.01" name="pricePerNight" required style={inputStyle} defaultValue={selectedRange.range.pricePerNight} />
                    </div>
                    <div style={field}>
                      <label htmlFor="pg-e-name" style={labelStyle}>Bezeichnung</label>
                      <input id="pg-e-name" type="text" name="name" style={inputStyle} defaultValue={selectedRange.range.name ?? ''} />
                    </div>
                  </div>
                  {formError && <div role="alert" style={{ fontSize: 12, color: '#f87171' }}>{formError}</div>}
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
                    {!confirmDelete ? (
                      <Button variant="danger" size="sm" type="button" onClick={() => setConfirmDelete(true)}>Löschen</Button>
                    ) : (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <Button variant="ghost" size="sm" type="button" onClick={() => setConfirmDelete(false)}>Abbrechen</Button>
                        <Button variant="danger" size="sm" type="button" onClick={handleDelete}>Wirklich löschen</Button>
                      </div>
                    )}
                    <Button variant="danger" size="sm" type="submit">Speichern</Button>
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
