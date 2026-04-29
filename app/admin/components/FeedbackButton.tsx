'use client';

import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const pathname = usePathname();

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    await fetch('/api/admin/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, page: pathname }),
    });
    setSending(false);
    setSent(true);
    setMessage('');
    setTimeout(() => { setSent(false); setOpen(false); }, 2000);
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed',
          top: 16,
          right: 20,
          zIndex: 900,
          padding: '7px 14px',
          background: 'var(--accent)',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}
      >
        Feedback geben
      </button>

      {/* Backdrop + Modal */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(15,23,42,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: 16,
              padding: '28px 28px 24px',
              width: '100%',
              maxWidth: 420,
              boxShadow: '0 20px 60px rgba(15,23,42,0.18)',
              display: 'grid',
              gap: 16,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#111' }}>Feedback geben</h2>
              <button
                onClick={() => setOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#9ca3af', lineHeight: 1 }}
              >
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
                    placeholder="Was hast du erwartet?"
                    rows={5}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: 8,
                      fontSize: 14,
                      resize: 'vertical',
                      outline: 'none',
                      lineHeight: 1.6,
                      boxSizing: 'border-box',
                      color: '#111',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending || !message.trim()}
                  style={{
                    padding: '11px',
                    background: sending || !message.trim() ? '#9ca3af' : 'var(--accent)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: sending || !message.trim() ? 'not-allowed' : 'pointer',
                  }}
                >
                  {sending ? 'Wird gesendet…' : 'Feedback senden'}
                </button>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  style={{
                    padding: '10px',
                    background: 'none',
                    border: '1px solid #e5e7eb',
                    borderRadius: 8,
                    fontSize: 14,
                    color: '#374151',
                    cursor: 'pointer',
                  }}
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
