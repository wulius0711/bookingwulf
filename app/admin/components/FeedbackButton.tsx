'use client';

import { usePathname } from 'next/navigation';
import { useRef, useState } from 'react';
import { Megaphone } from 'lucide-react';

function compressImage(file: File, maxWidth = 1280, quality = 0.8): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement('canvas');
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.src = url;
  });
}

export default function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();

  function handleClose() {
    setOpen(false);
    setMessage('');
    setScreenshot(null);
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImage(file);
    setScreenshot(compressed);
    e.target.value = '';
  }

  async function handlePaste(e: React.ClipboardEvent) {
    const item = Array.from(e.clipboardData.items).find((i) => i.type.startsWith('image/'));
    if (!item) return;
    const file = item.getAsFile();
    if (!file) return;
    e.preventDefault();
    const compressed = await compressImage(file);
    setScreenshot(compressed);
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    await fetch('/api/admin/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, page: pathname, screenshot }),
    });
    setSending(false);
    setSent(true);
    setMessage('');
    setScreenshot(null);
    setTimeout(() => { setSent(false); setOpen(false); }, 2000);
  }

  const btnBase: React.CSSProperties = {
    padding: '10px', borderRadius: 8, fontSize: 14,
    cursor: 'pointer', width: '100%',
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Feedback geben"
        style={{
          position: 'fixed', top: 14, right: 18, zIndex: 900,
          width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'transparent', border: '1px solid #e5e7eb', borderRadius: 8,
          cursor: 'pointer', color: '#9ca3af',
        }}
      >
        <Megaphone size={16} />
      </button>

      {open && (
        <div
          onClick={handleClose}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(15,23,42,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: 16, padding: '28px 28px 24px',
              width: '100%', maxWidth: 420,
              boxShadow: '0 20px 60px rgba(15,23,42,0.18)', display: 'grid', gap: 16,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#111' }}>Feedback geben</h2>
              <button onClick={handleClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#9ca3af', lineHeight: 1 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {sent ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#16a34a', fontSize: 15, fontWeight: 600 }}>
                ✓ Danke für dein Feedback!
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 14 }}>
                <div style={{ display: 'grid', gap: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
                    Beschreibung <span style={{ color: '#9ca3af', fontWeight: 400 }}>(erforderlich)</span>
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onPaste={handlePaste}
                    placeholder="Was hast du erwartet?"
                    rows={4}
                    required
                    style={{
                      width: '100%', padding: '10px 12px', border: '1px solid #d1d5db',
                      borderRadius: 8, fontSize: 14, resize: 'vertical', outline: 'none',
                      lineHeight: 1.6, boxSizing: 'border-box', color: '#111',
                    }}
                  />
                </div>

                {/* Screenshot upload */}
                <div style={{ display: 'grid', gap: 8 }}>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFile}
                    style={{ display: 'none' }}
                  />
                  {screenshot ? (
                    <div style={{ position: 'relative' }}>
                      <img
                        src={screenshot}
                        alt="Screenshot"
                        style={{ width: '100%', borderRadius: 8, border: '1px solid #e5e7eb', display: 'block', maxHeight: 160, objectFit: 'cover' }}
                      />
                      <button
                        type="button"
                        onClick={() => setScreenshot(null)}
                        style={{
                          position: 'absolute', top: 6, right: 6,
                          background: 'rgba(0,0,0,0.55)', border: 'none', borderRadius: 99,
                          width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', color: '#fff',
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      style={{
                        ...btnBase,
                        border: '1px dashed #d1d5db', background: '#f9fafb',
                        color: '#6b7280', fontWeight: 500,
                      }}
                    >
                      + Screenshot hinzufügen
                      <span style={{ display: 'block', fontSize: 11, color: '#9ca3af', fontWeight: 400, marginTop: 2 }}>
                        oder Bild aus Zwischenablage einfügen (Strg+V / ⌘V)
                      </span>
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={sending || !message.trim()}
                  style={{
                    ...btnBase, padding: '11px',
                    background: sending || !message.trim() ? '#9ca3af' : 'var(--accent)',
                    color: '#fff', border: 'none', fontWeight: 600,
                    cursor: sending || !message.trim() ? 'not-allowed' : 'pointer',
                  }}
                >
                  {sending ? 'Wird gesendet…' : 'Feedback senden'}
                </button>

                <button
                  type="button"
                  onClick={handleClose}
                  style={{ ...btnBase, background: 'none', border: '1px solid #e5e7eb', color: '#374151' }}
                >
                  Abbrechen
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
