'use client';

import { useState, useEffect, useRef } from 'react';

function useAnimatedValue(target: number, duration = 420) {
  const [display, setDisplay] = useState(target);
  const from = useRef(target);
  const startTime = useRef<number | null>(null);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const start = from.current;
    if (start === target) return;
    startTime.current = null;

    function tick(now: number) {
      if (!startTime.current) startTime.current = now;
      const t = Math.min((now - startTime.current) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out-cubic
      setDisplay(start + (target - start) * eased);
      if (t < 1) {
        raf.current = requestAnimationFrame(tick);
      } else {
        from.current = target;
      }
    }

    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [target, duration]);

  return display;
}

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

  const [cart, setCart] = useState<Map<number, number>>(new Map());
  const [step, setStep] = useState<'select' | 'form'>('select');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [message, setMessage] = useState('');

  function addItem(id: number) {
    setCart(prev => new Map(prev).set(id, (prev.get(id) || 0) + 1));
  }
  function removeItem(id: number) {
    setCart(prev => {
      const next = new Map(prev);
      const qty = (prev.get(id) || 0) - 1;
      if (qty <= 0) next.delete(id);
      else next.set(id, qty);
      return next;
    });
  }

  const cartItems = templates.filter(t => (cart.get(t.id) || 0) > 0);
  const cartTotal = cartItems.reduce((sum, t) => sum + (cart.get(t.id) || 0) * t.price, 0);
  const cartCount = Array.from(cart.values()).reduce((a, b) => a + b, 0);
  const animatedTotal = useAnimatedValue(cartTotal);

  async function handleCheckout() {
    if (cartCount === 0) return;
    if (!senderName.trim() || !senderEmail.trim()) {
      setError('Bitte Name und E-Mail angeben.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const items = cartItems.map(t => ({ templateId: t.id, quantity: cart.get(t.id)! }));
      const res = await fetch('/api/vouchers/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hotelSlug: hotel.slug,
          items,
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
    border: '1.5px solid var(--vs-border)', borderRadius: 10, fontSize: 15,
    fontFamily: 'inherit', color: 'var(--vs-text)', outline: 'none',
  };
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--vs-label)', marginBottom: 6 };

  return (
    <>
      <style>{`
        @keyframes vs-fade-up {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes vs-fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes vs-select-pulse {
          0%   { transform: scale(1); }
          40%  { transform: scale(1.025); box-shadow: 0 6px 28px var(--vs-accent-glow); }
          100% { transform: scale(1); }
        }
        .vs-wrap { max-width: 560px; margin: 0 auto; padding: 24px 16px 60px; font-family: ui-sans-serif, system-ui, -apple-system, sans-serif; color: var(--vs-text); }
        .vs-card { background: var(--vs-bg); border-radius: 16px; overflow: hidden; animation: vs-fade-in 0.35s ease both; }
        .vs-template { background: var(--vs-bg); border-radius: 14px; border: 2px solid var(--vs-border); overflow: hidden; transition: border-color 0.2s, transform 0.2s; animation: vs-fade-up 0.42s ease both; }
        .vs-template:hover { border-color: var(--vs-accent-soft); transform: translateY(-1px); }
        .vs-template.in-cart { border-color: var(--vs-accent); animation: vs-select-pulse 0.35s ease forwards; }
        .vs-qty-btn { width: 28px; height: 28px; border-radius: 50%; border: 1.5px solid var(--vs-accent); background: transparent; color: var(--vs-accent); font-size: 16px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; line-height: 1; transition: background 0.15s, color 0.15s; }
        .vs-qty-btn:hover { background: var(--vs-accent); color: var(--vs-on-accent); }
        .vs-qty-btn.add-first { width: auto; padding: 0 12px; border-radius: 20px; font-size: 13px; background: linear-gradient(to right, var(--vs-accent) 50%, transparent 50%); background-size: 200% 100%; background-position: right center; transition: background-position 0.3s cubic-bezier(0.22, 1, 0.36, 1), color 0.25s; }
        .vs-qty-btn.add-first:hover { background: linear-gradient(to right, var(--vs-accent) 50%, transparent 50%); background-size: 200% 100%; background-position: left center; color: var(--vs-on-accent); }
        .vs-step-form { animation: vs-fade-in 0.38s ease both; }
        .vs-btn { display: block; width: 100%; padding: 14px 20px; position: relative; overflow: hidden; z-index: 1; background: transparent; color: var(--vs-on-accent); border: none; border-radius: 12px; font-size: 16px; font-weight: 700; cursor: pointer; font-family: inherit; transition: transform 0.15s; }
        .vs-btn::after { content: ''; position: absolute; inset: 0; background: var(--vs-accent); border-radius: 12px; z-index: -2; }
        .vs-btn::before { content: ''; position: absolute; bottom: 0; left: 0; width: 0%; height: 100%; background: var(--vs-accent-dark); border-radius: 12px; z-index: -1; transition: width 0.3s ease; }
        .vs-btn:hover:not(:disabled)::before { width: 100%; }
        .vs-btn:active:not(:disabled) { transform: translateY(1px); }
        .vs-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>

      <div
        className="vs-wrap"
        style={{
          '--vs-accent': accent,
          '--vs-accent-dark': 'color-mix(in srgb, var(--vs-accent) 78%, black)',
          '--vs-on-accent': onAccent,
          '--vs-accent-soft': `${accent}88`,
          '--vs-accent-glow': `${accent}33`,
          '--vs-bg': '#ffffff',
          '--vs-surface': '#f9fafb',
          '--vs-border': '#e5e7eb',
          '--vs-border-subtle': '#f3f4f6',
          '--vs-text': '#111827',
          '--vs-label': '#374151',
          '--vs-muted': '#6b7280',
          '--vs-faint': '#9ca3af',
          '--vs-error': '#dc2626',
        } as React.CSSProperties}
      >
        {/* Header */}
        <div style={{ marginBottom: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--vs-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{hotel.name}</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--vs-text)' }}>Gutschein kaufen</h1>
          <p style={{ marginTop: 6, fontSize: 15, color: 'var(--vs-muted)' }}>Verschenken Sie ein unvergessliches Erlebnis.</p>
        </div>

        {step === 'select' && (
          <div style={{ display: 'grid', gap: 16 }}>
            {templates.map((t, i) => {
              const qty = cart.get(t.id) || 0;
              return (
                <div
                  key={t.id}
                  className={`vs-template${qty > 0 ? ' in-cart' : ''}`}
                  style={{ animationDelay: `${i * 0.07}s` }}
                >
                  {t.imageUrl && (
                    <img src={t.imageUrl} alt={t.name} style={{ width: '100%', height: 140, objectFit: 'cover', display: 'block' }} />
                  )}
                  <div style={{ padding: '16px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 16 }}>{t.name}</div>
                      {t.description && <div style={{ fontSize: 13, color: 'var(--vs-muted)', marginTop: 3, lineHeight: 1.4 }}>{t.description}</div>}
                      <div style={{ fontSize: 12, color: 'var(--vs-faint)', marginTop: 4 }}>{t.validDays} Tage gültig</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--vs-accent)' }}>{eur(t.price)}</div>
                        {t.value !== t.price && (
                          <div style={{ fontSize: 12, color: 'var(--vs-faint)' }}>Wert: {eur(t.value)}</div>
                        )}
                      </div>
                      {qty === 0 ? (
                        <button className="vs-qty-btn add-first" onClick={() => addItem(t.id)}>+ Hinzufügen</button>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <button className="vs-qty-btn" onClick={() => removeItem(t.id)}>−</button>
                          <span style={{ fontSize: 16, fontWeight: 700, minWidth: 20, textAlign: 'center', color: 'var(--vs-accent)' }}>{qty}</span>
                          <button className="vs-qty-btn" onClick={() => addItem(t.id)}>+</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {cartCount > 0 && (
              <div style={{ padding: '6px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', animation: 'vs-fade-in 0.3s ease both' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--vs-label)' }}>
                  {cartCount} {cartCount === 1 ? 'Gutschein' : 'Gutscheine'} ausgewählt
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--vs-accent)' }}>{eur(animatedTotal)}</div>
              </div>
            )}

            <button className="vs-btn" disabled={cartCount === 0} onClick={() => setStep('form')} style={{ marginTop: 4, width: '50%', marginLeft: 'auto', marginRight: 'auto', display: 'block' }}>
              Weiter →
            </button>
          </div>
        )}

        {step === 'form' && (
          <div className="vs-step-form" style={{ display: 'grid', gap: 20 }}>
            {/* Cart summary */}
            <div style={{ background: 'var(--vs-bg)', border: '1px solid var(--vs-border)', borderRadius: 14, padding: '16px 20px' }}>
              {cartItems.map(t => (
                <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0' }}>
                  <div style={{ fontWeight: 500, fontSize: 14, color: 'var(--vs-text)' }}>
                    <span style={{ color: 'var(--vs-faint)', fontWeight: 600, marginRight: 6, fontVariantNumeric: 'tabular-nums' }}>{cart.get(t.id)}×</span>
                    {t.name}
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--vs-label)', fontWeight: 500 }}>{eur((cart.get(t.id)!) * t.price)}</div>
                </div>
              ))}
              <div style={{ borderTop: '1px solid var(--vs-border-subtle)', marginTop: 10, paddingTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--vs-text)' }}>Gesamt</span>
                <span style={{ fontWeight: 800, fontSize: 17, color: 'var(--vs-accent)' }}>{eur(cartTotal)}</span>
              </div>
              <button onClick={() => setStep('select')} style={{ marginTop: 10, fontSize: 13, color: 'var(--vs-accent)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: 0, opacity: 0.85 }}>
                ← Warenkorb bearbeiten
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
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Empfänger <span style={{ fontWeight: 400, color: 'var(--vs-faint)', fontSize: 13 }}>(optional)</span></div>
              <p style={{ fontSize: 13, color: 'var(--vs-muted)', marginBottom: 16, lineHeight: 1.5 }}>Der Gutschein wird auch an die Empfänger-E-Mail geschickt.</p>
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

            {error && <p style={{ fontSize: 14, color: 'var(--vs-error)' }}>{error}</p>}

            <button className="vs-btn" onClick={handleCheckout} disabled={loading}>
              {loading ? 'Weiterleitung …' : `Jetzt bezahlen — ${eur(cartTotal)}`}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
