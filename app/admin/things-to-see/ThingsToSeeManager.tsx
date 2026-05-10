'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { ConfirmDialog } from '../components/ui';

type Item = {
  id: number;
  hotelId: number;
  category: string;
  title: string;
  description: string | null;
  address: string | null;
  mapsUrl: string | null;
  imageUrl: string | null;
  placeId: string | null;
  isActive: boolean;
  sortOrder: number;
  apartmentId: number | null;
  createdAt: string;
  updatedAt: string;
};

type Apartment = { id: number; name: string };
type Suggestion = { placeId: string; title: string; subtitle: string };

const CATEGORIES = [
  { value: 'restaurant', label: 'Restaurant & Café', icon: '🍽️' },
  { value: 'attraction', label: 'Sehenswürdigkeit', icon: '🏛️' },
  { value: 'activity', label: 'Aktivität', icon: '🏔️' },
  { value: 'event', label: 'Event', icon: '🎉' },
  { value: 'shopping', label: 'Einkaufen', icon: '🛍️' },
  { value: 'emergency', label: 'Wichtiges', icon: '🏥' },
];

function catLabel(v: string) {
  return CATEGORIES.find((c) => c.value === v)?.label ?? v;
}
function catIcon(v: string) {
  return CATEGORIES.find((c) => c.value === v)?.icon ?? '📍';
}

export default function ThingsToSeeManager({ hotelId, initialItems, apartments }: { hotelId: number; initialItems: Item[]; apartments: Apartment[] }) {
  const [items, setItems] = useState<Item[]>(initialItems);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [editId, setEditId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Item>>({});
  const [error, setError] = useState('');
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualData, setManualData] = useState({ category: 'event', title: '', description: '', address: '', mapsUrl: '', apartmentId: '' });
  const [filterCat, setFilterCat] = useState('all');
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length < 2) { setSuggestions([]); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoadingSuggestions(true);
      try {
        const res = await fetch(`/api/admin/places-search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setSuggestions(Array.isArray(data) ? data : []);
      } catch { setSuggestions([]); }
      finally { setLoadingSuggestions(false); }
    }, 300);
  }, [query]);

  async function importPlace(placeId: string) {
    setQuery('');
    setSuggestions([]);
    setError('');
    startTransition(async () => {
      try {
        const detailsRes = await fetch(`/api/admin/places-details?placeId=${placeId}`);
        const details = await detailsRes.json();
        if (!detailsRes.ok) { setError(details.error ?? 'Fehler beim Laden'); return; }

        const createRes = await fetch('/api/admin/things-to-see', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ hotelId, placeId, ...details }),
        });
        const newItem = await createRes.json();
        setItems((prev) => [...prev, newItem]);
      } catch { setError('Fehler beim Importieren'); }
    });
  }

  async function toggleActive(id: number, isActive: boolean) {
    await fetch(`/api/admin/things-to-see/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive }),
    });
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, isActive } : i));
  }

  async function execDelete() {
    if (confirmId === null) return;
    await fetch(`/api/admin/things-to-see/${confirmId}`, { method: 'DELETE' });
    setItems((prev) => prev.filter((i) => i.id !== confirmId));
    setConfirmId(null);
  }

  async function addManual() {
    if (!manualData.title.trim()) return;
    setError('');
    startTransition(async () => {
      try {
        const res = await fetch('/api/admin/things-to-see', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ hotelId, ...manualData, apartmentId: manualData.apartmentId ? Number(manualData.apartmentId) : null }),
        });
        const newItem = await res.json();
        setItems((prev) => [...prev, newItem]);
        setManualData({ category: 'event', title: '', description: '', address: '', mapsUrl: '', apartmentId: '' });
        setShowManualForm(false);
      } catch { setError('Fehler beim Speichern'); }
    });
  }

  async function saveEdit() {
    if (!editId) return;
    const res = await fetch(`/api/admin/things-to-see/${editId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editData),
    });
    const updated = await res.json();
    setItems((prev) => prev.map((i) => i.id === editId ? { ...i, ...updated } : i));
    setEditId(null);
    setEditData({});
  }

  const filtered = filterCat === 'all' ? items : items.filter((i) => i.category === filterCat);

  const inp: React.CSSProperties = { width: '100%', padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box' };
  const btn: React.CSSProperties = { padding: '7px 14px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' };

  return (
    <div style={{ display: 'grid', gap: 24 }}>

      {/* Search */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 20 }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>Ort suchen & importieren</div>
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <input
            style={{ ...inp, paddingLeft: 36 }}
            placeholder="z. B. Pizzeria Napoli, Innsbruck …"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>🔍</span>
          {(suggestions.length > 0 || loadingSuggestions) && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.1)', zIndex: 100, marginTop: 4, overflow: 'hidden' }}>
              {loadingSuggestions && <div style={{ padding: '12px 14px', fontSize: 13, color: 'var(--text-disabled)' }}>Suche …</div>}
              {suggestions.map((s) => (
                <button
                  key={s.placeId}
                  onClick={() => importPlace(s.placeId)}
                  disabled={isPending}
                  style={{ width: '100%', padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', borderBottom: '1px solid var(--border)', fontFamily: 'inherit' }}
                >
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{s.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{s.subtitle}</div>
                </button>
              ))}
            </div>
          )}
        </div>
        {error && <p style={{ fontSize: 13, color: 'var(--status-cancelled-text)', marginTop: 8 }}>{error}</p>}
        <p style={{ fontSize: 12, color: 'var(--text-disabled)', marginTop: 8 }}>
          Wählen Sie einen Eintrag aus den Vorschlägen — Name, Adresse und Kategorie werden automatisch übernommen.
        </p>
        <div style={{ borderTop: '1px solid var(--border)', marginTop: 12, paddingTop: 12 }}>
          {!showManualForm ? (
            <button style={{ ...btn, background: 'var(--surface-2)', color: 'var(--text-muted)', fontSize: 13 }} onClick={() => setShowManualForm(true)}>
              + Manuell hinzufügen
            </button>
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-muted)' }}>Manuell hinzufügen</div>
              <div className="two-col-grid" style={{ gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Titel *</label>
                  <input style={inp} value={manualData.title} onChange={(e) => setManualData((d) => ({ ...d, title: e.target.value }))} placeholder="z. B. Wochenmarkt Seefeld" />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Kategorie</label>
                  <select style={inp} value={manualData.category} onChange={(e) => setManualData((d) => ({ ...d, category: e.target.value }))}>
                    {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Beschreibung</label>
                <textarea style={{ ...inp, resize: 'vertical' }} rows={2} value={manualData.description} onChange={(e) => setManualData((d) => ({ ...d, description: e.target.value }))} placeholder="z. B. Jeden Dienstag 8–13 Uhr, frische Produkte aus der Region." />
              </div>
              <div className="two-col-grid" style={{ gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Adresse</label>
                  <input style={inp} value={manualData.address} onChange={(e) => setManualData((d) => ({ ...d, address: e.target.value }))} placeholder="z. B. Dorfplatz Seefeld" />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Maps-Link</label>
                  <input style={inp} value={manualData.mapsUrl} onChange={(e) => setManualData((d) => ({ ...d, mapsUrl: e.target.value }))} placeholder="https://maps.google.com/…" />
                </div>
              </div>
              {apartments.length > 1 && (
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Wohnung (optional)</label>
                  <select style={inp} value={manualData.apartmentId} onChange={(e) => setManualData((d) => ({ ...d, apartmentId: e.target.value }))}>
                    <option value="">Alle Wohnungen</option>
                    {apartments.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button className="btn-shine" style={{ ...btn, background: 'var(--surface-2)', color: 'var(--text-muted)' }} onClick={() => setShowManualForm(false)}>Abbrechen</button>
                <button className="btn-shine" style={{ ...btn, background: 'var(--accent)', color: 'var(--text-on-accent)' }} onClick={addManual} disabled={isPending || !manualData.title.trim()}>Hinzufügen</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filter */}
      {items.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={() => setFilterCat('all')} style={{ ...btn, background: filterCat === 'all' ? 'var(--accent)' : 'var(--surface-2)', color: filterCat === 'all' ? 'var(--text-on-accent)' : 'var(--text-muted)' }}>
            Alle ({items.length})
          </button>
          {CATEGORIES.filter((c) => items.some((i) => i.category === c.value)).map((c) => (
            <button key={c.value} onClick={() => setFilterCat(c.value)} style={{ ...btn, background: filterCat === c.value ? 'var(--accent)' : 'var(--surface-2)', color: filterCat === c.value ? 'var(--text-on-accent)' : 'var(--text-muted)' }}>
              {c.icon} {c.label} ({items.filter((i) => i.category === c.value).length})
            </button>
          ))}
        </div>
      )}

      {/* List */}
      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-disabled)', fontSize: 14 }}>
          {items.length === 0 ? 'Noch keine Einträge — oben suchen und importieren.' : 'Keine Einträge in dieser Kategorie.'}
        </div>
      )}

      {filtered.map((item) => (
        <div key={item.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', opacity: item.isActive ? 1 : 0.5 }}>
          {editId === item.id ? (
            <div style={{ padding: 20, display: 'grid', gap: 12 }}>
              <div className="two-col-grid" style={{ gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Titel</label>
                  <input style={inp} value={editData.title ?? item.title} onChange={(e) => setEditData((d) => ({ ...d, title: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Kategorie</label>
                  <select style={inp} value={editData.category ?? item.category} onChange={(e) => setEditData((d) => ({ ...d, category: e.target.value }))}>
                    {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Beschreibung</label>
                <textarea style={{ ...inp, resize: 'vertical' }} rows={2} value={editData.description ?? item.description ?? ''} onChange={(e) => setEditData((d) => ({ ...d, description: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Adresse</label>
                <input style={inp} value={editData.address ?? item.address ?? ''} onChange={(e) => setEditData((d) => ({ ...d, address: e.target.value }))} />
              </div>
              {apartments.length > 1 && (
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Wohnung (optional)</label>
                  <select
                    style={inp}
                    value={editData.apartmentId !== undefined ? (editData.apartmentId ?? '') : (item.apartmentId ?? '')}
                    onChange={(e) => setEditData((d) => ({ ...d, apartmentId: e.target.value ? Number(e.target.value) : null }))}
                  >
                    <option value="">Alle Wohnungen</option>
                    {apartments.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button className="btn-shine" style={{ ...btn, background: 'var(--surface-2)', color: 'var(--text-muted)' }} onClick={() => { setEditId(null); setEditData({}); }}>Abbrechen</button>
                <button className="btn-shine" style={{ ...btn, background: 'var(--accent)', color: 'var(--text-on-accent)' }} onClick={saveEdit}>Speichern</button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 0 }}>
              {item.imageUrl && (
                <img src={item.imageUrl} alt={item.title} style={{ width: 100, height: 90, objectFit: 'cover', flexShrink: 0 }} />
              )}
              <div style={{ flex: 1, padding: '12px 16px', minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {catIcon(item.category)} {item.title}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-disabled)', marginTop: 2 }}>{catLabel(item.category)}</div>
                    {item.address && <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.address}</div>}
                    {item.description && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.description}</div>}
                    {item.apartmentId && apartments.length > 1 && (
                      <div style={{ marginTop: 5 }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', background: 'var(--surface-2)', borderRadius: 6, padding: '2px 7px' }}>
                          {apartments.find((a) => a.id === item.apartmentId)?.name ?? 'Wohnung'}
                        </span>
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button aria-label="Eintrag bearbeiten" style={{ ...btn, background: 'var(--surface-2)', color: 'var(--text-muted)', padding: '5px 10px' }} onClick={() => { setEditId(item.id); setEditData({}); }}>✏️</button>
                    <button aria-label={item.isActive ? 'Eintrag deaktivieren' : 'Eintrag aktivieren'} style={{ ...btn, background: item.isActive ? 'var(--status-booked-bg)' : 'var(--surface-2)', color: item.isActive ? 'var(--status-booked-text)' : 'var(--text-muted)', padding: '5px 10px' }} onClick={() => toggleActive(item.id, !item.isActive)}>
                      {item.isActive ? 'Aktiv' : 'Inaktiv'}
                    </button>
                    <button aria-label="Eintrag löschen" style={{ ...btn, background: 'var(--status-cancelled-bg)', color: 'var(--status-cancelled-text)', padding: '5px 10px' }} onClick={() => setConfirmId(item.id)}>🗑️</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      <ConfirmDialog
        isOpen={confirmId !== null}
        onClose={() => setConfirmId(null)}
        onConfirm={execDelete}
        title="Eintrag löschen"
        description="Diesen Eintrag wirklich löschen?"
        confirmLabel="Löschen"
        dangerous
      />
    </div>
  );
}
