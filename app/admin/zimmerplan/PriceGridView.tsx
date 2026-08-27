'use client';

import { useState, useEffect } from 'react';
import { CHANNEL_DISPLAY_NAME, type Beds24ChannelKey } from '@/src/lib/beds24Channels';

const COL_W = 36;
const ROW_H = 36;
const LABEL_W = 140;
const WEEKDAY_SHORT = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

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

type AptPrices = { id: number; name: string; prices: Record<string, number> };

export default function PriceGridView({ todayIso, initialIso, availableChannels }: { todayIso: string; initialIso?: string; availableChannels: string[] }) {
  const [monthIso, setMonthIso] = useState(() => monthStart(initialIso ?? todayIso));
  const [channel, setChannel] = useState(availableChannels[0] ?? '');
  const [apartments, setApartments] = useState<AptPrices[]>([]);
  const [loading, setLoading] = useState(true);

  const from = monthStart(monthIso);
  const to = monthEnd(monthIso);

  const days: string[] = [];
  for (let d = from; d <= to; d = addDays(d, 1)) days.push(d);

  useEffect(() => {
    if (!channel) { setApartments([]); setLoading(false); return; }
    setLoading(true);
    fetch(`/api/admin/channel-price-grid?from=${from}&to=${to}&channel=${channel}`)
      .then((r) => r.json())
      .then((d) => { setApartments(d.apartments ?? []); setLoading(false); });
  }, [from, to, channel]);

  if (!availableChannels.length) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 14, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16 }}>
        Noch keine Kanalpreise eingerichtet — siehe <a href="/admin/beds24" style={{ color: 'var(--text-primary)' }}>Beds24-Einstellungen</a>.
      </div>
    );
  }

  return (
    <div>
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

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-secondary)', fontSize: 14 }}>Lädt…</div>
      ) : (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ display: 'flex' }}>
            <div style={{ width: LABEL_W, flexShrink: 0, borderRight: '1px solid var(--border)' }}>
              <div style={{ height: 40, borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }} />
              {apartments.map((apt, i) => (
                <div key={apt.id} style={{ height: ROW_H, display: 'flex', alignItems: 'center', padding: '0 14px', borderBottom: i < apartments.length - 1 ? '1px solid var(--border)' : 'none', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {apt.name}
                </div>
              ))}
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

                {apartments.map((apt, i) => (
                  <div key={apt.id} style={{ display: 'flex', height: ROW_H, borderBottom: i < apartments.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    {days.map((d) => {
                      const price = apt.prices[d];
                      const dow = new Date(d + 'T12:00:00Z').getUTCDay();
                      const isWeekend = dow === 0 || dow === 6;
                      const isToday = d === todayIso;
                      return (
                        <div key={d} style={{ width: COL_W, flexShrink: 0, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid var(--border)', background: isToday ? 'color-mix(in srgb, var(--accent) 6%, transparent)' : isWeekend ? 'var(--surface-2)' : 'transparent', fontSize: 10, fontWeight: 600, color: price != null ? 'var(--text-primary)' : 'var(--text-disabled)' }}>
                          {price != null ? Math.round(price) : '–'}
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
