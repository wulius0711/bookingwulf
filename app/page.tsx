import Link from 'next/link';
import { PLANS } from '@/src/lib/plans';

export default function LandingPage() {
  const features = [
    { icon: '🏨', title: 'Multi-Apartment', desc: 'Verwalten Sie beliebig viele Apartments mit individuellen Preisen, Bildern und Ausstattung.' },
    { icon: '📅', title: 'Live-Verfügbarkeit', desc: 'Echtzeit-Prüfung der Verfügbarkeit mit Sperrzeiten und Preissaisons.' },
    { icon: '🎨', title: 'Individuelles Branding', desc: 'Farben, Formen und Funktionen passend zu Ihrem Hotel-Auftritt.' },
    { icon: '📧', title: 'E-Mail-Benachrichtigungen', desc: 'Automatische Bestätigungen an Gäste und Benachrichtigungen an Sie.' },
    { icon: '🛡️', title: 'Versicherungsoptionen', desc: 'Reiserücktrittsversicherung direkt im Buchungsprozess anbieten.' },
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

  return (
    <div style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, sans-serif', color: '#111' }}>

      <style>{`
        .lp-btn {
          display: inline-block;
          padding: 14px 32px;
          border-radius: 999px;
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
          border-radius: 999px; text-decoration: none;
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

        @keyframes lp-fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .lp-hero { animation: lp-fadeUp 0.6s ease-out; }
      `}</style>

      {/* Nav */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', maxWidth: 1200, margin: '0 auto' }}>
        <img src="/bookingwulf-logo.png" alt="bookingwulf" style={{ height: 48 }} />
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <Link href="/admin/login" className="lp-nav-link">Login</Link>
          <Link href="/register" className="lp-btn lp-btn-primary" style={{ padding: '8px 20px', fontSize: 14 }}>Kostenlos testen</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="lp-hero" style={{ textAlign: 'center', padding: '80px 24px 60px', maxWidth: 800, margin: '0 auto' }}>
        <div className="lp-badge" style={{ marginBottom: 20 }}>
          14 Tage kostenlos testen
        </div>
        <h1 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 800, lineHeight: 1.08, letterSpacing: '-0.04em', margin: '0 0 20px' }}>
          Das Buchungs-Widget<br />für Ihr Hotel
        </h1>
        <p style={{ fontSize: 18, color: '#555', lineHeight: 1.6, maxWidth: 600, margin: '0 auto 32px' }}>
          Buchungsanfragen direkt auf Ihrer Website entgegennehmen — ohne Provision, ohne Drittplattform. Einbauen in 5 Minuten.
        </p>
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
            src="/widget.html?hotel=beimoser"
            style={{ width: '100%', height: 600, border: 'none', display: 'block', pointerEvents: 'none' }}
            scrolling="no"
            title="Widget Preview"
          />
        </div>
        <p style={{ textAlign: 'center', fontSize: 13, color: '#999', marginTop: 12 }}>
          Live-Vorschau des Booking-Widgets
        </p>
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
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 12px' }}>Faire Preise</h2>
          <p style={{ textAlign: 'center', fontSize: 16, color: '#666', margin: '0 0 48px' }}>Keine Provision, keine versteckten Kosten. Monatlich kündbar.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20 }}>
            {plans.map(([key, plan]) => (
              <div key={key} className="lp-pricing" style={{ border: key === 'pro' ? '2px solid #111' : '1px solid #e5e7eb' }}>
                {key === 'pro' && (
                  <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#111', color: '#fff', padding: '4px 16px', borderRadius: 999, fontSize: 12, fontWeight: 700 }}>Beliebt</div>
                )}
                <h3 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 4px' }}>{plan.name}</h3>
                <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.03em', margin: '8px 0' }}>
                  {'\u20AC'}{plan.priceEur}<span style={{ fontSize: 16, fontWeight: 400, color: '#999' }}>/Mo</span>
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
      </footer>
    </div>
  );
}
