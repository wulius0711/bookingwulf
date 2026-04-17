import Link from 'next/link';
import { PLANS } from '@/src/lib/plans';

export default function LandingPage() {
  const features = [
    { icon: '🏨', title: 'Multi-Apartment', desc: 'Verwalten Sie beliebig viele Apartments mit individuellen Preisen, Bildern und Ausstattung.' },
    { icon: '📅', title: 'Live-Verfügbarkeit', desc: 'Echtzeit-Prüfung der Verfügbarkeit mit Sperrzeiten und Preissaisons.' },
    { icon: '🎨', title: 'Individuelles Branding', desc: 'Farben, Formen und Funktionen passend zu Ihrem Hotel-Auftritt.' },
    { icon: '📧', title: 'E-Mail-Benachrichtigungen', desc: 'Automatische Bestätigungen an Gäste und Benachrichtigungen an Sie.' },
    { icon: '🛡️', title: 'Versicherungsoptionen', desc: 'Reiserücktrittsversicherung direkt im Buchungsprozess anbieten.' },
    { icon: '📊', title: 'Buchungsverwaltung', desc: 'Alle Anfragen im Blick — Status ändern, filtern, exportieren.' },
  ];

  const steps = [
    { num: '1', title: 'Registrieren', desc: 'Konto in 30 Sekunden erstellen — keine Kreditkarte nötig.' },
    { num: '2', title: 'Einrichten', desc: 'Apartments anlegen, Preise setzen, Design anpassen.' },
    { num: '3', title: 'Einbauen', desc: 'Eine Zeile Code auf Ihre Website — fertig.' },
  ];

  const plans = Object.entries(PLANS) as [string, typeof PLANS[keyof typeof PLANS]][];

  return (
    <div style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, sans-serif', color: '#111' }}>

      {/* Nav */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', maxWidth: 1200, margin: '0 auto' }}>
        <img src="/bookingwulf-logo.png" alt="bookingwulf" style={{ height: 48 }} />
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <Link href="/admin/login" style={{ fontSize: 14, color: '#555', textDecoration: 'none', fontWeight: 500 }}>Login</Link>
          <Link href="/register" style={{ fontSize: 14, color: '#fff', background: '#111', padding: '8px 20px', borderRadius: 999, textDecoration: 'none', fontWeight: 600 }}>Kostenlos testen</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '80px 24px 60px', maxWidth: 800, margin: '0 auto' }}>
        <div style={{ display: 'inline-block', padding: '6px 16px', borderRadius: 999, background: '#f0fdf4', color: '#16a34a', fontSize: 13, fontWeight: 600, marginBottom: 20 }}>
          14 Tage kostenlos testen
        </div>
        <h1 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 800, lineHeight: 1.08, letterSpacing: '-0.04em', margin: '0 0 20px' }}>
          Das Buchungs-Widget<br />für Ihr Hotel
        </h1>
        <p style={{ fontSize: 18, color: '#555', lineHeight: 1.6, maxWidth: 600, margin: '0 auto 32px' }}>
          Buchungsanfragen direkt auf Ihrer Website entgegennehmen — ohne Provision, ohne Drittplattform. Einbauen in 5 Minuten.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/register" style={{ padding: '14px 32px', background: '#111', color: '#fff', borderRadius: 999, fontSize: 16, fontWeight: 600, textDecoration: 'none' }}>
            Jetzt starten
          </Link>
          <a href="#features" style={{ padding: '14px 32px', border: '1px solid #ddd', background: '#fff', color: '#111', borderRadius: 999, fontSize: 16, fontWeight: 500, textDecoration: 'none' }}>
            Mehr erfahren
          </a>
        </div>
      </section>

      {/* Widget Preview */}
      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px 80px' }}>
        <div style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid #e5e7eb', boxShadow: '0 20px 60px rgba(0,0,0,0.08)', background: '#faebd7' }}>
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
              <div key={f.title} style={{ background: '#fff', border: '1px solid #eee', borderRadius: 16, padding: 24 }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
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
            <div key={s.num} style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
              <div style={{ width: 48, height: 48, borderRadius: 999, background: '#111', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, flexShrink: 0 }}>
                {s.num}
              </div>
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
              <div key={key} style={{ background: '#fff', border: key === 'pro' ? '2px solid #111' : '1px solid #e5e7eb', borderRadius: 20, padding: 28, position: 'relative' }}>
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
                <Link href="/register" style={{ display: 'block', textAlign: 'center', padding: '12px 0', borderRadius: 999, background: key === 'pro' ? '#111' : '#fff', color: key === 'pro' ? '#fff' : '#111', border: '1px solid #111', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
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
        <Link href="/register" style={{ padding: '14px 36px', background: '#111', color: '#fff', borderRadius: 999, fontSize: 16, fontWeight: 600, textDecoration: 'none' }}>
          Jetzt Konto erstellen
        </Link>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #eee', padding: '24px 32px', display: 'flex', justifyContent: 'center', gap: 24, fontSize: 12, color: '#999' }}>
        {process.env.LEGAL_IMPRINT_URL && <a href={process.env.LEGAL_IMPRINT_URL} style={{ color: '#999', textDecoration: 'none' }}>Impressum</a>}
        {process.env.LEGAL_PRIVACY_URL && <a href={process.env.LEGAL_PRIVACY_URL} style={{ color: '#999', textDecoration: 'none' }}>Datenschutz</a>}
        {process.env.LEGAL_TERMS_URL && <a href={process.env.LEGAL_TERMS_URL} style={{ color: '#999', textDecoration: 'none' }}>AGB</a>}
      </footer>
    </div>
  );
}
