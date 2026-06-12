'use client';

import { useState } from 'react';
import { Button, ConfirmDialog } from '../components/ui';

type Season = {
  id: number;
  name: string | null;
  startDate: Date;
  endDate: Date;
  pricePerNight: number;
  minStay: number;
  apartment: { name: string; hotel?: { name: string; settings?: { accentColor?: string | null } | null } | null; [key: string]: unknown } | null;
};

export default function PriceSeasonList({
  seasons: initial,
  deleteSeason,
  isSuperAdmin,
}: {
  seasons: Season[];
  deleteSeason: (formData: FormData) => Promise<void>;
  isSuperAdmin: boolean;
}) {
  const [seasons, setSeasons] = useState<Season[]>(initial);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [aptFilter, setAptFilter] = useState('all');
  const [nameFilter, setNameFilter] = useState('all');

  const apartmentNames = [...new Set(initial.map((s) => s.apartment?.name).filter(Boolean))] as string[];
  const seasonNames = [...new Set(initial.map((s) => s.name).filter(Boolean))] as string[];
  const showNameFilter = seasonNames.length >= 2 && apartmentNames.length >= 2;

  const visible = seasons
    .filter((s) => aptFilter === 'all' || s.apartment?.name === aptFilter)
    .filter((s) => nameFilter === 'all' || s.name === nameFilter);

  const fmt = (d: Date) => new Date(d).toLocaleDateString('de-AT');

  async function handleDelete() {
    if (confirmId === null) return;
    setDeleting(confirmId);
    setConfirmId(null);
    const fd = new FormData();
    fd.append('id', String(confirmId));
    await deleteSeason(fd);
    setSeasons((prev) => prev.filter((s) => s.id !== confirmId));
    setExpandedId(null);
    setDeleting(null);
  }

  const confirmSeason = confirmId !== null ? seasons.find((s) => s.id === confirmId) : null;

  return (
    <>
      <style>{`
        .price-season-grid { display: grid; gap: 12px; align-items: start; }
        @media (min-width: 640px) { .price-season-grid { grid-template-columns: 1fr 1fr; gap: 16px; } }
        .dark .season-card, [data-theme="dark"] .season-card { background: var(--bg-surface-raised) !important; }
      `}</style>

      {(apartmentNames.length > 1 || showNameFilter) && (
        <div style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {apartmentNames.length > 1 && (
            <select
              value={aptFilter}
              onChange={(e) => setAptFilter(e.target.value)}
              style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 13, cursor: 'pointer' }}
            >
              <option value="all">Alle Apartments ({seasons.length})</option>
              {apartmentNames.map((name) => (
                <option key={name} value={name}>{name} ({seasons.filter((s) => s.apartment?.name === name).length})</option>
              ))}
            </select>
          )}
          {showNameFilter && (
            <select
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 13, cursor: 'pointer' }}
            >
              <option value="all">Alle Saisons</option>
              {seasonNames.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          )}
        </div>
      )}

      <div className="price-season-grid">
        {visible.map((s) => {
          const isOpen = expandedId === s.id;
          return (
            <div
              key={s.id}
              className="season-card"
              style={{ border: '1px solid var(--border)', borderRadius: 12, background: 'var(--surface)', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
            >
              <button
                type="button"
                onClick={() => setExpandedId(isOpen ? null : s.id)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', gap: 12 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', flexShrink: 0 }}>
                    {s.name || '—'}
                  </span>
                  {isSuperAdmin && s.apartment?.hotel?.name && (() => {
                    const accent = s.apartment?.hotel?.settings?.accentColor || '#111827';
                    return (
                      <span style={{ fontSize: 11, fontWeight: 700, color: accent, background: `${accent}18`, border: `1px solid ${accent}40`, borderRadius: 6, padding: '2px 8px', letterSpacing: '0.03em', flexShrink: 0 }}>
                        {s.apartment.hotel.name}
                      </span>
                    );
                  })()}
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {s.apartment?.name} · {fmt(s.startDate)} – {fmt(s.endDate)}
                  </span>
                </div>
                <span className="card-caret" style={{ transform: isOpen ? 'rotate(180deg)' : undefined }}>
                  <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
              </button>

              {isOpen && (
                <div style={{ padding: '0 18px 18px', borderTop: '1px solid var(--border)' }}>
                  <div style={{ display: 'grid', gap: 6, marginTop: 14, fontSize: 14, color: 'var(--text-primary)' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <span style={{ color: 'var(--text-secondary)', width: 160, flexShrink: 0 }}>Apartment</span>
                      <span>{s.apartment?.name}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <span style={{ color: 'var(--text-secondary)', width: 160, flexShrink: 0 }}>Zeitraum</span>
                      <span>{fmt(s.startDate)} – {fmt(s.endDate)}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <span style={{ color: 'var(--text-secondary)', width: 160, flexShrink: 0 }}>Preis / Nacht</span>
                      <span>€ {s.pricePerNight}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <span style={{ color: 'var(--text-secondary)', width: 160, flexShrink: 0 }}>Mindestaufenthalt</span>
                      <span>{s.minStay} Nacht{s.minStay !== 1 ? 'ä' : ''}e</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
                    <Button variant="danger" size="sm" disabled={deleting === s.id} loading={deleting === s.id} onClick={() => setConfirmId(s.id)}>
                      Löschen
                    </Button>
                    <a href={`/admin/price-seasons/${s.id}/edit`} className="ui-btn ui-btn-secondary ui-btn-sm" style={{ textDecoration: 'none' }}>
                      Bearbeiten
                    </a>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        isOpen={confirmId !== null}
        onClose={() => setConfirmId(null)}
        onConfirm={handleDelete}
        title="Preiszeitraum löschen"
        description={confirmSeason ? `Preiszeitraum „${confirmSeason.name || '—'}" wirklich löschen?` : 'Preiszeitraum wirklich löschen?'}
        confirmLabel="Löschen"
        dangerous
      />
    </>
  );
}
