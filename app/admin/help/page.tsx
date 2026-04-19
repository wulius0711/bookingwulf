'use client';

import { useState } from 'react';

const sections = [
  {
    id: 'einbindung',
    title: 'Widget einbinden',
    content: EinbindungSection,
  },
  {
    id: 'apartments',
    title: 'Apartments verwalten',
    content: ApartmentsSection,
  },
  {
    id: 'buchungen',
    title: 'Buchungen & Anfragen',
    content: BuchungenSection,
  },
  {
    id: 'preise',
    title: 'Preise & Saisons',
    content: PreiseSection,
  },
  {
    id: 'extras',
    title: 'Zusatzleistungen',
    content: ExtrasSection,
  },
  {
    id: 'emails',
    title: 'E-Mail Templates',
    content: EmailsSection,
  },
  {
    id: 'einstellungen',
    title: 'Einstellungen & Design',
    content: EinstellungenSection,
  },
];

export default function HelpPage() {
  const [active, setActive] = useState('einbindung');
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
              }}
            >
              {s.title}
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

/* ─── Section components ───────────────────────────────────── */

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
    <div style={{
      background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8,
      padding: '10px 14px', fontSize: 13, color: '#166534', margin: '12px 0',
    }}>
      {children}
    </div>
  );
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8,
      padding: '10px 14px', fontSize: 13, color: '#1e40af', margin: '12px 0',
    }}>
      {children}
    </div>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code style={{
      background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 4,
      padding: '2px 6px', fontSize: 12, fontFamily: 'monospace', color: '#111',
    }}>
      {children}
    </code>
  );
}

function CodeBlock({ children }: { children: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div style={{ position: 'relative', margin: '12px 0' }}>
      <pre style={{
        background: '#1e293b', color: '#e2e8f0', borderRadius: 10,
        padding: '16px 20px', fontSize: 12, fontFamily: 'monospace',
        overflowX: 'auto', margin: 0, lineHeight: 1.6,
        whiteSpace: 'pre-wrap', wordBreak: 'break-all',
      }}>
        {children}
      </pre>
      <button
        onClick={() => { navigator.clipboard.writeText(children); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
        style={{
          position: 'absolute', top: 10, right: 10,
          padding: '4px 10px', borderRadius: 6, border: 'none',
          background: copied ? '#22c55e' : '#334155', color: '#fff',
          fontSize: 11, cursor: 'pointer',
        }}
      >
        {copied ? 'Kopiert!' : 'Kopieren'}
      </button>
    </div>
  );
}

function Step({ num, title, children }: { num: number; title: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
      <div style={{
        flexShrink: 0, width: 28, height: 28, borderRadius: '50%',
        background: '#111', color: '#fff', fontSize: 13, fontWeight: 700,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {num}
      </div>
      <div>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 14, color: '#374151', lineHeight: 1.6 }}>{children}</div>
      </div>
    </div>
  );
}

/* ─── Individual Sections ──────────────────────────────────── */

function EinbindungSection() {
  return (
    <div>
      <H2>Widget einbinden</H2>
      <P>
        Das Bookingwulf-Widget lässt sich mit einer einzigen Zeile Code auf jeder Website einbinden —
        egal ob WordPress, Jimdo, Wix, Squarespace oder eine eigene HTML-Seite.
      </P>

      <H3>Schritt-für-Schritt Anleitung</H3>

      <Step num={1} title="Embed-Code kopieren">
        Gehen Sie in der Admin-Oberfläche zu <strong>Einstellungen</strong> und scrollen Sie zum Abschnitt{' '}
        <strong>„Embed-Code"</strong>. Dort finden Sie Ihren persönlichen Code, der so aussieht:
        <CodeBlock>{`<script src="https://www.bookingwulf.com/widget.js" data-hotel="ihr-hotel-slug"></script>`}</CodeBlock>
        Klicken Sie auf <strong>„Kopieren"</strong>.
      </Step>

      <Step num={2} title="Code auf Ihrer Website einfügen">
        Fügen Sie den Code in den HTML-Quelltext der Seite ein, auf der das Widget erscheinen soll —
        z.B. auf einer Seite namens „Buchen" oder „Verfügbarkeit". Der Code muss direkt im{' '}
        <Code>{'<body>'}</Code>-Bereich platziert werden, idealerweise am Ende der Seite.
      </Step>

      <Step num={3} title="Fertig – Widget erscheint automatisch">
        Das Widget lädt sich selbst und passt sich der Breite Ihrer Seite an.
        Es ist nicht nötig, etwas weiter zu konfigurieren.
      </Step>

      <Note>
        <strong>Wichtig:</strong> Der <Code>data-hotel</Code>-Wert ist Ihr persönlicher Hotel-Slug und ist bereits vorausgefüllt.
        Ändern Sie diesen Wert nicht.
      </Note>

      <H3>WordPress</H3>
      <P>
        In WordPress gibt es zwei Möglichkeiten, den Code einzufügen:
      </P>
      <Step num={1} title='Block „Benutzerdefiniertes HTML" hinzufügen'>
        Öffnen Sie die gewünschte Seite im Gutenberg-Editor. Klicken Sie auf das{' '}
        <strong>„+"</strong>-Symbol um einen neuen Block hinzuzufügen, suchen Sie nach{' '}
        <strong>„Benutzerdefiniertes HTML"</strong> und fügen Sie dort den Embed-Code ein.
      </Step>
      <Step num={2} title="Alternativ: Theme-Footer (für alle Seiten)">
        Unter <strong>Design → Theme-Editor → footer.php</strong> (oder via Plugin wie{' '}
        <em>Insert Headers and Footers</em>) den Code vor <Code>{'</body>'}</Code> einfügen.
      </Step>

      <H3>Jimdo</H3>
      <Step num={1} title="Widget-Element einfügen">
        Im Jimdo-Editor auf <strong>„+"</strong> klicken → <strong>„Widget/HTML"</strong> auswählen →
        Code einfügen → Speichern.
      </Step>

      <H3>Wix</H3>
      <Step num={1} title="HTML iframe Element">
        Im Wix-Editor: <strong>„+"</strong> → <strong>„Mehr"</strong> → <strong>„HTML iframe"</strong> →
        Code einfügen. Alternativ über den Wix Velo Code-Editor direkt im Body.
      </Step>

      <H3>Squarespace</H3>
      <Step num={1} title="Code-Block einfügen">
        Im Squarespace-Editor: <strong>„+"</strong> → <strong>„Code"</strong> → HTML-Modus aktivieren →
        Code einfügen → Speichern.
      </Step>

      <H3>Mehrere Seiten oder Widgets</H3>
      <P>
        Sie können das Widget auf mehreren Seiten Ihrer Website einbinden — z.B. einmal für Anfragen
        und einmal für eine direkte Buchungsseite. Mit dem Pro-Plan können Sie zusätzlich verschiedene{' '}
        <strong>Widget-Konfigurationen</strong> erstellen (z.B. unterschiedliche Farben oder Apartment-Auswahl).
      </P>
      <Tip>
        <strong>Tipp:</strong> Platzieren Sie das Widget auf einer eigenen Unterseite (z.B. „/buchen") und
        verlinken Sie diese prominent in Ihrer Navigation — das erhöht die Conversion deutlich.
      </Tip>
    </div>
  );
}

function ApartmentsSection() {
  return (
    <div>
      <H2>Apartments verwalten</H2>
      <P>
        Unter <strong>Apartments</strong> legen Sie alle buchbaren Einheiten an — Zimmer, Appartements,
        Suiten oder Häuser.
      </P>

      <H3>Apartment anlegen</H3>
      <Step num={1} title={'„Apartment hinzufügen" klicken'}>
        Geben Sie Name, Beschreibung, maximale Personenanzahl und Basispreis pro Nacht ein.
      </Step>
      <Step num={2} title="Bilder hochladen">
        Laden Sie bis zu mehrere Bilder hoch. Das erste Bild wird als Vorschaubild im Widget angezeigt.
      </Step>
      <Step num={3} title="Speichern">
        Das Apartment erscheint sofort im Widget auf Ihrer Website.
      </Step>

      <H3>Basispreis vs. Saisons</H3>
      <P>
        Der Basispreis gilt das ganze Jahr, sofern keine Preissaison für den jeweiligen Zeitraum
        definiert ist. Saisons haben immer Vorrang. Weitere Details finden Sie unter{' '}
        <strong>Preise & Saisons</strong>.
      </P>

      <Note>
        <strong>Hinweis:</strong> Apartments können deaktiviert werden, ohne sie zu löschen.
        So bleiben historische Buchungsdaten erhalten.
      </Note>
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
          { label: 'Neu', color: '#f4f4f4', text: '#555', desc: 'Anfrage eingegangen, noch nicht bearbeitet.' },
          { label: 'Beantwortet', color: '#eaf2ff', text: '#2457a6', desc: 'Sie haben geantwortet — keine automatische Mail.' },
          { label: 'Gebucht', color: '#e8f5e9', text: '#256029', desc: 'Buchung bestätigt. Gast erhält eine Bestätigungsmail.' },
          { label: 'Storniert', color: '#fdecec', text: '#a63b3b', desc: 'Buchung storniert. Gast erhält eine Stornomail.' },
        ].map((s) => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{
              padding: '3px 10px', borderRadius: 6, background: s.color,
              color: s.text, fontSize: 12, fontWeight: 700, flexShrink: 0, minWidth: 100,
            }}>
              {s.label}
            </span>
            <span style={{ fontSize: 13, color: '#374151' }}>{s.desc}</span>
          </div>
        ))}
      </div>

      <H3>Nachricht senden</H3>
      <P>
        In der Buchungsdetailansicht können Sie dem Gast eine individuelle Nachricht schicken.
        Diese wird in der Sprache des Gastes (de/en/it) verfasst und automatisch als E-Mail versendet.
      </P>

      <H3>Sprache pro Buchung</H3>
      <P>
        In der Detailansicht können Sie die Kommunikationssprache pro Buchung einstellen (Deutsch,
        Englisch, Italienisch). Alle Status-Mails und Nachrichten werden dann in dieser Sprache gesendet.
        Die Sprache wird beim ersten Eingang automatisch aus der Browser-Sprache des Gastes ermittelt.
      </P>

      <Tip>
        <strong>Tipp:</strong> Setzen Sie den Status auf <strong>„Beantwortet"</strong> wenn Sie per E-Mail
        oder Telefon direkt geantwortet haben — so behalten Sie den Überblick ohne eine zusätzliche Mail auszulösen.
      </Tip>
    </div>
  );
}

function PreiseSection() {
  return (
    <div>
      <H2>Preise & Saisons</H2>
      <P>
        Unter <strong>Preissaisons</strong> können Sie für bestimmte Zeiträume abweichende Preise pro
        Nacht festlegen — z.B. für Hochsaison, Weihnachten oder Messen.
      </P>

      <H3>Saison anlegen</H3>
      <Step num={1} title="Zeitraum wählen">
        Geben Sie Start- und Enddatum der Saison ein.
      </Step>
      <Step num={2} title="Preis pro Nacht festlegen">
        Dieser Preis gilt für alle Apartments in diesem Zeitraum, sofern Sie keinen apartmentspezifischen
        Preis angeben.
      </Step>
      <Step num={3} title="Speichern">
        Die Saison ist sofort aktiv. Bei Überschneidungen gilt die spezifischere Saison.
      </Step>

      <Note>
        <strong>Hinweis:</strong> Sperrzeiten (z.B. für Eigennutzung oder Renovierung) werden separat
        unter <strong>Sperrzeiten</strong> verwaltet und blockieren das Apartment im Widget vollständig.
      </Note>
    </div>
  );
}

function ExtrasSection() {
  return (
    <div>
      <H2>Zusatzleistungen</H2>
      <P>
        Zusatzleistungen sind optionale Leistungen, die Gäste bei der Buchung dazubuchen können —
        z.B. Frühstück, Haustier, Parkplatz oder Endreinigung.
      </P>

      <H3>Zusatzleistung anlegen</H3>
      <P>
        Unter <strong>Zusatzleistungen</strong> können Sie Name, Preis und Abrechnungsart festlegen:
      </P>
      <div style={{ display: 'grid', gap: 6, margin: '8px 0 16px' }}>
        {[
          { label: 'Pro Nacht', desc: 'Preis wird mit der Anzahl der Nächte multipliziert.' },
          { label: 'Pro Person/Nacht', desc: 'Preis × Personen × Nächte.' },
          { label: 'Pro Aufenthalt', desc: 'Einmaliger Fixbetrag, unabhängig von Dauer und Personen.' },
        ].map((t) => (
          <div key={t.label} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#111', minWidth: 130 }}>{t.label}</span>
            <span style={{ fontSize: 13, color: '#6b7280' }}>{t.desc}</span>
          </div>
        ))}
      </div>

      <H3>Versicherung</H3>
      <P>
        Eine spezielle Zusatzleistung ist die Reiseversicherung. Gäste können diese annehmen oder
        ablehnen — beides wird in der Buchungsübersicht und in den E-Mails angezeigt.
      </P>

      <Tip>
        <strong>Tipp:</strong> Halten Sie Zusatzleistungen kurz und klar — zu viele Optionen können
        Gäste überfordern.
      </Tip>
    </div>
  );
}

function EmailsSection() {
  return (
    <div>
      <H2>E-Mail Templates</H2>
      <P>
        Unter <strong>E-Mail Templates</strong> können Sie die automatisch versendeten E-Mails
        individuell anpassen — z.B. Anrede, Inhalt und Signatur.
      </P>

      <H3>Welche E-Mails werden automatisch versendet?</H3>
      <div style={{ display: 'grid', gap: 8, margin: '12px 0' }}>
        {[
          { name: 'Eingangsbestätigung', desc: 'Geht an den Gast sobald eine Anfrage eingeht.' },
          { name: 'Buchungsbestätigung', desc: 'Geht an den Gast wenn Sie den Status auf „Gebucht" setzen.' },
          { name: 'Stornobestätigung', desc: 'Geht an den Gast wenn Sie den Status auf „Storniert" setzen.' },
          { name: 'Nachricht', desc: 'Wenn Sie über die Buchungsdetailansicht eine Nachricht senden.' },
          { name: 'Benachrichtigung (intern)', desc: 'Geht an Sie wenn eine neue Anfrage eingeht.' },
        ].map((e) => (
          <div key={e.name} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
            <span style={{ fontSize: 13, fontWeight: 600, minWidth: 180, color: '#111' }}>{e.name}</span>
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
        <strong>Hinweis:</strong> Wenn bei der Buchung kein Status gesetzt wird und Sie direkt antworten,
        setzen Sie den Status auf <strong>„Beantwortet"</strong> — dann wird keine automatische Mail ausgelöst.
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
        Sie können Akzentfarbe, Schriftart, Hintergrundfarbe und weitere visuelle Parameter
        des Widgets anpassen. Änderungen werden in der Live-Vorschau rechts sofort sichtbar.
      </P>

      <H3>Benachrichtigungs-E-Mail</H3>
      <P>
        Geben Sie Ihre E-Mail-Adresse ein, an die neue Anfragen gemeldet werden sollen.
        Diese Adresse wird auch als Kontaktadresse in Gast-Mails angezeigt.
      </P>

      <H3>Embed-Code</H3>
      <P>
        Der Embed-Code ist ebenfalls in den Einstellungen zu finden. Weitere Details zur
        Einbindung finden Sie unter <strong>Widget einbinden</strong>.
      </P>

      <H3>Widget-Konfigurationen (Pro)</H3>
      <P>
        Mit dem Pro-Plan können mehrere Widget-Varianten erstellt werden — z.B. eine für
        Anfragen, eine für direkte Buchungen, mit jeweils eigenen Einstellungen.
      </P>

      <Tip>
        <strong>Tipp:</strong> Testen Sie das Widget nach jeder Designänderung auf Ihrer echten
        Website, da die Vorschau im Admin-Bereich von der tatsächlichen Darstellung leicht abweichen kann.
      </Tip>
    </div>
  );
}
