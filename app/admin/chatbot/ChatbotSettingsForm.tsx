'use client';

import { useRef, useState } from 'react';
import { saveChatbotSettings } from './actions';
import SaveButton from '../components/SaveButton';

const DEFAULT_AVATAR = (
  `<svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">` +
  `<circle cx="18" cy="14" r="7" fill="rgba(255,255,255,0.9)"/>` +
  `<path d="M6 32c0-6.627 5.373-12 12-12s12 5.373 12 12" fill="rgba(255,255,255,0.9)"/>` +
  `</svg>`
);

export default function ChatbotSettingsForm({
  initialEnabled,
  initialName,
  initialColor,
  initialAvatar,
}: {
  initialEnabled: boolean;
  initialName: string;
  initialColor: string;
  initialAvatar: string | null;
}) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatar);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/admin/chatbot-avatar', { method: 'POST', body: fd });
    const data = await res.json() as { url?: string };
    if (data.url) setAvatarUrl(data.url);
    setUploading(false);
  }

  return (
    <form action={saveChatbotSettings}>
      <section className="admin-card" style={{ marginBottom: 24 }}>
        <h2 style={{ margin: '0 0 20px', fontSize: 16 }}>Einstellungen</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

          <input type="hidden" name="chatbotEnabled" value={enabled ? 'on' : 'off'} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 14, fontWeight: 500 }}>Chatbot aktivieren</span>
            <button
              type="button"
              role="switch"
              aria-checked={enabled}
              onClick={() => setEnabled(v => !v)}
              style={{
                width: 44, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer',
                background: enabled ? '#22c55e' : 'rgba(120,120,120,0.3)',
                position: 'relative', transition: 'background 0.2s', flexShrink: 0, padding: 0,
              }}
            >
              <span style={{
                position: 'absolute', top: 3, left: enabled ? 21 : 3,
                width: 20, height: 20, borderRadius: '50%', background: '#fff',
                transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
              }} />
            </button>
          </div>

          <hr style={{ margin: 0, border: 'none', borderTop: '1px solid var(--border)' }} />

          {/* Avatar */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 10 }}>
              Avatar <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>(optional)</span>
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                title="Bild hochladen"
                style={{
                  width: 56, height: 56, borderRadius: '50%', border: '2px solid var(--border)',
                  background: '#4b5563', cursor: 'pointer', overflow: 'hidden',
                  padding: 0, flexShrink: 0, position: 'relative',
                }}
              >
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span dangerouslySetInnerHTML={{ __html: DEFAULT_AVATAR }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }} />
                )}
                {uploading && (
                  <span style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#fff' }}>…</span>
                )}
              </button>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Klick auf den Kreis um ein Bild hochzuladen.<br />
                Empfohlen: quadratisch, min. 100×100 px
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
            </div>
          </div>

          <hr style={{ margin: 0, border: 'none', borderTop: '1px solid var(--border)' }} />

          {/* Name */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
              Name des Assistenten <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>(optional)</span>
            </label>
            <input
              type="text"
              name="chatbotName"
              defaultValue={initialName}
              placeholder="Buchungs-Assistent"
              style={{
                width: '100%', padding: '9px 12px', fontSize: 14,
                border: '1.5px solid var(--border)', borderRadius: 8,
                background: 'var(--surface-1)', color: 'var(--text-primary)', outline: 'none',
              }}
            />
          </div>

          {/* Farbe */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
              Akzentfarbe
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input
                type="color"
                name="chatbotColor"
                defaultValue={initialColor}
                style={{ width: 40, height: 36, padding: 2, border: '1.5px solid var(--border)', borderRadius: 8, cursor: 'pointer' }}
              />
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                Farbe des Chat-Buttons und der Nachrichten-Bubbles
              </span>
            </div>
          </div>

        </div>
      </section>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 32 }}>
        <SaveButton label="Speichern" />
      </div>
    </form>
  );
}
