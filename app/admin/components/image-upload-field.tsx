'use client';

import { useState } from 'react';
import { upload } from '@vercel/blob/client';

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #d1d5db',
  borderRadius: 6,
  fontSize: 14,
  color: '#111',
  background: '#fff',
};

export function ImageUploadField({
  index,
  defaultUrl = '',
  defaultAlt = '',
}: {
  index: number;
  defaultUrl?: string;
  defaultAlt?: string;
}) {
  const [url, setUrl] = useState(defaultUrl);
  const [alt, setAlt] = useState(defaultAlt);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');
    try {
      const blob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
      });
      setUrl(blob.url);
    } catch {
      setError('Upload fehlgeschlagen. Bitte nochmal versuchen.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div
      style={{
        border: '1px solid #eee',
        borderRadius: 8,
        padding: 12,
        display: 'grid',
        gap: 10,
      }}
    >
      {/* Hidden inputs submitted with the form */}
      <input type="hidden" name="imageUrl" value={url} />

      {url && (
        <div style={{ position: 'relative', width: 'fit-content' }}>
          <img
            src={url}
            alt={alt || `Bild ${index + 1}`}
            style={{
              width: 220,
              height: 140,
              objectFit: 'cover',
              borderRadius: 8,
              border: '1px solid #eee',
              display: 'block',
            }}
          />
          <button
            type="button"
            onClick={() => setUrl('')}
            style={{
              position: 'absolute',
              top: 6,
              right: 6,
              width: 24,
              height: 24,
              borderRadius: 999,
              background: 'rgba(0,0,0,0.6)',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              fontSize: 14,
              lineHeight: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ×
          </button>
        </div>
      )}

      <div>
        <label
          style={{
            display: 'inline-block',
            padding: '8px 14px',
            borderRadius: 999,
            border: '1px solid #d1d5db',
            background: '#fff',
            color: '#374151',
            fontSize: 13,
            cursor: uploading ? 'not-allowed' : 'pointer',
            opacity: uploading ? 0.6 : 1,
          }}
        >
          {uploading ? 'Lädt hoch…' : url ? 'Anderes Bild wählen' : 'Bild hochladen'}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFile}
            disabled={uploading}
            style={{ display: 'none' }}
          />
        </label>

        {error && (
          <span style={{ marginLeft: 10, fontSize: 12, color: '#dc2626' }}>{error}</span>
        )}
      </div>

      <input
        placeholder={`URL ${index + 1} (oder oben Datei wählen)`}
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        style={inputStyle}
      />

      <input
        name="altText"
        placeholder={`Alt Text ${index + 1}`}
        value={alt}
        onChange={(e) => setAlt(e.target.value)}
        style={inputStyle}
      />
    </div>
  );
}
