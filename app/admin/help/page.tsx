'use client';

import { useState, useRef, createContext, useContext } from 'react';

const NavigateCtx = createContext<(id: string) => void>(() => {});

const sections = [
  { id: 'uebersicht',    title: 'Übersicht',            plan: null,       content: UebersichtSection },
  { id: 'buchungen',     title: 'Buchungen & Anfragen',  plan: null,       content: BuchungenSection },
  { id: 'kalender',      title: 'Kalender',              plan: null,       content: KalenderSection },
  { id: 'zimmerplan',   title: 'Zimmerplan',            plan: null,       content: ZimmerplanSection },
  { id: 'analytics',     title: 'Analytics',             plan: 'Business', content: AnalyticsSection },
  { id: 'apartments',    title: 'Apartments verwalten',  plan: null,       content: ApartmentsSection },
  { id: 'preise',        title: 'Preisanpassungen',       plan: null,       content: PreiseSection },
  { id: 'sperrzeiten',   title: 'Sperrzeiten',           plan: null,       content: SperrzeitenSection },
  { id: 'extras',        title: 'Zusatzleistungen',      plan: 'Pro',      content: ExtrasSection },
  { id: 'emails',        title: 'E-Mails & Check-in',    plan: null,       content: EmailsSection },
  { id: 'einstellungen', title: 'Widget & Design',         plan: null,      content: EinstellungenSection },
  { id: 'zahlungen',     title: 'Zahlungsarten',           plan: null,       content: ZahlungenSection },
  { id: 'abonnement',    title: 'Abonnement',            plan: null,       content: AbonnementSection },
  { id: 'nuki',          title: 'Schlüsselloses Einchecken', plan: 'Pro',   content: NukiSection },
  { id: 'beds24',        title: 'Beds24 Channel Manager', plan: 'Pro',    content: Beds24Section },
  { id: 'assistent',     title: 'KI-Assistent',          plan: 'Pro',      content: AssistentSection },
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
        Alles was Sie wissen müssen, um Bookingwulf optimal zu nutzen.
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
              border: `1px solid ${active === s.id ? '#111' : '#e5e7eb'}`,
              background: active === s.id ? '#111' : '#fff',
              color: active === s.id ? '#fff' : '#6b7280',
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
        <nav className="help-sidebar" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '12px 8px', alignSelf: 'start' }}>
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => navigate(s.id)}
              style={{
                textAlign: 'left',
                padding: '8px 12px',
                borderRadius: 8,
                border: 'none',
                background: active === s.id ? '#f3f4f6' : 'transparent',
                color: active === s.id ? '#111' : '#6b7280',
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
                  background: s.plan === 'Business' ? '#fef3c7' : '#ede9fe',
                  color: s.plan === 'Business' ? '#92400e' : '#5b21b6',
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
  return <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 8px', color: '#111' }}>{children}</h2>;
}
function H3({ children }: { children: React.ReactNode }) {
  return <h3 style={{ fontSize: 15, fontWeight: 600, margin: '24px 0 6px', color: '#111' }}>{children}</h3>;
}
function P({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 14, lineHeight: 1.7, color: '#374151', margin: '0 0 12px' }}>{children}</p>;
}
function Note({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#166534', margin: '12px 0' }}>
      {children}
    </div>
  );
}
function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#1e40af', margin: '12px 0' }}>
      {children}
    </div>
  );
}
function InternalLink({ id, children }: { id: string; children: React.ReactNode }) {
  const navigate = useContext(NavigateCtx);
  return (
    <button
      onClick={() => navigate(id)}
      style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', fontSize: 'inherit', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline dashed', textDecorationColor: '#9ca3af', textUnderlineOffset: 3 }}
    >
      {children}
    </button>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code style={{ background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 4, padding: '2px 6px', fontSize: 12, fontFamily: 'monospace', color: '#111' }}>
      {children}
    </code>
  );
}
function PlanNote({ plan, feature }: { plan: 'Pro' | 'Business'; feature?: string }) {
  const isPro = plan === 'Pro';
  return (
    <div style={{
      background: isPro ? '#f5f3ff' : '#fffbeb',
      border: `1px solid ${isPro ? '#ddd6fe' : '#fde68a'}`,
      borderRadius: 8, padding: '10px 14px', fontSize: 13,
      color: isPro ? '#5b21b6' : '#92400e', margin: '12px 0',
      display: 'flex', alignItems: 'center', gap: 8,
    }}>
      <span style={{ fontWeight: 700, padding: '1px 6px', borderRadius: 4, background: isPro ? '#ede9fe' : '#fef3c7', fontSize: 11 }}>
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
      <div style={{ flexShrink: 0, width: 28, height: 28, borderRadius: '50%', background: '#111', color: '#fff', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {num}
      </div>
      <div>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 14, color: '#374151', lineHeight: 1.6 }}>{children}</div>
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
          <div key={i.label} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
            <span style={{ fontSize: 13, fontWeight: 600, minWidth: 180, color: '#111' }}>{i.label}</span>
            <span style={{ fontSize: 13, color: '#6b7280' }}>{i.desc}</span>
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
        Von hier aus können Sie Anfragen beantworten, bestätigen oder stornieren.
      </P>
      <H3>Status einer Anfrage</H3>
      <div style={{ display: 'grid', gap: 8, margin: '12px 0' }}>
        {[
          { label: 'Neu',          color: '#f4f4f4', text: '#555',    desc: 'Anfrage eingegangen, noch nicht bearbeitet.' },
          { label: 'Beantwortet',  color: '#eaf2ff', text: '#2457a6', desc: 'Sie haben geantwortet — keine automatische Mail wird ausgelöst.' },
          { label: 'Gebucht',      color: '#e8f5e9', text: '#256029', desc: 'Buchung bestätigt. Gast erhält automatisch eine Bestätigungsmail.' },
          { label: 'Storniert',    color: '#fdecec', text: '#a63b3b', desc: 'Buchung storniert. Gast erhält automatisch eine Stornomail.' },
        ].map((s) => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ padding: '3px 10px', borderRadius: 6, background: s.color, color: s.text, fontSize: 12, fontWeight: 700, flexShrink: 0, minWidth: 100 }}>
              {s.label}
            </span>
            <span style={{ fontSize: 13, color: '#374151' }}>{s.desc}</span>
          </div>
        ))}
      </div>
      <H3>Nachricht senden</H3>
      <PlanNote plan="Business" feature="Direktnachrichten an Gäste" />
      <P>
        In der Buchungsdetailansicht können Sie dem Gast eine individuelle Nachricht schicken.
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
        <strong>Tipp:</strong> Setzen Sie den Status auf <strong>„Beantwortet"</strong> wenn Sie per
        E-Mail oder Telefon direkt geantwortet haben — so behalten Sie den Überblick ohne eine
        zusätzliche automatische Mail auszulösen.
      </Tip>
      <H3>Buchhaltungsexport (CSV)</H3>
      <P>
        Über den Button <strong>„CSV Export"</strong> oben rechts auf der Anfragen-Seite können Sie
        alle bestätigten Buchungen als CSV-Datei herunterladen — geeignet für Ihren Steuerberater
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
        Die MwSt.-Sätze (z.B. AT: Zimmer 10%, Reinigung 20%) hinterlegen Sie einmalig unter
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
            <span style={{ fontSize: 13, color: '#374151' }}>{c.label}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gap: 6, margin: '8px 0 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 12, height: 12, borderRadius: 2, background: '#ef4444', flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: '#374151' }}>Rot – Sperrzeit</span>
        </div>
      </div>
      <H3>Zeitraum per Drag anlegen</H3>
      <P>
        Halten Sie die Maustaste gedrückt und ziehen Sie über mehrere Tage, um einen Zeitraum zu markieren.
        Nach dem Loslassen öffnet sich ein Formular zum direkten Anlegen von:
      </P>
      <ul style={{ fontSize: 14, color: '#374151', lineHeight: 1.7, paddingLeft: 20, margin: '6px 0 12px' }}>
        <li><strong style={{ color: '#ef4444' }}>Sperrzeit</strong> – Apartment für einen Zeitraum sperren</li>
        <li><strong style={{ color: '#3b82f6' }}>Preiszeitraum</strong> – Saisonalen Preis festlegen</li>
        <li><strong style={{ color: '#10b981' }}>Buchung</strong> – Manuelle Buchung erfassen</li>
      </ul>
      <P>Start- und Enddatum sind im Formular editierbar, falls der gewünschte Zeitraum über einen Monatswechsel hinausgeht.</P>
      <H3>Navigation</H3>
      <P>
        Mit den Pfeilen links und rechts wechseln Sie den Monat. Der Button <strong>„Heute"</strong> bringt
        Sie direkt zum aktuellen Monat zurück.
      </P>
      <H3>KPI-Leiste</H3>
      <P>
        Oberhalb des Kalenders werden Anfragen, bestätigte Buchungen, gebuchte Nächte und
        Stornierungen für den gewählten Monat zusammengefasst.
      </P>
      <Tip>
        <strong>Tipp:</strong> Klicken Sie auf einen Eintrag im Kalender um direkt zur entsprechenden Übersicht zu gelangen.
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
        Mit den Pfeilen links wechseln Sie den Monat, <strong>„Heute"</strong> springt zum aktuellen Monat.
      </P>
      <H3>Sperrzeiten & Buchungen anlegen</H3>
      <P>
        Ziehen Sie in einer Apartment-Zeile mit gedrückter Maustaste einen Zeitraum auf — die
        markierten Tage werden lila hervorgehoben. Nach dem Loslassen öffnet sich ein Formular
        mit dem Apartment und den Daten bereits vorausgefüllt. Wählen Sie den Typ:
      </P>
      <ul style={{ margin: '6px 0 14px', paddingLeft: 20, fontSize: 13, color: '#374151', lineHeight: 1.7 }}>
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
            <span style={{ fontSize: 13, color: '#374151' }}>{c.label}</span>
          </div>
        ))}
      </div>
      <P>
        Bei belegten Apartments werden Gastname, verbleibende Tage sowie Anreise- und Abreisedatum
        angezeigt. Fällt die Abreise auf den gewählten Tag, erscheint ein <strong>„Check-out heute"</strong>-Badge.
        Mit dem Datumsfeld oben rechts können Sie jeden Tag prüfen.
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
        Oben rechts können Sie den Auswertungszeitraum filtern: letzter Monat, 3 Monate, 6 Monate,
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
          <div key={k.label} style={{ display: 'flex', gap: 10, padding: '6px 0', borderBottom: '1px solid #f3f4f6' }}>
            <span style={{ fontSize: 13, fontWeight: 600, minWidth: 140, color: '#111' }}>{k.label}</span>
            <span style={{ fontSize: 13, color: '#6b7280' }}>{k.desc}</span>
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
        Unter <strong>Apartments</strong> legen Sie alle buchbaren Einheiten an — Zimmer,
        Appartements, Suiten oder Häuser.
      </P>
      <H3>Limits je Plan</H3>
      <div style={{ display: 'grid', gap: 6, margin: '8px 0 16px' }}>
        {[
          { plan: 'Starter', limit: 'Bis zu 5 Apartments' },
          { plan: 'Pro',     limit: 'Bis zu 20 Apartments' },
          { plan: 'Business', limit: 'Unlimitierte Apartments' },
        ].map((p) => (
          <div key={p.plan} style={{ display: 'flex', gap: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 600, minWidth: 80, color: '#111' }}>{p.plan}</span>
            <span style={{ fontSize: 13, color: '#6b7280' }}>{p.limit}</span>
          </div>
        ))}
      </div>
      <H3>Apartment anlegen</H3>
      <Step num={1} title="Apartment hinzufügen">
        Geben Sie Name, Beschreibung, maximale Personenanzahl und Basispreis pro Nacht ein.
      </Step>
      <Step num={2} title="Bilder hochladen">
        Laden Sie ein oder mehrere Bilder hoch. Das erste Bild wird als Vorschaubild im Widget angezeigt.
      </Step>
      <Step num={3} title="Speichern">
        Das Apartment erscheint sofort im Widget auf Ihrer Website.
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
        In der Detailansicht jedes Apartments finden Sie den Abschnitt <strong>Kalender-Sync</strong>.
        Damit lassen sich Verfügbarkeiten mit Airbnb, Booking.com und anderen Plattformen
        automatisch abgleichen — in beide Richtungen.
      </P>
      <div style={{ display: 'grid', gap: 10, margin: '12px 0 16px' }}>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: '14px 16px' }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: '#111', marginBottom: 4 }}>Export-URL</div>
          <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>
            Eine eindeutige iCal-URL für das Apartment. Diese URL bei Airbnb oder Booking.com als
            importierten Kalender hinterlegen — so werden Ihre Buchungen dort automatisch als
            blockiert angezeigt.
          </div>
        </div>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: '14px 16px' }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: '#111', marginBottom: 4 }}>Import-Feeds</div>
          <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>
            Die iCal-URL von Airbnb oder Booking.com eintragen. Buchungen von dort werden
            automatisch als Sperrzeiten übernommen und verhindern Doppelbuchungen.
            Mit <strong>„Jetzt syncen"</strong> können Sie den Abgleich manuell anstoßen.
          </div>
        </div>
      </div>
      <Tip>
        <strong>Tipp:</strong> Tragen Sie bei Airbnb unter <em>Kalender → Verfügbarkeit → Anderen
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
        Unter <strong>Preisanpassungen</strong> verwalten Sie saisonale Preise, Abgaben, Kinderpreise
        und automatische Rabatte — alles auf einer Seite.
      </P>

      <H3>Preiszeiträume <span style={{ fontSize: 12, fontWeight: 500, color: '#7c3aed', background: '#ede9fe', padding: '2px 8px', borderRadius: 6, marginLeft: 6 }}>Pro</span></H3>
      <P>Für bestimmte Zeiträume abweichende Preise pro Nacht festlegen — z.B. für Hochsaison, Weihnachten oder Messen.</P>
      <Step num={1} title="Zeitraum wählen">
        Geben Sie Start- und Enddatum der Saison ein.
      </Step>
      <Step num={2} title="Preis pro Nacht festlegen">
        Dieser Preis gilt für alle Apartments in diesem Zeitraum, sofern kein apartmentspezifischer
        Preis angegeben ist.
      </Step>
      <Step num={3} title="Mindestaufenthalt (optional)">
        Sie können pro Saison eine Mindestanzahl an Nächten festlegen. Apartments mit zu kurzem
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
      <ul style={{ fontSize: 14, color: '#374151', lineHeight: 1.8, paddingLeft: 20, margin: '0 0 12px' }}>
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

      <H3>Belegungsbasierter Aufschlag <span style={{ fontSize: 12, fontWeight: 500, color: '#92400e', background: '#fef3c7', padding: '2px 8px', borderRadius: 6, marginLeft: 6 }}>Business</span></H3>
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
        Wählen Sie das Apartment, das gesperrt werden soll.
      </Step>
      <Step num={2} title="Zeitraum eingeben">
        Geben Sie Start- und Enddatum ein.
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
          { label: 'Name',        desc: 'Wird im Widget als Titel der Karte angezeigt.' },
          { label: 'Beschreibung', desc: 'Optionaler Kurztext unter dem Namen (z.B. "inkl. Kaffee und Saft").' },
          { label: 'Bild',        desc: 'Optionales Bild — wird als Thumbnail links in der Karte angezeigt. Per Klick hochladen (JPEG, PNG, WebP).' },
          { label: 'Link-URL',    desc: 'Optionaler externer Link (z.B. zur Versicherungsseite).' },
          { label: 'Nr.',         desc: 'Reihenfolge im Widget (aufsteigend sortiert).' },
        ].map((t) => (
          <div key={t.label} style={{ display: 'flex', gap: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 600, minWidth: 150, color: '#111' }}>{t.label}</span>
            <span style={{ fontSize: 13, color: '#6b7280' }}>{t.desc}</span>
          </div>
        ))}
      </div>
      <H3>Abrechnungsarten</H3>
      <div style={{ display: 'grid', gap: 6, margin: '8px 0 16px' }}>
        {[
          { label: 'Pro Nacht',          desc: 'Preis wird mit der Anzahl der Nächte multipliziert.' },
          { label: 'Pro Person/Nacht',   desc: 'Preis × Personen × Nächte.' },
          { label: 'Pro Aufenthalt',     desc: 'Einmaliger Fixbetrag, unabhängig von Dauer und Personen.' },
        ].map((t) => (
          <div key={t.label} style={{ display: 'flex', gap: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 600, minWidth: 150, color: '#111' }}>{t.label}</span>
            <span style={{ fontSize: 13, color: '#6b7280' }}>{t.desc}</span>
          </div>
        ))}
      </div>
      <H3>Versicherung</H3>
      <P>
        Die Reiseversicherung ist in allen Plänen verfügbar. Gäste können diese annehmen oder
        ablehnen — beides wird in der Buchungsübersicht und in den E-Mails angezeigt.
      </P>
      <Tip>
        <strong>Tipp:</strong> Halten Sie Zusatzleistungen kurz und klar — zu viele Optionen
        können Gäste überfordern.
      </Tip>
    </div>
  );
}

function EmailsSection() {
  return (
    <div>
      <H2>E-Mails & Check-in</H2>
      <P>
        Unter <strong>Konfiguration → E-Mails</strong> passen Sie automatische E-Mails an und
        konfigurieren den Online Check-in für Gäste.
      </P>
      <H3>E-Mail Templates <span style={{ fontSize: 12, fontWeight: 500, color: '#7c3aed', background: '#ede9fe', padding: '2px 8px', borderRadius: 6, marginLeft: 6 }}>Pro</span></H3>
      <P>Betreff, Anrede, Fließtext und Verabschiedung der automatischen E-Mails individuell anpassen.</P>
      <H3>Automatisch versendete E-Mails</H3>
      <div style={{ display: 'grid', gap: 8, margin: '12px 0' }}>
        {[
          { name: 'Eingangsbestätigung',   desc: 'An den Gast sobald eine Anfrage eingeht.' },
          { name: 'Buchungsbestätigung',   desc: 'An den Gast wenn Status auf „Gebucht" gesetzt wird.' },
          { name: 'Stornobestätigung',     desc: 'An den Gast wenn Status auf „Storniert" gesetzt wird. Individuell anpassbar.' },
          { name: 'Nachricht',             desc: 'Wenn Sie in der Detailansicht eine Nachricht senden. (Business)' },
          { name: 'Interne Benachrichtigung', desc: 'An Sie, wenn eine neue Anfrage eingeht.' },
        ].map((e) => (
          <div key={e.name} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
            <span style={{ fontSize: 13, fontWeight: 600, minWidth: 200, color: '#111' }}>{e.name}</span>
            <span style={{ fontSize: 13, color: '#6b7280' }}>{e.desc}</span>
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
        <strong>Hinweis:</strong> Wenn Sie den Status auf <strong>„Beantwortet"</strong> setzen,
        wird keine automatische Mail ausgelöst — ideal wenn Sie direkt per Telefon oder E-Mail
        geantwortet haben.
      </Note>

      <H3>Online Check-in</H3>
      <P>
        Gäste erhalten nach der Buchungsbestätigung einen persönlichen Link zu einem Formular,
        in dem sie ihre Ankunftszeit und optionale Hinweise angeben können. Falls eine Hausordnung
        hinterlegt ist, muss der Gast diese bestätigen.
      </P>
      <P>
        Der Betreiber sieht in der Buchungsdetailansicht ob der Check-in ausgefüllt wurde.
        Der Gast erhält genau eine Erinnerungsmail — X Tage vor Anreise, falls noch nicht ausgefüllt.
      </P>
    </div>
  );
}

function EinstellungenSection() {
  return (
    <div>
      <H2>Widget & Design</H2>
      <P>
        Unter <strong>Konfiguration → Widget & Design</strong> passen Sie das Widget an das Design
        Ihrer Website an und konfigurieren grundlegende Parameter.
      </P>
      <H3>Design</H3>
      <P>
        Im Abschnitt <strong>Typografie</strong> wählen Sie eine Schriftart für das Widget —
        z.B. Inter, Lato, Playfair Display oder eine andere Google Font. So lässt sich das Widget
        an Ihr Corporate Design anpassen.
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
        Geben Sie Ihre E-Mail-Adresse ein, an die neue Anfragen gemeldet werden sollen.
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
        Im Abschnitt <strong>Features</strong> steuern Sie Verhalten und Umfang des Widgets.
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
          <div key={f.label} style={{ display: 'flex', gap: 10, padding: '7px 0', borderBottom: '1px solid #f3f4f6' }}>
            <span style={{ fontSize: 13, fontWeight: 600, minWidth: 220, color: '#111', flexShrink: 0 }}>{f.label}</span>
            <span style={{ fontSize: 13, color: '#6b7280' }}>{f.desc}</span>
          </div>
        ))}
      </div>

      <H3>Barrierefreiheits-Check</H3>
      <P>
        Unterhalb der Farbfelder zeigt ein WCAG-Kontrast-Checker automatisch an, ob Ihre Farbkombinationen
        den Mindestkontrast (AA = 4,5:1) erfüllen. Bei einem Fail erscheint ein Vorschlag für die
        nächstähnliche barrierefreie Farbe — ein Klick darauf übernimmt sie direkt.
      </P>

      <H3>Embed-Code</H3>
      <P>
        Der Embed-Code für Ihre Website ist ebenfalls in den Einstellungen zu finden.
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
        {[
          { step: '1', text: 'Gehe zu developer.paypal.com und melde dich mit deinem Business-Konto an.' },
          { step: '2', text: 'Klicke auf „Apps & Credentials" → „Create App". Gib der App einen Namen (z.B. „Bookingwulf") und wähle „Merchant".' },
          { step: '3', text: 'Nach dem Erstellen siehst du Client ID und Client Secret — zuerst im Sandbox-Modus. Für den Live-Betrieb wechsle oben rechts auf „Live" und kopiere die Live-Zugangsdaten.' },
          { step: '4', text: 'Trage Client ID und Client Secret unter Zahlungsarten → PayPal ein und aktiviere den Toggle.' },
        ].map((item) => (
          <div key={item.step} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
            <span style={{ fontSize: 12, fontWeight: 700, background: '#f3f4f6', color: '#6b7280', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>{item.step}</span>
            <span style={{ fontSize: 13, color: '#374151', lineHeight: 1.6 }}>{item.text}</span>
          </div>
        ))}
      </div>
      <Tip>
        Link: <strong>developer.paypal.com</strong> → Apps &amp; Credentials → Create App
      </Tip>

      <H3>Stripe (Kreditkarte) einrichten</H3>
      <P>
        Mit Stripe können Gäste direkt im Widget mit Kreditkarte zahlen — ohne Weiterleitung.
        Du verwendest deinen eigenen Stripe-Account, das Geld geht direkt an dich.
      </P>
      <div style={{ display: 'grid', gap: 8, margin: '8px 0 16px' }}>
        {[
          { step: '1', text: 'Erstelle ein Konto auf stripe.com (kostenlos). Verifiziere dein Business und hinterlege deine Bankverbindung für Auszahlungen.' },
          { step: '2', text: 'Gehe im Stripe Dashboard zu Entwickler → API-Schlüssel.' },
          { step: '3', text: 'Kopiere den Publishable Key (beginnt mit pk_live_…) und den Secret Key (sk_live_…).' },
          { step: '4', text: 'Trage beide Schlüssel unter Zahlungsarten → Kreditkarte (Stripe) ein und aktiviere den Toggle.' },
        ].map((item) => (
          <div key={item.step} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
            <span style={{ fontSize: 12, fontWeight: 700, background: '#f3f4f6', color: '#6b7280', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>{item.step}</span>
            <span style={{ fontSize: 13, color: '#374151', lineHeight: 1.6 }}>{item.text}</span>
          </div>
        ))}
      </div>
      <Tip>
        Link: <strong>dashboard.stripe.com/apikeys</strong>
      </Tip>
      <Note>
        Stripe erhebt pro Transaktion eine eigene Gebühr (ca. 1,5 % + 0,25 € für europäische Karten).
        Diese Kosten sind unabhängig von bookingwulf und werden direkt von Stripe abgerechnet.
      </Note>
    </div>
  );
}

function AbonnementSection() {
  return (
    <div>
      <H2>Abonnement</H2>
      <P>
        Unter <strong>Abonnement</strong> sehen Sie Ihren aktuellen Plan, verwalten Ihre
        Zahlungsmethode und können jederzeit upgraden oder kündigen.
      </P>
      <H3>Verfügbare Pläne</H3>
      <div style={{ display: 'grid', gap: 12, margin: '12px 0 20px' }}>
        {[
          {
            name: 'Starter', price: '€ 59 / Monat (€ 54 bei Jahreszahlung)',
            features: ['Bis zu 3 Apartments', '1 Admin-User', 'Basis Branding', 'E-Mail-Benachrichtigungen'],
          },
          {
            name: 'Pro', price: '€ 119 / Monat (€ 109 bei Jahreszahlung)',
            features: ['Bis zu 15 Apartments', '3 Admin-User', 'E-Mail Templates', 'Preiszeiträume', 'Mindestaufenthalt', 'Last-Minute Rabatt', 'Zusatzleistungen', 'Kinderpreise', 'Widget-Konfigurationen'],
          },
          {
            name: 'Business', price: '€ 249 / Monat (€ 229 bei Jahreszahlung)',
            features: ['Unlimitierte Apartments & User', 'Bis zu 2 Hotelanlagen', 'Analytics', 'Direktnachrichten', 'Belegungsaufschlag', 'Volles Branding', 'Priority Support'],
          },
        ].map((p) => (
          <div key={p.name} style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: '14px 18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontWeight: 700, fontSize: 15, color: '#111' }}>{p.name}</span>
              <span style={{ fontSize: 13, color: '#6b7280' }}>{p.price}</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {p.features.map((f) => (
                <span key={f} style={{ fontSize: 12, padding: '2px 8px', borderRadius: 999, background: '#f3f4f6', color: '#374151' }}>{f}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <H3>14 Tage kostenlos testen</H3>
      <P>
        Jeder neue Account startet automatisch mit einer 14-tägigen Testphase im Business-Plan —
        ohne Kreditkarte. Nach Ablauf können Sie einen Plan wählen oder das Abo kündigen.
      </P>
      <H3>Kündigung</H3>
      <P>
        Das Abonnement ist monatlich kündbar. Nach der Kündigung bleibt der Zugang bis Ende des
        bezahlten Zeitraums aktiv.
      </P>
      <Tip>
        <strong>Tipp:</strong> Mit der jährlichen Zahlung sparen Sie ca. 10 % gegenüber der
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
        kein physischer Schlüssel, kein Koordinationsaufwand. Das System kommuniziert direkt mit Ihren
        Nuki-Schlössern über die Nuki Web API.
      </P>

      <H3>Voraussetzungen</H3>
      <ul style={{ fontSize: 14, color: '#374151', lineHeight: 1.8, paddingLeft: 20, margin: '0 0 16px' }}>
        <li>Nuki-Schloss mit verbundenem Keypad (Nuki Keypad oder Keypad 2.0)</li>
        <li>Nuki Web-Konto unter <strong>web.nuki.io</strong></li>
        <li>Sofortbuchung im Widget aktiviert (<InternalLink id="einstellungen">Widget & Design</InternalLink>)</li>
        <li>Pro-Plan oder höher</li>
      </ul>

      <H3>Einrichtung</H3>
      <Step num={1} title="API-Token erstellen">
        <P>
          Melden Sie sich unter <strong>web.nuki.io</strong> an → oben rechts auf Ihren Namen klicken →
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
      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '16px 20px', marginBottom: 16, fontSize: 14, color: '#166534' }}>
        <strong>🔑 Beispiel-Code in der Gast-E-Mail:</strong>
        <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '0.15em', fontFamily: 'monospace', margin: '8px 0 4px' }}>4 8 2 1 9 3</div>
        <div style={{ fontSize: 13 }}>Gültig von Anreise bis Abreise — öffnet das Schloss direkt vor Ort.</div>
      </div>

      <H3>Hinweise</H3>
      <ul style={{ fontSize: 14, color: '#374151', lineHeight: 1.8, paddingLeft: 20, margin: '0 0 16px' }}>
        <li>Pro Apartment kann genau ein Schloss zugewiesen werden.</li>
        <li>Der Code läuft nach der Abreise automatisch ab (wird von Nuki deaktiviert).</li>
        <li>Bei reinen Anfragen (kein Sofortbuchungs-Modus) wird kein Code generiert.</li>
        <li>Schlägt die Code-Generierung fehl (z.B. Netzwerkfehler), wird die Buchung trotzdem gespeichert — der Gast erhält dann keinen Code. Sie erhalten in diesem Fall automatisch eine E-Mail-Benachrichtigung, damit Sie den Zugang manuell bereitstellen können.</li>
        <li>Den API-Token können Sie jederzeit aktualisieren oder die Verbindung trennen.</li>
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
      <ul style={{ fontSize: 14, color: '#374151', lineHeight: 1.9, paddingLeft: 20, margin: '0 0 16px' }}>
        <li><strong>Buchung bei Ihnen</strong> → bookingwulf meldet sie an Beds24 → Airbnb/Booking.com wird sofort gesperrt</li>
        <li><strong>Buchung auf Airbnb/Booking.com</strong> → Beds24 schickt Webhook → bookingwulf sperrt sofort</li>
      </ul>

      <H3>Voraussetzungen</H3>
      <ul style={{ fontSize: 14, color: '#374151', lineHeight: 1.8, paddingLeft: 20, margin: '0 0 16px' }}>
        <li>Beds24-Account (ca. €9/Monat pro Property — <strong>beds24.com</strong>)</li>
        <li>Airbnb und/oder Booking.com bereits in Beds24 verbunden</li>
        <li>Pro-Plan in bookingwulf</li>
      </ul>

      <H3>Einrichtung</H3>
      <Step num={1} title="Beds24-Account anlegen & Kanäle verbinden">
        <P>
          Registrieren Sie sich unter <strong>beds24.com</strong> und verbinden Sie dort Airbnb und/oder
          Booking.com über das Beds24-Dashboard (Channel Manager).
        </P>
      </Step>
      <Step num={2} title="Invite Code generieren & Verbindung herstellen">
        <P>
          In Beds24 unter <strong>Einstellungen → Marketplace → API → Einladungscode erstellen</strong> einen
          neuen Code generieren (Berechtigungen: bookings lesen + ändern, inventory lesen).
          Den Code im bookingwulf Admin unter <strong>Beds24 Channel Manager</strong> einfügen und auf
          „Verbinden" klicken. Invite Codes sind Einmalcodes — nach Verbindung werden sie nicht mehr benötigt.
        </P>
      </Step>
      <Step num={3} title="Zimmer zuordnen">
        <P>
          Ordnen Sie jedem Apartment die entsprechende <strong>Beds24 Einheit ID</strong> zu
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
      <ul style={{ fontSize: 14, color: '#374151', lineHeight: 1.8, paddingLeft: 20, margin: '0 0 16px' }}>
        <li>Buchung bei Ihnen → Airbnb gesperrt: <strong>~1–2 Minuten</strong></li>
        <li>Buchung auf Airbnb → bei Ihnen gesperrt: <strong>Echtzeit via Webhook</strong></li>
        <li>Zum Vergleich: iCal-Sync alle 30 Minuten</li>
      </ul>
    </div>
  );
}

function AssistentSection() {
  return (
    <div>
      <H2>KI-Assistent</H2>
      <PlanNote plan="Pro" />
      <P>
        Der bookingwulf-Assistent beantwortet Fragen zur Bedienung des Admin-Bereichs direkt im Chat —
        ohne dass du das Handbuch durchsuchen oder den Support kontaktieren musst.
      </P>
      <H3>Öffnen & verwenden</H3>
      <P>
        Der Assistent ist als runder Chat-Button unten rechts im Admin sichtbar. Klicke darauf,
        tippe deine Frage und bestätige mit Enter oder dem Senden-Button.
      </P>
      <H3>Was du fragen kannst</H3>
      <div style={{ display: 'grid', gap: 6, margin: '8px 0 16px' }}>
        {[
          { label: 'Bedienung',     desc: 'Wie funktioniert Sperrzeiten anlegen? Wo finde ich die E-Mail-Vorlagen?' },
          { label: 'Navigation',    desc: 'Wo ist der Zimmerplan? Wie komme ich zu den Preisanpassungen?' },
          { label: 'Seitenbezogen',  desc: 'Was mache ich hier? Wofür ist das?' },
          { label: 'Funktionen',    desc: 'Was kann der Beds24 Channel Manager? Wie funktioniert Nuki?' },
        ].map((t) => (
          <div key={t.label} style={{ display: 'flex', gap: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 600, minWidth: 130, color: '#111' }}>{t.label}</span>
            <span style={{ fontSize: 13, color: '#6b7280' }}>{t.desc}</span>
          </div>
        ))}
      </div>
      <H3>Verlauf & löschen</H3>
      <P>
        Der Chatverlauf bleibt gespeichert, auch wenn du die Seite wechselst oder den Browser schließt.
        Über das Papierkorb-Symbol oben rechts im Chat kannst du den Verlauf jederzeit löschen.
      </P>
      <Tip>
        <strong>Tipp:</strong> Der Assistent kennt die aktuelle Seite — auf vage Fragen wie
        "Was mache ich hier?" antwortet er konkret zum Bereich, in dem du dich gerade befindest.
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
        Gehen Sie zu <strong>Widget & Design</strong> und scrollen Sie zum Abschnitt <strong>„Embed-Code"</strong>.
        Dort finden Sie Ihren persönlichen Code:
        <CodeBlock>{`<script src="https://bookingwulf.com/widget.js" data-hotel="ihr-hotel-slug"></script>`}</CodeBlock>
        Klicken Sie auf <strong>„Kopieren"</strong>.
      </Step>
      <Step num={2} title="Code auf Ihrer Website einfügen">
        Fügen Sie den Code in den HTML-Quelltext der Seite ein, auf der das Widget erscheinen soll —
        z.B. auf einer Seite namens „Buchen". Der Code muss im <Code>{'<body>'}</Code>-Bereich platziert werden.
      </Step>
      <Step num={3} title="Fertig">
        Das Widget lädt sich automatisch und passt sich der Breite der Seite an.
      </Step>
      <Note>
        <strong>Wichtig:</strong> Der <Code>data-hotel</Code>-Wert ist Ihr persönlicher Hotel-Slug
        und bereits vorausgefüllt. Ändern Sie diesen Wert nicht.
      </Note>
      <H3>Sprache des Widgets</H3>
      <P>
        Das Widget unterstützt Deutsch und Englisch. Die Sprache wird über das optionale Attribut
        <Code>data-lang</Code> gesteuert:
      </P>
      <CodeBlock>{`<script src="https://bookingwulf.com/widget.js" data-hotel="ihr-hotel-slug" data-lang="en"></script>`}</CodeBlock>
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
      <ul style={{ margin: '10px 0 16px', paddingLeft: 20, lineHeight: 1.7, fontSize: 14, color: '#374151' }}>
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
        Gehen Sie zu <strong>Widget & Design</strong> und klappen Sie den Abschnitt <strong>„Mini-Widget"</strong> auf.
        Tragen Sie unter <strong>„Ziel-URL"</strong> die Seite ein, auf der Ihr Buchungs-Widget eingebunden ist —
        z.B. <Code>https://ihre-website.at/buchen</Code>. Auch Anker-Links sind möglich:
        <Code>https://ihre-website.at/buchen#buchungs-widget</Code>.
      </Step>
      <Step num={2} title="Embed-Code kopieren">
        Darunter finden Sie den Embed-Code in Deutsch und Englisch. Kopieren Sie den gewünschten Code.
      </Step>
      <Step num={3} title="Auf Ihrer Website einfügen">
        Fügen Sie den Code dort ein, wo das Mini-Widget erscheinen soll — z.B. im Header oder Hero-Bereich.
      </Step>
      <Note>
        <strong>Hinweis:</strong> Auf der Ziel-Seite muss das Buchungs-Widget mit <Code>widget.js</Code> eingebunden sein,
        damit Anreise, Abreise und Gästezahl automatisch übernommen werden.
      </Note>
      <H3>Mehrere Widget-Konfigurationen</H3>
      <PlanNote plan="Pro" feature="Mehrere Widget-Varianten auf verschiedenen Seiten einbinden" />
      <P>
        Mit dem Pro-Plan können Sie verschiedene Widget-Konfigurationen erstellen und auf
        unterschiedlichen Seiten einbinden — z.B. eine für Anfragen, eine für direkte Buchungen.
      </P>
      <Tip>
        <strong>Tipp:</strong> Platzieren Sie das Widget auf einer eigenen Unterseite (z.B. „/buchen")
        und verlinken Sie diese prominent in Ihrer Navigation — das erhöht die Conversion.
      </Tip>
    </div>
  );
}

