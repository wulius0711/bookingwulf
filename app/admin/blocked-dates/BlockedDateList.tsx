'use client';

import { useState } from 'react';
import { Button, ConfirmDialog } from '../components/ui';

type Range = {
  id: number;
  startDate: Date;
  endDate: Date;
  type: string;
  note: string | null;
  apartment: { name: string; hotel?: { name: string; settings?: { accentColor?: string | null } | null } | null; [key: string]: unknown } | null;
};

function BlockedDateCard({
  r,
  isSuperAdmin,
  onDelete,
  deleting,
}: {
  r: Range;
  isSuperAdmin: boolean;
  onDelete: (id: number) => void;
  deleting: boolean;
}) {
  const fmt = (d: Date) => new Date(d).toLocaleDateString('de-AT');

  return (
    <div className="bdc">
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>
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
        <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>
          {fmt(r.startDate)} – {fmt(r.endDate)}
        </div>
        {r.type && (
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
            {r.type === 'booking' ? 'Buchung' : r.type === 'manual' ? 'Eigennutzung' : 'Sonstiges'}
          </div>
        )}
        {r.note && (
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{r.note}</div>
        )}
      </div>

      <div className="bdc-actions">
        <Button variant="danger" size="sm" onClick={() => onDelete(r.id)} loading={deleting} disabled={deleting}>
          Löschen
        </Button>
        <a
          href={`/admin/blocked-dates/${r.id}/edit`}
          className="ui-btn ui-btn-secondary ui-btn-sm"
          style={{ textDecoration: 'none' }}
        >
          Bearbeiten
        </a>
      </div>
    </div>
  );
}

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
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const confirmRange = confirmId !== null ? ranges.find((r) => r.id === confirmId) : null;

  async function handleDelete() {
    if (confirmId === null) return;
    setDeleting(confirmId);
    setConfirmId(null);
    const fd = new FormData();
    fd.append('id', String(confirmId));
    await deleteBlockedDate(fd);
    setRanges((prev) => prev.filter((r) => r.id !== confirmId));
    setDeleting(null);
  }

  return (
    <>
      <style>{`
        .blocked-date-grid { display: grid; gap: 12px; }
        @media (min-width: 640px) { .blocked-date-grid { grid-template-columns: 1fr 1fr; gap: 16px; } }
        .bdc { border: 1px solid var(--border); padding: 14px 16px; border-radius: 12px; background: var(--surface); box-shadow: 0 1px 4px rgba(0,0,0,0.06); display: flex; flex-direction: column; gap: 12px; }
        .bdc-actions { display: flex; gap: 8px; }
        @media (min-width: 640px) {
          .bdc { flex-direction: row; align-items: center; justify-content: space-between; padding: 16px 20px; }
          .bdc-actions { flex-direction: row; flex-shrink: 0; }
        }
      `}</style>

      <div className="blocked-date-grid">
        {ranges.map((r) => (
          <BlockedDateCard
            key={r.id}
            r={r}
            isSuperAdmin={isSuperAdmin}
            onDelete={(id) => setConfirmId(id)}
            deleting={deleting === r.id}
          />
        ))}
      </div>

      <ConfirmDialog
        isOpen={confirmId !== null}
        onClose={() => setConfirmId(null)}
        onConfirm={handleDelete}
        title="Sperrzeit löschen"
        description={confirmRange ? `Sperrzeit für „${confirmRange.apartment?.name || 'Apartment'}" wirklich löschen?` : 'Sperrzeit wirklich löschen?'}
        confirmLabel="Löschen"
        dangerous
      />
    </>
  );
}
