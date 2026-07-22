'use client';

import { useState, useRef, createContext, useContext } from 'react';

const NavigateCtx = createContext<(id: string) => void>(() => {});

const sections = [
  { id: 'uebersicht',    title: 'Übersicht',            plan: null,       content: UebersichtSection },
  { id: 'buchungen',     title: 'Buchungen & Anfragen',  plan: null,       content: BuchungenSection },
  { id: 'kalender',      title: 'Kalender',              plan: null,       content: KalenderSection },
  { id: 'zimmerplan',   title: 'Zimmerplan',            plan: null,       content: ZimmerplanSection },
  { id: 'housekeeping', title: 'Housekeeping',          plan: 'Pro',      content: HousekeepingSection },
  { id: 'analytics',     title: 'Analytics',             plan: 'Business', content: AnalyticsSection },
  { id: 'apartments',    title: 'Apartments verwalten',  plan: null,       content: ApartmentsSection },
  { id: 'preise',        title: 'Preisanpassungen',       plan: null,       content: PreiseSection },
  { id: 'sperrzeiten',   title: 'Sperrzeiten',           plan: null,       content: SperrzeitenSection },
  { id: 'extras',        title: 'Zusatzleistungen',      plan: 'Pro',      content: ExtrasSection },
  { id: 'gasteportal',   title: 'Gäste-Lounge',          plan: null,       content: GastePortalSection },
  { id: 'emails',        title: 'E-Mails & Check-in',    plan: null,       content: EmailsSection },
  { id: 'einstellungen', title: 'Widget & Design',         plan: null,      content: EinstellungenSection },
  { id: 'zahlungen',     title: 'Zahlungsarten',           plan: null,       content: ZahlungenSection },
  { id: 'gutscheine',    title: 'Gutscheine',             plan: 'Pro',      content: GutscheineSection },
  { id: 'abonnement',    title: 'Abonnement',            plan: null,       content: AbonnementSection },
  { id: 'nuki',          title: 'Schlüsselloses Einchecken', plan: 'Pro',   content: NukiSection },
  { id: 'beds24',        title: 'Beds24 Channel Manager', plan: 'Pro',    content: Beds24Section },
  { id: 'chatbot',       title: 'Gast-Chatbot',           plan: null,       content: ChatbotSection },
  { id: 'assistent',     title: 'Hasky',                  plan: 'Pro',      content: AssistentSection },
  { id: 'einbindung',    title: 'Widget einbinden',      plan: null,       content: EinbindungSection },
];

export default function HelpPage() {
  const [active, setActive] = useState('uebersicht');
  const contentRef = useRef<HTMLDivElement>(null);
  const mobileNavRef = useRef<HTMLDivElement>(null);
  const current = sections.find((s) => s.id === active)!;
  const Content = current.content;

  function navigate(id: string) {
    setActive(id);
    setTimeout(() => {
      const target = mobileNavRef.current ?? contentRef.current;
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  }

  return (
    <main className="admin-page" style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>
      <h1 style={{ margin: 0 }}>Handbuch</h1>
      <p className="page-subtitle" style={{ marginBottom: 32 }}>
        Alles was du wissen musst, um Bookingwulf optimal zu nutzen.
      </p>

      {/* Mobile: horizontal scrollable nav */}
      <div className="help-mobile-nav" ref={mobileNavRef}>
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => navigate(s.id)}
            style={{
              flexShrink: 0,
              padding: '6px 12px',
              borderRadius: 999,
              border: `1px solid ${active === s.id ? 'var(--text-primary)' : 'var(--border)'}`,
              background: active === s.id ? 'var(--text-primary)' : 'var(--surface)',
              color: active === s.id ? 'var(--surface)' : 'var(--text-muted)',
              fontWeight: active === s.id ? 600 : 400,
              fontSize: 13,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {s.title}{s.plan ? ` (${s.plan})` : ''}
          </button>
        ))}
      </div>

      <div className="help-layout">
        {/* Desktop sidebar nav */}
        <nav className="help-sidebar" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '12px 8px', alignSelf: 'start' }}>
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => navigate(s.id)}
              style={{
                textAlign: 'left',
                padding: '8px 12px',
                borderRadius: 8,
                border: 'none',
                background: active === s.id ? 'var(--surface-3)' : 'transparent',
                color: active === s.id ? 'var(--text-primary)' : 'var(--text-muted)',
                fontWeight: active === s.id ? 600 : 400,
                fontSize: 13,
                cursor: 'pointer',
                transition: 'background 0.15s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 6,
              }}
            >
              <span>{s.title}</span>
              {s.plan && (
                <span style={{
                  fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 4,
                  background: s.plan === 'Business' ? 'var(--status-pending-bg)' : '#ede9fe',
                  color: s.plan === 'Business' ? 'var(--status-pending-text)' : '#5b21b6',
                  letterSpacing: '0.04em', flexShrink: 0,
                }}>
                  {s.plan.toUpperCase()}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div ref={contentRef} className="help-content">
          <NavigateCtx.Provider value={navigate}>
            <Content />
          </NavigateCtx.Provider>
        </div>
      </div>

    </main>
  );
}

/* ─── Shared components ────────────────────────────────────── */

function H2({ children }: { children: React.ReactNode }) {
  return <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 8px', color: 'var(--text-primary)' }}>{children}</h2>;
}
function H3({ children }: { children: React.ReactNode }) {
  return <h3 style={{ fontSize: 15, fontWeight: 600, margin: '24px 0 6px', color: 'var(--text-primary)' }}>{children}</h3>;
}
function P({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-muted)', margin: '0 0 12px' }}>{children}</p>;
}
function Note({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--status-booked-bg)', border: '1px solid var(--primitive-green-100)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--status-booked-text)', margin: '12px 0' }}>
      {children}
    </div>
  );
}
function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--status-new-bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--status-new-text)', margin: '12px 0' }}>
      {children}
    </div>
  );
}
function ExtLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', fontWeight: 600, textDecoration: 'underline', textDecorationColor: 'var(--text-disabled)', textUnderlineOffset: 3 }}>
      {children}
    </a>
  );
}

function InternalLink({ id, children }: { id: string; children: React.ReactNode }) {
  const navigate = useContext(NavigateCtx);
  return (
    <button
      onClick={() => navigate(id)}
      style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', fontSize: 'inherit', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline dashed', textDecorationColor: 'var(--text-disabled)', textUnderlineOffset: 3 }}
    >
      {children}
    </button>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code style={{ background: 'var(--surface-3)', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 6px', fontSize: 12, fontFamily: 'monospace', color: 'var(--text-primary)' }}>
      {children}
    </code>
  );
}
function PlanNote({ plan, feature }: { plan: 'Pro' | 'Business'; feature?: string }) {
  const isPro = plan === 'Pro';
  return (
    <div style={{
      background: isPro ? '#f5f3ff' : 'var(--status-pending-bg)',
      border: `1px solid ${isPro ? '#ddd6fe' : 'var(--border)'}`,
      borderRadius: 8, padding: '10px 14px', fontSize: 13,
      color: isPro ? '#5b21b6' : 'var(--status-pending-text)', margin: '12px 0',
      display: 'flex', alignItems: 'center', gap: 8,
    }}>
      <span style={{ fontWeight: 700, padding: '1px 6px', borderRadius: 4, background: isPro ? '#ede9fe' : 'var(--status-pending-bg)', fontSize: 11 }}>
        {plan}
      </span>
      {feature
        ? <span>{feature} ist im <strong>{plan}</strong>-Plan enthalten.</span>
        : <span>Dieser Bereich ist ab dem <strong>{plan}</strong>-Plan verfügbar.</span>}
    </div>
  );
}
function CodeBlock({ children }: { children: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div style={{ position: 'relative', margin: '12px 0' }}>
      <pre style={{ background: '#1e293b', color: '#e2e8f0', borderRadius: 10, padding: '16px 20px', fontSize: 12, fontFamily: 'monospace', overflowX: 'auto', margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
        {children}
      </pre>
      <button
        onClick={() => { navigator.clipboard.writeText(children); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
        style={{ position: 'absolute', top: 10, right: 10, padding: '4px 10px', borderRadius: 6, border: 'none', background: copied ? '#22c55e' : '#334155', color: '#fff', fontSize: 11, cursor: 'pointer' }}
      >
        {copied ? 'Kopiert!' : 'Kopieren'}
      </button>
    </div>
  );
}
function Step({ num, title, children }: { num: number; title: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
      <div style={{ flexShrink: 0, width: 28, height: 28, borderRadius: '50%', background: 'var(--text-primary)', color: 'var(--surface)', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {num}
      </div>
      <div>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>{children}</div>
      </div>
    </div>
  );
}

/* ─── Sections ─────────────────────────────────────────────── */

function UebersichtSection() {
  return (
    <div>
      <H2>Übersicht</H2>
      <P>
        Die Übersicht ist die Startseite des Admin-Bereichs. Sie zeigt die wichtigsten Kennzahlen
        des aktuellen Monats auf einen Blick.
      </P>
      <H3>Was wird angezeigt?</H3>
      <div style={{ display: 'grid', gap: 8, margin: '12px 0' }}>
        {[
          { label: 'Neue Anfragen', desc: 'Anzahl der eingegangenen Anfragen im aktuellen Monat.' },
          { label: 'Bestätigte Buchungen', desc: 'Anfragen die auf „Gebucht" gesetzt wurden.' },
          { label: 'Aktuelle Anfragen', desc: 'Die letzten 5 Anfragen mit Status — direkt verlinkt.' },
          { label: 'Schnellzugriff', desc: 'Links zu den wichtigsten Bereichen der Verwaltung.' },
        ].map((i) => (
          <div key={i.label} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border-2)' }}>
            <span style={{ fontSize: 13, fontWeight: 600, minWidth: 180, color: 'var(--text-primary)' }}>{i.label}</span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{i.desc}</span>
          </div>
        ))}
      </div>
      <Tip>
        <strong>Tipp:</strong> Die Übersicht eignet sich als täglicher Ausgangspunkt — neue Anfragen
        sind sofort sichtbar ohne erst zur Anfragen-Liste navigieren zu müssen.
      </Tip>
    </div>
  );
}

function BuchungenSection() {
  return (
    <div>
      <H2>Buchungen & Anfragen</H2>
      <P>
        Alle Anfragen, die über das Widget eingehen, erscheinen unter <strong>Anfragen</strong>.
        Von hier aus kannst du Anfragen beantworten, bestätigen oder stornieren.
      </P>
      <H3>Status einer Anfrage</H3>
      <div style={{ display: 'grid', gap: 8, margin: '12px 0' }}>
        {[
          { label: 'Neu',          color: '#f4f4f4', text: '#555',    desc: 'Anfrage eingegangen, noch nicht bearbeitet.' },
          { label: 'Beantwortet',  color: '#eaf2ff', text: '#2457a6', desc: 'Du hast geantwortet — keine automatische Mail wird ausgelöst.' },
          { label: 'Gebucht',      color: '#e8f5e9', text: '#256029', desc: 'Buchung bestätigt. Gast erhält automatisch eine Bestätigungsmail.' },
          { label: 'Storniert',    color: '#fdecec', text: '#a63b3b', desc: 'Buchung storniert. Gast erhält automatisch eine Stornomail.' },
        ].map((s) => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ padding: '3px 10px', borderRadius: 6, background: s.color, color: s.text, fontSize: 12, fontWeight: 700, flexShrink: 0, minWidth: 100 }}>
              {s.label}
            </span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{s.desc}</span>
          </div>
        ))}
      </div>
      <H3>Nachricht senden</H3>
      <PlanNote plan="Pro" feature="Direktnachrichten an Gäste" />
      <P>
        In der Buchungsdetailansicht kannst du dem Gast eine individuelle Nachricht schicken.
        Diese wird als E-Mail in der gewählten Sprache des Gastes versendet.
      </P>
      <H3>Sprache pro Buchung</H3>
      <P>
        Die Kommunikationssprache kann pro Buchung in der Detailansicht eingestellt werden.
        Unterstützte Sprachen: Deutsch, Englisch, Italienisch, Französisch, Niederländisch,
        Spanisch, Polnisch, Tschechisch, Russisch. Sie wird beim Eingang automatisch aus der
        Browser-Sprache des Gastes ermittelt und kann jederzeit manuell geändert werden.
      </P>
      <Tip>
        <strong>Tipp:</strong> Setze den Status auf <strong>„Beantwortet"</strong> wenn du per
        E-Mail oder Telefon direkt geantwortet hast — so behältst du den Überblick ohne eine
        zusätzliche automatische Mail auszulösen.
      </Tip>
      <H3>Buchhaltungsexport (CSV)</H3>
      <P>
        Über den Button <strong>„CSV Export"</strong> oben rechts auf der Anfragen-Seite kannst du
        alle bestätigten Buchungen als CSV-Datei herunterladen — geeignet für deinen Steuerberater
        oder die Übergabe an DATEV.
      </P>
      <P>
        Der Export filtert nach <strong>Abreisedatum</strong> (= steuerliches Leistungsdatum).
        Optional können stornierte Buchungen eingeschlossen werden.
      </P>
      <P>
        Die CSV enthält pro Buchung: Buchungsnummer, Buchungs- und Abreisedatum, Gastdaten,
        Apartment, Zimmerpreis brutto/netto/MwSt., Reinigung brutto/netto/MwSt., Extras,
        Ortstaxe und Gesamtbetrag.
      </P>
      <P>
        Die MwSt.-Sätze (z.B. AT: Zimmer 10%, Reinigung 20%) hinterlegst du einmalig unter
        <strong> Preisanpassungen → Steuer / Buchhaltung</strong>.
      </P>
      <Tip>
        <strong>Hinweis:</strong> Buchungen, die vor dem Mai 2026 erstellt wurden, enthalten
        keinen gespeicherten Preissnapshot — Zimmerpreis und Ortstaxe erscheinen dort als 0,00.
        Neue Buchungen werden vollständig mit allen Positionen exportiert.
      </Tip>
    </div>
  );
}

function KalenderSection() {
  return (
    <div>
      <H2>Kalender</H2>
      <P>
        Der Kalender gibt eine visuelle Monatsübersicht aller aktiven Anfragen und Buchungen.
        Stornierte Buchungen werden nicht angezeigt.
      </P>
      <H3>Ansicht</H3>
      <P>
        Jede Anfrage wird als farbiger Balken im jeweiligen Zeitraum (Anreise bis Abreise) dargestellt.
        Die Farbe entspricht dem Status:
      </P>
      <div style={{ display: 'grid', gap: 6, margin: '8px 0 16px' }}>
        {[
          { color: '#3b82f6', label: 'Blau – Neu' },
          { color: '#f59e0b', label: 'Gelb – Beantwortet' },
          { color: '#10b981', label: 'Grün – Gebucht' },
        ].map((c) => (
          <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 12, height: 12, borderRadius: 2, background: c.color, flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{c.label}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gap: 6, margin: '8px 0 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 12, height: 12, borderRadius: 2, background: '#ef4444', flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Rot – Sperrzeit</span>
        </div>
      </div>
      <H3>Zeitraum per Drag anlegen</H3>
      <P>
        Halte die Maustaste gedrückt und ziehe über mehrere Tage, um einen Zeitraum zu markieren.
        Nach dem Loslassen öffnet sich ein Formular zum direkten Anlegen von:
      </P>
      <ul style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7, paddingLeft: 20, margin: '6px 0 12px' }}>
        <li><strong style={{ color: '#ef4444' }}>Sperrzeit</strong> – Apartment für einen Zeitraum sperren</li>
        <li><strong style={{ color: '#3b82f6' }}>Preiszeitraum</strong> – Saisonalen Preis festlegen</li>
        <li><strong style={{ color: '#10b981' }}>Buchung</strong> – Manuelle Buchung erfassen</li>
      </ul>
      <P>Start- und Enddatum sind im Formular editierbar, falls der gewünschte Zeitraum über einen Monatswechsel hinausgeht.</P>
      <H3>Navigation</H3>
      <P>
        Mit den Pfeilen links und rechts wechselst du den Monat. Der Button <strong>„Heute"</strong> bringt
        dich direkt zum aktuellen Monat zurück.
      </P>
      <H3>KPI-Leiste</H3>
      <P>
        Oberhalb des Kalenders werden Anfragen, bestätigte Buchungen, gebuchte Nächte und
        Stornierungen für den gewählten Monat zusammengefasst.
      </P>
      <Tip>
        <strong>Tipp:</strong> Klicke auf einen Eintrag im Kalender um direkt zur entsprechenden Übersicht zu gelangen.
      </Tip>
    </div>
  );
}

function ZimmerplanSection() {
  return (
    <div>
      <H2>Zimmerplan</H2>
      <P>
        Der Zimmerplan bietet zwei Ansichten — umschaltbar über den Toggle oben rechts.
      </P>

      <H3>Belegungsplan (Standard)</H3>
      <P>
        Die Hauptansicht zeigt alle Apartments als monatliches Gantt-Diagramm: jede Zeile ein
        Apartment, jede Spalte ein Tag. Buchungen erscheinen als <strong style={{ color: '#166534' }}>grüne Balken</strong>,
        Sperrzeiten je nach Herkunft farbig (Airbnb rot, Booking.com blau, manuell amber).
        Mit den Pfeilen links wechselst du den Monat, <strong>„Heute"</strong> springt zum aktuellen Monat.
      </P>
      <H3>Sperrzeiten & Buchungen anlegen</H3>
      <P>
        Ziehe in einer Apartment-Zeile mit gedrückter Maustaste einen Zeitraum auf — die
        markierten Tage werden lila hervorgehoben. Nach dem Loslassen öffnet sich ein Formular
        mit dem Apartment und den Daten bereits vorausgefüllt. Wähle den Typ:
      </P>
      <ul style={{ margin: '6px 0 14px', paddingLeft: 20, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7 }}>
        <li><strong>Sperrzeit</strong> — Eigennutzung oder sonstiger Block</li>
        <li><strong>Preiszeitraum</strong> — Saisonpreis für diesen Zeitraum <span style={{ fontSize: 11, background: '#7c3aed', color: '#fff', borderRadius: 4, padding: '1px 6px', fontWeight: 700, marginLeft: 4 }}>Pro</span></li>
        <li><strong>Buchung</strong> — manuelle Buchung direkt eintragen</li>
      </ul>
      <H3>Balken anklicken</H3>
      <P>
        Klick auf einen <strong>grünen Buchungsbalken</strong> öffnet ein Detail-Panel mit Link zur Anfrage.
        Klick auf einen <strong>Sperrzeit-Balken</strong> öffnet ein Bearbeitungsformular — Datum, Grund und
        Notiz können geändert oder die Sperrzeit gelöscht werden. iCal-synchronisierte Sperrzeiten
        (Airbnb, Booking.com) sind read-only und zeigen nur den Plattform-Badge.
      </P>

      <H3>Tagesansicht</H3>
      <P>
        Die zweite Ansicht zeigt den Belegungsstatus aller Apartments für einen bestimmten Tag
        als Karten-Grid — ideal für das tägliche Check-in-Management.
      </P>
      <div style={{ display: 'grid', gap: 6, margin: '8px 0 16px' }}>
        {[
          { color: '#86efac', bg: '#f0fdf4', label: 'Grün – Frei' },
          { color: '#fca5a5', bg: '#fff5f5', label: 'Rot – Belegt' },
          { color: '#fcd34d', bg: '#fffbeb', label: 'Gelb – Blockiert' },
        ].map((c) => (
          <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 14, height: 14, borderRadius: 3, background: c.bg, border: `2px solid ${c.color}`, flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{c.label}</span>
          </div>
        ))}
      </div>
      <P>
        Bei belegten Apartments werden Gastname, verbleibende Tage sowie Anreise- und Abreisedatum
        angezeigt. Fällt die Abreise auf den gewählten Tag, erscheint ein <strong>„Check-out heute"</strong>-Badge.
        Mit dem Datumsfeld oben rechts kannst du jeden Tag prüfen.
      </P>
    </div>
  );
}

function HousekeepingSection() {
  return (
    <div>
      <H2>Housekeeping</H2>
      <PlanNote plan="Pro" />
      <P>
        Reinigungsstatus und Checkliste je Apartment — direkt im bookingwulf-Admin, ganz ohne
        Beds24-Login. Ideal für Rezeption oder Reinigungspersonal, um auf einen Blick zu sehen,
        welche Apartments bereit für den nächsten Gast sind.
      </P>

      <H3>Status</H3>
      <div style={{ display: 'grid', gap: 6, margin: '8px 0 16px' }}>
        {[
          { color: '#86efac', bg: '#f0fdf4', label: 'Sauber – bereit für den nächsten Gast' },
          { color: '#fcd34d', bg: '#fffbeb', label: 'Reinigung nötig' },
          { color: '#fca5a5', bg: '#fff5f5', label: 'Reparatur nötig' },
        ].map((c) => (
          <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 14, height: 14, borderRadius: 3, background: c.bg, border: `2px solid ${c.color}`, flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{c.label}</span>
          </div>
        ))}
      </div>
      <P>
        Status per Klick auf das Dropdown neben dem Apartment-Namen ändern. Jede Karte lässt sich
        aufklappen (Klick auf Namen oder Pfeil) — darin: Checkliste, Notizen und Zeitpunkt der
        letzten Aktualisierung.
      </P>

      <H3>Checkliste</H3>
      <P>
        Beim Aufklappen einer Karte erscheint die Checkliste dieses Apartments zum Abhaken.
        Sind <strong>alle Punkte abgehakt</strong>, springt der Status automatisch auf „Sauber" —
        entfernst du danach wieder ein Häkchen, springt er automatisch zurück auf
        „Reinigung nötig".
      </P>
      <Tip>
        <strong>Checkliste anpassen:</strong> Welche Punkte pro Apartment abgefragt werden, legst
        du unter <strong>Verwaltung → Apartments → [Apartment] bearbeiten → Housekeeping</strong> fest
        (ein Punkt pro Zeile). Nicht auf der Housekeeping-Seite selbst — die zeigt nur die
        aktuelle Liste zum Abhaken.
      </Tip>

      <H3>Notizen</H3>
      <P>
        Freitextfeld pro Apartment, z.B. „Fenster klemmt" oder „Handtücher fehlen". Es gibt keinen
        Verlauf — eine neue Notiz überschreibt die alte, und sie bleibt (anders als die Checkliste)
        auch nach einer Statusänderung stehen, bis sie manuell geändert wird.
      </P>

      <H3>Belegungsanzeige</H3>
      <P>
        Unter dem Apartment-Namen zeigt ein farbiger Punkt den aktuellen Belegungsstatus:
        <strong> Frei</strong>, <strong>Belegt bis [Datum]</strong>, <strong>Check-out heute</strong> oder
        <strong> Belegt</strong> (bei einer manuellen Sperrzeit). Das hilft einzuordnen, ob „Sauber"
        bedeutet „bereit für den nächsten Gast" oder nur „war beim letzten Check-in sauber, Gast ist
        aber noch da".
      </P>

      <H3>Automatik bei Check-out</H3>
      <P>
        Täglich um 12:00 Uhr prüft ein automatischer Job, welche Apartments heute Check-out haben,
        und setzt deren Status von „Sauber" auf „Reinigung nötig" — die Checkliste wird dabei
        zurückgesetzt. Ein manuell gesetzter Status „Reparatur nötig" wird dabei nie überschrieben.
      </P>

      <H3>Sortierung</H3>
      <P>
        Oben rechts kannst du zwischen zwei Sortierungen wählen: <strong>Anlegezeitpunkt</strong>
        (Reihenfolge, in der die Apartments angelegt wurden) oder <strong>Status</strong> (Reparatur
        nötig zuerst, dann Reinigung nötig, dann Sauber — für den schnellen Überblick, wo
        Handlungsbedarf besteht).
      </P>
    </div>
  );
}

function AnalyticsSection() {
  return (
    <div>
      <H2>Analytics</H2>
      <PlanNote plan="Business" />
      <P>
        Analytics bietet eine detaillierte Auswertung aller Anfragen und Buchungen über einen
        wählbaren Zeitraum.
      </P>
      <H3>Zeitraum auswählen</H3>
      <P>
        Oben rechts kannst du den Auswertungszeitraum filtern: letzter Monat, 3 Monate, 6 Monate,
        12 Monate, 2 Jahre oder gesamter Zeitraum. Als Superadmin kann zusätzlich nach Hotel gefiltert werden.
      </P>
      <H3>Kennzahlen (KPIs)</H3>
      <div style={{ display: 'grid', gap: 6, margin: '8px 0 16px' }}>
        {[
          { label: 'Anfragen', desc: 'Gesamtzahl der Anfragen im gewählten Zeitraum.' },
          { label: 'Gebucht', desc: 'Bestätigte Buchungen.' },
          { label: 'Conversion', desc: 'Anteil der Anfragen die zu einer Buchung wurden.' },
          { label: 'Ø Nächte', desc: 'Durchschnittliche Aufenthaltsdauer.' },
          { label: 'Ø Gäste', desc: 'Durchschnittliche Gästeanzahl pro Anfrage.' },
          { label: 'Umsatz', desc: 'Geschätzter Gesamtumsatz (Apartment + Extras).' },
          { label: 'Ø Buchungswert', desc: 'Durchschnittlicher Wert pro Buchung.' },
        ].map((k) => (
          <div key={k.label} style={{ display: 'flex', gap: 10, padding: '6px 0', borderBottom: '1px solid var(--border-2)' }}>
            <span style={{ fontSize: 13, fontWeight: 600, minWidth: 140, color: 'var(--text-primary)' }}>{k.label}</span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{k.desc}</span>
          </div>
        ))}
      </div>
      <H3>Diagramme</H3>
      <P>
        Anfragen pro Monat (Balkendiagramm), Statusverteilung, Top-Apartments nach Anfragen,
        Auslastung pro Apartment, beliebteste Extras und Herkunftsländer der Gäste.
      </P>
    </div>
  );
}

function ApartmentsSection() {
  return (
    <div>
      <H2>Apartments verwalten</H2>
      <P>
        Unter <strong>Apartments</strong> legst du alle buchbaren Einheiten an — Zimmer,
        Appartements, Suiten oder Häuser.
      </P>
      <H3>Preis je Apartment</H3>
      <P>
        Kein Limit für die Anzahl der Apartments, in jedem Plan. Das erste Apartment ist in der
        Grundgebühr enthalten, jedes weitere kostet € 10/Monat (€ 9 bei Jahreszahlung) —
        unabhängig davon, welchen Plan du gewählt hast.
      </P>
      <H3>Apartment anlegen</H3>
      <Step num={1} title="Apartment hinzufügen">
        Gib Name, Beschreibung, maximale Personenanzahl und Basispreis pro Nacht ein.
      </Step>
      <Step num={2} title="Bilder hochladen">
        Lade ein oder mehrere Bilder hoch. Das erste Bild wird als Vorschaubild im Widget angezeigt.
      </Step>
      <Step num={3} title="Speichern">
        Das Apartment erscheint sofort im Widget auf deiner Website.
      </Step>
      <H3>Basispreis vs. Saisons</H3>
      <P>
        Der Basispreis gilt das ganze Jahr, sofern keine Preissaison für den jeweiligen Zeitraum
        definiert ist. Saisons haben immer Vorrang. Weitere Details unter <InternalLink id="preise">Preisanpassungen</InternalLink>.
      </P>

      <Note>
        <strong>Hinweis:</strong> Apartments können deaktiviert werden, ohne sie zu löschen.
        So bleiben historische Buchungsdaten erhalten.
      </Note>

      <H3>Kalender-Sync (iCal)</H3>
      <P>
        In der Detailansicht jedes Apartments findest du den Abschnitt <strong>Kalender-Sync</strong>.
        Damit lassen sich Verfügbarkeiten mit Airbnb, Booking.com und anderen Plattformen
        automatisch abgleichen — in beide Richtungen.
      </P>
      <div style={{ display: 'grid', gap: 10, margin: '12px 0 16px' }}>
        <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', marginBottom: 4 }}>Export-URL</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Eine eindeutige iCal-URL für das Apartment. Diese URL bei Airbnb oder Booking.com als
            importierten Kalender hinterlegen — so werden deine Buchungen dort automatisch als
            blockiert angezeigt.
          </div>
        </div>
        <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', marginBottom: 4 }}>Import-Feeds</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Die iCal-URL von Airbnb oder Booking.com eintragen. Buchungen von dort werden
            automatisch als Sperrzeiten übernommen und verhindern Doppelbuchungen.
            Mit <strong>„Jetzt syncen"</strong> kannst du den Abgleich manuell anstoßen.
          </div>
        </div>
      </div>
      <Tip>
        <strong>Tipp:</strong> Trage bei Airbnb unter <em>Kalender → Verfügbarkeit → Anderen
        Kalender importieren</em> die Export-URL ein, und umgekehrt die Airbnb-iCal-URL hier als
        Import-Feed — dann laufen beide Richtungen synchron.
      </Tip>

    </div>
  );
}

function PreiseSection() {
  return (
    <div>
      <H2>Preisanpassungen</H2>
      <P>
        Unter <strong>Preisanpassungen</strong> verwaltest du saisonale Preise, Abgaben, Kinderpreise
        und automatische Rabatte — alles auf einer Seite.
      </P>

      <H3>Preiszeiträume <span style={{ fontSize: 12, fontWeight: 500, color: '#7c3aed', background: '#ede9fe', padding: '2px 8px', borderRadius: 6, marginLeft: 6 }}>Pro</span></H3>
      <P>Für bestimmte Zeiträume abweichende Preise pro Nacht festlegen — z.B. für Hochsaison, Weihnachten oder Messen.</P>
      <Step num={1} title="Zeitraum wählen">
        Gib Start- und Enddatum der Saison ein.
      </Step>
      <Step num={2} title="Preis pro Nacht festlegen">
        Dieser Preis gilt für alle Apartments in diesem Zeitraum, sofern kein apartmentspezifischer
        Preis angegeben ist.
      </Step>
      <Step num={3} title="Mindestaufenthalt (optional)">
        Du kannst pro Saison eine Mindestanzahl an Nächten festlegen. Apartments mit zu kurzem
        Aufenthalt werden im Widget als nicht buchbar markiert.
      </Step>
      <Step num={4} title="Speichern">
        Die Saison ist sofort aktiv. Bei Überschneidungen gilt die spezifischere Saison.
      </Step>

      <H3>Ortstaxe / Kurtaxe</H3>
      <P>
        Wird automatisch zur Buchungssumme addiert und im Widget sowie in Bestätigungs-E-Mails
        separat ausgewiesen. Drei Modi:
      </P>
      <ul style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.8, paddingLeft: 20, margin: '0 0 12px' }}>
        <li><strong>Deaktiviert</strong> — keine Ortstaxe.</li>
        <li><strong>Wien (automatisch)</strong> — bookingwulf rechnet mit den offiziellen WKO-Sätzen automatisch nach Anreisedatum: bis 30.6.2026 → 2,5237 %, ab 1.7.2026 → 4,3478 %, ab 1.7.2027 → 6,7797 % vom Zimmerpreis. Kein manuelles Update nötig.</li>
        <li><strong>Eigener Betrag</strong> — fixer Betrag in € pro Person und Nacht (z. B. für Salzburg, Tirol, etc.). Optional: Mindestalter für Kinder-Befreiung.</li>
      </ul>

      <H3>Kinderpreise</H3>
      <P>
        Preise pro Kind und Nacht nach Altersgruppen — ohne Saisonbindung. Kinder ohne passende
        Gruppe sind automatisch kostenlos. Bezeichnung (optional), Alter von/bis und Preis eingeben.
      </P>
      <Tip>
        <strong>Beispiel:</strong> 0–6 Jahre → € 0, 7–16 Jahre → € 15 / Nacht.<br />
        Das Widget berechnet den Aufschlag automatisch und weist ihn im Preis-Popover je Kind aus.
      </Tip>

      <H3>Last-Minute Rabatt <span style={{ fontSize: 12, fontWeight: 500, color: '#7c3aed', background: '#ede9fe', padding: '2px 8px', borderRadius: 6, marginLeft: 6 }}>Pro</span></H3>
      <P>
        Prozentualer Rabatt, der automatisch greift wenn die Anreise innerhalb einer konfigurierbaren
        Anzahl Tage liegt (z.B. 10 % bei Anreise in den nächsten 7 Tagen). Im Widget als grünes Badge.
      </P>

      <H3>Belegungsbasierter Aufschlag <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--status-pending-text)', background: 'var(--status-pending-bg)', padding: '2px 8px', borderRadius: 6, marginLeft: 6 }}>Business</span></H3>
      <P>
        Wenn die Auslastung einen konfigurierbaren Schwellwert überschreitet (z.B. 80 %), wird
        automatisch ein prozentualer Aufschlag angewendet. Im Widget als gelbes Badge.
      </P>

      <H3>Lücken-Rabatt <span style={{ fontSize: 12, fontWeight: 500, color: '#7c3aed', background: '#ede9fe', padding: '2px 8px', borderRadius: 6, marginLeft: 6 }}>Pro</span></H3>
      <P>
        Kurze freie Zeiträume zwischen zwei Buchungen werden automatisch vergünstigt. Rabatt in
        Prozent und maximale Lückenlänge in Nächten festlegen. Im Widget als „Sonderpreis"-Badge.
      </P>

      <H3>Verfügbarkeits-Hinweise (🔥 Banner)</H3>
      <P>
        Zeigt im Widget einen Banner wenn weniger als X % der Nächte im angezeigten Monat frei sind.
        Schwellenwert frei einstellbar (Standard 40 %, Schritt 5).
      </P>

      <Note>
        <strong>Hinweis:</strong> Sperrzeiten (z.B. für Eigennutzung oder Renovierung) werden separat
        unter <InternalLink id="sperrzeiten">Sperrzeiten</InternalLink> verwaltet.
      </Note>
    </div>
  );
}

function SperrzeitenSection() {
  return (
    <div>
      <H2>Sperrzeiten</H2>
      <P>
        Sperrzeiten blockieren ein Apartment für einen bestimmten Zeitraum vollständig — das Apartment
        erscheint dann im Widget als nicht verfügbar. Sperrzeiten sind z.B. sinnvoll für Eigennutzung,
        Renovierungen oder externe Buchungen.
      </P>
      <H3>Sperrzeit anlegen</H3>
      <Step num={1} title="Apartment wählen">
        Wähle das Apartment, das gesperrt werden soll.
      </Step>
      <Step num={2} title="Zeitraum eingeben">
        Gib Start- und Enddatum ein.
      </Step>
      <Step num={3} title="Speichern">
        Das Apartment ist im Widget für diesen Zeitraum sofort gesperrt.
      </Step>
      <Tip>
        <strong>Tipp:</strong> Sperrzeiten eignen sich auch dafür, extern (z.B. über Booking.com)
        gebuchte Zeiträume einzutragen und so Doppelbuchungen zu vermeiden.
      </Tip>
    </div>
  );
}

function ExtrasSection() {
  return (
    <div>
      <H2>Zusatzleistungen</H2>
      <PlanNote plan="Pro" />
      <P>
        Zusatzleistungen sind optionale Leistungen, die Gäste bei der Buchung dazubuchen können —
        z.B. Frühstück, Haustier, Parkplatz oder Endreinigung.
      </P>
      <H3>Felder</H3>
      <div style={{ display: 'grid', gap: 6, margin: '8px 0 16px' }}>
        {[
          { label: 'Name',              desc: 'Wird im Widget als Titel der Karte angezeigt.' },
          { label: 'Beschreibung',      desc: 'Optionaler Kurztext unter dem Namen (z.B. "inkl. Kaffee und Saft").' },
          { label: 'Bild',              desc: 'Optionales Bild — wird als Thumbnail links in der Karte angezeigt. Per Klick hochladen (JPEG, PNG, WebP).' },
          { label: 'Link-URL',          desc: 'Optionaler externer Link (z.B. zur Versicherungsseite). In der Gäste-Lounge erscheinen dann beide Buttons: „Mehr erfahren" und „Hinzufügen".' },
          { label: 'Varianten-Gruppe',  desc: 'Extras mit demselben Gruppen-Namen schließen sich gegenseitig aus — der Gast kann nur eine davon buchen. Nützlich z.B. für Hotelstorno-Varianten: beide Extras bekommen denselben Wert (z.B. „hotelstorno").' },
          { label: 'Nr.',               desc: 'Reihenfolge im Widget (aufsteigend sortiert).' },
        ].map((t) => (
          <div key={t.label} style={{ display: 'flex', gap: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 600, minWidth: 150, color: 'var(--text-primary)' }}>{t.label}</span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{t.desc}</span>
          </div>
        ))}
      </div>
      <H3>Sichtbarkeit</H3>
      <P>
        Jedes Extra hat drei klickbare Status-Buttons in der Übersicht:
      </P>
      <div style={{ display: 'grid', gap: 6, margin: '8px 0 16px' }}>
        {[
          { label: 'Aktiv / Inaktiv',  desc: 'Grundschalter — inaktive Extras erscheinen nirgends.' },
          { label: 'Widget ✓',          desc: 'Extra erscheint im Buchungs-Widget und kann vom Gast beim Buchen gewählt werden.' },
          { label: 'Upsell ✓',          desc: 'Extra wird in der Bestätigungs-E-Mail als Nachkauf-Empfehlung angeboten (nur wenn noch nicht gebucht) und ist zusätzlich in der Gäste-Lounge buchbar.' },
        ].map((t) => (
          <div key={t.label} style={{ display: 'flex', gap: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 600, minWidth: 150, color: 'var(--text-primary)' }}>{t.label}</span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{t.desc}</span>
          </div>
        ))}
      </div>
      <Tip>
        <strong>Mail-Only-Extras (Widget aus, Upsell an):</strong> Extras, die nicht im Buchungsformular erscheinen, aber nach der Buchung per E-Mail angeboten und in der Gäste-Lounge buchbar sind. Ideal für spontane Überraschungen, die der Gast nicht selbst einplant — z.B. Champagner zur Ankunft, Zimmerdekoration (Rosen, Luftballons) für besondere Anlässe, Frühstück aufs Zimmer am ersten Morgen, privater Shuttle-Transfer vom Bahnhof oder Late-Check-out auf Anfrage.
      </Tip>
      <H3>Abrechnungsarten</H3>
      <div style={{ display: 'grid', gap: 6, margin: '8px 0 16px' }}>
        {[
          { label: 'Pro Nacht',          desc: 'Preis wird mit der Anzahl der Nächte multipliziert.' },
          { label: 'Pro Person/Nacht',   desc: 'Preis × Personen × Nächte.' },
          { label: 'Pro Aufenthalt',     desc: 'Einmaliger Fixbetrag, unabhängig von Dauer und Personen.' },
        ].map((t) => (
          <div key={t.label} style={{ display: 'flex', gap: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 600, minWidth: 150, color: 'var(--text-primary)' }}>{t.label}</span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{t.desc}</span>
          </div>
        ))}
      </div>
      <H3>Versicherung</H3>
      <P>
        Die Reiseversicherung ist in allen Plänen verfügbar. Gäste können diese annehmen oder
        ablehnen — beides wird in der Buchungsübersicht und in den E-Mails angezeigt.
      </P>
      <Tip>
        <strong>Tipp:</strong> Halte Zusatzleistungen kurz und klar — zu viele Optionen
        können Gäste überfordern.
      </Tip>
    </div>
  );
}

function GastePortalSection() {
  return (
    <div>
      <H2>Gäste-Lounge</H2>
      <P>
        Jeder Gast erhält mit der Buchungsbestätigung einen persönlichen Link zur Gäste-Lounge —
        kein Passwort, kein Account nötig. Das Portal ist unter{' '}
        <Code>bookingwulf.com/gast/[token]</Code> erreichbar.
      </P>
      <H3>Was der Gast im Portal sieht</H3>
      <div style={{ display: 'grid', gap: 8, margin: '12px 0 16px' }}>
        {[
          { label: 'Buchung',     desc: 'Anreise, Abreise, Apartment(s), Preisübersicht und Zahlungsart. Bei Nuki-Integration wird der Zugangscode hier angezeigt, sobald der Gast die Vor-Ort-Bestätigung (QR-Code) durchgeführt hat.' },
          { label: 'Check-in',   desc: 'Ankunftszeit, Meldedaten (Geburtsdatum, Nationalität, Ausweisnr., Adresse), digitale Unterschrift und Hausordnung bestätigen — erscheint nur wenn „Online Check-in" in den Einstellungen aktiviert ist.' },
          { label: 'Extras',     desc: 'Alle aktiven Zusatzleistungen. Bereits gebuchte sind grün markiert. Mit Varianten-Gruppe: nur eine Variante buchbar.' },
          { label: 'Hausinfos',  desc: 'WLAN-Zugangsdaten, Parkplatz, Müllentsorgung, Hausordnung und Notfallnummern. Wird befüllt unter Konfiguration → Gäste-Lounge.' },
          { label: 'Umgebung',   desc: 'Restaurants, Aktivitäten, Events und Sehenswürdigkeiten rund ums Hotel. Verwaltung unter Konfiguration → Gäste-Lounge.' },
          { label: 'Nachrichten', desc: 'Direkter Chat mit dem Hotel. Neue Nachrichten des Gastes erscheinen in der Buchungsdetailansicht.' },
        ].map((t) => (
          <div key={t.label} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border-2)' }}>
            <span style={{ fontSize: 13, fontWeight: 600, minWidth: 120, color: 'var(--text-primary)' }}>{t.label}</span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{t.desc}</span>
          </div>
        ))}
      </div>
      <H3>Hausinfos & Umgebung einrichten</H3>
      <P>
        Alles wird zentral unter <strong>Konfiguration → Gäste-Lounge</strong> verwaltet — WLAN-Daten,
        Parkplatz- und Müllhinweise, Hausordnung, Notfallnummern sowie Umgebungstipps (Restaurants,
        Aktivitäten, Sehenswürdigkeiten). Umgebungseinträge können per Google-Suche importiert oder
        manuell erfasst werden.
      </P>
      <Note>
        Die Hausordnung wird auch beim Online Check-in angezeigt — der Gast muss sie dort
        bestätigen, bevor der Check-in abgeschlossen wird.
      </Note>
      <Note>
        <strong>Hinweis Extras:</strong> Zusatzleistungen, die der Gast im Portal bucht, werden <strong>nicht online bezahlt</strong> — sie werden zur Buchung hinzugefügt und beim Checkout vor Ort verrechnet. Du erhältst beim ersten nachgebuchten Extra automatisch eine E-Mail mit allen offenen Positionen und dem Gesamtbetrag.
      </Note>
      <H3>Sprache</H3>
      <P>
        Die Gäste-Lounge ist in <strong>Deutsch, Englisch und Italienisch</strong> verfügbar.
        Die Standardsprache richtet sich nach der Buchungssprache des Gastes.
        Im Portal erscheinen drei Buttons <strong>DE / EN / IT</strong> oben rechts im Header —
        der Gast kann die Sprache jederzeit wechseln, die Auswahl wird gespeichert.
      </P>
      <Tip>
        Die Gäste-Lounge funktioniert auch offline — nach dem ersten Öffnen können Gäste es ohne
        Internetverbindung nutzen.
      </Tip>
    </div>
  );
}

function EmailsSection() {
  return (
    <div>
      <H2>E-Mails & Check-in</H2>
      <P>
        Unter <strong>Konfiguration → E-Mails</strong> passt du automatische Gäste-Benachrichtigungen
        an und konfigurierst den Online Check-in. Die Seite ist in drei Gruppen gegliedert:
      </P>
      <div style={{ display: 'grid', gap: 8, margin: '12px 0' }}>
        {[
          { name: 'Buchung',            desc: 'Vorlagen für Anfrage, Buchungsbestätigung, Storno und interne Benachrichtigung.' },
          { name: 'Vor der Anreise',    desc: 'Check-in Infos Vorlage, Online Check-in, automatischer Check-in E-Mail-Versand.' },
          { name: 'Abreise & Nachher',  desc: 'Check-out-Erinnerung und automatische Bewertungsanfrage.' },
        ].map((e) => (
          <div key={e.name} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border-2)' }}>
            <span style={{ fontSize: 13, fontWeight: 600, minWidth: 180, color: 'var(--text-primary)' }}>{e.name}</span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{e.desc}</span>
          </div>
        ))}
      </div>
      <Note>
        Alle Einstellungen werden mit einem einzigen <strong>Speichern</strong>-Button ganz unten auf der Seite gespeichert.
      </Note>
      <H3>E-Mail Templates <span style={{ fontSize: 12, fontWeight: 500, color: '#7c3aed', background: '#ede9fe', padding: '2px 8px', borderRadius: 6, marginLeft: 6 }}>Pro</span></H3>
      <P>Betreff, Anrede, Fließtext und Verabschiedung der automatischen E-Mails individuell anpassen. Verfügbare Platzhalter (z.B. <Code>{'{{guestName}}'}</Code>, <Code>{'{{arrival}}'}</Code>) sind oben auf der Seite aufgelistet.</P>
      <H3>Automatisch versendete E-Mails</H3>
      <div style={{ display: 'grid', gap: 8, margin: '12px 0' }}>
        {[
          { name: 'Eingangsbestätigung',   desc: 'An den Gast sobald eine Anfrage eingeht.' },
          { name: 'Buchungsbestätigung',   desc: 'An den Gast wenn Status auf „Gebucht" gesetzt wird.' },
          { name: 'Stornobestätigung',     desc: 'An den Gast wenn Status auf „Storniert" gesetzt wird. Individuell anpassbar.' },
          { name: 'Nachricht',             desc: 'Wenn du in der Detailansicht eine Nachricht sendest. (Business)' },
          { name: 'Interne Benachrichtigung', desc: 'An dich, wenn eine neue Anfrage eingeht.' },
        ].map((e) => (
          <div key={e.name} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border-2)' }}>
            <span style={{ fontSize: 13, fontWeight: 600, minWidth: 200, color: 'var(--text-primary)' }}>{e.name}</span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{e.desc}</span>
          </div>
        ))}
      </div>
      <H3>Sprache der Templates</H3>
      <P>
        Templates werden immer auf Deutsch bearbeitet. Die tatsächlich versendete E-Mail wird
        automatisch in die Sprache übersetzt, die für die jeweilige Buchung eingestellt ist
        (Deutsch, Englisch, Italienisch, Französisch, Niederländisch, Spanisch, Polnisch, Tschechisch oder Russisch).
      </P>
      <Note>
        <strong>Hinweis:</strong> Wenn du den Status auf <strong>„Beantwortet"</strong> setzt,
        wird keine automatische Mail ausgelöst — ideal wenn du direkt per Telefon oder E-Mail
        geantwortet hast.
      </Note>

      <H3>Online Check-in</H3>
      <P>
        Gäste erhalten nach der Buchungsbestätigung einen persönlichen Link zu einem Formular,
        in dem sie ihre Ankunftszeit, ihre gesetzlich vorgeschriebenen Meldedaten (Geburtsdatum,
        Nationalität, Ausweisnummer, Adresse) sowie optionale Hinweise angeben. Mit einer digitalen
        Unterschrift bestätigt der Gast die Richtigkeit seiner Angaben. Falls eine Hausordnung
        hinterlegt ist, muss der Gast diese ebenfalls bestätigen.
      </P>
      <P>
        Der Betreiber sieht in der Buchungsdetailansicht ob der Check-in ausgefüllt wurde, inklusive
        aller Meldedaten und der Unterschrift. Der Gast erhält genau eine Erinnerungsmail — X Tage
        vor Anreise, falls noch nicht ausgefüllt.
      </P>
      <Note>
        <strong>Wichtig für die Meldepflicht:</strong> Die Online-Unterschrift wird laut österreichischem
        Meldegesetz erst gültig, wenn der Gast sie vor Ort bestätigt. Drucke dafür in den
        Apartment-Einstellungen unter <strong>„Vor-Ort-Bestätigung"</strong> den QR-Code aus und bringe
        ihn am Eingang bzw. Schlüsselkasten an — der Gast scannt ihn bei Ankunft. Bei Nuki-Hotels wird
        der Zugangscode in der Gäste-Lounge erst nach dieser Bestätigung angezeigt.
        Über den <strong>Gästemeldeexport</strong> (Button in der Anfragen-Liste) kannst du die Meldedaten
        aller eingecheckten Gäste als CSV exportieren und im Landesportal bzw. Feratel-WebClient hochladen.
      </Note>

      <H3>Check-out-Erinnerung</H3>
      <P>
        Gäste erhalten am Abreisetag morgens automatisch eine E-Mail mit der Check-out-Uhrzeit und
        deinen individuellen Hinweisen — z.B. wo der Schlüssel abzugeben ist oder was zu beachten ist.
      </P>
      <P>
        Aktivieren unter <strong>Konfiguration → E-Mails & Check-in → Check-out-Erinnerung</strong>.
        Einstellbar: Check-out-Uhrzeit und ein freier Hinweistext. Die E-Mail wird automatisch
        einmal pro Buchung versendet und nicht wiederholt.
      </P>

      <H3>Bewertungsanfrage</H3>
      <PlanNote plan="Pro" feature="Automatische Bewertungsanfrage nach dem Aufenthalt" />
      <P>
        X Tage nach der Abreise erhalten Gäste automatisch eine freundliche E-Mail mit der Bitte,
        eine Google-Bewertung zu hinterlassen. Du gibst deinen Google-Reviews-Link ein — ein Klick
        in der Mail öffnet direkt das Bewertungsformular.
      </P>
      <P>
        Aktivieren unter <strong>Konfiguration → E-Mails & Check-in → Bewertungsanfrage</strong>.
        Einstellbar: Versandzeitpunkt (Tage nach Abreise, Standard: 2) und der Google Reviews Link.
      </P>
    </div>
  );
}

function EinstellungenSection() {
  return (
    <div>
      <H2>Widget & Design</H2>
      <P>
        Unter <strong>Konfiguration → Widget & Design</strong> passt du das Widget an das Design
        deiner Website an und konfigurierst grundlegende Parameter.
      </P>
      <H3>Design</H3>
      <P>
        Im Abschnitt <strong>Typografie</strong> wählst du eine Schriftart für das Widget —
        z.B. Inter, Lato, Playfair Display oder eine andere Google Font. So lässt sich das Widget
        an dein Corporate Design anpassen.
      </P>
      <P>
        Daneben lassen sich Akzentfarbe, Hintergrundfarbe, Eckenradius und weitere visuelle
        Parameter einstellen. Alle Änderungen werden in der Live-Vorschau rechts sofort sichtbar.
      </P>
      <H3>Erweitertes Branding</H3>
      <PlanNote plan="Pro" feature="Erweiterte Farbsteuerung (Hintergrund, Karten, Text, Rahmen)" />
      <H3>Volles Branding & kein bookingwulf-Logo</H3>
      <PlanNote plan="Business" feature="Volles Branding ohne bookingwulf-Hinweis im Widget" />
      <H3>Benachrichtigungs-E-Mail</H3>
      <P>
        Gib deine E-Mail-Adresse ein, an die neue Anfragen gemeldet werden sollen.
        Diese Adresse wird auch als Kontaktadresse in Gast-Mails angezeigt.
      </P>
      <H3>Widget-Konfigurationen</H3>
      <PlanNote plan="Pro" feature="Mehrere Widget-Varianten (z.B. Anfrage + direkte Buchung)" />
      <P>
        Mit dem Pro-Plan können mehrere Widget-Varianten erstellt werden — jeweils mit eigenen
        Einstellungen. So kann z.B. eine Variante für Anfragen und eine für direkte Buchungen
        auf verschiedenen Unterseiten eingebunden werden. Weitere Details unter <InternalLink id="einbindung">Widget einbinden</InternalLink>.
      </P>
      <H3>Features</H3>
      <P>
        Im Abschnitt <strong>Features</strong> steuerst du Verhalten und Umfang des Widgets.
        Jede Option lässt sich unabhängig ein- oder ausschalten:
      </P>
      <div style={{ display: 'grid', gap: 6, margin: '8px 0 16px' }}>
        {[
          { label: 'Preise anzeigen',               desc: 'Zeigt Preise pro Nacht und den Gesamtbetrag im Widget an.' },
          { label: 'Ausstattung anzeigen',           desc: 'Zeigt Ausstattungsmerkmale der Apartments (z.B. WLAN, Parkplatz).' },
          { label: 'Zusatzleistungen anzeigen',      desc: 'Blendet den Extras-Schritt im Buchungsprozess ein oder aus.' },
          { label: 'Telefonfeld anzeigen',           desc: 'Fügt ein optionales Telefon-Eingabefeld im Kontaktformular hinzu.' },
          { label: 'Nachrichtenfeld anzeigen',       desc: 'Ermöglicht Gästen, beim Buchen eine freie Nachricht mitzuschicken.' },
          { label: 'Image Slider aktivieren',        desc: 'Zeigt mehrere Bilder pro Apartment als Slider statt als Einzelbild.' },
          { label: 'Verbindliche Buchung anbieten',  desc: 'Gäste können direkt verbindlich buchen statt nur eine Anfrage zu senden.' },
        ].map((f) => (
          <div key={f.label} style={{ display: 'flex', gap: 10, padding: '7px 0', borderBottom: '1px solid var(--border-2)' }}>
            <span style={{ fontSize: 13, fontWeight: 600, minWidth: 220, color: 'var(--text-primary)', flexShrink: 0 }}>{f.label}</span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{f.desc}</span>
          </div>
        ))}
      </div>

      <H3>Barrierefreiheits-Check</H3>
      <P>
        Unterhalb der Farbfelder zeigt ein WCAG-Kontrast-Checker automatisch an, ob deine Farbkombinationen
        den Mindestkontrast (AA = 4,5:1) erfüllen. Bei einem Fail erscheint ein Vorschlag für die
        nächstähnliche barrierefreie Farbe — ein Klick darauf übernimmt sie direkt.
      </P>

      <H3>Embed-Code</H3>
      <P>
        Der Embed-Code für deine Website ist ebenfalls in den Einstellungen zu finden.
        Weitere Details unter <InternalLink id="einbindung">Widget einbinden</InternalLink>.
      </P>
    </div>
  );
}

function ZahlungenSection() {
  return (
    <div>
      <H2>Zahlungsarten</H2>
      <P>
        Unter <strong>Konfiguration → Widget &amp; Design → Zahlungsarten</strong> legst du fest,
        welche Zahlungsmethoden deine Gäste im Widget nutzen können.
        Verfügbar sind Banküberweisung, PayPal und Kreditkarte (Stripe).
      </P>

      <H3>Banküberweisung</H3>
      <P>
        Aktiviere Banküberweisung und hinterlege Kontoinhaber, IBAN und BIC.
        Diese Daten werden dem Gast nach der Buchung in der Bestätigungs-E-Mail angezeigt.
      </P>
      <P>
        Optional kannst du eine Anzahlung aktivieren — als Prozentsatz oder Fixbetrag,
        mit konfigurierbarer Zahlungsfrist in Tagen.
      </P>

      <H3>PayPal einrichten</H3>
      <P>
        Für PayPal benötigst du ein PayPal-Business-Konto und einen API-Zugang.
        So richtest du es ein:
      </P>
      <div style={{ display: 'grid', gap: 8, margin: '8px 0 16px' }}>
        {([
          ['1', <>Gehe zu <ExtLink href="https://developer.paypal.com">developer.paypal.com</ExtLink> und melde dich mit deinem Business-Konto an.</>],
          ['2', <>Klicke auf „Apps &amp; Credentials" → „Create App". Gib der App einen Namen (z.B. „Bookingwulf") und wähle „Merchant".</>],
          ['3', <>Nach dem Erstellen siehst du Client ID und Client Secret — zuerst im Sandbox-Modus. Für den Live-Betrieb wechsle oben rechts auf „Live" und kopiere die Live-Zugangsdaten.</>],
          ['4', <>Trage Client ID und Client Secret unter Zahlungsarten → PayPal ein und aktiviere den Toggle.</>],
        ] as [string, React.ReactNode][]).map(([step, text]) => (
          <div key={step} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '8px 0', borderBottom: '1px solid var(--border-2)' }}>
            <span style={{ fontSize: 12, fontWeight: 700, background: 'var(--surface-3)', color: 'var(--text-muted)', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>{step}</span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{text}</span>
          </div>
        ))}
      </div>
      <Tip>
        <ExtLink href="https://developer.paypal.com/dashboard/applications/live">developer.paypal.com</ExtLink> → Apps &amp; Credentials → Create App
      </Tip>

      <H3>Stripe (Kreditkarte) einrichten</H3>
      <P>
        Mit Stripe können Gäste direkt im Widget mit Kreditkarte zahlen — ohne Weiterleitung.
        Du verwendest deinen eigenen Stripe-Account, das Geld geht direkt an dich.
      </P>
      <div style={{ display: 'grid', gap: 8, margin: '8px 0 16px' }}>
        {([
          ['1', <>Erstelle ein Konto auf <ExtLink href="https://stripe.com">stripe.com</ExtLink> (kostenlos). Verifiziere dein Business und hinterlege deine Bankverbindung für Auszahlungen.</>],
          ['2', <>Gehe im Stripe Dashboard zu <ExtLink href="https://dashboard.stripe.com/apikeys">Entwickler → API-Schlüssel</ExtLink>.</>],
          ['3', <>Kopiere den Publishable Key (beginnt mit pk_live_…) und den Secret Key (sk_live_…).</>],
          ['4', <>Trage beide Schlüssel unter Zahlungsarten → Kreditkarte (Stripe) ein und aktiviere den Toggle.</>],
        ] as [string, React.ReactNode][]).map(([step, text]) => (
          <div key={step} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '8px 0', borderBottom: '1px solid var(--border-2)' }}>
            <span style={{ fontSize: 12, fontWeight: 700, background: 'var(--surface-3)', color: 'var(--text-muted)', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>{step}</span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{text}</span>
          </div>
        ))}
      </div>
      <Tip>
        <ExtLink href="https://dashboard.stripe.com/apikeys">dashboard.stripe.com/apikeys</ExtLink>
      </Tip>
      <Note>
        Stripe erhebt pro Transaktion eine eigene Gebühr (ca. 1,5 % + 0,25 € für europäische Karten).
        Diese Kosten sind unabhängig von bookingwulf und werden direkt von Stripe abgerechnet.
      </Note>
    </div>
  );
}

function GutscheineSection() {
  return (
    <div>
      <H2>Gutscheine</H2>
      <PlanNote plan="Pro" />
      <P>
        Mit dem Gutschein-Modul kannst du Geschenkgutscheine direkt über deine Hotel-Website verkaufen.
        Gäste kaufen den Gutschein per Kreditkarte (Stripe), erhalten den Code und ein PDF per E-Mail
        und können ihn bei der nächsten Buchung im Widget einlösen.
      </P>
      <H3>Vorlagen anlegen</H3>
      <P>
        Unter <strong>Gutscheine</strong> legst du Vorlagen an, die dann auf deiner Gutschein-Seite
        erscheinen. Jede Vorlage definiert Art, Wert und Laufzeit.
      </P>
      <div style={{ display: 'grid', gap: 6, margin: '8px 0 16px' }}>
        {[
          { label: 'Name',             desc: 'Titel des Gutscheins — z.B. „Muttertagsspecial" oder „Erlebnis-Gutschein". Wird auf der Kauf-Seite und im PDF angezeigt.' },
          { label: 'Typ',              desc: 'Wertgutschein (fixer €-Betrag) oder Nächte-Gutschein (z.B. „2 Nächte"). Bei Einlösung wird in beiden Fällen der Kaufpreis als Rabatt vom Buchungstotal abgezogen.' },
          { label: 'Nennwert',         desc: 'Der angezeigte Wert auf dem Gutschein (z.B. € 150 oder 2 Nächte).' },
          { label: 'Kaufpreis',        desc: 'Der tatsächlich bezahlte Betrag. Kann vom Nennwert abweichen — z.B. Nennwert € 200, Kaufpreis € 170.' },
          { label: 'Gültig (Tage)',    desc: 'Wie viele Tage der Gutschein nach dem Kauf gültig ist. Standard: 365 Tage.' },
          { label: 'Beschreibung',     desc: 'Optionaler Hinweistext für den Gast — z.B. „Gültig für Doppelzimmer inkl. Frühstück". Erscheint auf der Kauf-Seite und im PDF.' },
        ].map((t) => (
          <div key={t.label} style={{ display: 'flex', gap: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 600, minWidth: 140, color: 'var(--text-primary)' }}>{t.label}</span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{t.desc}</span>
          </div>
        ))}
      </div>
      <H3>Kauf-Seite</H3>
      <P>
        Jedes Hotel hat eine öffentliche Gutschein-Seite unter{' '}
        <Code>bookingwulf.com/gutschein/[dein-slug]</Code>. Dort sehen Besucher alle aktiven Vorlagen,
        wählen eine aus, geben Empfänger- und Absenderdaten ein und bezahlen per Kreditkarte.
        Nach erfolgreicher Zahlung wird der Gutschein-Code automatisch per E-Mail zugestellt —
        inklusive angehängtem PDF.
      </P>
      <H3>PDF-Gutschein</H3>
      <P>
        Nach dem Kauf erhält der Käufer (und optional der Empfänger) automatisch ein gestaltetes
        PDF mit Akzentfarbe des Hotels, Gutschein-Code, Wert, Gültigkeitsdatum, Beschreibung
        und einer persönlichen Nachricht.
      </P>
      <H3>Einlösen im Widget</H3>
      <P>
        Im Buchungs-Widget erscheint beim Checkout ein Feld „Gutschein-Code". Der Gast gibt den
        Code ein, klickt auf Einlösen — der Rabatt wird sofort vom Gesamtbetrag abgezogen und
        in der Preisübersicht angezeigt. Nach abgeschlossener Buchung wird der Gutschein als
        eingelöst markiert.
      </P>
      <Tip>
        <strong>Nächte-Gutscheine:</strong> Der Kaufpreis des Gutscheins wird als Rabatt abgezogen.
        Wenn der Gast ein teureres Zimmer bucht, zahlt er die Differenz — das regelst du in deinen
        Buchungsbedingungen.
      </Tip>
      <H3>Verwaltung</H3>
      <P>
        Unter <strong>Gutscheine → Verkaufte Gutscheine</strong> siehst du alle ausgestellten Codes
        mit Status (ausstehend / aktiv / eingelöst / abgelaufen) und können einzelne Gutscheine
        bei Bedarf manuell auf aktiv setzen.
      </P>
    </div>
  );
}

function AbonnementSection() {
  return (
    <div>
      <H2>Abonnement</H2>
      <P>
        Unter <strong>Abonnement</strong> siehst du deinen aktuellen Plan, verwaltest deine
        Zahlungsmethode und kannst jederzeit upgraden oder kündigen.
      </P>
      <H3>Verfügbare Pläne</H3>
      <div style={{ display: 'grid', gap: 12, margin: '12px 0 20px' }}>
        {[
          {
            name: 'Starter', price: '€ 29 / Monat (€ 26 bei Jahreszahlung) + € 10 je weiterem Apartment',
            features: ['1 Apartment inklusive', '1 Admin-User', 'Basis Branding', 'E-Mail-Benachrichtigungen'],
          },
          {
            name: 'Pro', price: '€ 59 / Monat (€ 53 bei Jahreszahlung) + € 10 je weiterem Apartment',
            features: ['1 Apartment inklusive', '3 Admin-User', 'E-Mail Templates', 'Preiszeiträume', 'Mindestaufenthalt', 'Last-Minute Rabatt', 'Zusatzleistungen', 'Kinderpreise', 'Widget-Konfigurationen', 'Direktnachrichten an Gäste'],
          },
          {
            name: 'Business', price: '€ 89 / Monat (€ 80 bei Jahreszahlung) + € 10 je weiterem Apartment',
            features: ['1 Apartment inklusive', 'Unlimitierte User', 'Bis zu 2 Hotelanlagen', 'Analytics', 'Nachrichten für Airbnb/Booking.com-Gäste', 'Belegungsaufschlag', 'Volles Branding', 'Priority Support'],
          },
        ].map((p) => (
          <div key={p.name} style={{ border: '1px solid var(--border)', borderRadius: 10, padding: '14px 18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>{p.name}</span>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{p.price}</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {p.features.map((f) => (
                <span key={f} style={{ fontSize: 12, padding: '2px 8px', borderRadius: 999, background: 'var(--surface-3)', color: 'var(--text-muted)' }}>{f}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <H3>14 Tage kostenlos testen</H3>
      <P>
        Jeder neue Account startet automatisch mit einer 14-tägigen Testphase im Business-Plan —
        ohne Kreditkarte. Nach Ablauf kannst du einen Plan wählen oder das Abo kündigen.
      </P>
      <H3>Kündigung</H3>
      <P>
        Das Abonnement ist monatlich kündbar. Nach der Kündigung bleibt der Zugang bis Ende des
        bezahlten Zeitraums aktiv.
      </P>
      <Tip>
        <strong>Tipp:</strong> Mit der jährlichen Zahlung sparst du ca. 10 % gegenüber der
        monatlichen Abrechnung.
      </Tip>
    </div>
  );
}

function NukiSection() {
  return (
    <div>
      <H2>Schlüsselloses Einchecken</H2>
      <PlanNote plan="Pro" />
      <P>
        Gäste erhalten nach einer Sofortbuchung automatisch einen 6-stelligen Zugangscode per E-Mail —
        kein physischer Schlüssel, kein Koordinationsaufwand. Das System kommuniziert direkt mit deinen
        Nuki-Schlössern über die Nuki Web API.
      </P>

      <H3>Voraussetzungen</H3>
      <ul style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.8, paddingLeft: 20, margin: '0 0 16px' }}>
        <li>Nuki-Schloss mit verbundenem Keypad (Nuki Keypad oder Keypad 2.0)</li>
        <li>Nuki Web-Konto unter <strong>web.nuki.io</strong></li>
        <li>Sofortbuchung im Widget aktiviert (<InternalLink id="einstellungen">Widget & Design</InternalLink>)</li>
        <li>Pro-Plan oder höher</li>
      </ul>

      <H3>Einrichtung</H3>
      <Step num={1} title="API-Token erstellen">
        <P>
          Melde dich unter <strong>web.nuki.io</strong> an → oben rechts auf deinen Namen klicken →
          <strong> API</strong> → <strong>API Token erstellen</strong>. Den Token kopieren.
        </P>
      </Step>
      <Step num={2} title="Token in bookingwulf eingeben">
        <P>
          Im Admin-Bereich unter <strong>Schlüsselloses Einchecken</strong> den Token einfügen und auf
          „Verbindung testen & speichern" klicken. Die verfügbaren Schlösser werden danach automatisch angezeigt.
        </P>
      </Step>
      <Step num={3} title="Schloss pro Apartment zuweisen">
        <P>
          Unter <InternalLink id="apartments">Apartments</InternalLink> das gewünschte Apartment öffnen →
          Abschnitt <strong>Nuki-Schloss</strong> → passendes Schloss aus der Liste wählen → Speichern.
        </P>
      </Step>
      <Step num={4} title="Sofortbuchung aktivieren">
        <P>
          Unter <InternalLink id="einstellungen">Widget & Design</InternalLink> die Option
          <strong> Sofortbuchung</strong> aktivieren. Nur bei Sofortbuchungen (nicht bei Anfragen)
          wird automatisch ein Zugangscode generiert.
        </P>
      </Step>

      <H3>So funktioniert es</H3>
      <P>
        Sobald ein Gast eine Sofortbuchung abschickt, generiert bookingwulf automatisch einen
        6-stelligen Code, schickt ihn zeitlich begrenzt (Anreise bis Abreise) an das Nuki-Schloss
        und fügt ihn in die Buchungsbestätigung an den Gast ein.
      </P>
      <div style={{ background: 'var(--status-booked-bg)', border: '1px solid var(--primitive-green-100)', borderRadius: 12, padding: '16px 20px', marginBottom: 16, fontSize: 14, color: 'var(--status-booked-text)' }}>
        <strong>🔑 Beispiel-Code in der Gast-E-Mail:</strong>
        <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '0.15em', fontFamily: 'monospace', margin: '8px 0 4px' }}>4 8 2 1 9 3</div>
        <div style={{ fontSize: 13 }}>Gültig von Anreise bis Abreise — öffnet das Schloss direkt vor Ort.</div>
      </div>

      <H3>Hinweise</H3>
      <ul style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.8, paddingLeft: 20, margin: '0 0 16px' }}>
        <li>Pro Apartment kann genau ein Schloss zugewiesen werden.</li>
        <li>Der Code läuft nach der Abreise automatisch ab (wird von Nuki deaktiviert).</li>
        <li>Bei reinen Anfragen (kein Sofortbuchungs-Modus) wird kein Code generiert.</li>
        <li>Schlägt die Code-Generierung fehl (z.B. Netzwerkfehler), wird die Buchung trotzdem gespeichert — der Gast erhält dann keinen Code. Du erhältst in diesem Fall automatisch eine E-Mail-Benachrichtigung, damit du den Zugang manuell bereitstellen kannst.</li>
        <li>Den API-Token kannst du jederzeit aktualisieren oder die Verbindung trennen.</li>
      </ul>
    </div>
  );
}

function Beds24Section() {
  return (
    <div>
      <H2>Beds24 Channel Manager</H2>
      <PlanNote plan="Pro" />
      <P>
        Beds24 ist ein zertifizierter Channel Manager mit direkter Anbindung an Airbnb und Booking.com.
        Durch die Verbindung werden Buchungen automatisch synchronisiert — Doppelbuchungen werden nahezu ausgeschlossen.
      </P>
      <H3>Wie es funktioniert</H3>
      <P>
        bookingwulf kommuniziert direkt mit Beds24. Beds24 ist bei Airbnb und Booking.com als Channel Manager
        zertifiziert und übermittelt Verfügbarkeiten in beide Richtungen:
      </P>
      <ul style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.9, paddingLeft: 20, margin: '0 0 16px' }}>
        <li><strong>Buchung bei dir</strong> → bookingwulf meldet sie an Beds24 → Airbnb/Booking.com wird sofort gesperrt</li>
        <li><strong>Buchung auf Airbnb/Booking.com</strong> → Beds24 schickt Webhook → bookingwulf sperrt sofort</li>
      </ul>

      <H3>Voraussetzungen</H3>
      <ul style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.8, paddingLeft: 20, margin: '0 0 16px' }}>
        <li>Beds24-Account (ca. €9/Monat pro Property — <strong>beds24.com</strong>)</li>
        <li>Airbnb und/oder Booking.com bereits in Beds24 verbunden</li>
        <li>Pro-Plan in bookingwulf</li>
      </ul>

      <H3>Einrichtung</H3>
      <Step num={1} title="Beds24-Account anlegen & Kanäle verbinden">
        <P>
          Registriere dich unter <strong>beds24.com</strong> und verbinde dort Airbnb und/oder
          Booking.com über das Beds24-Dashboard (Channel Manager).
        </P>
      </Step>
      <Step num={2} title="Invite Code generieren & Verbindung herstellen">
        <P>
          In Beds24 unter <strong>Einstellungen → Marketplace → API → Einladungscode erstellen</strong> einen
          neuen Code generieren (Berechtigungen: bookings lesen + ändern, inventory lesen; für Gästenachrichten
          zusätzlich bookings-personal, siehe unten).
          Den Code im bookingwulf Admin unter <strong>Beds24 Channel Manager</strong> einfügen und auf
          „Verbinden" klicken. Invite Codes sind Einmalcodes — nach Verbindung werden sie nicht mehr benötigt.
        </P>
      </Step>
      <Step num={3} title="Zimmer zuordnen">
        <P>
          Ordne jedem Apartment die entsprechende <strong>Beds24 Einheit ID</strong> zu
          (sichtbar in Beds24 unter Einstellungen → Unterkünfte → Einheiten).
          Danach <strong>Sync aktiv</strong> einschalten.
        </P>
      </Step>
      <Step num={4} title="Webhook eintragen">
        <P>
          Die angezeigte Webhook-URL in Beds24 unter
          <strong> Unterkünfte → Zugang → Buchung Webhook</strong> eintragen (Webhook Version 2).
          Damit werden externe Buchungen von Airbnb/Booking.com in Echtzeit übermittelt.
        </P>
      </Step>

      <H3>Sync-Geschwindigkeit</H3>
      <ul style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.8, paddingLeft: 20, margin: '0 0 16px' }}>
        <li>Buchung bei dir → Airbnb gesperrt: <strong>~1–2 Minuten</strong></li>
        <li>Buchung auf Airbnb → bei dir gesperrt: <strong>Echtzeit via Webhook</strong></li>
        <li>Zum Vergleich: iCal-Sync alle 30 Minuten</li>
      </ul>

      <H3>Gästenachrichten (Airbnb/Booking.com)</H3>
      <PlanNote plan="Business" feature="Nachrichten für Airbnb/Booking.com-Gäste" />
      <P>
        Nachrichten von Airbnb/Booking.com-Gästen erscheinen im Chat der jeweiligen Buchung — du kannst
        direkt aus bookingwulf heraus antworten, ohne Airbnb/Booking.com separat zu öffnen. Damit auch
        deine Antworten übermittelt werden, braucht der Invite Code zusätzlich den Scope{' '}
        <strong>bookings-personal</strong>. Falls das Senden einer Nachricht fehlschlägt: in Beds24 unter{' '}
        <strong>Einstellungen → Marketplace → API</strong> einen neuen Invite Code mit diesem Scope erzeugen
        und oben erneut verbinden — die Zimmer-Zuordnungen bleiben dabei erhalten.
      </P>

      <H3>Gäste-Lounge für Airbnb/Booking.com-Gäste</H3>
      <P>
        Jede Buchung die über Beds24 reinkommt, erhält automatisch einen persönlichen Gäste-Lounge-Link.
        In der Buchungsdetailansicht findest du unter <strong>Gäste-Lounge</strong> einen „Link kopieren"-Button —
        den Link kannst du dem Gast direkt über Airbnb-Nachrichten, WhatsApp oder E-Mail schicken.
      </P>
      <P>
        <strong>Warum kein automatischer Versand?</strong> Airbnb und Booking.com schicken eigene
        Kommunikation an den Gast. Eine zweite E-Mail von bookingwulf wäre verwirrend — deshalb
        entscheidest du selbst, wann und über welchen Kanal du den Link teilst.
      </P>
    </div>
  );
}

function AssistentSection() {
  return (
    <div>
      <H2>Hasky</H2>
      <PlanNote plan="Pro" />
      <P>
        Hasky ist dein KI-Assistent direkt im Admin. Er beantwortet Fragen zur Bedienung —
        ohne dass du das Handbuch durchsuchen oder den Support kontaktieren musst.
      </P>
      <H3>Öffnen & verwenden</H3>
      <P>
        Hasky ist als runder Chat-Button unten rechts im Admin sichtbar. Klicke darauf,
        tippe deine Frage und bestätige mit Enter oder dem Senden-Button.
      </P>
      <H3>Was du fragen kannst</H3>
      <div style={{ display: 'grid', gap: 6, margin: '8px 0 16px' }}>
        {[
          { label: 'Bedienung',      desc: 'Wie funktioniert Sperrzeiten anlegen? Wo finde ich die E-Mail-Vorlagen?' },
          { label: 'Navigation',     desc: 'Wo ist der Zimmerplan? Wie komme ich zu den Preisanpassungen?' },
          { label: 'Seitenbezogen',  desc: 'Was mache ich hier? Wofür ist das?' },
          { label: 'Funktionen',     desc: 'Was kann der Beds24 Channel Manager? Wie funktioniert Nuki?' },
        ].map((t) => (
          <div key={t.label} style={{ display: 'flex', gap: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 600, minWidth: 130, color: 'var(--text-primary)' }}>{t.label}</span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{t.desc}</span>
          </div>
        ))}
      </div>
      <H3>Verlauf & löschen</H3>
      <P>
        Der Chatverlauf bleibt gespeichert, auch wenn du die Seite wechselst oder den Browser schließt.
        Über das Papierkorb-Symbol oben rechts im Chat kannst du den Verlauf jederzeit löschen.
      </P>
      <Tip>
        <strong>Tipp:</strong> Hasky kennt die aktuelle Seite — auf vage Fragen wie
        „Was mache ich hier?" antwortet er konkret zum Bereich, in dem du dich gerade befindest.
      </Tip>
    </div>
  );
}

function ChatbotSection() {
  return (
    <div>
      <H2>Gast-Chatbot</H2>
      <PlanNote plan="Pro" />
      <P>
        Der Gast-Chatbot ist ein KI-Assistent, den du auf deiner Hotel-Website einbinden kannst.
        Er beantwortet Fragen, empfiehlt passende Apartments und generiert direkte Buchungslinks —
        rund um die Uhr, ohne dass du eingreifen musst.
      </P>

      <H3>Einrichten</H3>
      <Step num={1} title="Chatbot aktivieren">
        Gehe zu <strong>Gast-Chatbot</strong> in der linken Navigation und schalte den Toggle
        „Chatbot aktivieren" ein.
      </Step>
      <Step num={2} title="Name & Aussehen anpassen (optional)">
        Vergib einen Namen (z.B. „Lisa" oder „Buchungs-Assistent"), wähle eine Akzentfarbe die
        zu eurer Website passt, und lade ein Avatar-Bild hoch. All das erscheint direkt im Chat-Widget.
      </Step>
      <Step num={3} title="Website-Kontext scrapen (empfohlen)">
        Trage eure Website-URL ein und klicke <strong>„Scrapen"</strong>. Der Chatbot liest
        daraufhin den Inhalt eurer Seite ein und kann damit Fragen zu Lage, Storno, Anreise,
        Umgebung und mehr beantworten.
      </Step>
      <Step num={4} title="FAQ ergänzen (optional)">
        Für Infos die nicht auf der Website stehen — z.B. „Sind Haustiere erlaubt?" oder
        Parkplatz-Details — kannst du manuelle Fragen und Antworten eintragen.
      </Step>
      <Step num={5} title="Code auf der Website einbinden">
        Den fertigen Einbindungs-Code findest du ganz unten auf der Chatbot-Seite.
        Einmalig vor dem schließenden <Code>{'</body>'}</Code>-Tag auf eurer Website einfügen — fertig.
      </Step>

      <H3>Was der Chatbot kann</H3>
      <div style={{ display: 'grid', gap: 8, margin: '8px 0 16px' }}>
        {[
          { label: 'Apartments empfehlen', desc: 'Kontextabhängig — für Familien, Paare, Haustiere, Wellness, Budget etc.' },
          { label: 'Verfügbarkeit prüfen', desc: 'Prüft Zeitraum und Personenzahl und nennt Preise.' },
          { label: 'Extras vorstellen',    desc: 'Frühstück, Spa, Kinderbett — nur was wirklich passt.' },
          { label: 'Fragen beantworten',   desc: 'Check-in, Check-out, Parken, WLAN, Storno — aus Website-Kontext und FAQ.' },
          { label: 'Buchungslink erstellen', desc: 'Direkt zum vorausgefüllten Buchungsformular, mit allen Angaben aus dem Gespräch.' },
        ].map((t) => (
          <div key={t.label} style={{ display: 'flex', gap: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 600, minWidth: 180, color: 'var(--text-primary)' }}>{t.label}</span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{t.desc}</span>
          </div>
        ))}
      </div>

      <Note>
        <strong>Hinweis:</strong> Der Chatbot legt keine Buchungen an und verarbeitet keine Zahlungen.
        Er führt den Gast zum Buchungsformular — die Buchung läuft wie gewohnt ab.
      </Note>

      <H3>Einbindungs-Code</H3>
      <P>
        Den Code mit deinem persönlichen Hotel-Slug findest du direkt auf der Chatbot-Seite ganz unten.
        Er sieht so aus:
      </P>
      <CodeBlock>{`<script\n  src="https://bookingwulf.com/chat.js"\n  data-hotel="dein-hotel-slug"\n  data-lang="de">\n</script>`}</CodeBlock>

      <Tip>
        <strong>Tipp:</strong> Name, Farbe und Avatar übernimmt das Widget automatisch aus deinen
        Admin-Einstellungen — du musst nach einer Änderung nichts am Code auf deiner Website anpassen.
        Mit <code>data-lang</code> (de, en oder it) legst du die Startsprache fest. Hast du mehrere
        Sprachversionen deiner Website, bindest du das Script auf jeder mit dem passenden Wert ein —
        schreibt ein Gast in einer der drei Sprachen, wechselt der Assistent automatisch mit.
      </Tip>
    </div>
  );
}

function EinbindungSection() {
  return (
    <div>
      <H2>Widget einbinden</H2>
      <P>
        Das Bookingwulf-Widget lässt sich mit einer einzigen Zeile Code auf jeder Website einbinden —
        egal ob WordPress, Jimdo, Wix, Squarespace oder eine eigene HTML-Seite.
      </P>
      <H3>Schritt-für-Schritt</H3>
      <Step num={1} title="Embed-Code kopieren">
        Gehe zu <strong>Widget & Design</strong> und scrolle zum Abschnitt <strong>„Embed-Code"</strong>.
        Dort findest du deinen persönlichen Code:
        <CodeBlock>{`<script src="https://bookingwulf.com/widget.js" data-hotel="dein-hotel-slug"></script>`}</CodeBlock>
        Klicke auf <strong>„Kopieren"</strong>.
      </Step>
      <Step num={2} title="Code auf deiner Website einfügen">
        Füge den Code in den HTML-Quelltext der Seite ein, auf der das Widget erscheinen soll —
        z.B. auf einer Seite namens „Buchen". Der Code muss im <Code>{'<body>'}</Code>-Bereich platziert werden.
      </Step>
      <Step num={3} title="Fertig">
        Das Widget lädt sich automatisch und passt sich der Breite der Seite an.
      </Step>
      <Note>
        <strong>Wichtig:</strong> Der <Code>data-hotel</Code>-Wert ist dein persönlicher Hotel-Slug
        und bereits vorausgefüllt. Ändere diesen Wert nicht.
      </Note>
      <H3>Sprache des Widgets</H3>
      <P>
        Das Widget unterstützt Deutsch und Englisch. Die Sprache wird über das optionale Attribut
        <Code>data-lang</Code> gesteuert:
      </P>
      <CodeBlock>{`<script src="https://bookingwulf.com/widget.js" data-hotel="dein-hotel-slug" data-lang="en"></script>`}</CodeBlock>
      <P>
        Mit <Code>data-lang="en"</Code> erscheinen alle Labels, Monatsnamen, Wochentage und
        Meldungen im Widget auf Englisch. Standard ist Deutsch (<Code>de</Code>).
        Die Sprache der Bestätigungs-E-Mails an Gäste wird davon unabhängig pro Buchung eingestellt.
      </P>
      <H3>WordPress</H3>
      <Step num={1} title='Block „Benutzerdefiniertes HTML" hinzufügen'>
        Im Gutenberg-Editor auf <strong>„+"</strong> klicken → <strong>„Benutzerdefiniertes HTML"</strong>
        suchen → Code einfügen → Speichern.
      </Step>
      <Step num={2} title="Alternativ: Theme-Footer">
        Via Plugin <em>Insert Headers and Footers</em> den Code vor <Code>{'</body>'}</Code> einfügen —
        dann ist das Widget auf allen Seiten verfügbar.
      </Step>
      <H3>Jimdo</H3>
      <Step num={1} title="Widget-Element einfügen">
        Im Jimdo-Editor: <strong>„+"</strong> → <strong>„Widget/HTML"</strong> → Code einfügen → Speichern.
      </Step>
      <H3>Wix</H3>
      <Step num={1} title="HTML iframe Element">
        Im Wix-Editor: <strong>„+"</strong> → <strong>„Mehr"</strong> → <strong>„HTML iframe"</strong> →
        Code einfügen.
      </Step>
      <H3>Squarespace</H3>
      <Step num={1} title="Code-Block einfügen">
        Im Squarespace-Editor: <strong>„+"</strong> → <strong>„Code"</strong> → HTML-Modus →
        Code einfügen → Speichern.
      </Step>
      <H3>Buchungsformular — was Gäste sehen</H3>
      <P>
        Das Widget führt Gäste in vier Schritten durch den Buchungsprozess:
      </P>
      <ul style={{ margin: '10px 0 16px', paddingLeft: 20, lineHeight: 1.7, fontSize: 14, color: 'var(--text-muted)' }}>
        <li><strong>Schritt 1 – Reisedaten:</strong> Visueller Kalender-Datepicker (2-Monats-Ansicht). Gäste wählen Anreise durch Klick, dann Abreise — mit farbiger Range-Vorschau beim Hover. Nächte werden live angezeigt.</li>
        <li><strong>Schritt 2 – Apartment:</strong> Nur passende Apartments werden angezeigt; nicht verfügbare sind markiert. Jede Karte zeigt den Gesamtpreis — Klick auf „Preis Details" öffnet eine Aufschlüsselung mit Nächten, Preis pro Nacht, Endreinigung und Gesamtbetrag.</li>
        <li><strong>Schritt 3 – Zusatzleistungen:</strong> (falls aktiviert)</li>
        <li><strong>Schritt 4 – Persönliche Angaben:</strong> Pflichtfelder: Vorname, Nachname, E-Mail. Telefon und Adresse sind optional.</li>
      </ul>
      <Note>
        Pflichtfelder werden bei leerem Absenden direkt am Feld rot markiert — Gäste sehen sofort, was fehlt.
      </Note>
      <Note>
        Die Preisaufschlüsselung (Nächte × Rate, Endreinigung, Extras) ist in der rechten Sidebar jederzeit sichtbar und wird live aktualisiert.
      </Note>
      <H3>Mini-Widget (kompakter Datepicker)</H3>
      <P>
        Das Mini-Widget ist ein kompakter Datepicker für Landing Pages, Homepages oder Seitenleisten.
        Gäste wählen Anreise, Abreise und Gästezahl — ein Klick leitet sie direkt zum Buchungs-Widget weiter,
        mit vorausgefüllten Daten. Es zeigt außerdem automatisch an, ob der gewählte Zeitraum verfügbar ist.
      </P>
      <Step num={1} title="Ziel-URL festlegen">
        Gehe zu <strong>Widget & Design</strong> und klappe den Abschnitt <strong>„Mini-Widget"</strong> auf.
        Trage unter <strong>„Ziel-URL"</strong> die Seite ein, auf der dein Buchungs-Widget eingebunden ist —
        z.B. <Code>https://deine-website.at/buchen</Code>. Auch Anker-Links sind möglich:
        <Code>https://deine-website.at/buchen#buchungs-widget</Code>.
      </Step>
      <Step num={2} title="Embed-Code kopieren">
        Darunter findest du den Embed-Code in Deutsch und Englisch. Kopiere den gewünschten Code.
      </Step>
      <Step num={3} title="Auf deiner Website einfügen">
        Füge den Code dort ein, wo das Mini-Widget erscheinen soll — z.B. im Header oder Hero-Bereich.
      </Step>
      <Note>
        <strong>Hinweis:</strong> Auf der Ziel-Seite muss das Buchungs-Widget mit <Code>widget.js</Code> eingebunden sein,
        damit Anreise, Abreise und Gästezahl automatisch übernommen werden.
      </Note>
      <H3>Verfügbarkeits-Widget</H3>
      <P>
        Zeigt einen Monatskalender mit Frei/Belegt-Übersicht für alle Apartments — als iframe
        auf deiner Website einbindbar. Gäste sehen auf einen Blick, welche Zeiträume verfügbar sind.
      </P>
      <Step num={1} title="Embed-Code kopieren">
        Gehe zu <strong>Widget & Design</strong> und klappe den Abschnitt <strong>„Verfügbarkeits-Widget"</strong> auf.
        Kopiere den iframe-Code und füge ihn auf deiner Website ein.
      </Step>
      <Step num={2} title="Anzahl Monate anpassen">
        Im Embed-Code steht standardmäßig <Code>months=6</Code> — das bedeutet 6 Monate Navigation.
        Du kannst diesen Wert im Code auf deiner Website direkt ändern, z.B. <Code>months=3</Code> für 3 Monate.
      </Step>
      <Note>
        Das Widget ist responsiv: auf Desktop zeigt es die volle Breite, auf Mobilgeräten kann
        horizontal gescrollt werden. Die Apartment-Namen bleiben dabei links fixiert.
      </Note>

      <H3>Mehrere Widget-Konfigurationen</H3>
      <PlanNote plan="Pro" feature="Mehrere Widget-Varianten auf verschiedenen Seiten einbinden" />
      <P>
        Mit dem Pro-Plan kannst du verschiedene Widget-Konfigurationen erstellen und auf
        unterschiedlichen Seiten einbinden — z.B. eine für Anfragen, eine für direkte Buchungen.
      </P>
      <Tip>
        <strong>Tipp:</strong> Platziere das Widget auf einer eigenen Unterseite (z.B. „/buchen")
        und verlinke diese prominent in deiner Navigation — das erhöht die Conversion.
      </Tip>
    </div>
  );
}

