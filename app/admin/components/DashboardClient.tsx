'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import StatCard from './StatCard';

const WIDGETS = [
  { id: 'stats',     label: 'Statistiken' },
  { id: 'status',   label: 'Anfragestatus' },
  { id: 'quick',    label: 'Schnellzugriff' },
  { id: 'arrivals', label: 'Nächste Anreisen' },
  { id: 'recent',   label: 'Letzte Anfragen' },
  { id: 'zimmerplan', label: 'Zimmerplan' },
] as const;

type WidgetId = typeof WIDGETS[number]['id'];
type Prefs = Record<WidgetId, boolean>;

const LS_KEY = 'dashboard_widgets';
const DEFAULT: Prefs = { stats: true, status: true, quick: true, arrivals: true, recent: true, zimmerplan: true };

function loadPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return DEFAULT;
    return { ...DEFAULT, ...JSON.parse(raw) };
  } catch { return DEFAULT; }
}

function statusLabel(s: string) {
  switch (s) {
    case 'new':       return 'Neu';
    case 'answered':  return 'Beantwortet';
    case 'booked':    return 'Gebucht';
    case 'cancelled': return 'Storniert';
    default:          return s;
  }
}

function statusColor(s: string) {
  switch (s) {
    case 'new':       return { bg: 'var(--surface-2)',     color: 'var(--text-muted)', border: 'var(--border)' };
    case 'answered':  return { bg: 'rgba(37,99,235,0.12)', color: '#60a5fa',           border: 'rgba(37,99,235,0.3)' };
    case 'booked':    return { bg: 'rgba(22,163,74,0.12)', color: '#4ade80',           border: 'rgba(22,163,74,0.3)' };
    case 'cancelled': return { bg: 'rgba(220,38,38,0.12)', color: '#f87171',           border: 'rgba(220,38,38,0.3)' };
    default:          return { bg: 'var(--surface-2)',     color: 'var(--text-muted)', border: 'var(--border)' };
  }
}

const QUICK_LINKS = [
  { label: 'Anfragen',      href: '/admin/requests',      icon: '📋' },
  { label: 'Zimmerplan',    href: '/admin/zimmerplan',    icon: '🗓' },
  { label: 'Kalender',      href: '/admin/calendar',      icon: '📅' },
  { label: 'Apartments',    href: '/admin/apartments',    icon: '🏠' },
  { label: 'Preisanpassungen', href: '/admin/price-seasons', icon: '💶' },
  { label: 'Widget & Design', href: '/admin/settings',   icon: '⚙️' },
];

type Booking = { id: number; kind: 'booking'; startDate: string; endDate: string; label: string; requestId: number };
type Block   = { id: number; kind: 'blocked'; startDate: string; endDate: string; note: string | null; type: string };
type AptData = { id: number; name: string; bookings: Booking[]; blocks: Block[] };

const ROW_H = 36;
const LABEL_W = 110;
const DAYS = 14;

function addDays(iso: string, n: number) {
  const d = new Date(iso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string) {
  return Math.round((new Date(b + 'T00:00:00Z').getTime() - new Date(a + 'T00:00:00Z').getTime()) / 86400000);
}

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const DOW = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

function MiniZimmerplan({ data }: { data: AptData[] }) {
  const from = todayIso();
  const days = Array.from({ length: DAYS }, (_, i) => addDays(from, i));
  const containerRef = useRef<HTMLDivElement>(null);
  const [colW, setColW] = useState(28);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const calc = () => setColW(Math.max(24, Math.floor((el.clientWidth - LABEL_W) / DAYS)));
    calc();
    const ro = new ResizeObserver(calc);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={containerRef} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <div style={{ minWidth: LABEL_W + 24 * DAYS }}>
          {/* Header row */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
            <div style={{ width: LABEL_W, flexShrink: 0 }} />
            {days.map((d) => {
              const isToday = d === from;
              const dow = new Date(d + 'T00:00:00Z').getUTCDay();
              const isWeekend = dow === 0 || dow === 6;
              return (
                <div key={d} style={{
                  width: colW, flexShrink: 0, textAlign: 'center', padding: '6px 0',
                  fontSize: 10, fontWeight: isToday ? 700 : 500,
                  background: isToday ? 'rgba(234,85,4,0.12)' : isWeekend ? 'var(--surface-2)' : 'transparent',
                  color: isToday ? '#EA5504' : isWeekend ? 'var(--text-secondary)' : 'var(--text-muted)',
                  borderLeft: '1px solid var(--border)',
                }}>
                  <div>{DOW[dow]}</div>
                  <div style={{ fontSize: 11, fontWeight: 700 }}>{parseInt(d.slice(8))}</div>
                </div>
              );
            })}
          </div>

          {/* Apartment rows */}
          {data.map((apt, i) => (
            <div key={apt.id} style={{
              display: 'flex', position: 'relative', height: ROW_H,
              borderBottom: i < data.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              {/* Label */}
              <div style={{
                width: LABEL_W, flexShrink: 0, display: 'flex', alignItems: 'center',
                padding: '0 12px', fontSize: 12, fontWeight: 500, color: 'var(--text-primary)',
                borderRight: '1px solid var(--border)', whiteSpace: 'nowrap', overflow: 'hidden',
              }}>
                {apt.name}
              </div>

              {/* Day cells */}
              <div style={{ position: 'relative', flex: 1 }}>
                {days.map((d) => {
                  const isToday = d === from;
                  const dow = new Date(d + 'T00:00:00Z').getUTCDay();
                  const isWeekend = dow === 0 || dow === 6;
                  return (
                    <div key={d} style={{
                      position: 'absolute', top: 0, bottom: 0,
                      left: daysBetween(from, d) * colW,
                      width: colW,
                      background: isToday ? 'rgba(234,85,4,0.06)' : isWeekend ? 'var(--surface-2)' : 'transparent',
                      borderLeft: '1px solid var(--border)',
                    }} />
                  );
                })}

                {/* Booking bars */}
                {apt.bookings.map((b) => {
                  const s = b.startDate < from ? from : b.startDate;
                  const to = addDays(from, DAYS);
                  const e = b.endDate > to ? to : b.endDate;
                  const startIdx = daysBetween(from, s);
                  const span = daysBetween(s, e);
                  if (span <= 0) return null;
                  return (
                    <Link key={b.id} href={`/admin/requests/${b.requestId}`} style={{ textDecoration: 'none' }}>
                      <div style={{
                        position: 'absolute',
                        left: startIdx * colW + 2, width: span * colW - 4,
                        top: 5, height: ROW_H - 10,
                        background: '#bbf7d0', borderRadius: 5,
                        display: 'flex', alignItems: 'center', paddingLeft: 6,
                        fontSize: 10, fontWeight: 600, color: '#166534',
                        overflow: 'hidden', whiteSpace: 'nowrap',
                        cursor: 'pointer',
                      }}>
                        {span > 1 ? b.label : ''}
                      </div>
                    </Link>
                  );
                })}

                {/* Block bars */}
                {apt.blocks.map((b) => {
                  const s = b.startDate < from ? from : b.startDate;
                  const to = addDays(from, DAYS);
                  const e = b.endDate > to ? to : b.endDate;
                  const startIdx = daysBetween(from, s);
                  const span = daysBetween(s, e);
                  if (span <= 0) return null;
                  return (
                    <div key={b.id} style={{
                      position: 'absolute',
                      left: startIdx * colW + 2, width: span * colW - 4,
                      top: 5, height: ROW_H - 10,
                      background: '#fcd34d', borderRadius: 5,
                      fontSize: 10, fontWeight: 600, color: '#78350f',
                    }} />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '8px 12px', textAlign: 'right', borderTop: '1px solid var(--border)' }}>
        <Link href="/admin/zimmerplan" style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none' }}>
          Zum Zimmerplan →
        </Link>
      </div>
    </div>
  );
}

export default function DashboardClient({
  hotel, stats, byStatus, totalRequests, recentRequests, upcomingArrivals, zimmerplanData,
}: {
  hotel: { name: string; accentColor: string | null };
  stats: { label: string; value: number; href: string; highlight?: boolean }[];
  byStatus: Record<string, number>;
  totalRequests: number;
  recentRequests: {
    id: number; firstname: string | null; lastname: string;
    arrival: Date; departure: Date; nights: number;
    adults: number; children: number | null; status: string; createdAt: Date;
  }[];
  upcomingArrivals: {
    id: number; firstname: string | null; lastname: string;
    arrival: string; departure: string; nights: number; adults: number;
  }[];
  zimmerplanData: AptData[];
}) {
  const [prefs, setPrefs] = useState<Prefs>(() => {
    if (typeof window === 'undefined') return DEFAULT;
    return loadPrefs();
  });
  const [customizing, setCustomizing] = useState(false);

  function toggle(id: WidgetId) {
    setPrefs((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem(LS_KEY, JSON.stringify(next));
      return next;
    });
  }

  return (
    <main className="admin-page w-lg">
      {/* Header */}
      <div style={{ marginBottom: 28, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12, flexShrink: 0,
          background: hotel.accentColor || '#e5e7eb', border: '1px solid rgba(0,0,0,0.08)',
        }} />
        <div style={{ flex: 1 }}>
          <h1 className="dashboard-h1" style={{ margin: 0, fontSize: 32, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>{hotel.name}</h1>
          <p style={{ margin: '6px 0 0', fontSize: 14, color: '#667085' }}>Dein Hotel auf einen Blick</p>
        </div>
        <button onClick={() => setCustomizing(v => !v)} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, fontSize: 13,
          border: '1px solid var(--border)', background: customizing ? 'var(--surface-2)' : 'transparent',
          color: 'var(--text-muted)', cursor: 'pointer',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>
          </svg>
          Anpassen
        </button>
      </div>

      {/* Customizer Panel */}
      {customizing && (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12,
          padding: '16px 20px', marginBottom: 24, display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center',
        }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Widgets</span>
          {WIDGETS.map(({ id, label }) => (
            <label key={id} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{label}</span>
              <span onClick={() => toggle(id)} style={{
                position: 'relative', display: 'inline-block', width: 36, height: 20,
                borderRadius: 10, flexShrink: 0, cursor: 'pointer',
                background: prefs[id] ? '#22c55e' : '#4b5563',
                transition: 'background 0.2s',
              }}>
                <span style={{
                  position: 'absolute', top: 3, left: prefs[id] ? 19 : 3,
                  width: 14, height: 14, borderRadius: '50%',
                  background: '#fff', transition: 'left 0.2s',
                }} />
              </span>
            </label>
          ))}
        </div>
      )}

      {/* Statistiken */}
      {prefs.stats && (
        <div className="stat-grid" style={{ gap: 14, marginBottom: 32 }}>
          {stats.map(s => <StatCard key={s.label} label={s.label} value={s.value} href={s.href} highlight={s.highlight} />)}
        </div>
      )}

      {/* Anfragestatus */}
      {prefs.status && totalRequests > 0 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
          {(['new', 'answered', 'booked', 'cancelled'] as const).map(st =>
            (byStatus[st] ?? 0) > 0 ? (
              <span key={st} style={{
                padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                background: statusColor(st).bg, color: statusColor(st).color, border: `1px solid ${statusColor(st).border}`,
              }}>
                {byStatus[st]} {statusLabel(st)}
              </span>
            ) : null
          )}
        </div>
      )}

      {/* Schnellzugriff */}
      {prefs.quick && (
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ margin: '0 0 14px', fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>Schnellzugriff</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
            {QUICK_LINKS.map(({ label, href, icon }) => (
              <Link key={href} href={href} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10,
                  padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8,
                }}>
                  <span style={{ fontSize: 20 }}>{icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Adaptive middle section: Anreisen / Letzte Anfragen / Zimmerplan */}
      {(() => {
        const allThree = prefs.arrivals && prefs.recent && prefs.zimmerplan;
        const h2 = (t: string) =><h2 style={{ margin: '0 0 14px', fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>{t}</h2>;

        const arrivalsBlock = prefs.arrivals && (
          <div>
            {h2('Nächste Anreisen')}
            {upcomingArrivals.length === 0 ? (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, fontSize: 13, color: 'var(--text-muted)' }}>
                Keine Anreisen in den nächsten 14 Tagen.
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 8 }}>
                {upcomingArrivals.map(r => {
                  const arrival = new Date(r.arrival);
                  const daysUntil = Math.round((arrival.getTime() - Date.now()) / 86400000);
                  return (
                    <Link key={r.id} href={`/admin/requests/${r.id}`} style={{ textDecoration: 'none' }}>
                      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{r.firstname || ''} {r.lastname}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                            {arrival.toLocaleDateString('de-AT')} · {r.nights} Nächte · {r.adults} Erw.
                          </div>
                        </div>
                        <span suppressHydrationWarning style={{
                          fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, flexShrink: 0,
                          background: daysUntil === 0 ? 'rgba(22,163,74,0.15)' : daysUntil <= 2 ? 'rgba(234,85,4,0.12)' : 'var(--surface-2)',
                          color: daysUntil === 0 ? '#4ade80' : daysUntil <= 2 ? '#EA5504' : 'var(--text-muted)',
                          border: `1px solid ${daysUntil === 0 ? 'rgba(22,163,74,0.3)' : daysUntil <= 2 ? 'rgba(234,85,4,0.3)' : 'var(--border)'}`,
                        }}>
                          {daysUntil === 0 ? 'Heute' : daysUntil === 1 ? 'Morgen' : `in ${daysUntil} Tagen`}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );

        const recentBlock = prefs.recent && (
          <div>
            {h2('Letzte Anfragen')}
            <div style={{ display: 'grid', gap: 8 }}>
              {recentRequests.length === 0 ? (
                <p style={{ fontSize: 14, color: '#888' }}>Noch keine Anfragen.</p>
              ) : (
                recentRequests.map(r => {
                  const sc = statusColor(r.status);
                  return (
                    <Link key={r.id} href={`/admin/requests/${r.id}`} style={{ textDecoration: 'none' }}>
                      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                          <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{r.firstname || ''} {r.lastname}</div>
                          <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, flexShrink: 0 }}>
                            {statusLabel(r.status)}
                          </span>
                        </div>
                        <div style={{ fontSize: 11, color: '#888', marginTop: 3 }}>
                          {new Date(r.arrival).toLocaleDateString('de-AT')} – {new Date(r.departure).toLocaleDateString('de-AT')} · {r.nights} N.
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
              {recentRequests.length > 0 && (
                <Link href="/admin/requests" style={{ display: 'block', padding: '8px 14px', borderRadius: 8, textAlign: 'center', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text-muted)', fontSize: 12, textDecoration: 'none' }}>
                  Alle Anfragen →
                </Link>
              )}
            </div>
          </div>
        );

        const zimmerBlock = prefs.zimmerplan && (
          <div>
            {h2('Zimmerplan')}
            <MiniZimmerplan data={zimmerplanData} />
          </div>
        );

        if (!arrivalsBlock && !recentBlock && !zimmerBlock) return null;

        const twoCol: React.CSSProperties = {
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: 24,
          alignItems: 'start',
        };

        if (allThree) return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32, marginBottom: 32 }}>
            <div className="dash-two-col" style={twoCol}>
              {arrivalsBlock}
              {recentBlock}
            </div>
            {zimmerBlock}
          </div>
        );

        // Exactly 2 active: 50/50
        const activeBlocks = [arrivalsBlock, recentBlock, zimmerBlock].filter(Boolean);
        if (activeBlocks.length === 2) return (
          <div className="dash-two-col" style={{ ...twoCol, marginBottom: 32 }}>
            {activeBlocks[0]}
            {activeBlocks[1]}
          </div>
        );

        // 1 active: full-width
        return <div style={{ marginBottom: 32 }}>{activeBlocks[0]}</div>;
      })()}
    </main>
  );
}
