'use client';

import { useState } from 'react';

type Range = {
  id: number;
  startDate: Date;
  endDate: Date;
  type: string;
  note: string | null;
  apartment: { name: string; hotel?: { name: string; settings?: { accentColor?: string | null } | null } | null; [key: string]: unknown } | null;
};

export default function BlockedDateList({
  ranges: initial,
  deleteBlockedDate,
  isSuperAdmin,
}: {
  ranges: Range[];
  deleteBlockedDate: (formData: FormData) => Promise<void>;
  isSuperAdmin: boolean;
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
    <>
      <style>{`
        .blocked-date-grid { display: grid; gap: 12px; }
        @media (min-width: 640px) { .blocked-date-grid { grid-template-columns: 1fr 1fr; gap: 16px; } }
        .bdc { border: 1px solid #e5e7eb; padding: 14px 16px; border-radius: 12px; background: #fff; box-shadow: 0 1px 4px rgba(0,0,0,0.06); display: flex; flex-direction: column; gap: 12px; }
        .bdc-actions { display: flex; gap: 8px; }
        .bdc-actions a, .bdc-actions button { flex: 1; text-align: center; padding: 8px 0; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; }
        @media (min-width: 640px) {
          .bdc { flex-direction: row; align-items: center; justify-content: space-between; padding: 16px 20px; }
          .bdc-actions { flex-direction: row; flex-shrink: 0; }
          .bdc-actions a, .bdc-actions button { flex: none; padding: 6px 14px; }
        }
      `}</style>
      <div className="blocked-date-grid">
      {ranges.map((r) => (
        <div key={r.id} className="bdc">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 700, fontSize: 15, color: '#111' }}>
                {r.apartment?.name || 'Alle Apartments'}
              </span>
              {isSuperAdmin && r.apartment?.hotel?.name && (() => {
                const accent = r.apartment?.hotel?.settings?.accentColor || '#111827';
                return (
                  <span style={{ fontSize: 11, fontWeight: 700, color: accent, background: `${accent}18`, border: `1px solid ${accent}40`, borderRadius: 6, padding: '2px 8px', letterSpacing: '0.03em' }}>
                    {r.apartment.hotel.name}
                  </span>
                );
              })()}
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

          <div className="bdc-actions">
            <button
              type="button"
              disabled={deleting === r.id}
              onClick={() => handleDelete(r.id)}
              style={{ border: '1px solid #fecaca', background: '#fff', color: '#dc2626', borderRadius: 8, opacity: deleting === r.id ? 0.5 : 1 }}
            >
              {deleting === r.id ? '…' : 'Löschen'}
            </button>
            <a
              href={`/admin/blocked-dates/${r.id}/edit`}
              style={{ border: '1px solid #d1d5db', background: '#fff', color: '#374151', borderRadius: 8, textDecoration: 'none' }}
            >
              Bearbeiten
            </a>
          </div>
        </div>
      ))}
    </div>
    </>
  );
}
