'use client';

import { useState } from 'react';
import { createExtra } from './actions';
import { Button } from '../components/ui';

const chevron = (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const labelSt: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  color: 'var(--text-secondary)',
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
};

export default function CreateExtraForm({ hotelId }: { hotelId: number }) {
  const [imageUrl, setImageUrl] = useState('');
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

  return (
    <form action={createExtra} style={{ display: 'grid', gap: 16 }}>
      <input type="hidden" name="hotelId" value={hotelId} />
      <input type="hidden" name="imageUrl" value={imageUrl} />

      <div className="extras-form-grid">
        <div style={{ display: 'grid', gap: 6 }}>
          <label style={labelSt}>Name *</label>
          <input name="name" required placeholder="z. B. Frühstück" className="ui-input" />
        </div>

        <div style={{ display: 'grid', gap: 6 }}>
          <label style={labelSt}>Typ</label>
          <div className="ui-select-wrapper">
            <select name="type" className="ui-select-control">
              <option value="extra">Zusatzleistung</option>
              <option value="insurance">Versicherung</option>
            </select>
            <span className="ui-select-chevron">{chevron}</span>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 6 }}>
          <label style={labelSt}>Abrechnung *</label>
          <div className="ui-select-wrapper">
            <select name="billingType" required className="ui-select-control">
              <option value="per_stay">pro Aufenthalt</option>
              <option value="per_night">pro Nacht</option>
              <option value="per_person_per_night">pro Person / Nacht</option>
              <option value="per_person_per_stay">pro Person / Aufenthalt</option>
            </select>
            <span className="ui-select-chevron">{chevron}</span>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 6 }}>
          <label style={labelSt}>Preis (€) *</label>
          <input name="price" type="number" min="0" step="0.01" required placeholder="0.00" className="ui-input" />
        </div>

        <div style={{ display: 'grid', gap: 6 }}>
          <label style={labelSt}>Nr.</label>
          <input name="sortOrder" type="number" min="0" defaultValue={0} className="ui-input" />
        </div>
      </div>

      <div style={{ display: 'grid', gap: 6 }}>
        <label style={labelSt}>
          Beschreibung{' '}
          <span style={{ fontWeight: 400, textTransform: 'none', fontSize: 11, color: 'var(--text-disabled)' }}>(optional)</span>
        </label>
        <input name="description" placeholder="Kurze Beschreibung für das Widget" className="ui-input" />
      </div>

      <div style={{ display: 'grid', gap: 6 }}>
        <label style={labelSt}>
          Bild{' '}
          <span style={{ fontWeight: 400, textTransform: 'none', fontSize: 11, color: 'var(--text-disabled)' }}>(optional)</span>
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {imageUrl && (
            <div style={{ position: 'relative' }}>
              <img src={imageUrl} alt="" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)', display: 'block' }} />
              <button
                type="button"
                onClick={() => setImageUrl('')}
                style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: 'var(--primitive-gray-700)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ×
              </button>
            </div>
          )}
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-secondary)', fontSize: 13, cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.6 : 1 }}>
            {uploading ? 'Lädt hoch…' : imageUrl ? 'Anderes Bild' : 'Bild hochladen'}
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} disabled={uploading} style={{ display: 'none' }} />
          </label>
          {uploadError && <span style={{ fontSize: 12, color: 'var(--danger)' }}>{uploadError}</span>}
        </div>
      </div>

      <div style={{ display: 'grid', gap: 6 }}>
        <label style={labelSt}>
          Link-URL{' '}
          <span style={{ fontWeight: 400, textTransform: 'none', fontSize: 11, color: 'var(--text-disabled)' }}>(optional)</span>
        </label>
        <input name="linkUrl" type="url" placeholder="https://..." className="ui-input" />
      </div>

      <div style={{ display: 'grid', gap: 6 }}>
        <label style={labelSt}>
          Varianten-Gruppe{' '}
          <span style={{ fontWeight: 400, textTransform: 'none', fontSize: 11, color: 'var(--text-disabled)' }}>(optional)</span>
        </label>
        <input name="exclusiveGroup" placeholder="z. B. hotelstorno" className="ui-input" />
        <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          Wenn mehrere Extras den gleichen Gruppen-Namen haben, kann der Gast nur <strong>eine davon</strong> buchen — z. B. „Hotelstorno Plus" und „Hotelstorno Premium" beide mit dem Wert <em>hotelstorno</em>.
        </p>
      </div>

      <div className="admin-form-actions">
        <Button type="submit" variant="primary">Anlegen</Button>
      </div>
    </form>
  );
}
