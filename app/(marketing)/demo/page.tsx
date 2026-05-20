'use client';

import { useActionState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { requestDemo } from './actions';
import { useV4Animate } from '../_components/useV4Animate';

const DEMO_HOTEL_SLUG = 'alpine-retreat';

function WidgetEmbed() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    function onMessage(e: MessageEvent) {
      if (e.data?.type === 'booking-widget-resize' && e.data.height > 100) {
        if (iframeRef.current) iframeRef.current.style.height = e.data.height + 'px';
      }
      if (e.data?.type === 'booking-widget-scroll-top') {
        iframeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
    window.addEventListener('message', onMessage);

    return () => {
      window.removeEventListener('message', onMessage);
    };
  }, []);

  return (
    <div style={{
      borderRadius: 16,
      overflow: 'hidden',
      border: '1px solid #e2e8f0',
      boxShadow: '0 32px 80px rgba(0,0,0,0.14)',
    }}>
      {/* Browser chrome */}
      <div style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {['#fc5f57', '#fdbc2c', '#27c840'].map((c) => (
            <div key={c} style={{ width: 11, height: 11, borderRadius: '50%', background: c }} />
          ))}
        </div>
        <div style={{ flex: 1, background: '#fff', borderRadius: 6, padding: '4px 12px', fontSize: 12, color: '#64748b', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          hotel-alpine-retreat.at
        </div>
      </div>
      <iframe
        ref={iframeRef}
        src={`/widget.html?hotel=${DEMO_HOTEL_SLUG}`}
        style={{ width: '100%', height: 1200, border: 'none', display: 'block', background: '#fff' }}
        title="bookingwulf Widget Demo"
        loading="lazy"
        scrolling="no"
      />
    </div>
  );
}

function DemoForm() {
  const [state, action, pending] = useActionState(requestDemo, undefined);

  if (state?.success) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 24px' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--v4-green-light)', border: '2px solid var(--v4-green-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--v4-green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--v4-navy)', marginBottom: 8 }}>Anfrage eingegangen!</div>
        <div style={{ fontSize: 15, color: 'var(--v4-body)', lineHeight: 1.6 }}>
          Ich melde mich innerhalb von 24 Stunden bei Ihnen. Bis dahin können Sie das Widget oben direkt ausprobieren.
        </div>
      </div>
    );
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', border: '1px solid var(--v4-border)', borderRadius: 8,
    fontSize: 14, background: '#fff', color: 'var(--v4-navy)', outline: 'none',
    boxSizing: 'border-box',
  };
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--v4-navy)', marginBottom: 5,
  };

  return (
    <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label style={labelStyle}>Name *</label>
          <input name="name" required placeholder="Maria Müller" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Betrieb / Hotel *</label>
          <input name="hotel" required placeholder="Pension Alpenblick" style={inputStyle} />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label style={labelStyle}>E-Mail *</label>
          <input name="email" type="email" required placeholder="maria@beispiel.at" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Telefon <span style={{ fontWeight: 400, color: 'var(--v4-muted)' }}>(optional)</span></label>
          <input name="phone" type="tel" placeholder="+43 664 …" style={inputStyle} />
        </div>
      </div>
      <div>
        <label style={labelStyle}>Nachricht <span style={{ fontWeight: 400, color: 'var(--v4-muted)' }}>(optional)</span></label>
        <textarea name="message" rows={3} placeholder="z.B. aktuelle Software, Anzahl Apartments, Fragen …" style={{ ...inputStyle, resize: 'vertical' }} />
      </div>
      {state?.error && (
        <p style={{ fontSize: 13, color: '#dc2626', margin: 0 }}>{state.error}</p>
      )}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          type="submit"
          disabled={pending}
          className="v4-btn v4-btn-primary"
          style={{ opacity: pending ? 0.7 : 1 }}
        >
          {pending ? 'Wird gesendet …' : 'Demo anfragen →'}
        </button>
      </div>
    </form>
  );
}

export default function DemoPage() {
  useV4Animate();
  useEffect(() => {
    window.history.scrollRestoration = 'manual';
    requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'instant' })));
  }, []);

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="v4-section bg-white" style={{ paddingBottom: 64 }}>
        <div className="v4-container text-center" style={{ maxWidth: 680 }}>
          <span className="v4-eyebrow v4-animate">Demo</span>
          <h1 className="v4-h1 mb-5 v4-animate v4-d1">bookingwulf selbst erleben.</h1>
          <p className="v4-animate v4-d2" style={{ fontSize: 18, lineHeight: 1.75, color: 'var(--v4-body)' }}>
            Testen Sie das Widget live — so wie es Ihre Gäste sehen. Kein Login, keine Kreditkarte.
          </p>
        </div>
      </section>

      {/* ── Live Widget ───────────────────────────────────────────── */}
      <section style={{ background: 'var(--v4-surface)', padding: '100px 0' }}>
        <div className="v4-container" style={{ maxWidth: 1200 }}>
          <div className="v4-animate v4-d1">
            <WidgetEmbed />
          </div>
          <p className="v4-animate v4-d2 text-center mt-6" style={{ fontSize: 13, color: 'var(--v4-muted)' }}>
            Demo-Widget · Testdaten · keine echten Buchungen
          </p>
        </div>
      </section>

      {/* ── Demo anfragen ─────────────────────────────────────────── */}
      <section className="v4-section bg-white">
        <div className="v4-container" style={{ maxWidth: 720 }}>
          <div className="text-center mb-12">
            <span className="v4-eyebrow v4-animate">Persönliche Demo</span>
            <h2 className="v4-h2 v4-animate v4-d1">Demo anfragen</h2>
            <p className="v4-animate v4-d2" style={{ fontSize: 16, color: 'var(--v4-body)', marginTop: 12, lineHeight: 1.7 }}>
              Sie haben Fragen oder möchten bookingwulf für Ihren Betrieb einrichten? Ich zeige es Ihnen persönlich — per Video-Call, kostenlos.
            </p>
          </div>

          <div className="v4-animate v4-d3 v4-card p-8">
            <DemoForm />
          </div>

          <div className="v4-animate v4-d4 text-center mt-8" style={{ fontSize: 14, color: 'var(--v4-body)' }}>
            Lieber direkt starten?{' '}
            <Link href="/register" style={{ color: 'var(--v4-green)', fontWeight: 600 }}>
              14 Tage kostenlos testen →
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section className="v4-section v4-grain" style={{ background: 'var(--v4-navy)' }}>
        <div className="v4-container text-center" style={{ maxWidth: 600 }}>
          <p className="v4-animate" style={{ fontSize: 22, fontWeight: 600, color: '#fff', marginBottom: 8, lineHeight: 1.4 }}>
            Überzeugt? Starten Sie in 5 Minuten.
          </p>
          <p className="v4-animate v4-d1" style={{ fontSize: 16, color: 'var(--v4-muted)', marginBottom: 40 }}>
            14 Tage kostenlos — ohne Kreditkarte, ohne Risiko.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/register" className="v4-btn v4-btn-primary v4-animate v4-d2">Jetzt starten</Link>
            <Link href="/preise" className="v4-btn v4-btn-ghost-white v4-animate v4-d3">Preise ansehen</Link>
          </div>
        </div>
      </section>
    </>
  );
}
