'use client';

import { useState, useLayoutEffect, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Building2, Calendar, Palette, LayoutGrid, RefreshCw, ToggleLeft,
  ClipboardList, TrendingDown, Globe, Code2, Lock, ShieldCheck,
} from 'lucide-react';

type Feature = {
  icon: React.ElementType;
  label: string;
  title: string;
  short: string;
  long: string;
  bullets?: string[];
};

const FEATURES: Feature[] = [
  {
    icon: Building2, label: 'Verwaltung',
    title: 'Multi-Apartment',
    short: 'Beliebig viele Apartments mit individuellen Preisen und Ausstattung.',
    long: 'Legen Sie jede Einheit mit eigenem Namen, eigenen Fotos, Ausstattungsmerkmalen und Preisstruktur an. Saisontarife, Wochenend-Zuschläge und Mindestaufenthalte sind pro Apartment konfigurierbar. Neue Einheiten sind in Minuten eingerichtet — ohne technisches Wissen.',
    bullets: ['Eigene Bilder & Beschreibung pro Einheit', 'Individuelle Preissaisons & Aufschläge', 'Separate Verfügbarkeitskalender', 'Unbegrenzte Einheiten in allen Plänen'],
  },
  {
    icon: Calendar, label: 'Kalender',
    title: 'Live-Verfügbarkeit',
    short: 'Echtzeit-Prüfung mit Sperrzeiten und Preissaisons.',
    long: 'Der Kalender zeigt sofort, welche Daten frei oder belegt sind — ohne manuelles Nachpflegen. Sperrzeiten können per Klick gesetzt werden, Pufferzeiten zwischen Buchungen verhindern Überschneidungen automatisch.',
    bullets: ['Manuelle Blockierungen', 'Pufferzeiten konfigurierbar', 'iCal-Export für externe Kalender'],
  },
  {
    icon: Palette, label: 'Design',
    title: 'Individuelles Branding',
    short: 'Farben, Formen und Funktionen passend zu Ihrem Auftritt.',
    long: 'Das Buchungswidget übernimmt Ihre Primärfarbe, Ihren Button-Stil und Ihre Schriftart — so fügt es sich nahtlos in jede Website ein. Kein bookingwulf-Branding sichtbar.',
    bullets: ['Eigene Primärfarbe & Akzente', 'Button-Radius & Schrift anpassbar', 'Kein fremdes Logo im Widget'],
  },
  {
    icon: LayoutGrid, label: 'Übersicht',
    title: 'Zimmerplan',
    short: 'Belegungsstatus auf einen Blick — frei, belegt, blockiert.',
    long: 'Die Gantt-ähnliche Monatsansicht zeigt alle Einheiten nebeneinander. Buchungen lassen sich per Drag & Drop verschieben, Reservierungen als CSV exportieren.',
    bullets: ['Monatsansicht aller Einheiten', 'Drag & Drop zum Verschieben', 'CSV-Export'],
  },
  {
    icon: RefreshCw, label: 'Integration',
    title: 'Airbnb & Booking.com Sync',
    short: 'Echtzeit-Sync via Beds24 — keine Doppelbuchungen.',
    long: 'Über den Beds24 Channel Manager werden Buchungen von Airbnb, Booking.com und anderen Portalen in Echtzeit gespiegelt — und umgekehrt. Kein manuelles Übertragen, keine Doppelbuchungen.',
    bullets: ['Airbnb, Booking.com, Expedia u. v. m.', 'Beds24-Account nötig', 'Bidirektionaler Sync in Echtzeit'],
  },
  {
    icon: ToggleLeft, label: 'Widget',
    title: 'Doppelt einsetzbar',
    short: 'Gleichzeitig für Buchung und Anfrage konfigurierbar.',
    long: 'bookingwulf funktioniert wahlweise als verbindliches Buchungssystem oder als Anfrage-Formular — oder beides gleichzeitig, je nach Apartment. Gäste sehen im Widget direkt, ob sie sofort buchen oder eine Anfrage stellen.',
    bullets: ['Modus pro Apartment wählbar', 'Anfragen mit Angebots-E-Mail', 'Buchungsbestätigung automatisch', 'Keine separate Software nötig'],
  },
  {
    icon: ClipboardList, label: 'Admin',
    title: 'Buchungsverwaltung',
    short: 'Alle Anfragen im Blick — Status, Filter, Export.',
    long: 'Das Admin-Dashboard listet alle Buchungen und Anfragen mit Status-Workflow: Neu → Angebot → Bestätigt → Abgereist. Filter nach Zeitraum, Apartment oder Status, CSV-Export inklusive.',
    bullets: ['Status-Workflow mit E-Mail-Auslöser', 'Filter & Suche', 'CSV-Export'],
  },
  {
    icon: TrendingDown, label: 'Preise',
    title: 'Dynamic Pricing',
    short: 'Last-Minute-Rabatte, Mindestaufenthalte, belegungsbasierte Preise.',
    long: 'Konfigurieren Sie Regeln, die automatisch greifen: Last-Minute-Rabatt ab 3 Tagen vor Anreise, Langzeit-Rabatt ab 7 Nächten, Wochenend-Aufschlag, Mindestaufenthalt je Saison.',
    bullets: ['Last-Minute & Langzeit-Rabatte', 'Saison-Mindestaufenthalte', 'Wochenend-Aufschläge'],
  },
  {
    icon: Code2, label: 'Setup',
    title: 'Einbau in 1 Minute',
    short: 'Eine Zeile Code — kein Entwickler nötig.',
    long: 'Kopieren Sie ein einzelnes Script-Tag auf Ihre Website — das Widget lädt sich selbst, passt sich dem Layout an und ist sofort buchbar. Funktioniert mit WordPress, Framer, Wix, Squarespace und jedem anderen CMS.',
    bullets: ['WordPress, Framer, Wix, Squarespace', 'Responsive für alle Bildschirmgrößen', 'Updates automatisch, kein Re-Embed'],
  },
  {
    icon: Globe, label: 'Sprachen',
    title: 'Mehrsprachige Kommunikation',
    short: 'Automatische Gäste-E-Mails in 9 Sprachen.',
    long: 'bookingwulf erkennt die Browser-Sprache des Gastes und sendet Bestätigungs- und Angebots-E-Mails automatisch in der passenden Sprache. Alle E-Mail-Texte sind vollständig anpassbar.',
    bullets: ['DE, EN, FR, IT, ES, NL, HR, PL, CS', 'Automatische Spracherkennung', 'Alle Texte individuell anpassbar'],
  },
  {
    icon: Lock, label: 'Smart Home',
    title: 'Nuki-Integration',
    short: 'Schlüssellose Übergabe — direkt verbunden.',
    long: 'Verbinden Sie Ihr Nuki-Smart-Lock mit bookingwulf: Nach Buchungsbestätigung wird automatisch ein temporärer Zugangscode generiert und dem Gast in der Gäste-Lounge angezeigt.',
    bullets: ['Automatischer Code bei Buchung', 'Code gültig nur für Aufenthaltszeitraum', 'Anzeige in der Gäste-Lounge'],
  },
  {
    icon: ShieldCheck, label: 'Datenschutz',
    title: 'Alle Daten in der EU',
    short: 'Server in der EU — DSGVO-konform.',
    long: 'bookingwulf läuft ausschließlich auf Servern in der EU (Amsterdam). Alle Daten bleiben innerhalb des europäischen Rechtsraums. Auf Wunsch stellen wir einen Auftragsverarbeitungsvertrag (AVV) bereit.',
    bullets: ['Hosting: EU (Railway, Amsterdam)', 'Daten bleiben im EU-Rechtsraum', 'AVV auf Anfrage'],
  },
];

export default function FeaturesPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('v4-visible'); }),
      { threshold: 0.1 }
    );
    document.querySelectorAll('.v4-animate').forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const prevRects = useRef<(DOMRect | null)[]>([]);

  function toggle(i: number) {
    prevRects.current = cardRefs.current.map((el) => el?.getBoundingClientRect() ?? null);
    setOpenIdx((prev) => (prev === i ? null : i));
  }

  useLayoutEffect(() => {
    cardRefs.current.forEach((el, i) => {
      if (!el || !prevRects.current[i]) return;
      const prev = prevRects.current[i]!;
      const next = el.getBoundingClientRect();
      const dy = prev.top - next.top;
      if (Math.abs(dy) > 0.5) {
        el.animate(
          [{ transform: `translateY(${dy}px)` }, { transform: 'translateY(0)' }],
          { duration: 380, easing: 'cubic-bezier(0.4,0,0.2,1)' },
        );
      }
    });
  }, [openIdx]);

  return (
    <div style={{ background: 'var(--v4-surface)', minHeight: '100vh' }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <section className="v4-section text-center" style={{ paddingBottom: 72 }}>
        <div className="v4-container">
          <span className="v4-eyebrow v4-animate">Features</span>
          <h1 className="v4-h1 v4-animate v4-d1" style={{ marginBottom: 20 }}>Alles was Sie brauchen</h1>
          <p className="v4-animate v4-d2" style={{ fontSize: 18, lineHeight: 1.65, color: 'var(--v4-body)', maxWidth: 600, margin: '0 auto' }}>
            bookingwulf gibt Ihnen alle Werkzeuge für moderne Direktbuchungen —
            ohne unnötige Komplexität, ohne versteckte Kosten.
          </p>
        </div>
      </section>

      {/* ── Grid ───────────────────────────────────────────────── */}
      <section style={{ paddingBottom: 100 }}>
        <div className="v4-container">
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 list-none m-0 p-0" style={{ gap: 14 }}>
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              const isOpen = openIdx === i;
              const idx = String(i + 1).padStart(2, '0');

              return (
                <li key={f.title} ref={(el) => { cardRefs.current[i] = el; }}>
                  <article
                    style={{
                      background: '#fff',
                      borderRadius: 14,
                      border: '1px solid var(--v4-border)',
                      boxShadow: isOpen ? '0 8px 28px rgba(0,0,0,0.10)' : '0 2px 10px rgba(0,0,0,0.06)',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      overflow: 'hidden',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.12)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = '';
                      e.currentTarget.style.boxShadow = isOpen ? '0 8px 28px rgba(0,0,0,0.10)' : '0 2px 10px rgba(0,0,0,0.06)';
                    }}
                  >
                    <button
                      onClick={() => toggle(i)}
                      aria-expanded={isOpen}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 14,
                        width: '100%', padding: '18px 20px',
                        background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                      }}
                    >
                      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--v4-muted)', minWidth: 22, userSelect: 'none' }}>
                        {idx}
                      </span>

                      <div style={{
                        width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: isOpen ? 'var(--v4-green)' : 'var(--v4-green-light)',
                        transition: 'background 0.25s ease',
                      }}>
                        <Icon size={19} strokeWidth={1.75} style={{ color: isOpen ? '#fff' : 'var(--v4-green)', transition: 'color 0.25s ease' }} aria-hidden />
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--v4-green)', marginBottom: 1 }}>
                          {f.label}
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--v4-navy)', lineHeight: 1.25, marginBottom: 2 }}>
                          {f.title}
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--v4-body)', lineHeight: 1.5 }}>
                          {f.short}
                        </div>
                      </div>

                      <span
                        aria-hidden
                        style={{
                          width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                          border: `1.5px solid ${isOpen ? 'var(--v4-green)' : 'var(--v4-border)'}`,
                          background: isOpen ? 'var(--v4-green)' : 'transparent',
                          color: isOpen ? '#fff' : 'var(--v4-muted)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 17, fontWeight: 300, lineHeight: 1,
                          transition: 'background 0.25s ease, border-color 0.25s ease, color 0.25s ease, transform 0.3s ease',
                          transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                          userSelect: 'none',
                        }}
                      >
                        +
                      </span>
                    </button>

                    <div
                      aria-hidden={!isOpen}
                      style={{
                        maxHeight: isOpen ? 500 : 0,
                        opacity: isOpen ? 1 : 0,
                        overflow: 'hidden',
                        transition: 'max-height 0.38s cubic-bezier(0.4,0,0.2,1), opacity 0.28s ease',
                      }}
                    >
                      <div style={{
                        margin: '0 20px 18px',
                        padding: '14px 16px',
                        borderRadius: 10,
                        background: 'var(--v4-green-light)',
                        border: '1px solid var(--v4-green-border)',
                      }}>
                        <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--v4-body)', margin: 0, marginBottom: f.bullets ? 12 : 0 }}>
                          {f.long}
                        </p>
                        {f.bullets && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {f.bullets.map((b) => (
                              <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--v4-navy)', fontWeight: 500 }}>
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--v4-green)', flexShrink: 0 }} aria-hidden />
                                {b}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────── */}
      <section className="v4-grain" style={{ background: 'var(--v4-navy)', paddingTop: 80, paddingBottom: 80 }}>
        <div className="v4-container text-center">
          <h2 className="v4-h2 v4-animate" style={{ color: '#fff', marginBottom: 12 }}>Bereit loszulegen?</h2>
          <p className="v4-animate v4-d1" style={{ fontSize: 17, color: 'rgba(255,255,255,0.65)', marginBottom: 32 }}>
            14 Tage kostenlos testen — keine Kreditkarte, keine Bindung.
          </p>
          <div className="flex flex-wrap justify-center gap-3 v4-animate v4-d2">
            <Link href="/register" className="v4-btn v4-btn-primary">Kostenlos starten</Link>
            <Link href="/v4/preise" className="v4-btn v4-btn-ghost-white">Preise ansehen →</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
