'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { PLANS } from '@/src/lib/plans';

const LP_BASE = {
  accentColor: '#dc143c', backgroundColor: '#faebd7', cardBackground: '#fef9f2',
  textColor: '#111111', mutedTextColor: '#666666', borderColor: '#dddddd',
  cardRadius: '12', buttonRadius: '44', buttonColor: '#ffffff',
  headlineFont: '', bodyFont: '',
  headlineFontSize: '28', bodyFontSize: '14', headlineFontWeight: '700',
};

const LP_PRESETS = [
  { accentColor: '#1a56db', backgroundColor: '#eff6ff', cardBackground: '#f8fbff', textColor: '#0f1941', borderColor: '#c3d9f8', cardRadius: '2',  buttonRadius: '2'  },
  { accentColor: '#065f46', backgroundColor: '#ecfdf5', cardBackground: '#f6fdf9', textColor: '#022c22', borderColor: '#a7f3d0', cardRadius: '20', buttonRadius: '44' },
  { accentColor: '#7c3aed', backgroundColor: '#f5f3ff', cardBackground: '#faf9ff', textColor: '#1e0a4a', borderColor: '#ddd6fe', cardRadius: '0',  buttonRadius: '32' },
  { accentColor: '#111827', backgroundColor: '#f9fafb', cardBackground: '#ffffff', textColor: '#111827', borderColor: '#e5e7eb', cardRadius: '8',  buttonRadius: '8'  },
];

export default function LandingPage() {
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('year');

  const features = [
    { icon: '🏨', title: 'Multi-Apartment', desc: 'Verwalten Sie beliebig viele Apartments mit individuellen Preisen, Bildern und Ausstattung.' },
    { icon: '📅', title: 'Live-Verfügbarkeit', desc: 'Echtzeit-Prüfung der Verfügbarkeit mit Sperrzeiten und Preissaisons.' },
    { icon: '🎨', title: 'Individuelles Branding', desc: 'Farben, Formen und Funktionen passend zu Ihrem Hotel-Auftritt.' },
    { icon: '📧', title: 'E-Mail-Benachrichtigungen', desc: 'Automatische Bestätigungen an Gäste und Benachrichtigungen an Sie.' },
    { icon: '♊', title: 'Doppelt einsetzbar', desc: 'Gleichzeitig für Buchung und Anfrage verwenden.' },
    { icon: '🔄', title: 'Airbnb & Booking.com Sync', desc: 'Automatischer Kalenderabgleich per iCal — keine Doppelbuchungen mehr.' },
    { icon: '📊', title: 'Buchungsverwaltung', desc: 'Alle Anfragen im Blick — Status ändern, filtern, exportieren.' },
    { icon: '💶', title: 'Preissaisons', desc: 'Saisonale Preise automatisch anwenden — Haupt-, Neben- und Feiertagspreise.' },
    { icon: '⚡', title: 'Einbau in 1 Minute', desc: 'Eine Zeile Code auf Ihre Website — kein Entwickler nötig.' },
  ];

  const steps = [
    { num: '1', title: 'Registrieren', desc: 'Konto in 30 Sekunden erstellen — keine Kreditkarte nötig.' },
    { num: '2', title: 'Einrichten', desc: 'Apartments anlegen, Preise setzen, Design anpassen.' },
    { num: '3', title: 'Einbauen', desc: 'Eine Zeile Code auf Ihre Website — fertig.' },
  ];

  const plans = Object.entries(PLANS) as [string, typeof PLANS[keyof typeof PLANS]][];

  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    function send(settings: Record<string, string>) {
      iframeRef.current?.contentWindow?.postMessage(
        { type: 'booking-widget-preview-settings', settings },
        '*'
      );
    }

    let timer: ReturnType<typeof setTimeout>;
    let presetIndex = 0;
    let started = false;

    function cycle() {
      send({ ...LP_BASE, ...LP_PRESETS[presetIndex % LP_PRESETS.length] });
      presetIndex++;
      timer = setTimeout(() => {
        send(LP_BASE);
        timer = setTimeout(cycle, 3000);
      }, 5000);
    }

    function onMessage(e: MessageEvent) {
      if (e.data?.type === 'booking-widget-ready' && !started) {
        started = true;
        send(LP_BASE);
        timer = setTimeout(cycle, 4000);
      }
    }

    window.addEventListener('message', onMessage);
    return () => {
      window.removeEventListener('message', onMessage);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, sans-serif', color: '#111' }}>

      <style>{`
        .lp-btn {
          display: inline-block;
          padding: 14px 32px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          text-decoration: none;
          transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
          cursor: pointer;
        }
        .lp-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
        .lp-btn:active { transform: translateY(0); }
        .lp-btn-primary { background: #111; color: #fff; border: none; }
        .lp-btn-primary:hover { background: #333; }
        .lp-btn-secondary { background: #fff; color: #111; border: 1px solid #ddd; }
        .lp-btn-secondary:hover { border-color: #111; }

        .lp-nav-link {
          font-size: 14px; color: #555; text-decoration: none; font-weight: 500;
          transition: color 0.15s ease;
        }
        .lp-nav-link:hover { color: #111; }

        .lp-feature {
          background: #fff; border: 1px solid #eee; border-radius: 16px; padding: 24px;
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
        }
        .lp-feature:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.08);
          border-color: #ddd;
        }
        .lp-feature-icon {
          font-size: 28px; margin-bottom: 12px;
          display: inline-block;
          transition: transform 0.3s ease;
        }
        .lp-feature:hover .lp-feature-icon { transform: scale(1.15); }

        .lp-step-num {
          width: 48px; height: 48px; border-radius: 999px;
          background: #111; color: #fff;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; font-weight: 700; flex-shrink: 0;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .lp-step:hover .lp-step-num {
          transform: scale(1.1);
          box-shadow: 0 6px 16px rgba(0,0,0,0.15);
        }

        .lp-pricing {
          background: #fff; border-radius: 20px; padding: 28px;
          position: relative;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .lp-pricing:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.1);
        }
        .lp-pricing-btn {
          display: block; text-align: center; padding: 12px 0;
          border-radius: 8px; text-decoration: none;
          font-size: 14px; font-weight: 600;
          transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.15s ease, color 0.15s ease;
        }
        .lp-pricing-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }

        .lp-preview {
          border-radius: 20px; overflow: hidden;
          border: 1px solid #e5e7eb;
          background: #faebd7;
          transition: transform 0.4s ease, box-shadow 0.4s ease;
          box-shadow: 0 20px 60px rgba(0,0,0,0.08);
        }
        .lp-preview:hover {
          transform: translateY(-4px);
          box-shadow: 0 28px 70px rgba(0,0,0,0.12);
        }

        .lp-badge {
          display: inline-block; padding: 6px 16px; border-radius: 999px;
          background: #f0fdf4; color: #16a34a; font-size: 13px; font-weight: 600;
          animation: lp-pulse 2s ease-in-out infinite;
        }
        @keyframes lp-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(22,163,106,0.2); }
          50% { box-shadow: 0 0 0 8px rgba(22,163,106,0); }
        }

        .lp-footer-link {
          color: #999; text-decoration: none;
          transition: color 0.15s ease;
        }
        .lp-footer-link:hover { color: #555; }

        .lp-logo { height: 48px; }
        .lp-nav-btn { padding: 8px 20px; font-size: 14px; text-align: center; }

        @media (max-width: 640px) {
          .lp-logo { height: 32px; }
          .lp-nav-btn { padding: 8px 14px; font-size: 13px; }
          .lp-btn { padding: 12px 24px; font-size: 15px; }
        }

        @keyframes lp-fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .lp-hero { animation: lp-fadeUp 0.6s ease-out; }
      `}</style>

      {/* Nav */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', maxWidth: 1200, margin: '0 auto' }}>
        <img src="/bookingwulf-logo.png" alt="bookingwulf" className="lp-logo" />
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link href="/admin/login" className="lp-nav-link">Login</Link>
          <Link href="/register" className="lp-btn lp-btn-primary lp-nav-btn">Kostenlos testen</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="lp-hero" style={{ textAlign: 'center', padding: '80px 24px 60px', maxWidth: 800, margin: '0 auto' }}>
        <div className="lp-badge" style={{ marginBottom: 20 }}>
          14 Tage kostenlos testen
        </div>
        <h1 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 800, lineHeight: 1.08, letterSpacing: '-0.04em', margin: '0 0 20px' }}>
          Das Buchungssystem für Hotels und Apartments
        </h1>
        <p style={{ fontSize: 18, color: '#555', lineHeight: 1.6, maxWidth: 580, margin: '0 auto 12px' }}>
          Anfragen und Buchungen direkt auf Ihrer Website – ohne Provision, ohne Drittplattform.
        </p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'nowrap', marginBottom: 48 }}>
          {['Anpassbares Design', 'Einbauen in 5 Minuten', 'Kein Entwickler nötig'].map((label) => (
            <span key={label} style={{ padding: '6px 14px', borderRadius: 999, border: '1px solid #e0e0e0', fontSize: 13, color: '#555', background: '#fafafa', whiteSpace: 'nowrap' }}>
              {label}
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/register" className="lp-btn lp-btn-primary">
            Jetzt starten
          </Link>
          <a href="#features" className="lp-btn lp-btn-secondary">
            Mehr erfahren
          </a>
        </div>
      </section>

      {/* Widget Preview */}
      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px 80px' }}>
        <div className="lp-preview">
          <iframe
            ref={iframeRef}
            src="/widget.html?hotel=beimoser"
            style={{ width: '100%', height: 680, border: 'none', display: 'block', pointerEvents: 'none' }}
            scrolling="no"
            title="Widget Preview"
          />
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ background: '#fafafa', padding: '80px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 12px' }}>Alles was Sie brauchen</h2>
          <p style={{ textAlign: 'center', fontSize: 16, color: '#666', margin: '0 0 48px' }}>Kein Schnickschnack — nur die Features die Hotels wirklich nutzen.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {features.map((f) => (
              <div key={f.title} className="lp-feature">
                <div className="lp-feature-icon">{f.icon}</div>
                <h3 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 8px' }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: '#666', lineHeight: 1.55, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '80px 24px', maxWidth: 800, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 48px' }}>In 3 Schritten live</h2>
        <div style={{ display: 'grid', gap: 32 }}>
          {steps.map((s) => (
            <div key={s.num} className="lp-step" style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
              <div className="lp-step-num">{s.num}</div>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 6px' }}>{s.title}</h3>
                <p style={{ fontSize: 15, color: '#666', margin: 0, lineHeight: 1.5 }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ background: '#fafafa', padding: '80px 24px' }}>
        <div style={{ maxWidth: 950, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 12px' }}>Faire Preise</h2>
          <p style={{ textAlign: 'center', fontSize: 16, color: '#666', margin: '0 0 24px' }}>Keine Provision, keine versteckten Kosten. Monatlich kündbar.</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 40 }}>
            <span style={{ fontSize: 14, color: billingInterval === 'month' ? '#111' : '#999', fontWeight: billingInterval === 'month' ? 600 : 400 }}>Monatlich</span>
            <button
              onClick={() => setBillingInterval(billingInterval === 'month' ? 'year' : 'month')}
              style={{
                width: 48, height: 26, borderRadius: 999, border: 'none', cursor: 'pointer', padding: 3,
                background: billingInterval === 'year' ? '#111' : '#d1d5db',
                display: 'flex', alignItems: 'center',
                justifyContent: billingInterval === 'year' ? 'flex-end' : 'flex-start',
                transition: 'background 0.2s ease',
              }}
            >
              <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', display: 'block' }} />
            </button>
            <span style={{ fontSize: 14, color: billingInterval === 'year' ? '#111' : '#999', fontWeight: billingInterval === 'year' ? 600 : 400 }}>
              Jährlich
              {billingInterval === 'year' && (
                <span style={{ marginLeft: 6, padding: '2px 8px', borderRadius: 6, background: '#dcfce7', color: '#16a34a', fontSize: 12, fontWeight: 700 }}>spare 10%</span>
              )}
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20, alignItems: 'start' }}>
            {plans.map(([key, plan]) => (
              <div key={key} className="lp-pricing" style={{ border: key === 'pro' ? '2px solid #111' : '1px solid #e5e7eb' }}>
                {key === 'pro' && (
                  <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#111', color: '#fff', padding: '4px 16px', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>Beliebt</div>
                )}
                <h3 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 4px' }}>{plan.name}</h3>
                <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.03em', margin: '8px 0' }}>
                  {'\u20AC'}{billingInterval === 'year' ? plan.priceYearly : plan.priceMonthly}<span style={{ fontSize: 16, fontWeight: 400, color: '#999' }}>/Mo</span>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '20px 0 24px', display: 'grid', gap: 10 }}>
                  {plan.features.map((f) => (
                    <li key={f} style={{ fontSize: 14, color: '#444', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <span style={{ color: '#22c55e', fontWeight: 700, flexShrink: 0 }}>{'✓'}</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className="lp-pricing-btn"
                  style={{ background: key === 'pro' ? '#111' : '#fff', color: key === 'pro' ? '#fff' : '#111', border: '1px solid #111' }}
                >
                  Kostenlos testen
                </Link>
              </div>
            ))}
          </div>
          <p style={{ textAlign: 'center', marginTop: 32, fontSize: 14, color: '#888' }}>
            Fragen? <a href="mailto:support@bookingwulf.com" style={{ color: '#111', fontWeight: 600, textDecoration: 'none' }}>support@bookingwulf.com</a>
          </p>
        </div>
      </section>

      {/* CTA */}
      <section style={{ textAlign: 'center', padding: '80px 24px' }}>
        <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 16px' }}>Bereit loszulegen?</h2>
        <p style={{ fontSize: 16, color: '#666', margin: '0 0 28px' }}>14 Tage kostenlos — keine Kreditkarte erforderlich.</p>
        <Link href="/register" className="lp-btn lp-btn-primary">
          Jetzt Konto erstellen
        </Link>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #eee', padding: '24px 32px', display: 'flex', justifyContent: 'center', gap: 24, fontSize: 12 }}>
        <a href="/impressum" className="lp-footer-link">Impressum</a>
        <a href="/datenschutz" className="lp-footer-link">Datenschutz</a>
        <a href="/agb" className="lp-footer-link">AGB</a>
        <a href="/avv" className="lp-footer-link">AVV</a>
        <a href="mailto:support@bookingwulf.com" className="lp-footer-link">Support</a>
      </footer>
    </div>
  );
}
