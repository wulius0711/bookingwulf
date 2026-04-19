import Link from 'next/link';

export const metadata = { title: 'Datenschutzerklärung — bookingwulf' };

const s = { maxWidth: 720, margin: '0 auto', padding: '48px 24px', fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif', color: '#111' };
const h1 = { fontSize: 32, fontWeight: 800 as const, letterSpacing: '-0.03em', margin: '0 0 32px' };
const h2 = { fontSize: 18, fontWeight: 700 as const, margin: '28px 0 8px' };
const h3 = { fontSize: 15, fontWeight: 700 as const, margin: '20px 0 6px' };
const p = { fontSize: 15, lineHeight: 1.7, color: '#374151', margin: '0 0 12px' };
const ul = { fontSize: 15, lineHeight: 1.7, color: '#374151', margin: '0 0 12px', paddingLeft: 20 };

export default function DatenschutzPage() {
  return (
    <main style={s}>
      <Link href="/" style={{ fontSize: 13, color: '#666', textDecoration: 'none', display: 'inline-block', marginBottom: 24 }}>← Zurück zur Startseite</Link>

      <h1 style={h1}>Datenschutzerklärung</h1>

      <p style={p}>Stand: April 2026</p>

      <h2 style={h2}>1. Verantwortlicher</h2>
      <p style={p}>
        Wolfgang Heis<br />
        Vorgartenstraße 200/8<br />
        1020 Wien, Österreich<br />
        E-Mail: office@wulius.at
      </p>

      <h2 style={h2}>2. Überblick der Verarbeitungen</h2>
      <p style={p}>
        Die folgende Übersicht fasst die Arten der verarbeiteten Daten und die Zwecke ihrer Verarbeitung zusammen und verweist auf die betroffenen Personen.
      </p>

      <h3 style={h3}>Arten der verarbeiteten Daten</h3>
      <ul style={ul}>
        <li>Bestandsdaten (z. B. Namen, Adressen)</li>
        <li>Kontaktdaten (z. B. E-Mail, Telefonnummern)</li>
        <li>Inhaltsdaten (z. B. Buchungsanfragen, Nachrichten)</li>
        <li>Nutzungsdaten (z. B. besuchte Seiten, Zugriffszeiten)</li>
        <li>Vertragsdaten (z. B. Vertragsgegenstand, Laufzeit)</li>
        <li>Zahlungsdaten (z. B. über Stripe verarbeitete Zahlungsinformationen)</li>
      </ul>

      <h3 style={h3}>Kategorien betroffener Personen</h3>
      <ul style={ul}>
        <li>Kunden und Geschäftskunden (Hotelbetreiber, die bookingwulf nutzen)</li>
        <li>Endnutzer (Gäste, die Buchungsanfragen über das Widget stellen)</li>
      </ul>

      <h2 style={h2}>3. Rechtsgrundlagen</h2>
      <p style={p}>
        Die Verarbeitung personenbezogener Daten erfolgt auf Grundlage der folgenden Rechtsgrundlagen der DSGVO:
      </p>
      <ul style={ul}>
        <li><strong>Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO)</strong> — Verarbeitung zur Erfüllung des Nutzungsvertrags und zur Durchführung von Buchungsanfragen.</li>
        <li><strong>Berechtigte Interessen (Art. 6 Abs. 1 lit. f DSGVO)</strong> — Verarbeitung zur Verbesserung des Dienstes, zur Betrugsprävention und zur Gewährleistung der IT-Sicherheit.</li>
        <li><strong>Einwilligung (Art. 6 Abs. 1 lit. a DSGVO)</strong> — Soweit eine Einwilligung erteilt wurde (z. B. Newsletter).</li>
      </ul>

      <h2 style={h2}>4. Erhobene Daten im Detail</h2>

      <h3 style={h3}>4.1 Registrierung und Nutzerkonto (Hotelbetreiber)</h3>
      <p style={p}>
        Bei der Registrierung werden Name, E-Mail-Adresse und ein Passwort (gehashed gespeichert) erhoben. Diese Daten sind zur Vertragserfüllung erforderlich.
      </p>

      <h3 style={h3}>4.2 Buchungsanfragen (Endnutzer/Gäste)</h3>
      <p style={p}>
        Wenn Gäste eine Buchungsanfrage über das Widget stellen, werden folgende Daten erhoben: Name, E-Mail-Adresse, ggf. Telefonnummer, Reisezeitraum, Anzahl der Gäste, gewählte Apartments und Zusatzleistungen sowie optionale Nachrichten. Diese Daten werden an das jeweilige Hotel weitergeleitet und zur Bearbeitung der Anfrage gespeichert.
      </p>

      <h3 style={h3}>4.3 Zahlungsdaten</h3>
      <p style={p}>
        Zahlungen für Abonnements werden über <strong>Stripe, Inc.</strong> (USA) abgewickelt. Wir speichern keine Kreditkarten- oder Bankdaten. Stripe verarbeitet Zahlungsdaten gemäß eigener Datenschutzbestimmungen: <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#111', textDecoration: 'underline' }}>stripe.com/privacy</a>.
      </p>

      <h2 style={h2}>5. Auftragsverarbeiter und Datentransfers</h2>
      <p style={p}>Wir setzen folgende Dienstleister ein:</p>
      <ul style={ul}>
        <li><strong>Neon Inc.</strong> — PostgreSQL-Datenbank, Serverstandort Frankfurt (EU). Datenhaltung in der EU.</li>
        <li><strong>Vercel Inc.</strong> (USA) — Hosting und Bereitstellung der Anwendung. Vercel verarbeitet Anfragedaten auf Edge-Servern weltweit. Datenschutzrichtlinie: <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" style={{ color: '#111', textDecoration: 'underline' }}>vercel.com/legal/privacy-policy</a>.</li>
        <li><strong>Resend Inc.</strong> (USA) — E-Mail-Versand (Buchungsbestätigungen, Benachrichtigungen). Datenschutzrichtlinie: <a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" style={{ color: '#111', textDecoration: 'underline' }}>resend.com/legal/privacy-policy</a>.</li>
        <li><strong>Stripe Inc.</strong> (USA) — Zahlungsabwicklung. Stripe ist nach dem EU-US Data Privacy Framework zertifiziert.</li>
        <li><strong>Sentry Inc.</strong> (USA) — Fehler-Monitoring zur Sicherstellung der Betriebsstabilität. Dabei können technische Fehlerdaten (Stack Traces, Geräteinformationen, ggf. anonymisierte Nutzungsdaten) übertragen werden. Datenschutzrichtlinie: <a href="https://sentry.io/privacy/" target="_blank" rel="noopener noreferrer" style={{ color: '#111', textDecoration: 'underline' }}>sentry.io/privacy</a>.</li>
      </ul>
      <p style={p}>
        Für Datentransfers in die USA stützen wir uns auf das EU-US Data Privacy Framework, Standardvertragsklauseln (SCCs) sowie die Angemessenheitsbeschlüsse der EU-Kommission, soweit anwendbar.
      </p>

      <h2 style={h2}>6. Cookies und Tracking</h2>
      <p style={p}>
        bookingwulf verwendet <strong>keine Tracking-Cookies</strong> und <strong>kein Google Analytics</strong> oder vergleichbare Analysedienste. Es wird lediglich ein technisch notwendiger Session-Cookie (<code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: 4, fontSize: 13 }}>admin_session</code>) für die Authentifizierung im Admin-Bereich gesetzt. Dieser Cookie ist httpOnly, wird nicht an Dritte weitergegeben und enthält keine personenbezogenen Daten.
      </p>

      <h2 style={h2}>7. Speicherdauer</h2>
      <ul style={ul}>
        <li><strong>Buchungsanfragen:</strong> Werden gespeichert, solange das Hotelbetreiber-Konto aktiv ist. Eine Löschung einzelner oder aller Buchungsanfragen erfolgt auf Anfrage durch den Betreiber (office@wulius.at). Hotelbetreiber selbst haben keinen eigenständigen Löschzugriff.</li>
        <li><strong>Nutzerkonten:</strong> Werden bei Kündigung des Abonnements gelöscht, sofern keine gesetzlichen Aufbewahrungspflichten entgegenstehen.</li>
        <li><strong>Session-Daten:</strong> Automatische Löschung nach 7 Tagen.</li>
        <li><strong>Passwort-Reset-Tokens:</strong> Automatische Löschung nach 1 Stunde.</li>
      </ul>

      <h2 style={h2}>8. Ihre Rechte</h2>
      <p style={p}>
        Sie haben gemäß DSGVO folgende Rechte:
      </p>
      <ul style={ul}>
        <li><strong>Auskunft</strong> (Art. 15 DSGVO) — Recht auf Auskunft über Ihre gespeicherten Daten.</li>
        <li><strong>Berichtigung</strong> (Art. 16 DSGVO) — Recht auf Korrektur unrichtiger Daten.</li>
        <li><strong>Löschung</strong> (Art. 17 DSGVO) — Recht auf Löschung Ihrer Daten.</li>
        <li><strong>Einschränkung</strong> (Art. 18 DSGVO) — Recht auf Einschränkung der Verarbeitung.</li>
        <li><strong>Datenübertragbarkeit</strong> (Art. 20 DSGVO) — Recht auf Erhalt Ihrer Daten in maschinenlesbarem Format.</li>
        <li><strong>Widerspruch</strong> (Art. 21 DSGVO) — Recht auf Widerspruch gegen die Verarbeitung.</li>
        <li><strong>Widerruf der Einwilligung</strong> (Art. 7 Abs. 3 DSGVO) — Recht, erteilte Einwilligungen jederzeit zu widerrufen.</li>
      </ul>
      <p style={p}>
        Zur Ausübung Ihrer Rechte — insbesondere zur Löschung von Buchungsanfragen — kontaktieren Sie uns unter: <strong>office@wulius.at</strong>
      </p>

      <h2 style={h2}>9. Beschwerderecht</h2>
      <p style={p}>
        Sie haben das Recht, sich bei einer Aufsichtsbehörde zu beschweren. Die zuständige Aufsichtsbehörde ist:
      </p>
      <p style={p}>
        Österreichische Datenschutzbehörde<br />
        Barichgasse 40-42<br />
        1030 Wien<br />
        <a href="https://www.dsb.gv.at" target="_blank" rel="noopener noreferrer" style={{ color: '#111', textDecoration: 'underline' }}>www.dsb.gv.at</a>
      </p>

      <h2 style={h2}>10. Änderungen</h2>
      <p style={p}>
        Wir behalten uns vor, diese Datenschutzerklärung anzupassen, um sie an geänderte Rechtslagen oder Änderungen des Dienstes anzupassen. Die aktuelle Fassung finden Sie stets auf dieser Seite.
      </p>
    </main>
  );
}
