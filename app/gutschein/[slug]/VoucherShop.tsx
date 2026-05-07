'use client';

import { useState } from 'react';

type Template = {
  id: number;
  name: string;
  type: string;
  value: number;
  price: number;
  description: string | null;
  imageUrl: string | null;
  validDays: number;
};

type Hotel = { slug: string; name: string; accentColor: string };

function eur(n: number) {
  return new Intl.NumberFormat('de-AT', { style: 'currency', currency: 'EUR' }).format(n);
}

function hexLuminance(hex: string): number {
  const c = hex.replace('#', '');
  const r = parseInt(c.slice(0, 2), 16) / 255;
  const g = parseInt(c.slice(2, 4), 16) / 255;
  const b = parseInt(c.slice(4, 6), 16) / 255;
  const lin = (v: number) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

export default function VoucherShop({ hotel, templates }: { hotel: Hotel; templates: Template[] }) {
  const accent = hotel.accentColor;
  const onAccent = hexLuminance(accent) > 0.4 ? '#111827' : '#ffffff';

  const [selected, setSelected] = useState<Template | null>(null);
  const [step, setStep] = useState<'select' | 'form'>('select');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [message, setMessage] = useState('');

  async function handleCheckout() {
    if (!selected) return;
    if (!senderName.trim() || !senderEmail.trim()) {
      setError('Bitte Name und E-Mail angeben.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/vouchers/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hotelSlug: hotel.slug,
          templateId: selected.id,
          senderName: senderName.trim(),
          senderEmail: senderEmail.trim(),
          recipientName: recipientName.trim() || null,
          recipientEmail: recipientEmail.trim() || null,
          message: message.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Fehler beim Starten des Checkouts.');
      if (data.url) window.location.href = data.url;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ein Fehler ist aufgetreten.');
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box', padding: '11px 14px',
    border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 15,
    fontFamily: 'inherit', color: '#111', outline: 'none',
  };
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 };

  return (
    <>
      <style>{`
        .vs-wrap { max-width: 560px; margin: 0 auto; padding: 24px 16px 60px; font-family: ui-sans-serif, system-ui, -apple-system, sans-serif; color: #111827; }
        .vs-card { background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 16px rgba(0,0,0,0.07); }
        .vs-template { background: #fff; border-radius: 14px; border: 2px solid #e5e7eb; cursor: pointer; overflow: hidden; transition: border-color 0.15s, box-shadow 0.15s; }
        .vs-template:hover { border-color: var(--vs-accent-soft); box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
        .vs-template.selected { border-color: var(--vs-accent); box-shadow: 0 4px 20px var(--vs-accent-glow); }
        .vs-btn { display: block; width: 100%; padding: 14px 20px; background: var(--vs-accent); color: var(--vs-on-accent); border: none; border-radius: 12px; font-size: 16px; font-weight: 700; cursor: pointer; font-family: inherit; transition: opacity 0.15s; }
        .vs-btn:hover:not(:disabled) { opacity: 0.9; }
        .vs-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>

      <div
        className="vs-wrap"
        style={{
          '--vs-accent': accent,
          '--vs-on-accent': onAccent,
          '--vs-accent-soft': `${accent}88`,
          '--vs-accent-glow': `${accent}33`,
        } as React.CSSProperties}
      >
        {/* Header */}
        <div style={{ marginBottom: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{hotel.name}</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', color: '#0f172a' }}>Gutschein kaufen</h1>
          <p style={{ marginTop: 6, fontSize: 15, color: '#6b7280' }}>Verschenken Sie ein unvergessliches Erlebnis.</p>
        </div>

        {step === 'select' && (
          <div style={{ display: 'grid', gap: 16 }}>
            {templates.map((t) => (
              <div
                key={t.id}
                className={`vs-template${selected?.id === t.id ? ' selected' : ''}`}
                onClick={() => setSelected(t)}
              >
                {t.imageUrl && (
                  <img src={t.imageUrl} alt={t.name} style={{ width: '100%', height: 140, objectFit: 'cover', display: 'block' }} />
                )}
                <div style={{ padding: '16px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{t.name}</div>
                    {t.description && <div style={{ fontSize: 13, color: '#6b7280', marginTop: 3, lineHeight: 1.4 }}>{t.description}</div>}
                    <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>{t.validDays} Tage gültig</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--vs-accent)' }}>{eur(t.price)}</div>
                    {t.value !== t.price && (
                      <div style={{ fontSize: 12, color: '#9ca3af' }}>Wert: {eur(t.value)}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <button className="vs-btn" disabled={!selected} onClick={() => setStep('form')} style={{ marginTop: 8 }}>
              Weiter →
            </button>
          </div>
        )}

        {step === 'form' && selected && (
          <div style={{ display: 'grid', gap: 20 }}>
            <div style={{ background: 'var(--vs-accent-glow)', border: '1.5px solid var(--vs-accent-soft)', borderRadius: 12, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700 }}>{selected.name}</div>
                <div style={{ fontSize: 13, color: '#6b7280' }}>{eur(selected.price)}</div>
              </div>
              <button onClick={() => setStep('select')} style={{ fontSize: 13, color: 'var(--vs-accent)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                Ändern
              </button>
            </div>

            <div className="vs-card" style={{ padding: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Ihre Angaben</div>
              <div style={{ display: 'grid', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Ihr Name *</label>
                  <input style={inputStyle} value={senderName} onChange={(e) => setSenderName(e.target.value)} placeholder="Max Mustermann" />
                </div>
                <div>
                  <label style={labelStyle}>Ihre E-Mail-Adresse *</label>
                  <input style={inputStyle} type="email" value={senderEmail} onChange={(e) => setSenderEmail(e.target.value)} placeholder="max@beispiel.at" />
                </div>
              </div>
            </div>

            <div className="vs-card" style={{ padding: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Empfänger <span style={{ fontWeight: 400, color: '#9ca3af', fontSize: 13 }}>(optional)</span></div>
              <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16, lineHeight: 1.5 }}>Der Gutschein wird auch an die Empfänger-E-Mail geschickt.</p>
              <div style={{ display: 'grid', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Name des Empfängers</label>
                  <input style={inputStyle} value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="Anna Muster" />
                </div>
                <div>
                  <label style={labelStyle}>E-Mail des Empfängers</label>
                  <input style={inputStyle} type="email" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} placeholder="anna@beispiel.at" />
                </div>
                <div>
                  <label style={labelStyle}>Persönliche Nachricht</label>
                  <textarea style={{ ...inputStyle, resize: 'vertical' }} rows={3} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Alles Gute zum Geburtstag! 🎉" />
                </div>
              </div>
            </div>

            {error && <p style={{ fontSize: 14, color: '#dc2626' }}>{error}</p>}

            <button className="vs-btn" onClick={handleCheckout} disabled={loading}>
              {loading ? 'Weiterleitung …' : `Jetzt bezahlen — ${eur(selected.price)}`}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
