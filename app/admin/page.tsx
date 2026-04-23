import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

/* ---------- helpers ---------- */

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
    case 'new':       return { bg: 'var(--surface-2)',              color: 'var(--text-muted)',  border: 'var(--border)' };
    case 'answered':  return { bg: 'rgba(37,99,235,0.12)',          color: '#60a5fa',            border: 'rgba(37,99,235,0.3)' };
    case 'booked':    return { bg: 'rgba(22,163,74,0.12)',          color: '#4ade80',            border: 'rgba(22,163,74,0.3)' };
    case 'cancelled': return { bg: 'rgba(220,38,38,0.12)',          color: '#f87171',            border: 'rgba(220,38,38,0.3)' };
    default:          return { bg: 'var(--surface-2)',              color: 'var(--text-muted)',  border: 'var(--border)' };
  }
}

/* ---------- page ---------- */

export default async function AdminPage() {
  const session = await verifySession();
  const isSuperAdmin = session.hotelId === null;

  if (isSuperAdmin) {
    return <SuperAdminDashboard />;
  } else {
    return <HotelAdminDashboard hotelId={session.hotelId!} />;
  }
}

/* ========== SUPER ADMIN ========== */

async function SuperAdminDashboard() {
  const [hotels, allRequests, recentRequests] = await Promise.all([
    prisma.hotel.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { apartments: true, requests: true } },
        requests: { select: { status: true } },
      },
    }),
    prisma.request.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.request.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: { hotel: { select: { name: true, accentColor: true } } },
    }),
  ]);

  const totalApartments = hotels.reduce((s, h) => s + h._count.apartments, 0);
  const totalRequests   = hotels.reduce((s, h) => s + h._count.requests, 0);
  const newRequests     = (allRequests.find((r) => r.status === 'new')?._count._all ?? 0)
                        + (allRequests.find((r) => r.status === 'confirmed')?._count._all ?? 0);

  const stats = [
    { label: 'Hotels',     value: hotels.filter((h) => h.isActive).length, href: '/admin/hotels' },
    { label: 'Apartments', value: totalApartments, href: '/admin/apartments' },
    { label: 'Anfragen',   value: totalRequests,   href: '/admin/requests' },
    { label: 'Neu',        value: newRequests,      href: '/admin/requests', highlight: newRequests > 0 },
  ];

  return (
    <main className="admin-page" style={pageStyle}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={headlineStyle}>Übersicht</h1>
        <p style={sublineStyle}>Alle Hotels auf einen Blick</p>
      </div>

      {/* STAT CARDS */}
      <div className="stat-grid" style={statsRowStyle}>
        {stats.map((s) => (
          <Link key={s.label} href={s.href} style={{ textDecoration: 'none' }}>
            <div style={{ ...statCardStyle, ...(s.highlight ? { borderColor: '#fca5a5', background: '#fef2f2' } : {}) }}>
              <div style={{ fontSize: 32, fontWeight: 700, color: s.highlight ? '#dc2626' : '#111' }}>
                {s.value}
              </div>
              <div style={{ fontSize: 13, color: s.highlight ? '#dc2626' : '#666', marginTop: 4 }}>
                {s.label}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="two-col" style={twoColStyle}>
        {/* HOTEL CARDS */}
        <div>
          <h2 style={sectionTitleStyle}>Hotels</h2>
          <div style={{ display: 'grid', gap: 12 }}>
            {hotels.map((h) => {
              const byStatus = Object.fromEntries(
                h.requests.reduce((map, r) => {
                  map.set(r.status, (map.get(r.status) ?? 0) + 1);
                  return map;
                }, new Map<string, number>()),
              );
              const newCount = byStatus['new'] ?? 0;

              return (
                <div
                  key={h.id}
                  style={{
                    ...cardStyle,
                    opacity: h.isActive ? 1 : 0.5,
                    borderLeft: `4px solid ${h.accentColor || '#e5e7eb'}`,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 12 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: '#111' }}>
                        {h.name}
                        {!h.isActive && (
                          <span style={{ marginLeft: 8, fontSize: 11, color: '#999' }}>Inaktiv</span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: '#888', marginTop: 3 }}>
                        {h._count.apartments} Apartments · {h._count.requests} Anfragen
                      </div>
                    </div>

                    {newCount > 0 && (
                      <span style={{
                        padding: '3px 10px',
                        borderRadius: 8,
                        background: '#fef2f2',
                        color: '#dc2626',
                        fontSize: 12,
                        fontWeight: 700,
                        border: '1px solid #fca5a5',
                        flexShrink: 0,
                      }}>
                        {newCount} neu
                      </span>
                    )}
                  </div>

                  {h._count.requests > 0 && (
                    <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                      {(['new', 'answered', 'booked', 'cancelled'] as const).map((st) =>
                        (byStatus[st] ?? 0) > 0 ? (
                          <span
                            key={st}
                            style={{
                              padding: '2px 10px',
                              borderRadius: 8,
                              fontSize: 11,
                              fontWeight: 600,
                              background: statusColor(st).bg,
                              color: statusColor(st).color,
                              border: `1px solid ${statusColor(st).border}`,
                            }}
                          >
                            {byStatus[st]} {statusLabel(st)}
                          </span>
                        ) : null,
                      )}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <Link
                      href={`/admin/requests?hotel=${h.slug}`}
                      style={linkBtnStyle}
                    >
                      Anfragen
                    </Link>
                    <Link
                      href={`/admin/apartments?hotel=${h.slug}`}
                      style={linkBtnStyle}
                    >
                      Apartments
                    </Link>
                    <Link
                      href={`/admin/settings?hotel=${h.id}`}
                      style={linkBtnStyle}
                    >
                      Settings
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RECENT REQUESTS */}
        <div>
          <h2 style={sectionTitleStyle}>Letzte Anfragen</h2>
          <div style={{ display: 'grid', gap: 10 }}>
            {recentRequests.length === 0 ? (
              <p style={{ fontSize: 14, color: '#888' }}>Noch keine Anfragen.</p>
            ) : (
              recentRequests.map((r) => {
                const sc = statusColor(r.status);
                return (
                  <Link
                    key={r.id}
                    href={`/admin/requests/${r.id}`}
                    style={{ textDecoration: 'none' }}
                  >
                    <div style={cardStyle}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                        <div style={{ fontWeight: 600, fontSize: 14, color: '#111' }}>
                          {r.firstname || ''} {r.lastname}
                        </div>
                        <span style={{
                          padding: '2px 10px',
                          borderRadius: 8,
                          fontSize: 11,
                          fontWeight: 700,
                          background: sc.bg,
                          color: sc.color,
                          border: `1px solid ${sc.border}`,
                          flexShrink: 0,
                        }}>
                          {statusLabel(r.status)}
                        </span>
                      </div>

                      <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
                        {r.hotel && (
                          <span style={{
                            display: 'inline-block',
                            marginRight: 8,
                            padding: '1px 8px',
                            borderRadius: 8,
                            background: r.hotel.accentColor || '#eee',
                            color: '#fff',
                            fontSize: 11,
                          }}>
                            {r.hotel.name}
                          </span>
                        )}
                        {new Date(r.arrival).toLocaleDateString('de-AT')} –{' '}
                        {new Date(r.departure).toLocaleDateString('de-AT')} · {r.nights} Nächte
                      </div>

                      <div style={{ fontSize: 11, color: '#bbb', marginTop: 4 }}>
                        {new Date(r.createdAt).toLocaleString('de-AT')}
                      </div>
                    </div>
                  </Link>
                );
              })
            )}

            {recentRequests.length > 0 && (
              <Link href="/admin/requests" style={{ ...linkBtnStyle, textAlign: 'center' }}>
                Alle Anfragen →
              </Link>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

/* ========== HOTEL ADMIN ========== */

async function HotelAdminDashboard({ hotelId }: { hotelId: number }) {
  const [hotel, requestGroups, recentRequests] = await Promise.all([
    prisma.hotel.findUnique({
      where: { id: hotelId },
      include: { _count: { select: { apartments: true } } },
    }),
    prisma.request.groupBy({
      by: ['status'],
      where: { hotelId },
      _count: { _all: true },
    }),
    prisma.request.findMany({
      where: { hotelId },
      take: 8,
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  if (!hotel) return <p>Hotel nicht gefunden.</p>;

  const byStatus = Object.fromEntries(requestGroups.map((r) => [r.status, r._count._all]));
  const totalRequests = requestGroups.reduce((s, r) => s + r._count._all, 0);
  const newCount = (byStatus['new'] ?? 0) + (byStatus['confirmed'] ?? 0);

  const stats = [
    { label: 'Apartments', value: hotel._count.apartments, href: '/admin/apartments' },
    { label: 'Anfragen',   value: totalRequests,           href: '/admin/requests' },
    { label: 'Neu',        value: newCount,                href: '/admin/requests', highlight: newCount > 0 },
  ];

  return (
    <main className="admin-page" style={pageStyle}>
      <div style={{ marginBottom: 28, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: hotel.accentColor || '#e5e7eb',
            border: '1px solid rgba(0,0,0,0.08)',
            flexShrink: 0,
          }}
        />
        <div>
          <h1 style={headlineStyle}>{hotel.name}</h1>
          <p style={sublineStyle}>Dein Hotel auf einen Blick</p>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="stat-grid" style={statsRowStyle}>
        {stats.map((s) => (
          <Link key={s.label} href={s.href} style={{ textDecoration: 'none' }}>
            <div style={{ ...statCardStyle, ...(s.highlight ? { borderColor: '#fca5a5', background: '#fef2f2' } : {}) }}>
              <div style={{ fontSize: 32, fontWeight: 700, color: s.highlight ? '#dc2626' : '#111' }}>
                {s.value}
              </div>
              <div style={{ fontSize: 13, color: s.highlight ? '#dc2626' : '#666', marginTop: 4 }}>
                {s.label}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* STATUS BREAKDOWN */}
      {totalRequests > 0 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
          {(['new', 'answered', 'booked', 'cancelled'] as const).map((st) =>
            (byStatus[st] ?? 0) > 0 ? (
              <span
                key={st}
                style={{
                  padding: '6px 14px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  background: statusColor(st).bg,
                  color: statusColor(st).color,
                  border: `1px solid ${statusColor(st).border}`,
                }}
              >
                {byStatus[st]} {statusLabel(st)}
              </span>
            ) : null,
          )}
        </div>
      )}

      {/* RECENT REQUESTS */}
      <h2 style={sectionTitleStyle}>Letzte Anfragen</h2>
      <div style={{ display: 'grid', gap: 10 }}>
        {recentRequests.length === 0 ? (
          <p style={{ fontSize: 14, color: '#888' }}>Noch keine Anfragen.</p>
        ) : (
          recentRequests.map((r) => {
            const sc = statusColor(r.status);
            return (
              <Link
                key={r.id}
                href={`/admin/requests/${r.id}`}
                style={{ textDecoration: 'none' }}
              >
                <div style={cardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#111' }}>
                      {r.firstname || ''} {r.lastname}
                    </div>
                    <span style={{
                      padding: '2px 10px',
                      borderRadius: 8,
                      fontSize: 11,
                      fontWeight: 700,
                      background: sc.bg,
                      color: sc.color,
                      border: `1px solid ${sc.border}`,
                      flexShrink: 0,
                    }}>
                      {statusLabel(r.status)}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
                    {new Date(r.arrival).toLocaleDateString('de-AT')} –{' '}
                    {new Date(r.departure).toLocaleDateString('de-AT')} · {r.nights} Nächte ·{' '}
                    {r.adults} Erw.{r.children ? `, ${r.children} Kinder` : ''}
                  </div>
                  <div style={{ fontSize: 11, color: '#bbb', marginTop: 4 }}>
                    {new Date(r.createdAt).toLocaleString('de-AT')}
                  </div>
                </div>
              </Link>
            );
          })
        )}

        {recentRequests.length > 0 && (
          <Link href="/admin/requests" style={{ ...linkBtnStyle, textAlign: 'center' }}>
            Alle Anfragen →
          </Link>
        )}
      </div>
    </main>
  );
}

/* ---------- styles ---------- */

const pageStyle: React.CSSProperties = {
  maxWidth: 1100,
};

const headlineStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 28,
  fontWeight: 700,
  color: 'var(--text-primary)',
  letterSpacing: '-0.02em',
};

const sublineStyle: React.CSSProperties = {
  margin: '4px 0 0',
  fontSize: 14,
  color: 'var(--text-muted)',
};

const statsRowStyle: React.CSSProperties = {
  gap: 14,
  marginBottom: 32,
};

const statCardStyle: React.CSSProperties = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 14,
  padding: '20px 22px',
  cursor: 'pointer',
  transition: 'box-shadow 0.15s',
};

const twoColStyle: React.CSSProperties = {
  gap: 28,
  alignItems: 'start',
};

const sectionTitleStyle: React.CSSProperties = {
  margin: '0 0 14px',
  fontSize: 17,
  fontWeight: 700,
  color: 'var(--text-primary)',
  letterSpacing: '-0.01em',
};

const cardStyle: React.CSSProperties = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 12,
  padding: '14px 16px',
};

const linkBtnStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '6px 12px',
  borderRadius: 8,
  border: '1px solid var(--border)',
  background: 'var(--surface-2)',
  color: 'var(--text-muted)',
  fontSize: 12,
  textDecoration: 'none',
};
