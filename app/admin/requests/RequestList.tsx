'use client';

import Link from 'next/link';

type RequestItem = {
  id: number;
  hotelId: number | null;
  arrival: Date;
  departure: Date;
  firstname: string | null;
  lastname: string;
  selectedApartmentIds: string;
  status: string;
  hotel: { name: string; accentColor: string | null } | null;
};

type ApartmentLookup = { id: number; name: string };

function getStatusBadge(status: string) {
  switch (status) {
    case 'booked':     return { label: 'Gebucht',     bg: 'var(--status-booked-bg)',    color: 'var(--status-booked-text)',    border: 'transparent' };
    case 'answered':   return { label: 'Beantwortet', bg: 'var(--status-new-bg)',        color: 'var(--status-new-text)',        border: 'transparent' };
    case 'cancelled':  return { label: 'Storniert',   bg: 'var(--status-cancelled-bg)', color: 'var(--status-cancelled-text)', border: 'transparent' };
    default:           return { label: 'Neu',          bg: 'var(--status-pending-bg)',   color: 'var(--status-pending-text)',   border: 'transparent' };
  }
}

function resolveApartmentNames(ids: string, apartments: ApartmentLookup[]): string {
  const parsed = ids.split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
  const names = parsed.map((id) => apartments.find((a) => a.id === id)?.name).filter(Boolean);
  return names.length > 0 ? names.join(', ') : '—';
}

const fmt = (d: Date) => new Date(d).toLocaleDateString('de-AT');

export default function RequestList({ requests, apartments, isSuperAdmin }: {
  requests: RequestItem[];
  apartments: ApartmentLookup[];
  isSuperAdmin: boolean;
}) {
  return (
    <div style={{ display: 'grid', gap: 6 }}>
      {requests.map((r) => {
        const badge = getStatusBadge(r.status);
        const name = [r.firstname, r.lastname].filter(Boolean).join(' ');
        const aptNames = resolveApartmentNames(r.selectedApartmentIds, apartments);

        return (
          <Link
            key={r.id}
            href={`/admin/requests/${r.id}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              padding: '12px 16px',
              border: '1px solid var(--border)',
              borderRadius: 10,
              background: 'var(--surface)',
              cursor: 'pointer',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1, flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', flexShrink: 0 }}>{name}</span>

                {isSuperAdmin && r.hotel?.name && (
                  <span style={{
                    fontSize: 11, fontWeight: 700, color: '#fafafa',
                    background: r.hotel.accentColor || '#111827',
                    borderRadius: 6, padding: '2px 8px', flexShrink: 0,
                  }}>
                    {r.hotel.name}
                  </span>
                )}

                <span style={{ fontSize: 13, color: 'var(--text-muted)', flexShrink: 0 }}>
                  {fmt(r.arrival)} – {fmt(r.departure)}
                </span>

                <span style={{ fontSize: 13, color: 'var(--text-subtle)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {aptNames}
                </span>
              </div>

              <span style={{
                display: 'inline-flex', alignItems: 'center',
                padding: '4px 10px', borderRadius: 7,
                background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`,
                fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em',
                flexShrink: 0,
              }}>
                {badge.label}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
