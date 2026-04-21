'use client';

import { useState } from 'react';
import { upload } from '@vercel/blob/client';
import { createExtra } from './actions';

const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 700, color: '#4b5563', letterSpacing: '0.05em', textTransform: 'uppercase' };
const inputStyle: React.CSSProperties = { width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, background: '#fff', color: '#111' };

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
      const blob = await upload(file.name, file, { access: 'public', handleUploadUrl: '/api/upload' });
      setImageUrl(blob.url);
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
          <label style={labelStyle}>Name *</label>
          <input name="name" required placeholder="z. B. Frühstück" style={inputStyle} />
        </div>

        <div style={{ display: 'grid', gap: 6 }}>
          <label style={labelStyle}>Typ</label>
          <select name="type" style={inputStyle}>
            <option value="extra">Zusatzleistung</option>
            <option value="insurance">Versicherung</option>
          </select>
        </div>

        <div style={{ display: 'grid', gap: 6 }}>
          <label style={labelStyle}>Abrechnung *</label>
          <select name="billingType" required style={inputStyle}>
            <option value="per_stay">pro Aufenthalt</option>
            <option value="per_night">pro Nacht</option>
            <option value="per_person_per_night">pro Person / Nacht</option>
            <option value="per_person_per_stay">pro Person / Aufenthalt</option>
          </select>
        </div>

        <div style={{ display: 'grid', gap: 6 }}>
          <label style={labelStyle}>Preis (€) *</label>
          <input name="price" type="number" min="0" step="0.01" required placeholder="0.00" style={inputStyle} />
        </div>

        <div style={{ display: 'grid', gap: 6 }}>
          <label style={labelStyle}>Nr.</label>
          <input name="sortOrder" type="number" min="0" defaultValue={0} style={inputStyle} />
        </div>
      </div>

      <div style={{ display: 'grid', gap: 6 }}>
        <label style={labelStyle}>Beschreibung <span style={{ fontWeight: 400, textTransform: 'none', fontSize: 11, color: '#9ca3af' }}>(optional)</span></label>
        <input name="description" placeholder="Kurze Beschreibung für das Widget" style={inputStyle} />
      </div>

      <div style={{ display: 'grid', gap: 6 }}>
        <label style={labelStyle}>Bild <span style={{ fontWeight: 400, textTransform: 'none', fontSize: 11, color: '#9ca3af' }}>(optional)</span></label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {imageUrl && (
            <div style={{ position: 'relative' }}>
              <img src={imageUrl} alt="" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, border: '1px solid #e5e7eb', display: 'block' }} />
              <button type="button" onClick={() => setImageUrl('')} style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: '#374151', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            </div>
          )}
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', color: '#374151', fontSize: 13, cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.6 : 1 }}>
            {uploading ? 'Lädt hoch…' : imageUrl ? 'Anderes Bild' : 'Bild hochladen'}
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} disabled={uploading} style={{ display: 'none' }} />
          </label>
          {uploadError && <span style={{ fontSize: 12, color: '#dc2626' }}>{uploadError}</span>}
        </div>
      </div>

      <div style={{ display: 'grid', gap: 6 }}>
        <label style={labelStyle}>Link-URL <span style={{ fontWeight: 400, textTransform: 'none', fontSize: 11, color: '#9ca3af' }}>(optional)</span></label>
        <input name="linkUrl" type="url" placeholder="https://..." style={inputStyle} />
      </div>

      <div>
        <button type="submit" style={{ padding: '11px 20px', borderRadius: 8, background: 'var(--accent)', color: '#fff', border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          Anlegen
        </button>
      </div>
    </form>
  );
}
