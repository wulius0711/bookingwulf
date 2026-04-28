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
    case 'booked':     return { label: 'Gebucht',     bg: '#e8f5e9', color: '#256029', border: '#b7dfba' };
    case 'answered':   return { label: 'Beantwortet', bg: '#eaf2ff', color: '#2457a6', border: '#bfd4fb' };
    case 'cancelled':  return { label: 'Storniert',   bg: '#fdecec', color: '#a63b3b', border: '#f3c3c3' };
    default:           return { label: 'Neu',          bg: '#f4f4f4', color: '#555',    border: '#ddd' };
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
              border: '1px solid #e5e7eb',
              borderRadius: 10,
              background: '#fff',
              cursor: 'pointer',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1, flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 600, fontSize: 14, color: '#111827', flexShrink: 0 }}>{name}</span>

                {isSuperAdmin && r.hotel?.name && (
                  <span style={{
                    fontSize: 11, fontWeight: 700, color: '#fafafa',
                    background: r.hotel.accentColor || '#111827',
                    borderRadius: 6, padding: '2px 8px', flexShrink: 0,
                  }}>
                    {r.hotel.name}
                  </span>
                )}

                <span style={{ fontSize: 13, color: '#6b7280', flexShrink: 0 }}>
                  {fmt(r.arrival)} – {fmt(r.departure)}
                </span>

                <span style={{ fontSize: 13, color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
