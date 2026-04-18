'use client';

import { useState } from 'react';

type Range = {
  id: number;
  startDate: Date;
  endDate: Date;
  type: string;
  note: string | null;
  apartment: { name: string; [key: string]: unknown } | null;
};

export default function BlockedDateList({
  ranges: initial,
  deleteBlockedDate,
}: {
  ranges: Range[];
  deleteBlockedDate: (formData: FormData) => Promise<void>;
}) {
  const [ranges, setRanges] = useState<Range[]>(initial);
  const [deleting, setDeleting] = useState<number | null>(null);

  const fmt = (d: Date) => new Date(d).toLocaleDateString('de-AT');

  async function handleDelete(id: number) {
    if (!window.confirm('Sperrzeit wirklich löschen?')) return;
    setDeleting(id);
    const fd = new FormData();
    fd.append('id', String(id));
    await deleteBlockedDate(fd);
    setRanges((prev) => prev.filter((r) => r.id !== id));
    setDeleting(null);
  }

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {ranges.map((r) => (
        <div
          key={r.id}
          style={{
            border: '1px solid #e5e7eb',
            padding: '16px 20px',
            borderRadius: 12,
            background: '#fff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#111' }}>
              {r.apartment?.name || 'Alle Apartments'}
            </div>
            <div style={{ fontSize: 14, color: '#374151', marginTop: 4 }}>
              {fmt(r.startDate)} – {fmt(r.endDate)}
            </div>
            {r.type && (
              <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>
                {r.type === 'booking' ? 'Buchung' : r.type === 'manual' ? 'Eigennutzung' : 'Sonstiges'}
              </div>
            )}
            {r.note && (
              <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{r.note}</div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <a
              href={`/admin/blocked-dates/${r.id}/edit`}
              style={{ padding: '6px 14px', border: '1px solid #d1d5db', background: '#fff', color: '#374151', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}
            >
              Bearbeiten
            </a>
            <button
              type="button"
              disabled={deleting === r.id}
              onClick={() => handleDelete(r.id)}
              style={{ padding: '6px 14px', border: '1px solid #fecaca', background: '#fff', color: '#dc2626', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, opacity: deleting === r.id ? 0.5 : 1 }}
            >
              {deleting === r.id ? '…' : 'Löschen'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
