'use client';

import { useState } from 'react';

const sections = [
  { id: 'uebersicht',    title: 'Übersicht',            plan: null,       content: UebersichtSection },
  { id: 'buchungen',     title: 'Buchungen & Anfragen',  plan: null,       content: BuchungenSection },
  { id: 'kalender',      title: 'Kalender',              plan: null,       content: KalenderSection },
  { id: 'analytics',     title: 'Analytics',             plan: 'Business', content: AnalyticsSection },
  { id: 'apartments',    title: 'Apartments verwalten',  plan: null,       content: ApartmentsSection },
  { id: 'preise',        title: 'Preise & Saisons',      plan: 'Pro',      content: PreiseSection },
  { id: 'sperrzeiten',   title: 'Sperrzeiten',           plan: null,       content: SperrzeitenSection },
  { id: 'extras',        title: 'Zusatzleistungen',      plan: 'Pro',      content: ExtrasSection },
  { id: 'emails',        title: 'E-Mail Templates',      plan: 'Pro',      content: EmailsSection },
  { id: 'einstellungen', title: 'Einstellungen & Design', plan: null,      content: EinstellungenSection },
  { id: 'abonnement',    title: 'Abonnement',            plan: null,       content: AbonnementSection },
  { id: 'einbindung',    title: 'Widget einbinden',      plan: null,       content: EinbindungSection },
];

export default function HelpPage() {
  const [active, setActive] = useState('uebersicht');
  const current = sections.find((s) => s.id === active)!;
  const Content = current.content;

  return (
    <main className="admin-page" style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>
      <h1 style={{ margin: '0 0 6px' }}>Handbuch</h1>
      <p style={{ margin: '0 0 32px', fontSize: 14, color: '#6b7280' }}>
        Alles was Sie wissen müssen, um Bookingwulf optimal zu nutzen.
      </p>

      <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
        {/* Sidebar nav */}
        <nav style={{
          flexShrink: 0,
          width: 200,
          position: 'sticky',
          top: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}>
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
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
        <div style={{
          flex: 1,
          minWidth: 0,
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: 16,
          padding: '32px 40px',
        }}>
          <Content />
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
        Die Kommunikationssprache (Deutsch, Englisch, Italienisch) kann pro Buchung in der
        Detailansicht eingestellt werden. Sie wird beim Eingang automatisch aus der Browser-Sprache
        des Gastes ermittelt und kann jederzeit manuell geändert werden.
      </P>
      <Tip>
        <strong>Tipp:</strong> Setzen Sie den Status auf <strong>„Beantwortet"</strong> wenn Sie per
        E-Mail oder Telefon direkt geantwortet haben — so behalten Sie den Überblick ohne eine
        zusätzliche automatische Mail auszulösen.
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
        <strong>Tipp:</strong> Klicken Sie auf einen Eintrag im Kalender um direkt zur Anfragenübersicht
        zu gelangen.
      </Tip>
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
        definiert ist. Saisons haben immer Vorrang. Weitere Details unter <strong>Preise & Saisons</strong>.
      </P>

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

      <Note>
        <strong>Hinweis:</strong> Apartments können deaktiviert werden, ohne sie zu löschen.
        So bleiben historische Buchungsdaten erhalten.
      </Note>
    </div>
  );
}

function PreiseSection() {
  return (
    <div>
      <H2>Preise & Saisons</H2>
      <PlanNote plan="Pro" />
      <P>
        Unter <strong>Preissaisons</strong> können Sie für bestimmte Zeiträume abweichende Preise
        pro Nacht festlegen — z.B. für Hochsaison, Weihnachten oder Messen.
      </P>
      <H3>Saison anlegen</H3>
      <Step num={1} title="Zeitraum wählen">
        Geben Sie Start- und Enddatum der Saison ein.
      </Step>
      <Step num={2} title="Preis pro Nacht festlegen">
        Dieser Preis gilt für alle Apartments in diesem Zeitraum, sofern kein apartmentspezifischer
        Preis angegeben ist.
      </Step>
      <Step num={3} title="Speichern">
        Die Saison ist sofort aktiv. Bei Überschneidungen gilt die spezifischere Saison.
      </Step>
      <Note>
        <strong>Hinweis:</strong> Sperrzeiten (z.B. für Eigennutzung oder Renovierung) werden separat
        unter <strong>Sperrzeiten</strong> verwaltet.
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
      <Note>
        <strong>Unterschied zu Preissaisons:</strong> Sperrzeiten blockieren die Verfügbarkeit
        komplett. Preissaisons ändern nur den Preis, das Apartment bleibt buchbar.
      </Note>
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
      <H2>E-Mail Templates</H2>
      <PlanNote plan="Pro" />
      <P>
        Unter <strong>E-Mail Templates</strong> können Sie die automatisch versendeten E-Mails
        individuell anpassen — Anrede, Inhalt und Signatur.
      </P>
      <H3>Automatisch versendete E-Mails</H3>
      <div style={{ display: 'grid', gap: 8, margin: '12px 0' }}>
        {[
          { name: 'Eingangsbestätigung',   desc: 'An den Gast sobald eine Anfrage eingeht.' },
          { name: 'Buchungsbestätigung',   desc: 'An den Gast wenn Status auf „Gebucht" gesetzt wird.' },
          { name: 'Stornobestätigung',     desc: 'An den Gast wenn Status auf „Storniert" gesetzt wird.' },
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
        (Deutsch, Englisch oder Italienisch).
      </P>
      <Note>
        <strong>Hinweis:</strong> Wenn Sie den Status auf <strong>„Beantwortet"</strong> setzen,
        wird keine automatische Mail ausgelöst — ideal wenn Sie direkt per Telefon oder E-Mail
        geantwortet haben.
      </Note>
    </div>
  );
}

function EinstellungenSection() {
  return (
    <div>
      <H2>Einstellungen & Design</H2>
      <P>
        Unter <strong>Einstellungen</strong> passen Sie das Widget an das Design Ihrer Website an
        und konfigurieren grundlegende Parameter.
      </P>
      <H3>Design</H3>
      <P>
        Akzentfarbe, Schriftart, Hintergrundfarbe und weitere visuelle Parameter des Widgets lassen
        sich anpassen. Änderungen werden in der Live-Vorschau rechts sofort sichtbar.
      </P>
      <H3>Erweitertes Branding</H3>
      <PlanNote plan="Pro" feature="Erweitertes Branding (Logo, eigene Farben)" />
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
        auf verschiedenen Unterseiten eingebunden werden.
      </P>
      <H3>Embed-Code</H3>
      <P>
        Der Embed-Code für Ihre Website ist ebenfalls in den Einstellungen zu finden.
        Weitere Details unter <strong>Widget einbinden</strong>.
      </P>
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
            name: 'Starter', price: '€ 55 / Monat (€ 49 bei Jahreszahlung)',
            features: ['Bis zu 5 Apartments', '1 Admin-User', 'Basis Branding', 'E-Mail-Benachrichtigungen'],
          },
          {
            name: 'Pro', price: '€ 109 / Monat (€ 99 bei Jahreszahlung)',
            features: ['Bis zu 20 Apartments', '3 Admin-User', 'E-Mail Templates', 'Preissaisons', 'Zusatzleistungen', 'Widget-Konfigurationen'],
          },
          {
            name: 'Business', price: '€ 217 / Monat (€ 199 bei Jahreszahlung)',
            features: ['Unlimitierte Apartments & User', 'Bis zu 2 Hotelanlagen', 'Analytics', 'Direktnachrichten', 'Volles Branding', 'Priority Support'],
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
        Gehen Sie zu <strong>Einstellungen</strong> und scrollen Sie zum Abschnitt <strong>„Embed-Code"</strong>.
        Dort finden Sie Ihren persönlichen Code:
        <CodeBlock>{`<script src="https://www.bookingwulf.com/widget.js" data-hotel="ihr-hotel-slug"></script>`}</CodeBlock>
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
