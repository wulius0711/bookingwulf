'use client';

import { useState, useMemo } from 'react';
import type { HousekeepingApartment, HousekeepingStatus, Occupancy } from '@/src/lib/housekeeping';
import InfoTooltip from '@/app/admin/components/InfoTooltip';

function formatShortDate(iso: string) {
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.`;
}

function OccupancyTag({ occupancy }: { occupancy: Occupancy }) {
  if (occupancy.kind === 'belegt') {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: '#dc2626' }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#dc2626', display: 'inline-block', flexShrink: 0 }} />
        {occupancy.checkoutToday ? 'Check-out heute' : `Belegt bis ${formatShortDate(occupancy.departure)}`}
      </span>
    );
  }
  if (occupancy.kind === 'blockiert') {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: '#d97706' }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#d97706', display: 'inline-block', flexShrink: 0 }} />
        Belegt
      </span>
    );
  }
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: '#16a34a' }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#16a34a', display: 'inline-block', flexShrink: 0 }} />
      Frei
    </span>
  );
}

const STATUS_PRIORITY: Record<HousekeepingStatus, number> = { repair: 0, dirty: 1, clean: 2 };
type SortBy = 'created' | 'status';

const STATUS_CONFIG: Record<HousekeepingStatus, { label: string; bg: string; color: string; border: string }> = {
  clean:  { label: 'Sauber',            bg: 'var(--housekeeping-clean-bg)',  color: 'var(--status-booked-text)',    border: 'color-mix(in srgb, var(--status-booked-text) 35%, transparent)' },
  dirty:  { label: 'Reinigung nötig',   bg: 'var(--housekeeping-dirty-bg)',  color: 'var(--status-pending-text)',   border: 'color-mix(in srgb, var(--status-pending-text) 35%, transparent)' },
  repair: { label: 'Reparatur nötig',   bg: 'var(--housekeeping-repair-bg)', color: 'var(--status-cancelled-text)', border: 'color-mix(in srgb, var(--status-cancelled-text) 35%, transparent)' },
};

function formatUpdatedAt(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('de-AT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function Badge({ color, text, label }: { color: string; text: string; label: string }) {
  return (
    <span style={{ background: color, color: text, fontSize: 13, fontWeight: 600, padding: '4px 12px', borderRadius: 20 }}>
      {label}
    </span>
  );
}

function StatusSelect({ apt, disabled, onChange }: { apt: HousekeepingApartment; disabled: boolean; onChange: (status: string) => void }) {
  const cfg = STATUS_CONFIG[apt.status];
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* Sichtbare Pille — komplett eigenes Styling, unabhängig vom Browser-Rendering des Selects */}
      <div
        aria-hidden="true"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          border: `1px solid ${cfg.border}`,
          borderRadius: 99,
          padding: '4px 10px 4px 12px',
          fontSize: 13,
          fontWeight: 700,
          background: cfg.bg,
          color: cfg.color,
          pointerEvents: 'none',
        }}
      >
        {cfg.label}
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" style={{ color: cfg.color, flexShrink: 0 }}>
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      {/* Unsichtbares natives Select — übernimmt nur Klick/Auswahl-Logik */}
      <select
        value={apt.status}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        aria-label="Status"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          opacity: 0,
          border: 'none',
          cursor: 'pointer',
          fontSize: 13,
        }}
      >
        {(Object.keys(STATUS_CONFIG) as HousekeepingStatus[]).map((s) => (
          <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
        ))}
      </select>
    </div>
  );
}

function HousekeepingCard({ apt, saving, hasError, expanded, onToggleExpanded, onPatch }: {
  apt: HousekeepingApartment;
  saving: boolean;
  hasError: boolean;
  expanded: boolean;
  onToggleExpanded: () => void;
  onPatch: (body: Record<string, unknown>) => void;
}) {
  const cfg = STATUS_CONFIG[apt.status];
  return (
    <div style={{
      background: cfg.bg,
      border: `2px solid ${cfg.border}`,
      borderRadius: 12,
      overflow: 'hidden',
    }}>
      <div
        role="button"
        tabIndex={0}
        onClick={onToggleExpanded}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggleExpanded(); } }}
        style={{ cursor: 'pointer', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap', WebkitUserSelect: 'none', userSelect: 'none' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ color: cfg.color, flexShrink: 0, transition: 'transform 0.15s', transform: expanded ? 'rotate(180deg)' : 'none' }}>
              <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', lineHeight: 1.3 }}>{apt.name}</span>
            {hasError && <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--status-cancelled-text)' }}>Fehler beim Speichern</span>}
          </span>
          <span style={{ paddingLeft: 22 }}>
            <OccupancyTag occupancy={apt.occupancy} />
          </span>
        </div>
        <span onClick={(e) => e.stopPropagation()}>
          <StatusSelect apt={apt} disabled={saving} onChange={(status) => onPatch({ status })} />
        </span>
      </div>

      {expanded && (
        <div style={{ padding: '0 18px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gap: 6 }}>
            {apt.checklistItems.map((item) => (
              <label key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                <input
                  type="checkbox"
                  checked={Boolean(apt.checklistState[item])}
                  onChange={(e) => onPatch({ checklistItem: item, checklistDone: e.target.checked })}
                  style={{ colorScheme: 'light', width: 15, height: 15, accentColor: cfg.color, cursor: 'pointer' }}
                />
                {item}
              </label>
            ))}
          </div>

          <textarea
            defaultValue={apt.note ?? ''}
            placeholder="Notizen, z.B. Fenster klemmt, Handtücher fehlen"
            rows={2}
            onBlur={(e) => {
              if (e.target.value !== (apt.note ?? '')) onPatch({ note: e.target.value });
            }}
            style={{ width: '100%', padding: '6px 8px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 13, resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box', background: 'var(--surface)', color: 'var(--text-primary)' }}
          />

          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Zuletzt aktualisiert: {formatUpdatedAt(apt.updatedAt)}</span>
        </div>
      )}
    </div>
  );
}

export default function HousekeepingClient({ initialApartments }: { initialApartments: HousekeepingApartment[] }) {
  const [apartments, setApartments] = useState(initialApartments);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [errorId, setErrorId] = useState<number | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [sortBy, setSortBy] = useState<SortBy>('created');

  const sortedApartments = useMemo(() => {
    const list = [...apartments];
    if (sortBy === 'status') {
      list.sort((a, b) => STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status]);
    } else {
      list.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    }
    return list;
  }, [apartments, sortBy]);

  function toggleExpanded(id: number) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function flashError(apartmentId: number) {
    setErrorId(apartmentId);
    setTimeout(() => setErrorId((id) => (id === apartmentId ? null : id)), 4000);
  }

  async function patch(apartmentId: number, body: Record<string, unknown>) {
    setSavingId(apartmentId);
    try {
      const res = await fetch('/api/admin/housekeeping', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apartmentId, ...body }),
      });
      const data = await res.json();
      if (!res.ok) {
        flashError(apartmentId);
        return;
      }
      setApartments((prev) =>
        prev.map((apt) =>
          apt.id === apartmentId
            ? {
                ...apt,
                status: data.apartment.housekeepingStatus,
                note: data.apartment.housekeepingNote,
                updatedAt: data.apartment.housekeepingUpdatedAt,
                checklistState: data.apartment.housekeepingChecklistState ?? apt.checklistState,
              }
            : apt,
        ),
      );
    } catch {
      flashError(apartmentId);
    } finally {
      setSavingId(null);
    }
  }

  const cleanCount = apartments.filter((a) => a.status === 'clean').length;
  const dirtyCount = apartments.filter((a) => a.status === 'dirty').length;
  const repairCount = apartments.filter((a) => a.status === 'repair').length;

  return (
    <div className="admin-page">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0 }}>Housekeeping</h1>
        <p className="page-subtitle" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          Reinigungsstatus und Checkliste je Apartment
          <InfoTooltip text="Die Checkliste je Apartment kann unter Apartments → Bearbeiten → Housekeeping angepasst werden." />
        </p>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Badge color="var(--status-booked-bg)" text="var(--status-booked-text)" label={`${cleanCount} Sauber`} />
          <Badge color="var(--status-pending-bg)" text="var(--status-pending-text)" label={`${dirtyCount} Reinigung nötig`} />
          <Badge color="var(--status-cancelled-bg)" text="var(--status-cancelled-text)" label={`${repairCount} Reparatur nötig`} />
        </div>
        <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
          <button
            onClick={() => setSortBy('created')}
            style={{ padding: '6px 12px', fontSize: 13, cursor: 'pointer', border: 'none', background: sortBy === 'created' ? 'var(--accent)' : 'var(--surface)', color: sortBy === 'created' ? 'var(--text-on-accent)' : 'var(--text-muted)', fontWeight: sortBy === 'created' ? 600 : 400 }}
          >
            Anlegezeitpunkt
          </button>
          <button
            onClick={() => setSortBy('status')}
            style={{ padding: '6px 12px', fontSize: 13, cursor: 'pointer', border: 'none', borderLeft: '1px solid var(--border)', background: sortBy === 'status' ? 'var(--accent)' : 'var(--surface)', color: sortBy === 'status' ? 'var(--text-on-accent)' : 'var(--text-muted)', fontWeight: sortBy === 'status' ? 600 : 400 }}
          >
            Status
          </button>
        </div>
      </div>

      {apartments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)', fontSize: 14 }}>Keine Apartments vorhanden.</div>
      ) : (
        <div className="housekeeping-grid">
          {sortedApartments.map((apt) => (
            <HousekeepingCard
              key={apt.id}
              apt={apt}
              saving={savingId === apt.id}
              hasError={errorId === apt.id}
              expanded={expandedIds.has(apt.id)}
              onToggleExpanded={() => toggleExpanded(apt.id)}
              onPatch={(body) => patch(apt.id, body)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
