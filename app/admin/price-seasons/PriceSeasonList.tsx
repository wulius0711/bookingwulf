'use client';

import { useState } from 'react';

type Season = {
  id: number;
  name: string | null;
  startDate: Date;
  endDate: Date;
  pricePerNight: number;
  minStay: number;
  apartment: { name: string; [key: string]: unknown } | null;
};

export default function PriceSeasonList({
  seasons: initial,
  deleteSeason,
}: {
  seasons: Season[];
  deleteSeason: (formData: FormData) => Promise<void>;
}) {
  const [seasons, setSeasons] = useState<Season[]>(initial);
  const [open, setOpen] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  const fmt = (d: Date) => new Date(d).toLocaleDateString('de-AT');

  async function handleDelete(id: number) {
    if (!window.confirm('Preiszeitraum wirklich löschen?')) return;
    setDeleting(id);
    const fd = new FormData();
    fd.append('id', String(id));
    await deleteSeason(fd);
    setSeasons((prev) => prev.filter((s) => s.id !== id));
    setOpen(null);
    setDeleting(null);
  }

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {seasons.map((s) => {
        const isOpen = open === s.id;
        return (
          <div
            key={s.id}
            style={{ border: '1px solid #e5e7eb', borderRadius: 12, background: '#fff', overflow: 'hidden' }}
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : s.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#111827', flexShrink: 0 }}>
                  {s.name || '—'}
                </span>
                <span style={{ fontSize: 13, color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {s.apartment?.name} · {fmt(s.startDate)} – {fmt(s.endDate)}
                </span>
              </div>
              <span style={{ fontSize: 13, color: '#9ca3af', flexShrink: 0 }}>{isOpen ? '▲' : '▼'}</span>
            </button>

            {isOpen && (
              <div style={{ padding: '0 18px 18px', borderTop: '1px solid #f3f4f6' }}>
                <div style={{ display: 'grid', gap: 6, marginTop: 14, fontSize: 14, color: '#374151' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <span style={{ color: '#9ca3af', width: 160, flexShrink: 0 }}>Apartment</span>
                    <span>{s.apartment?.name}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <span style={{ color: '#9ca3af', width: 160, flexShrink: 0 }}>Zeitraum</span>
                    <span>{fmt(s.startDate)} – {fmt(s.endDate)}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <span style={{ color: '#9ca3af', width: 160, flexShrink: 0 }}>Preis / Nacht</span>
                    <span>€ {s.pricePerNight}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <span style={{ color: '#9ca3af', width: 160, flexShrink: 0 }}>Mindestaufenthalt</span>
                    <span>{s.minStay} Nacht{s.minStay !== 1 ? 'ä' : ''}e</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                  <a
                    href={`/admin/price-seasons/${s.id}/edit`}
                    style={{ padding: '6px 14px', border: '1px solid #d1d5db', background: '#fff', color: '#374151', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}
                  >
                    Bearbeiten
                  </a>
                  <button
                    type="button"
                    disabled={deleting === s.id}
                    onClick={() => handleDelete(s.id)}
                    style={{ padding: '6px 14px', border: '1px solid #fecaca', background: '#fff', color: '#dc2626', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, opacity: deleting === s.id ? 0.5 : 1 }}
                  >
                    {deleting === s.id ? '…' : 'Löschen'}
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
