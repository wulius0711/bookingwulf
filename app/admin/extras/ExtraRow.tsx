'use client';

import { useState } from 'react';

const BILLING_LABELS: Record<string, string> = {
  per_night: 'pro Nacht',
  per_person_per_night: 'pro Person / Nacht',
  per_stay: 'pro Aufenthalt',
  per_person_per_stay: 'pro Person / Aufenthalt',
};

const TYPE_LABELS: Record<string, string> = {
  extra: 'Zusatzleistung',
  insurance: 'Versicherung',
};

type Extra = {
  id: number;
  name: string;
  type: string;
  billingType: string;
  price: number;
  description: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  isActive: boolean;
  sortOrder: number;
};

type Props = {
  extra: Extra;
  updateAction: (formData: FormData) => void;
  toggleAction: (formData: FormData) => void;
  deleteAction: (formData: FormData) => void;
};

const inputStyle: React.CSSProperties = {
  padding: '6px 10px',
  border: '1px solid #d1d5db',
  borderRadius: 6,
  fontSize: 13,
  color: '#111',
  width: '100%',
  boxSizing: 'border-box',
};

export default function ExtraRow({ extra, updateAction, toggleAction, deleteAction }: Props) {
  const [editing, setEditing] = useState(false);
  const [imageUrl, setImageUrl] = useState(extra.imageUrl || '');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload-single', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload fehlgeschlagen.');
      setImageUrl(data.url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload fehlgeschlagen.');
    } finally {
      setUploading(false);
    }
  }

  if (editing) {
    return (
      <tr style={{ borderBottom: '1px solid #f0f0f0', background: '#fafafa' }}>
        <td colSpan={7} style={{ padding: 16 }}>
          <form action={updateAction} style={{ display: 'grid', gap: 12 }}>
            <input type="hidden" name="id" value={extra.id} />

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr 1fr 80px', gap: 10, alignItems: 'end' }}>
              <div style={{ display: 'grid', gap: 4 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Name</label>
                <input name="name" required defaultValue={extra.name} style={inputStyle} />
              </div>
              <div style={{ display: 'grid', gap: 4 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Typ</label>
                <select name="type" defaultValue={extra.type} style={inputStyle}>
                  <option value="extra">Zusatzleistung</option>
                  <option value="insurance">Versicherung</option>
                </select>
              </div>
              <div style={{ display: 'grid', gap: 4 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Abrechnung</label>
                <select name="billingType" defaultValue={extra.billingType} style={inputStyle}>
                  <option value="per_stay">pro Aufenthalt</option>
                  <option value="per_night">pro Nacht</option>
                  <option value="per_person_per_night">pro Person / Nacht</option>
                  <option value="per_person_per_stay">pro Person / Aufenthalt</option>
                </select>
              </div>
              <div style={{ display: 'grid', gap: 4 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Preis</label>
                <input name="price" type="number" min="0" step="0.01" required defaultValue={extra.price} style={inputStyle} />
              </div>
              <div style={{ display: 'grid', gap: 4 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Nr.</label>
                <input name="sortOrder" type="number" min="0" defaultValue={extra.sortOrder} style={inputStyle} />
              </div>
            </div>

            <div style={{ display: 'grid', gap: 4 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Beschreibung</label>
              <input name="description" defaultValue={extra.description || ''} placeholder="Kurze Beschreibung (optional)" style={inputStyle} />
            </div>

            <div style={{ display: 'grid', gap: 4 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Bild <span style={{ fontWeight: 400, textTransform: 'none', fontSize: 10, color: '#9ca3af' }}>(optional)</span></label>
              <input type="hidden" name="imageUrl" value={imageUrl} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                {imageUrl && (
                  <div style={{ position: 'relative' }}>
                    <img src={imageUrl} alt="" style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: 6, border: '1px solid #e5e7eb', display: 'block' }} />
                    <button type="button" onClick={() => setImageUrl('')} style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%', background: '#374151', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                  </div>
                )}
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', color: '#374151', fontSize: 12, cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.6 : 1 }}>
                  {uploading ? 'Lädt…' : imageUrl ? 'Anderes Bild' : 'Hochladen'}
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} disabled={uploading} style={{ display: 'none' }} />
                </label>
                {uploadError && <span style={{ fontSize: 11, color: '#dc2626' }}>{uploadError}</span>}
              </div>
            </div>

            <div style={{ display: 'grid', gap: 4 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Link-URL <span style={{ fontWeight: 400, textTransform: 'none', fontSize: 10, color: '#9ca3af' }}>(optional)</span></label>
              <input name="linkUrl" type="url" defaultValue={extra.linkUrl || ''} placeholder="https://..." style={inputStyle} />
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" style={{ padding: '7px 16px', borderRadius: 8, border: 'none', background: '#111', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                Speichern
              </button>
              <button type="button" onClick={() => setEditing(false)} style={{ padding: '7px 16px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', color: '#111', fontSize: 13, cursor: 'pointer' }}>
                Abbrechen
              </button>
            </div>
          </form>
        </td>
      </tr>
    );
  }

  return (
    <tr style={{ borderBottom: '1px solid #f9fafb' }}>
      <td style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {extra.imageUrl && (
            <img src={extra.imageUrl} alt="" style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
          )}
          <div>
            <div style={{ fontWeight: 500, color: '#111827' }}>{extra.name}</div>
            {extra.description && <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{extra.description}</div>}
          </div>
        </div>
      </td>
      <td style={{ padding: '12px 16px' }}>
        <span style={{
          padding: '2px 8px', borderRadius: 8, fontSize: 11, fontWeight: 600,
          background: extra.type === 'insurance' ? '#fef3c7' : '#f0f9ff',
          color: extra.type === 'insurance' ? '#92400e' : '#0369a1',
        }}>
          {TYPE_LABELS[extra.type] ?? extra.type}
        </span>
      </td>
      <td style={{ padding: '12px 16px', color: '#374151' }}>{BILLING_LABELS[extra.billingType] ?? extra.billingType}</td>
      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#111827' }}>{'\u20AC'} {extra.price.toFixed(2)}</td>
      <td style={{ padding: '12px 16px', color: '#6b7280', fontSize: 12 }}>
        {extra.linkUrl ? (
          <a href={extra.linkUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'none' }}>Link</a>
        ) : '\u2014'}
      </td>
      <td style={{ padding: '12px 16px' }}>
        <span style={{ padding: '3px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: extra.isActive ? '#dcfce7' : '#f3f4f6', color: extra.isActive ? '#16a34a' : '#6b7280' }}>
          {extra.isActive ? 'Aktiv' : 'Inaktiv'}
        </span>
      </td>
      <td style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" onClick={() => setEditing(true)} style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', fontSize: 12, cursor: 'pointer', color: '#374151' }}>
            Bearbeiten
          </button>
          <form action={toggleAction}>
            <input type="hidden" name="id" value={extra.id} />
            <input type="hidden" name="isActive" value={extra.isActive ? 'false' : 'true'} />
            <button type="submit" style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', fontSize: 12, cursor: 'pointer', color: '#374151' }}>
              {extra.isActive ? 'Deaktivieren' : 'Aktivieren'}
            </button>
          </form>
          <form action={deleteAction}>
            <input type="hidden" name="id" value={extra.id} />
            <button type="submit" style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid #fecaca', background: '#fff', fontSize: 12, cursor: 'pointer', color: '#dc2626' }}>
              Löschen
            </button>
          </form>
        </div>
      </td>
    </tr>
  );
}
