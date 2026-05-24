'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useV4Animate } from '../_components/useV4Animate';
import {
  BotMessageSquare, Building2, Calendar, Palette, LayoutGrid, RefreshCw, ToggleLeft,
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
    short: 'Beliebig viele Apartments — jede Einheit mit eigenen Preisen, Fotos und Ausstattung. Saisontarife und Aufschläge pro Apartment konfigurierbar.',
    long: 'Lege jede Einheit mit eigenem Namen, eigenen Fotos, Ausstattungsmerkmalen und Preisstruktur an. Saisontarife, Wochenend-Zuschläge und Mindestaufenthalte sind pro Apartment konfigurierbar. Neue Einheiten sind in Minuten eingerichtet — ohne technisches Wissen.',
    bullets: ['Eigene Bilder & Beschreibung pro Einheit', 'Individuelle Preissaisons & Aufschläge', 'Separate Verfügbarkeitskalender'],
  },
  {
    icon: Calendar, label: 'Kalender',
    title: 'Live-Verfügbarkeit',
    short: 'Welche Daten frei oder belegt sind — in Echtzeit, ohne manuelles Nachpflegen.',
    long: 'Der Kalender zeigt sofort, welche Daten frei oder belegt sind — ohne manuelles Nachpflegen. Sperrzeiten können per Klick gesetzt werden, Pufferzeiten zwischen Buchungen verhindern Überschneidungen automatisch.',
    bullets: ['Manuelle Blockierungen', 'Pufferzeiten konfigurierbar', 'iCal-Export für externe Kalender'],
  },
  {
    icon: Palette, label: 'Design',
    title: 'Individuelles Branding',
    short: 'Das Widget übernimmt deine Primärfarbe, Button-Stil und Schriftart. Kein fremdes Logo, kein bookingwulf-Branding — deine Gäste merken nicht, dass sie ein externes System nutzen.',
    long: 'Das Buchungswidget übernimmt deine Primärfarbe, deinen Button-Stil und deine Schriftart — so fügt es sich nahtlos in jede Website ein. Kein bookingwulf-Branding sichtbar.',
    bullets: ['Eigene Primärfarbe & Akzente', 'Button-Radius & Schrift anpassbar', 'Kein fremdes Logo im Widget'],
  },
  {
    icon: LayoutGrid, label: 'Übersicht',
    title: 'Zimmerplan',
    short: 'Gantt-Ansicht aller Einheiten: Buchungen auf einen Blick, Zeiträume per Drag erstellen, CSV-Export inklusive.',
    long: 'Die Gantt-ähnliche Monatsansicht zeigt alle Einheiten nebeneinander. Zeiträume lassen sich per Drag erstellen, Reservierungen als CSV exportieren.',
    bullets: ['Monatsansicht aller Einheiten', 'Zeiträume per Drag erstellen', 'CSV-Export'],
  },
  {
    icon: RefreshCw, label: 'Integration',
    title: 'Airbnb & Booking.com Sync',
    short: 'Buchungen von allen großen Portalen laufen automatisch zusammen — keine Doppelbuchungen.',
    long: 'Über den Beds24 Channel Manager werden Buchungen von Airbnb, Booking.com und anderen Portalen in Echtzeit gespiegelt — und umgekehrt. Kein manuelles Übertragen, keine Doppelbuchungen.',
    bullets: ['Airbnb, Booking.com, Expedia u. v. m.', 'Beds24-Account nötig', 'Bidirektionaler Sync in Echtzeit'],
  },
  {
    icon: ToggleLeft, label: 'Widget',
    title: 'Doppelt einsetzbar',
    short: 'Verbindliche Buchung oder Anfrage-Formular — oder beides gleichzeitig, pro Apartment konfigurierbar. Gäste sehen sofort, ob sie direkt buchen oder eine Anfrage stellen können.',
    long: 'bookingwulf funktioniert wahlweise als verbindliches Buchungssystem oder als Anfrage-Formular — oder beides gleichzeitig, je nach Apartment. Gäste sehen im Widget direkt, ob sie sofort buchen oder eine Anfrage stellen.',
    bullets: ['Modus pro Apartment wählbar', 'Anfragen mit Angebots-E-Mail', 'Buchungsbestätigung automatisch', 'Keine separate Software nötig'],
  },
  {
    icon: ClipboardList, label: 'Admin',
    title: 'Buchungsverwaltung',
    short: 'Status-Workflow von Neu bis Abgereist, Filter nach Zeitraum und Apartment, CSV-Export für die Buchhaltung — alles in einem übersichtlichen Dashboard.',
    long: 'Das Admin-Dashboard listet alle Buchungen und Anfragen mit Status-Workflow: Neu → Angebot → Bestätigt → Abgereist. Filter nach Zeitraum, Apartment oder Status, CSV-Export inklusive.',
    bullets: ['Status-Workflow mit E-Mail-Auslöser', 'Filter & Suche', 'CSV-Export'],
  },
  {
    icon: TrendingDown, label: 'Preise',
    title: 'Dynamic Pricing',
    short: 'Last-Minute-Rabatte, Langzeit-Boni, Wochenend-Aufschläge — greifen automatisch nach Ihren Regeln.',
    long: 'Konfiguriere Regeln, die automatisch greifen: Last-Minute-Rabatt ab 3 Tagen vor Anreise, Langzeit-Rabatt ab 7 Nächten, Wochenend-Aufschlag, Mindestaufenthalt je Saison.',
    bullets: ['Last-Minute & Langzeit-Rabatte', 'Saison-Mindestaufenthalte', 'Wochenend-Aufschläge'],
  },
  {
    icon: Code2, label: 'Setup',
    title: 'Einbau in 1 Minute',
    short: 'Ein Script-Tag, fertig. Funktioniert mit WordPress, Framer, Wix und jedem CMS.',
    long: 'Kopiere ein einzelnes Script-Tag auf deine Website — das Widget lädt sich selbst, passt sich dem Layout an und ist sofort buchbar. Funktioniert mit WordPress, Framer, Wix, Squarespace und jedem anderen CMS.',
    bullets: ['WordPress, Framer, Wix, Squarespace', 'Responsive für alle Bildschirmgrößen', 'Updates automatisch, kein Re-Embed'],
  },
  {
    icon: Globe, label: 'Sprachen',
    title: 'Mehrsprachige Kommunikation',
    short: 'Bestätigungen, Angebote und alle Gäste-E-Mails werden automatisch in der Sprache des Gastes verschickt — 9 Sprachen, keine manuelle Auswahl nötig.',
    long: 'bookingwulf erkennt die Browser-Sprache des Gastes und sendet Bestätigungs- und Angebots-E-Mails automatisch in der passenden Sprache. Alle E-Mail-Texte sind vollständig anpassbar.',
    bullets: ['DE, EN, FR, IT, ES, NL, HR, PL, CS', 'Automatische Spracherkennung', 'Alle Texte individuell anpassbar'],
  },
  {
    icon: BotMessageSquare, label: 'KI',
    title: 'Gast-Chatbot',
    short: 'KI-Assistent auf deiner Website — beantwortet Fragen, empfiehlt Apartments und erstellt Buchungslinks. Rund um die Uhr, ohne Aufwand.',
    long: 'Ein einzelner Script-Tag genügt: Der Chatbot liest den Inhalt deiner Website ein und kennt damit Lage, Storno, Ausstattung und alles Weitere. Er empfiehlt das passende Apartment kontextabhängig (Familie, Paar, Wellness, Budget) und generiert am Ende einen vorausgefüllten Buchungslink direkt im Chat.',
    bullets: ['Verfügbarkeit & Preise in Echtzeit', 'Extras & Upsells passend zum Kontext', 'Buchungslink direkt im Chat', 'Name, Farbe & Avatar individuell konfigurierbar'],
  },
  {
    icon: Lock, label: 'Smart Home',
    title: 'Nuki-Integration',
    short: 'Nuki-Schloss verbinden, fertig. Zugangscode wird automatisch generiert und dem Gast angezeigt.',
    long: 'Verbinde dein Nuki-Smart-Lock mit bookingwulf: Nach Buchungsbestätigung wird automatisch ein temporärer Zugangscode generiert und dem Gast in der Gäste-Lounge angezeigt.',
    bullets: ['Automatischer Code bei Buchung', 'Code gültig nur für Aufenthaltszeitraum', 'Anzeige in der Gäste-Lounge'],
  },
  {
    icon: ShieldCheck, label: 'Datenschutz',
    title: 'Alle Daten in der EU',
    short: 'Alle Daten auf EU-Servern in Amsterdam — DSGVO-konform, kein Drittland-Transfer, AVV auf Anfrage.',
    long: 'bookingwulf läuft ausschließlich auf Servern in der EU (Amsterdam). Alle Daten bleiben innerhalb des europäischen Rechtsraums. Auf Wunsch stellen wir einen Auftragsverarbeitungsvertrag (AVV) bereit.',
    bullets: ['Hosting: EU (Railway, Amsterdam)', 'Daten bleiben im EU-Rechtsraum', 'AVV auf Anfrage'],
  },
];

export default function FeaturesPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  useV4Animate();

  function toggle(i: number) {
    setOpenIdx((prev) => (prev === i ? null : i));
  }

  function renderCard(i: number) {
    const f = FEATURES[i];
    const Icon = f.icon;
    const isOpen = openIdx === i;
    const idx = String(i + 1).padStart(2, '0');
    return (
      <li key={f.title} style={{ display: 'flex' }}>
        <article
          style={{
            background: '#172442',
            borderRadius: 18,
            border: `1.5px solid ${isOpen ? 'rgba(144,204,224,0.4)' : 'rgba(255,255,255,0.1)'}`,
            boxShadow: isOpen ? '0 8px 32px rgba(16,139,169,0.2)' : '0 2px 12px rgba(0,0,0,0.2)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
            overflow: 'hidden',
            position: 'relative',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = isOpen ? '0 12px 36px rgba(16,139,169,0.28)' : '0 10px 30px rgba(0,0,0,0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = '';
            e.currentTarget.style.boxShadow = isOpen ? '0 8px 32px rgba(16,139,169,0.2)' : '0 2px 12px rgba(0,0,0,0.2)';
          }}
        >
          <span aria-hidden style={{
            position: 'absolute', bottom: 14, right: 18,
            fontSize: 72, fontWeight: 800, lineHeight: 1,
            color: '#fff', opacity: 0.05,
            userSelect: 'none', pointerEvents: 'none',
          }}>{idx}</span>

          <button
            onClick={() => toggle(i)}
            aria-expanded={isOpen}
            style={{
              display: 'flex', alignItems: 'flex-start', gap: 16,
              width: '100%', padding: '24px 24px 20px',
              background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
              position: 'relative', flex: 1,
            }}
          >
            <div style={{
              width: 48, height: 48, borderRadius: 14, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: isOpen ? 'var(--v4-green)' : 'var(--v4-green-light)',
              transition: 'background 0.25s ease',
              marginTop: 2,
            }}>
              <Icon size={22} strokeWidth={1.75} style={{ color: isOpen ? '#fff' : 'var(--v4-green)', transition: 'color 0.25s ease' }} aria-hidden />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--v4-green)', marginBottom: 4 }}>
                {f.label}
              </div>
              <div style={{ fontSize: 17, fontWeight: 700, color: '#fff', lineHeight: 1.25, marginBottom: 6 }}>
                {f.title}
              </div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>
                {f.short}
              </div>
            </div>

            <span
              aria-hidden
              style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                border: `1.5px solid ${isOpen ? 'var(--v4-green)' : 'rgba(255,255,255,0.2)'}`,
                background: isOpen ? 'var(--v4-green)' : 'transparent',
                color: isOpen ? '#fff' : 'rgba(255,255,255,0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, fontWeight: 300, lineHeight: 1,
                transition: 'background 0.25s ease, border-color 0.25s ease, color 0.25s ease, transform 0.3s ease',
                transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                userSelect: 'none', marginTop: 10,
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
              margin: '0 24px 22px',
              padding: '16px 18px',
              borderRadius: 12,
              background: 'var(--v4-green-light)',
              border: '1px solid var(--v4-green-border)',
            }}>
              <p style={{ fontSize: 14, lineHeight: 1.75, color: 'var(--v4-body)', margin: 0, marginBottom: f.bullets ? 14 : 0 }}>
                {f.long}
              </p>
              {f.bullets && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {f.bullets.map((b) => (
                    <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 13, color: 'var(--v4-navy)', fontWeight: 500 }}>
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
  }

  return (
    <div style={{ background: 'var(--v4-surface)', minHeight: '100vh' }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <section className="v4-section text-center" style={{ paddingBottom: 72 }}>
        <div className="v4-container">
          <span className="v4-eyebrow v4-animate">Features</span>
          <h1 className="v4-h1 v4-animate v4-d1" style={{ marginBottom: 20 }}>Alles was du brauchst</h1>
          <p className="v4-animate v4-d2" style={{ fontSize: 18, lineHeight: 1.65, color: 'var(--v4-body)', maxWidth: 600, margin: '0 auto' }}>
            bookingwulf gibt dir alle Werkzeuge für moderne Direktbuchungen —
            ohne unnötige Komplexität, ohne versteckte Kosten.
          </p>
        </div>
      </section>

      {/* ── Grid ───────────────────────────────────────────────── */}
      <section style={{ paddingBottom: 100 }}>
        <div className="v4-container">
          {/* Mobile: single column, natural order */}
          <ul className="flex flex-col sm:hidden list-none m-0 p-0" style={{ gap: 16 }}>
            {FEATURES.map((_, i) => renderCard(i))}
          </ul>
          {/* Desktop: two independent masonry columns */}
          <div className="hidden sm:flex" style={{ gap: 16, alignItems: 'flex-start' }}>
            <ul className="flex flex-col list-none m-0 p-0" style={{ flex: 1, gap: 16 }}>
              {FEATURES.map((_, i) => i % 2 === 0 ? renderCard(i) : null)}
            </ul>
            <ul className="flex flex-col list-none m-0 p-0" style={{ flex: 1, gap: 16 }}>
              {FEATURES.map((_, i) => i % 2 === 1 ? renderCard(i) : null)}
            </ul>
          </div>
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
            <Link href="/preise" className="v4-btn v4-btn-ghost-white">Preise ansehen →</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
