'use client';

import { useState, useMemo } from 'react';
import { Button, ConfirmDialog } from '../components/ui';
import { getChannelColor } from '@/src/lib/channelColors';
import { CHANNEL_DISPLAY_NAME, type Beds24ChannelKey } from '@/src/lib/beds24Channels';

type ChannelPriceRange = {
  id: number;
  channel: string;
  name: string | null;
  startDate: Date;
  endDate: Date;
  pricePerNight: number;
  beds24SyncError: string | null;
  apartment: { name: string };
};

type GroupBy = 'apartment' | 'channel';

const inputStyle: React.CSSProperties = {
  padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13,
  boxSizing: 'border-box', background: 'var(--surface)', color: 'var(--text-primary)',
};
const lbl: React.CSSProperties = { fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' };

function isoDate(d: Date): string {
  return new Date(d).toISOString().slice(0, 10);
}
function channelLabel(channel: string): string {
  return CHANNEL_DISPLAY_NAME[channel as Beds24ChannelKey] ?? channel;
}

export default function ChannelPriceList({
  ranges: initial,
  updateChannelPrice,
  deleteChannelPrice,
}: {
  ranges: ChannelPriceRange[];
  updateChannelPrice: (formData: FormData) => Promise<void>;
  deleteChannelPrice: (formData: FormData) => Promise<void>;
}) {
  const [ranges, setRanges] = useState(initial);
  const [groupBy, setGroupBy] = useState<GroupBy>('apartment');
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const fmt = (d: Date) => new Date(d).toLocaleDateString('de-AT');

  const groups = useMemo(() => {
    const map = new Map<string, ChannelPriceRange[]>();
    for (const r of ranges) {
      const key = groupBy === 'apartment' ? r.apartment.name : channelLabel(r.channel);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0], 'de'));
  }, [ranges, groupBy]);

  async function handleDelete() {
    if (confirmId === null) return;
    setDeleting(confirmId);
    setConfirmId(null);
    const fd = new FormData();
    fd.append('id', String(confirmId));
    await deleteChannelPrice(fd);
    setRanges((prev) => prev.filter((r) => r.id !== confirmId));
    setDeleting(null);
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>, id: number) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    fd.append('id', String(id));
    await updateChannelPrice(fd);
    setRanges((prev) => prev.map((r) => r.id === id ? {
      ...r,
      startDate: new Date(String(fd.get('startDate'))),
      endDate: new Date(String(fd.get('endDate'))),
      pricePerNight: Number(fd.get('pricePerNight')),
      name: (fd.get('name') as string) || null,
      beds24SyncError: null, // optimistic — page revalidation brings the real value if a sync error occurred
    } : r));
    setSaving(false);
    setEditingId(null);
  }

  const confirmRange = confirmId !== null ? ranges.find((r) => r.id === confirmId) : null;

  function renderRow(r: ChannelPriceRange) {
    const label = channelLabel(r.channel);
    const color = getChannelColor(label);
    const isEditing = editingId === r.id;

    if (isEditing) {
      return (
        <form key={r.id} onSubmit={(e) => handleSave(e, r.id)} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end', padding: '12px 14px', border: '1px solid var(--border)', borderRadius: 10, background: 'var(--surface)' }}>
          {groupBy === 'channel' && <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', alignSelf: 'center' }}>{r.apartment.name}</span>}
          {groupBy === 'apartment' && <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: color.bg, color: color.text, flexShrink: 0, alignSelf: 'center' }}>{label}</span>}
          <div style={{ display: 'grid', gap: 4, flex: '1 1 140px' }}>
            <label style={lbl}>Von</label>
            <input name="startDate" type="date" defaultValue={isoDate(r.startDate)} required style={inputStyle} />
          </div>
          <div style={{ display: 'grid', gap: 4, flex: '1 1 140px' }}>
            <label style={lbl}>Bis</label>
            <input name="endDate" type="date" defaultValue={isoDate(r.endDate)} required style={inputStyle} />
          </div>
          <div style={{ display: 'grid', gap: 4, flex: '1 1 100px' }}>
            <label style={lbl}>€ / Nacht</label>
            <input name="pricePerNight" type="number" min="0" step="0.01" defaultValue={r.pricePerNight} required style={inputStyle} />
          </div>
          <div style={{ display: 'grid', gap: 4, flex: '1 1 140px' }}>
            <label style={lbl}>Bezeichnung</label>
            <input name="name" type="text" defaultValue={r.name ?? ''} placeholder="Optional" style={inputStyle} />
          </div>
          <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
            <Button variant="secondary" size="sm" type="button" onClick={() => setEditingId(null)} disabled={saving}>Abbrechen</Button>
            <Button variant="primary" size="sm" type="submit" loading={saving} disabled={saving}>Speichern</Button>
          </div>
        </form>
      );
    }

    return (
      <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 10, background: 'var(--surface)' }}>
        {groupBy === 'apartment' && <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: color.bg, color: color.text, flexShrink: 0 }}>{label}</span>}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 500 }}>
            {groupBy === 'channel' ? r.apartment.name : (r.name || <span style={{ color: 'var(--text-disabled)', fontWeight: 400 }}>(keine Bezeichnung)</span>)}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
            {groupBy === 'channel' ? (r.name ? `${r.name} · ` : <span style={{ color: 'var(--text-disabled)' }}>(keine Bezeichnung) · </span>) : ''}{fmt(r.startDate)} – {fmt(r.endDate)} · € {r.pricePerNight}/Nacht
          </div>
          {r.beds24SyncError && (
            <div style={{ fontSize: 12, color: '#b45309', marginTop: 4 }}>
              ⚠️ Nicht an Beds24 übertragen: {r.beds24SyncError}
            </div>
          )}
        </div>
        {groupBy === 'channel' && <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: color.bg, color: color.text, flexShrink: 0 }}>{label}</span>}
        <Button variant="secondary" size="sm" onClick={() => setEditingId(r.id)}>Bearbeiten</Button>
        <Button variant="danger" size="sm" disabled={deleting === r.id} loading={deleting === r.id} onClick={() => setConfirmId(r.id)}>
          Löschen
        </Button>
      </div>
    );
  }

  return (
    <>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
          <button onClick={() => { setGroupBy('apartment'); setExpandedGroup(null); }} style={{ padding: '6px 12px', fontSize: 13, cursor: 'pointer', border: 'none', background: groupBy === 'apartment' ? 'var(--accent)' : 'var(--surface)', color: groupBy === 'apartment' ? 'var(--text-on-accent)' : 'var(--text-muted)', fontWeight: groupBy === 'apartment' ? 600 : 400 }}>Nach Apartment</button>
          <button onClick={() => { setGroupBy('channel'); setExpandedGroup(null); }} style={{ padding: '6px 12px', fontSize: 13, cursor: 'pointer', border: 'none', borderLeft: '1px solid var(--border)', background: groupBy === 'channel' ? 'var(--accent)' : 'var(--surface)', color: groupBy === 'channel' ? 'var(--text-on-accent)' : 'var(--text-muted)', fontWeight: groupBy === 'channel' ? 600 : 400 }}>Nach Kanal</button>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 10 }}>
        {groups.map(([key, items]) => {
          const isOpen = expandedGroup === key;
          return (
            <div key={key} style={{ border: '1px solid var(--border)', borderRadius: 12, background: 'var(--surface)', overflow: 'hidden' }}>
              <button
                type="button"
                onClick={() => setExpandedGroup(isOpen ? null : key)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', gap: 12 }}
              >
                <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {key} <span style={{ fontWeight: 400, color: 'var(--text-secondary)', fontSize: 13 }}>· {items.length} {items.length === 1 ? 'Eintrag' : 'Einträge'}</span>
                </span>
                <span className="card-caret" style={{ transform: isOpen ? 'rotate(180deg)' : undefined }}>
                  <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
              </button>
              {isOpen && (
                <div style={{ padding: '0 14px 14px', borderTop: '1px solid var(--border)', display: 'grid', gap: 8, paddingTop: 14 }}>
                  {items.map(renderRow)}
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
        title="Kanalpreis löschen"
        description={confirmRange ? `Kanalpreis „${confirmRange.apartment.name} · ${channelLabel(confirmRange.channel)}" wirklich löschen?` : 'Kanalpreis wirklich löschen?'}
        confirmLabel="Löschen"
        dangerous
      />
    </>
  );
}
