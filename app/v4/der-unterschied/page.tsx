'use client';

import { useEffect } from 'react';
import Link from 'next/link';

function Placeholder({ tint = false, ratio = '4/3' }: { tint?: boolean; ratio?: string }) {
  return (
    <div style={{
      borderRadius: 14,
      aspectRatio: ratio,
      background: tint ? 'var(--v4-green-light)' : '#f1f5f9',
      border: `1px solid ${tint ? 'var(--v4-green-border)' : 'var(--v4-border)'}`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
    }}>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={tint ? 'var(--v4-green)' : '#94a3b8'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 21V9" />
      </svg>
      <span style={{ fontSize: 11, fontWeight: 600, color: tint ? 'var(--v4-green)' : '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        Screenshot
      </span>
    </div>
  );
}

const adminFeatures = [
  {
    label: 'Zimmerverwaltung',
    title: 'Jedes Apartment auf einen Blick.',
    body: 'Eigene Preissaisons, Fotos, Ausstattung — alles pro Einheit. Neue Einheiten sind in Minuten eingerichtet, ohne technisches Wissen.',
  },
  {
    label: 'Kalenderansicht',
    title: 'Belegt. Frei. Blockiert.',
    body: 'Die Monatsübersicht zeigt alle Einheiten nebeneinander. Sperrzeiten per Klick setzen, Buchungen auf einen Blick erkennen — ohne Klickwege.',
  },
  {
    label: 'Buchungsübersicht',
    title: 'Status, Filter, Export.',
    body: 'Alle Buchungen und Anfragen in einer Liste. Status-Workflow, Filter nach Zeitraum oder Apartment, CSV-Export inklusive.',
  },
];

const widgetSteps = [
  {
    step: '01',
    label: 'Zimmerauswahl',
    body: 'Bilder, Ausstattung und Preis auf einen Blick. Klare Verfügbarkeitsanzeige — ohne Rätselraten.',
  },
  {
    step: '02',
    label: 'Gastdaten-Formular',
    body: 'Nur was wirklich nötig ist. Kein unnötiges Formular, das Gäste abbricht — mobil-optimiert und schnell ausgefüllt.',
  },
  {
    step: '03',
    label: 'Bestätigungsseite',
    body: 'Klare Zusammenfassung, sofortige Bestätigung per E-Mail. Der Gast weiß, was als nächstes passiert.',
  },
];

export default function DerUnterschiedPage() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('v4-visible'); }),
      { threshold: 0.08 },
    );
    document.querySelectorAll('.v4-animate').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="v4-section bg-white">
        <div className="v4-container" style={{ maxWidth: 760 }}>
          <span className="v4-eyebrow v4-animate">Der Unterschied</span>
          <h1 className="v4-h1 mb-8 v4-animate v4-d1">
            Warum sehen Buchungswidgets noch immer so aus?
          </h1>
          <p className="v4-animate v4-d2" style={{ fontSize: 18, lineHeight: 1.75, color: 'var(--v4-body)', marginBottom: 20 }}>
            Du hast in deine Website investiert. Die Fotografie stimmt, das Design passt zu deinem Haus. Und dann öffnet der Gast das Buchungswidget — und landet in einer anderen Welt. Genau so fühlt sich oft auch die tägliche Arbeit im Admin an: unübersichtlich, umständlich, zu viele Klicks für einfache Dinge.
          </p>
          <p className="v4-animate v4-d3" style={{ fontSize: 18, lineHeight: 1.75, color: 'var(--v4-body)' }}>
            Die meisten Systeme am Markt sind über 10 Jahre alt. Gebaut für Desktop, gebaut für Stabilität — nicht für Conversion oder einfache Bedienung. Weil ein Wechsel aufwändig ist, blieb das Interface wie es war.
          </p>
        </div>
      </section>

      {/* ── Screenshot-Vergleich ───────────────────────────────────── */}
      <section className="v4-section" style={{ background: 'var(--v4-surface)' }}>
        <div className="v4-container">
          <div className="text-center mb-14">
            <span className="v4-eyebrow v4-animate">Gegenüberstellung</span>
            <h2 className="v4-h2 v4-animate v4-d1">Widget. Einmal alt, einmal neu.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Alt */}
            <div className="v4-animate v4-d1">
              <Placeholder ratio="4/3" />
              <div style={{ marginTop: 14, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', flexShrink: 0, marginTop: 5 }} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--v4-navy)', marginBottom: 4 }}>Typisches Buchungswidget</div>
                  <div style={{ fontSize: 13, color: 'var(--v4-body)', lineHeight: 1.6 }}>
                    Kein visueller Zusammenhang zur Website. Überladen, umständlich, kaum mobil nutzbar.
                  </div>
                </div>
              </div>
            </div>

            {/* bookingwulf */}
            <div className="v4-animate v4-d2">
              <Placeholder tint ratio="4/3" />
              <div style={{ marginTop: 14, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--v4-green)', flexShrink: 0, marginTop: 5 }} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--v4-navy)', marginBottom: 4 }}>bookingwulf</div>
                  <div style={{ fontSize: 13, color: 'var(--v4-body)', lineHeight: 1.6 }}>
                    Nahtlos integriert, mobil-first, an Ihre Farben angepasst. Der Gast merkt nicht, dass er ein fremdes System nutzt.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Admin-Sektion ─────────────────────────────────────────── */}
      <section className="v4-section bg-white">
        <div className="v4-container">
          <div className="text-center mb-20">
            <span className="v4-eyebrow v4-animate">Admin</span>
            <h2 className="v4-h2 v4-animate v4-d1">Ein Admin der nicht nervt.</h2>
          </div>

          <div className="flex flex-col" style={{ gap: 80 }}>
            {adminFeatures.map((item, i) => (
              <div
                key={item.label}
                className={`v4-animate v4-d${(i % 3) + 1} grid grid-cols-1 md:grid-cols-2 items-center gap-10 md:gap-14`}
              >
                <div className={i % 2 === 1 ? 'md:order-2' : ''}>
                  <Placeholder ratio="16/10" />
                </div>
                <div className={i % 2 === 1 ? 'md:order-1' : ''}>
                  <span className="v4-eyebrow" style={{ marginBottom: 10 }}>{item.label}</span>
                  <h3 style={{ fontSize: 26, fontWeight: 700, color: 'var(--v4-navy)', lineHeight: 1.2, letterSpacing: '-0.015em', marginBottom: 14 }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: 16, color: 'var(--v4-body)', lineHeight: 1.75 }}>{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Widget-Sektion ────────────────────────────────────────── */}
      <section className="v4-section" style={{ background: 'var(--v4-surface)' }}>
        <div className="v4-container">
          <div className="text-center mb-16">
            <span className="v4-eyebrow v4-animate">Widget</span>
            <h2 className="v4-h2 v4-animate v4-d1">Buchungserlebnis das überzeugt.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {widgetSteps.map((item, i) => (
              <div key={item.label} className={`v4-animate v4-d${i + 1}`}>
                <Placeholder tint ratio="3/4" />
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--v4-green)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
                    Schritt {item.step}
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--v4-navy)', marginBottom: 8, lineHeight: 1.3 }}>
                    {item.label}
                  </h3>
                  <p style={{ fontSize: 14, color: 'var(--v4-body)', lineHeight: 1.7 }}>{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Abschluss / CTA ───────────────────────────────────────── */}
      <section className="v4-section v4-grain" style={{ background: 'var(--v4-navy)' }}>
        <div className="v4-container text-center" style={{ maxWidth: 640 }}>
          <p className="v4-animate" style={{ fontSize: 22, fontWeight: 600, lineHeight: 1.5, color: '#fff', marginBottom: 6 }}>
            Für den Gast: ein Buchungserlebnis das überzeugt.
          </p>
          <p className="v4-animate v4-d1" style={{ fontSize: 22, fontWeight: 600, lineHeight: 1.5, color: 'var(--v4-green-border)', marginBottom: 44 }}>
            Für das Hotel: ein Admin der nicht nervt.
          </p>
          <Link href="/register" className="v4-btn v4-btn-primary v4-animate v4-d2">
            Demo anfragen
          </Link>
        </div>
      </section>
    </>
  );
}
