'use client';

import { useState, useRef, useEffect } from 'react';

type ChatMessage = { role: 'user' | 'assistant'; text: string };

const STORAGE_KEY = 'bw_chat_messages';

export default function AdminChatWidget({ accentColor = '#111' }: { accentColor?: string }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [planError, setPlanError] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setMessages(JSON.parse(stored));
    } catch {}
  }, []);

  // Persist to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {}
  }, [messages]);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  function clearChat() {
    setMessages([]);
    setPlanError(false);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }

  async function send() {
    const q = input.trim();
    if (!q || loading) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: q }]);
    setLoading(true);
    try {
      const res = await fetch('/api/admin/help-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, page: window.location.pathname }),
      });
      const data = await res.json();
      if (res.status === 403 && data.error === 'plan_required') {
        setPlanError(true);
        setMessages((prev) => prev.slice(0, -1));
        return;
      }
      if (!res.ok) {
        const msg = res.status === 429
          ? 'Der Assistent ist gerade überlastet. Bitte versuche es in einer Minute erneut.'
          : 'Ein Fehler ist aufgetreten. Bitte versuche es erneut oder wende dich an support@bookingwulf.com.';
        setMessages((prev) => [...prev, { role: 'assistant', text: msg }]);
        return;
      }
      const answer = data.answer ?? 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.';
      setMessages((prev) => [...prev, { role: 'assistant', text: answer }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', text: 'Verbindungsfehler. Bitte versuche es erneut.' }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Assistent öffnen"
        title={`color: ${accentColor}`}
        style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
          width: 52, height: 52, borderRadius: '50%',
          background: accentColor, border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
          transition: 'background 0.15s',
        }}
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M5 5l10 10M15 5L5 15" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 92, right: 28, zIndex: 9998,
          width: 360, maxWidth: 'calc(100vw - 56px)',
          background: '#fff', borderRadius: 16,
          boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
          border: '1px solid #e5e7eb',
          display: 'flex', flexDirection: 'column',
          maxHeight: '60vh',
        }}>
          {/* Header */}
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: accentColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>bookingwulf Assistent</div>
              <div style={{ fontSize: 11, color: '#6b7280' }}>Fragen zur Bedienung</div>
            </div>
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                title="Verlauf löschen"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#9ca3af', display: 'flex', alignItems: 'center' }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                </svg>
              </button>
            )}
          </div>

          {/* Plan gate */}
          {planError ? (
            <div style={{ padding: 20, textAlign: 'center' }}>
              <div style={{ fontSize: 13, color: '#374151', marginBottom: 12 }}>
                Der Assistent ist ab dem <strong>Pro-Plan</strong> verfügbar.
              </div>
              <a href="/admin/billing" style={{ fontSize: 13, fontWeight: 600, color: '#111', textDecoration: 'underline' }}>
                Jetzt upgraden →
              </a>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {messages.length === 0 && (
                  <div style={{ fontSize: 13, color: '#6b7280', textAlign: 'center', marginTop: 8 }}>
                    Wie kann ich helfen? Stell mir eine Frage zur Bedienung von bookingwulf.
                  </div>
                )}
                {messages.map((m, i) => (
                  <div key={i} style={{
                    alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    background: m.role === 'user' ? accentColor : '#f3f4f6',
                    color: m.role === 'user' ? '#fff' : '#111',
                    borderRadius: m.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                    padding: '8px 12px',
                    fontSize: 13,
                    lineHeight: 1.55,
                    whiteSpace: 'pre-wrap',
                  }}>
                    {m.text}
                  </div>
                ))}
                {loading && (
                  <div style={{ alignSelf: 'flex-start', background: '#f3f4f6', borderRadius: '12px 12px 12px 2px', padding: '8px 14px', fontSize: 20, color: '#9ca3af', letterSpacing: 2 }}>
                    ···
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div style={{ padding: '10px 12px', borderTop: '1px solid #f3f4f6', display: 'flex', gap: 8 }}>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                  placeholder="Frage stellen …"
                  disabled={loading}
                  style={{
                    flex: 1, border: '1px solid #e5e7eb', borderRadius: 8,
                    padding: '8px 12px', fontSize: 13, outline: 'none',
                    background: loading ? '#f9fafb' : '#fff',
                  }}
                />
                <button
                  onClick={send}
                  disabled={loading || !input.trim()}
                  style={{
                    padding: '8px 14px', borderRadius: 8, border: 'none',
                    background: loading || !input.trim() ? '#e5e7eb' : accentColor,
                    color: loading || !input.trim() ? '#9ca3af' : '#fff',
                    fontSize: 13, fontWeight: 600, cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                    transition: 'background 0.15s',
                  }}
                >
                  ↑
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
