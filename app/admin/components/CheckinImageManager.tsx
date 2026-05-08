'use client';

import { useState, useRef, useTransition } from 'react';

type CheckinImage = {
  id: number;
  imageUrl: string;
  caption: string | null;
  sortOrder: number;
};

export default function CheckinImageManager({
  hotelId,
  apartmentId,
  initialImages,
}: {
  hotelId: number;
  apartmentId?: number;
  initialImages: CheckinImage[];
}) {
  const [images, setImages] = useState<CheckinImage[]>(initialImages);
  const [uploading, setUploading] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editCaption, setEditCaption] = useState('');
  const [isPending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const inp: React.CSSProperties = { width: '100%', padding: '8px 11px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box' };
  const btn: React.CSSProperties = { padding: '6px 12px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' };

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const uploadRes = await fetch('/api/upload-single', { method: 'POST', body: fd });
      const { url } = await uploadRes.json();

      const res = await fetch('/api/admin/checkin-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hotelId, apartmentId: apartmentId ?? null, imageUrl: url, sortOrder: images.length }),
      });
      const newImage = await res.json();
      setImages((prev) => [...prev, newImage]);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function deleteImage(id: number) {
    if (!confirm('Bild löschen?')) return;
    await fetch(`/api/admin/checkin-images/${id}`, { method: 'DELETE' });
    setImages((prev) => prev.filter((i) => i.id !== id));
  }

  async function saveCaption(id: number) {
    startTransition(async () => {
      const res = await fetch(`/api/admin/checkin-images/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caption: editCaption }),
      });
      const updated = await res.json();
      setImages((prev) => prev.map((i) => i.id === id ? { ...i, caption: updated.caption } : i));
      setEditId(null);
    });
  }

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {images.length === 0 && (
        <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>Noch keine Bilder — laden Sie Fotos hoch (z. B. Schlüsselkasten, Eingang, Türcode).</p>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
        {images.map((img) => (
          <div key={img.id} style={{ border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden', background: '#fff' }}>
            <div style={{ position: 'relative' }}>
              <img src={img.imageUrl} alt={img.caption ?? ''} style={{ width: '100%', height: 120, objectFit: 'cover', display: 'block' }} />
              <button
                onClick={() => deleteImage(img.id)}
                style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.55)', border: 'none', borderRadius: 6, color: '#fff', fontSize: 12, padding: '3px 7px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: '8px 10px' }}>
              {editId === img.id ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <input
                    style={inp}
                    value={editCaption}
                    onChange={(e) => setEditCaption(e.target.value)}
                    placeholder="Beschreibung…"
                    autoFocus
                  />
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button style={{ ...btn, background: '#f3f4f6', color: '#374151', flex: 1 }} onClick={() => setEditId(null)}>Abbrechen</button>
                    <button style={{ ...btn, background: '#111827', color: '#fff', flex: 1 }} onClick={() => saveCaption(img.id)} disabled={isPending}>OK</button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => { setEditId(img.id); setEditCaption(img.caption ?? ''); }}
                  style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0, fontFamily: 'inherit' }}
                >
                  <span style={{ fontSize: 12, color: img.caption ? '#374151' : '#9ca3af' }}>
                    {img.caption || '+ Beschreibung'}
                  </span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUpload} />
        <button
          style={{ ...btn, background: '#f3f4f6', color: '#374151' }}
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? 'Wird hochgeladen…' : '+ Bild hochladen'}
        </button>
      </div>
    </div>
  );
}
