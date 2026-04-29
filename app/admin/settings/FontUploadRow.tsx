'use client';

import { useRef, useState } from 'react';

type Props = {
  field: 'headline' | 'body';
  initialUrl: string | null;
};

function fileName(url: string | null) {
  if (!url) return null;
  const part = url.split('/').pop() ?? '';
  // strip timestamp prefix: "headline-1234567890.woff2" → "headline-…woff2"
  return part.replace(/^(headline|body)-\d+\./, '$1.');
}

export default function FontUploadRow({ field, initialUrl }: Props) {
  const [url, setUrl] = useState<string | null>(initialUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function sendToPreview(fontUrl: string | null) {
    const iframe = document.querySelector('iframe.settings-preview-iframe') as HTMLIFrameElement | null;
    const urlKey = field === 'headline' ? 'headlineFontUrl' : 'bodyFontUrl';
    const googleKey = field === 'headline' ? 'headlineFont' : 'bodyFont';
    const settings: Record<string, string | null> = { [urlKey]: fontUrl };
    if (!fontUrl) {
      const el = document.querySelector<HTMLSelectElement>(`[name="${googleKey}"]`);
      settings[googleKey] = el?.value || 'Inter';
    }
    iframe?.contentWindow?.postMessage({ type: 'booking-widget-preview-settings', settings }, '*');
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setLoading(true);
    setError(null);
    const form = new FormData();
    form.append('file', file);
    form.append('field', field);
    const res = await fetch('/api/admin/font-upload', { method: 'POST', body: form });
    if (res.ok) {
      const data = await res.json();
      setUrl(data.url);
      sendToPreview(data.url);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error === 'too_large' ? 'Datei zu groß (max. 5 MB)' : 'Upload fehlgeschlagen');
    }
    setLoading(false);
  }

  async function handleDelete() {
    setLoading(true);
    setError(null);
    const res = await fetch('/api/admin/font-upload', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ field }),
    });
    if (res.ok) {
      setUrl(null);
      sendToPreview(null);
    }
    setLoading(false);
  }

  const label = field === 'headline' ? 'Eigene Schrift (Headline)' : 'Eigene Schrift (Fließtext)';

  return (
    <div className="settings-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '10px 0', flexWrap: 'wrap' }}>
      <span style={{ fontSize: 14, fontWeight: 500, color: '#374151' }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {url ? (
          <>
            <span style={{ fontSize: 12, color: '#6b7280', fontFamily: 'monospace', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {fileName(url)}
            </span>
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              title="Font entfernen"
              style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: 6, padding: '4px 8px', fontSize: 12, color: '#9ca3af', cursor: loading ? 'default' : 'pointer' }}
            >
              {loading ? '…' : '× Entfernen'}
            </button>
          </>
        ) : (
          <>
            <input ref={fileRef} type="file" accept=".woff,.woff2,.ttf,.otf" onChange={handleFile} style={{ display: 'none' }} />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={loading}
              style={{ border: '1px solid #d1d5db', borderRadius: 6, padding: '6px 12px', fontSize: 13, color: '#374151', background: '#f9fafb', cursor: loading ? 'default' : 'pointer' }}
            >
              {loading ? 'Wird hochgeladen…' : '+ Font hochladen'}
            </button>
            <span style={{ fontSize: 11, color: '#9ca3af' }}>woff, woff2, ttf, otf · max. 5 MB</span>
          </>
        )}
        {error && <span style={{ fontSize: 12, color: '#dc2626' }}>{error}</span>}
      </div>
    </div>
  );
}
