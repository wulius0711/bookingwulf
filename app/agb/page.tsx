import Link from 'next/link';

export const metadata = { title: 'AGB — bookingwulf' };

const s = { maxWidth: 720, margin: '0 auto', padding: '48px 24px', fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif', color: '#111' };
const h1 = { fontSize: 32, fontWeight: 800 as const, letterSpacing: '-0.03em', margin: '0 0 32px' };
const h2 = { fontSize: 18, fontWeight: 700 as const, margin: '28px 0 8px' };
const p = { fontSize: 15, lineHeight: 1.7, color: '#374151', margin: '0 0 12px' };
const ul = { fontSize: 15, lineHeight: 1.7, color: '#374151', margin: '0 0 12px', paddingLeft: 20 };

export default function AGBPage() {
  return (
    <main style={s}>
      <Link href="/" style={{ fontSize: 13, color: '#666', textDecoration: 'none', display: 'inline-block', marginBottom: 24 }}>← Zurück zur Startseite</Link>

      <h1 style={h1}>Allgemeine Geschäftsbedingungen (AGB)</h1>

      <p style={p}>Stand: April 2026</p>

      <h2 style={h2}>§ 1 Geltungsbereich</h2>
      <p style={p}>
        Diese Allgemeinen Geschäftsbedingungen gelten für die Nutzung der SaaS-Plattform „bookingwulf" (im Folgenden „Dienst"), betrieben von Wolfgang Heis, Vorgartenstraße 200/8, 1020 Wien, Österreich (im Folgenden „Anbieter").
      </p>
      <p style={p}>
        Kunden des Dienstes sind Hotelbetreiber und Vermieter von Ferienwohnungen (im Folgenden „Kunde"), die bookingwulf zur Entgegennahme von Buchungsanfragen auf ihrer Website nutzen.
      </p>

      <h2 style={h2}>§ 2 Leistungsbeschreibung</h2>
      <p style={p}>
        bookingwulf stellt ein einbettbares Buchungswidget bereit, das Kunden auf ihrer Website einbinden können. Der Dienst umfasst:
      </p>
      <ul style={ul}>
        <li>Verwaltung von Apartments, Preisen und Verfügbarkeiten</li>
        <li>Entgegennahme und Verwaltung von Buchungsanfragen</li>
        <li>Automatische E-Mail-Benachrichtigungen an Kunden und Gäste</li>
        <li>Konfigurierbare Zusatzleistungen und Versicherungsoptionen</li>
        <li>Individuelles Branding des Widgets (je nach Plan)</li>
      </ul>
      <p style={p}>
        bookingwulf ist ein Anfrageverwaltungssystem. Die Buchungsbestätigung und der Vertragsschluss zwischen Kunde und Gast erfolgen außerhalb der Plattform. bookingwulf ist nicht Vertragspartei der Buchung.
      </p>

      <h2 style={h2}>§ 3 Vertragsschluss und Registrierung</h2>
      <p style={p}>
        Der Vertrag kommt durch die Registrierung auf bookingwulf und die Bestätigung der AGB zustande. Die Registrierung ist kostenlos und beinhaltet eine 14-tägige Testphase.
      </p>
      <p style={p}>
        Der Kunde versichert, dass die bei der Registrierung angegebenen Daten korrekt sind und er berechtigt ist, für das angegebene Hotel/die angegebene Unterkunft zu handeln.
      </p>

      <h2 style={h2}>§ 4 Testphase und Abonnement</h2>
      <p style={p}>
        Nach der Registrierung erhält der Kunde eine kostenlose Testphase von 14 Tagen mit vollem Funktionsumfang. Nach Ablauf der Testphase ist ein kostenpflichtiges Abonnement erforderlich, um den Dienst weiter zu nutzen.
      </p>
      <p style={p}>
        Es stehen folgende Pläne zur Verfügung:
      </p>
      <ul style={ul}>
        <li><strong>Starter</strong> — € 49/Monat</li>
        <li><strong>Pro</strong> — € 99/Monat</li>
        <li><strong>Business</strong> — € 199/Monat</li>
      </ul>
      <p style={p}>
        Die Abrechnung erfolgt monatlich über Stripe. Der Kunde kann sein Abonnement jederzeit zum Ende des laufenden Abrechnungszeitraums kündigen.
      </p>

      <h2 style={h2}>§ 5 Preise und Zahlung</h2>
      <p style={p}>
        Alle angegebenen Preise verstehen sich in Euro und exklusive der gesetzlichen Umsatzsteuer, sofern nicht anders angegeben. Die Zahlung erfolgt per Kreditkarte oder anderen von Stripe unterstützten Zahlungsmethoden.
      </p>
      <p style={p}>
        Bei Zahlungsverzug behält sich der Anbieter das Recht vor, den Zugang zum Dienst einzuschränken, bis die ausstehenden Beträge beglichen sind.
      </p>

      <h2 style={h2}>§ 6 Pflichten des Kunden</h2>
      <ul style={ul}>
        <li>Der Kunde ist für die Inhalte seiner Apartments (Beschreibungen, Bilder, Preise) selbst verantwortlich.</li>
        <li>Der Kunde stellt sicher, dass die über bookingwulf erhobenen Gästedaten gemäß DSGVO verarbeitet werden.</li>
        <li>Der Kunde informiert seine Gäste über die Datenverarbeitung durch bookingwulf, z. B. durch Verlinkung der Datenschutzerklärung im Widget.</li>
        <li>Der Kunde darf den Dienst nicht für rechtswidrige Zwecke nutzen.</li>
        <li>Zugangsdaten sind vertraulich zu behandeln.</li>
      </ul>

      <h2 style={h2}>§ 7 Verfügbarkeit und Haftung</h2>
      <p style={p}>
        Der Anbieter bemüht sich um eine hohe Verfügbarkeit des Dienstes, kann jedoch keine ununterbrochene Erreichbarkeit garantieren. Wartungsarbeiten werden nach Möglichkeit angekündigt.
      </p>
      <p style={p}>
        Die Haftung des Anbieters beschränkt sich auf Vorsatz und grobe Fahrlässigkeit. Die Haftung für indirekte Schäden, entgangenen Gewinn und Datenverlust ist — soweit gesetzlich zulässig — ausgeschlossen. Die Haftung ist in jedem Fall auf den vom Kunden in den letzten 12 Monaten gezahlten Betrag begrenzt.
      </p>

      <h2 style={h2}>§ 8 Kündigung</h2>
      <p style={p}>
        Der Kunde kann sein Abonnement jederzeit zum Ende des laufenden Abrechnungszeitraums kündigen. Die Kündigung erfolgt über das Stripe-Kundenportal oder per E-Mail an office@wulius.at.
      </p>
      <p style={p}>
        Nach Kündigung wird der Zugang zum Admin-Bereich gesperrt. Buchungsanfragen, die über bereits eingebettete Widgets eingehen, werden nicht mehr verarbeitet. Der Anbieter löscht die Kundendaten innerhalb von 30 Tagen nach Kündigung, sofern keine gesetzlichen Aufbewahrungspflichten entgegenstehen.
      </p>
      <p style={p}>
        Der Anbieter kann den Vertrag bei schwerwiegenden Verstößen gegen diese AGB fristlos kündigen.
      </p>

      <h2 style={h2}>§ 9 Datenschutz</h2>
      <p style={p}>
        Der Anbieter verarbeitet personenbezogene Daten gemäß der <Link href="/datenschutz" style={{ color: '#111', textDecoration: 'underline' }}>Datenschutzerklärung</Link>. Der Anbieter handelt in Bezug auf Gästedaten als Auftragsverarbeiter im Sinne von Art. 28 DSGVO. Die Details der Auftragsverarbeitung können auf Anfrage bereitgestellt werden.
      </p>

      <h2 style={h2}>§ 10 Änderungen der AGB</h2>
      <p style={p}>
        Der Anbieter behält sich vor, diese AGB mit angemessener Ankündigungsfrist zu ändern. Änderungen werden dem Kunden per E-Mail mitgeteilt. Widerspricht der Kunde nicht innerhalb von 30 Tagen, gelten die geänderten AGB als akzeptiert.
      </p>

      <h2 style={h2}>§ 11 Schlussbestimmungen</h2>
      <p style={p}>
        Es gilt österreichisches Recht unter Ausschluss des UN-Kaufrechts. Gerichtsstand ist Wien, Österreich.
      </p>
      <p style={p}>
        Sollten einzelne Bestimmungen dieser AGB unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.
      </p>
    </main>
  );
}
