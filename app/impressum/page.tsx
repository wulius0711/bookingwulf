import Link from 'next/link';

export const metadata = { title: 'Impressum — bookingwulf' };

const s = { maxWidth: 720, margin: '0 auto', padding: '48px 24px', fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif', color: '#111' };
const h1 = { fontSize: 32, fontWeight: 800 as const, letterSpacing: '-0.03em', margin: '0 0 32px' };
const h2 = { fontSize: 18, fontWeight: 700 as const, margin: '28px 0 8px' };
const p = { fontSize: 15, lineHeight: 1.7, color: '#374151', margin: '0 0 12px' };

export default function ImpressumPage() {
  return (
    <main style={s}>
      <Link href="/" style={{ fontSize: 13, color: '#666', textDecoration: 'none', display: 'inline-block', marginBottom: 24 }}>← Zurück zur Startseite</Link>

      <h1 style={h1}>Impressum</h1>

      <h2 style={h2}>Angaben gemäß § 5 ECG und § 25 MedienG</h2>
      <p style={p}>
        Wolfgang Heis<br />
        Vorgartenstraße 200/8<br />
        1020 Wien, Österreich
      </p>

      <h2 style={h2}>Kontakt</h2>
      <p style={p}>
        E-Mail: office@wulius.at
      </p>

      <h2 style={h2}>Umsatzsteuer-ID</h2>
      <p style={p}>
        Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: [wird nachgetragen]
      </p>

      <h2 style={h2}>Verantwortlich für den Inhalt</h2>
      <p style={p}>
        Wolfgang Heis<br />
        Vorgartenstraße 200/8<br />
        1020 Wien, Österreich
      </p>

      <h2 style={h2}>Haftungsausschluss</h2>
      <p style={p}>
        Die Inhalte dieser Website wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.
      </p>
      <p style={p}>
        Als Diensteanbieter sind wir gemäß § 7 Abs. 1 ECG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Wir sind jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
      </p>

      <h2 style={h2}>Urheberrecht</h2>
      <p style={p}>
        Die durch den Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem österreichischen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des Autors.
      </p>

      <h2 style={h2}>Streitschlichtung</h2>
      <p style={p}>
        Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" style={{ color: '#111', textDecoration: 'underline' }}>https://ec.europa.eu/consumers/odr</a>. Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
      </p>
    </main>
  );
}
