import Link from 'next/link';

export const metadata = { title: 'Auftragsverarbeitungsvertrag (AVV) — bookingwulf' };

const s = { maxWidth: 720, margin: '0 auto', padding: '48px 24px', fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif', color: '#111' };
const h1 = { fontSize: 32, fontWeight: 800 as const, letterSpacing: '-0.03em', margin: '0 0 32px' };
const h2 = { fontSize: 18, fontWeight: 700 as const, margin: '28px 0 8px' };
const p = { fontSize: 15, lineHeight: 1.7, color: '#374151', margin: '0 0 12px' };
const ul = { fontSize: 15, lineHeight: 1.7, color: '#374151', margin: '0 0 12px', paddingLeft: 20 };

export default function AVVPage() {
  return (
    <main style={s}>
      <Link href="/" style={{ fontSize: 13, color: '#666', textDecoration: 'none', display: 'inline-block', marginBottom: 24 }}>← Zurück zur Startseite</Link>

      <h1 style={h1}>Auftragsverarbeitungsvertrag (AVV)</h1>
      <p style={p}>Stand: April 2026 · Gemäß Art. 28 DSGVO</p>

      <h2 style={h2}>1. Parteien</h2>
      <p style={p}>
        Dieser Auftragsverarbeitungsvertrag (AVV) gilt zwischen:
      </p>
      <p style={p}>
        <strong>Auftragsverarbeiter:</strong><br />
        Wolfgang Heis (bookingwulf)<br />
        Vorgartenstraße 200/8, 1020 Wien, Österreich<br />
        E-Mail: support@bookingwulf.com
      </p>
      <p style={p}>
        <strong>Verantwortlicher:</strong><br />
        Der jeweilige Kunde (Hotelbetreiber/Vermieter), der bookingwulf im Rahmen der Allgemeinen Geschäftsbedingungen nutzt.
      </p>
      <p style={p}>
        Durch den Abschluss des Nutzungsvertrags mit bookingwulf erklärt sich der Verantwortliche mit den Bedingungen dieses AVV einverstanden.
      </p>

      <h2 style={h2}>2. Gegenstand und Dauer der Verarbeitung</h2>
      <p style={p}>
        Gegenstand der Auftragsverarbeitung ist die Bereitstellung der SaaS-Plattform bookingwulf, insbesondere die Erhebung, Speicherung und Weiterleitung von Buchungsanfragedaten (Gästedaten) im Auftrag des Verantwortlichen. Die Verarbeitung erfolgt für die Dauer des Nutzungsvertrags.
      </p>

      <h2 style={h2}>3. Art und Zweck der Verarbeitung</h2>
      <p style={p}>Art der Verarbeitung:</p>
      <ul style={ul}>
        <li>Erhebung von Gästedaten über das Buchungswidget</li>
        <li>Speicherung in der Datenbank des Auftragverarbeiters</li>
        <li>Übermittlung per E-Mail-Benachrichtigung an den Verantwortlichen</li>
        <li>Darstellung im Admin-Dashboard des Verantwortlichen</li>
      </ul>
      <p style={p}>Zweck: Verwaltung von Buchungsanfragen im Auftrag des Verantwortlichen.</p>

      <h2 style={h2}>4. Art der personenbezogenen Daten</h2>
      <ul style={ul}>
        <li>Name (Vor- und Nachname) der anfragenden Gäste</li>
        <li>E-Mail-Adresse</li>
        <li>Telefonnummer (optional)</li>
        <li>Reisezeitraum (An- und Abreisedatum)</li>
        <li>Anzahl der Gäste (Erwachsene, Kinder)</li>
        <li>Gewählte Apartments und Zusatzleistungen</li>
        <li>Freitext-Nachrichten der Gäste</li>
      </ul>

      <h2 style={h2}>5. Kategorien betroffener Personen</h2>
      <p style={p}>Gäste und Interessenten, die über das Buchungswidget des Verantwortlichen eine Anfrage stellen.</p>

      <h2 style={h2}>6. Pflichten des Auftragsverarbeiters</h2>
      <p style={p}>Der Auftragsverarbeiter verpflichtet sich:</p>
      <ul style={ul}>
        <li>Personenbezogene Daten ausschließlich auf dokumentierte Weisung des Verantwortlichen zu verarbeiten.</li>
        <li>Zur Vertraulichkeit der verarbeiteten Daten — alle mit der Verarbeitung befassten Personen sind zur Vertraulichkeit verpflichtet.</li>
        <li>Geeignete technische und organisatorische Maßnahmen (TOMs) gemäß Art. 32 DSGVO umzusetzen (verschlüsselte Übertragung via HTTPS, Zugangsbeschränkungen, gehashte Passwörter, sichere Session-Verwaltung).</li>
        <li>Den Verantwortlichen unverzüglich zu informieren, wenn eine Weisung gegen geltendes Datenschutzrecht verstößt.</li>
        <li>Den Verantwortlichen bei der Erfüllung von Betroffenenrechten (Auskunft, Löschung, Berichtigung) zu unterstützen.</li>
        <li>Den Verantwortlichen bei Datenschutzverletzungen gemäß Art. 33/34 DSGVO unverzüglich zu informieren.</li>
        <li>Nach Beendigung des Vertrags alle Daten zu löschen oder zurückzugeben, soweit nicht gesetzlich zur Aufbewahrung verpflichtet.</li>
      </ul>

      <h2 style={h2}>7. Unterauftragsverarbeiter</h2>
      <p style={p}>
        Der Auftragsverarbeiter setzt folgende Unterauftragsverarbeiter ein, denen der Verantwortliche durch Abschluss des Nutzungsvertrags zustimmt:
      </p>
      <ul style={ul}>
        <li><strong>Neon Inc.</strong> (USA) — Datenbankhosting, Serverstandort Frankfurt (EU). Standardvertragsklauseln (SCCs) vereinbart.</li>
        <li><strong>Vercel Inc.</strong> (USA) — Application Hosting. Standardvertragsklauseln (SCCs) vereinbart.</li>
        <li><strong>Resend Inc.</strong> (USA) — E-Mail-Versand von Buchungsbenachrichtigungen. Standardvertragsklauseln (SCCs) vereinbart.</li>
        <li><strong>Sentry Inc.</strong> (USA) — Fehler-Monitoring (technische Daten, keine Gästedaten im Regelfall). Standardvertragsklauseln (SCCs) vereinbart.</li>
      </ul>
      <p style={p}>
        Der Auftragsverarbeiter informiert den Verantwortlichen über geplante Änderungen bei Unterauftragsverarbeitern. Der Verantwortliche hat das Recht, Änderungen zu widersprechen.
      </p>

      <h2 style={h2}>8. Technische und organisatorische Maßnahmen (TOMs)</h2>
      <ul style={ul}>
        <li>Verschlüsselte Datenübertragung (HTTPS/TLS)</li>
        <li>Passwörter werden gehasht gespeichert (bcrypt)</li>
        <li>Authentifizierung über signierte, httpOnly-Session-Cookies</li>
        <li>Zugangsbeschränkung: Hotelbetreiber sehen ausschließlich ihre eigenen Daten</li>
        <li>Rollenbasierte Zugriffskontrolle (Hotel-Admin vs. Super-Admin)</li>
        <li>Öffentliche Buchungslinks sind HMAC-Token-gesichert</li>
        <li>Regelmäßige Datenbankbackups durch den Datenbankdienstleister</li>
      </ul>

      <h2 style={h2}>9. Weisungsrecht</h2>
      <p style={p}>
        Der Verantwortliche kann Weisungen zur Datenverarbeitung erteilen, insbesondere zur Löschung von Daten, per E-Mail an support@bookingwulf.com. Der Auftragsverarbeiter bestätigt den Eingang und setzt Weisungen innerhalb angemessener Frist um.
      </p>

      <h2 style={h2}>10. Haftung</h2>
      <p style={p}>
        Die Haftung der Parteien richtet sich nach den Regelungen der DSGVO sowie den AGB von bookingwulf. Jede Partei haftet gegenüber betroffenen Personen für den ihr zuzurechnenden Schaden.
      </p>

      <h2 style={h2}>11. Kontakt</h2>
      <p style={p}>
        Bei Fragen zum AVV oder zur Ausübung des Weisungsrechts: <strong>support@bookingwulf.com</strong>
      </p>
    </main>
  );
}
