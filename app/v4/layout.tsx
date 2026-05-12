import './v4.css';
import Nav from './_components/Nav';
import Footer from './_components/Footer';

export const metadata = { title: 'bookingwulf – Direktbuchungen für Ihre Unterkunft' };

const JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'bookingwulf',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      url: 'https://bookingwulf.com',
      description: 'Buchungswidget für Hotels, Pensionen und Ferienwohnungen. Direktbuchungen ohne Provision.',
      offers: { '@type': 'Offer', price: '59', priceCurrency: 'EUR' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'Wie baue ich das Widget ein?',                                        acceptedAnswer: { '@type': 'Answer', text: 'Sie fügen eine Zeile Code auf Ihrer Website ein — fertig. Kein Entwickler nötig. Funktioniert mit WordPress, Framer, Wix und mehr.' } },
        { '@type': 'Question', name: 'Gibt es versteckte Kosten oder Provisionen?',                         acceptedAnswer: { '@type': 'Answer', text: 'Nein. Nur der monatliche Fixpreis — keine Provision, keine Transaktionsgebühren.' } },
        { '@type': 'Question', name: 'Kann ich das Widget für Anfragen und Buchungen gleichzeitig nutzen?', acceptedAnswer: { '@type': 'Answer', text: 'Ja — zweifach konfigurierbar als Buchungs- und Anfrageformular.' } },
        { '@type': 'Question', name: 'Was passiert nach den 14 kostenlosen Tagen?',                         acceptedAnswer: { '@type': 'Answer', text: 'Sie wählen einen Plan. Kündigung jederzeit möglich — keine Mindestlaufzeit.' } },
        { '@type': 'Question', name: 'Wo werden meine Daten gespeichert?',                                  acceptedAnswer: { '@type': 'Answer', text: 'Auf Servern in Deutschland — sicher und DSGVO-konform.' } },
        { '@type': 'Question', name: 'Funktioniert der Sync mit Airbnb und Booking.com?',                   acceptedAnswer: { '@type': 'Answer', text: 'Ja — via Beds24 Channel Manager (separater Account nötig, kein Aufpreis von bookingwulf).' } },
        { '@type': 'Question', name: 'Wie migriere ich von Lodgify, Smoobu oder easybooking?',              acceptedAnswer: { '@type': 'Answer', text: 'Der Wechsel ist unkompliziert: Apartments neu anlegen, bestehendes Widget durch das bookingwulf-Widget ersetzen, fertig. Bei Fragen begleiten wir Sie persönlich durch die Umstellung.' } },
        { '@type': 'Question', name: 'Wer steckt hinter bookingwulf?',                                      acceptedAnswer: { '@type': 'Answer', text: 'bookingwulf ist ein Vollzeit-Projekt von Wolfgang Heis, Webentwickler aus Wien. Kein anonymes Konzern-Tool — Sie erreichen mich direkt unter support@bookingwulf.com.' } },
      ],
    },
  ],
};

export default function V4Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
      <Nav />
      <main>{children}</main>
      <Footer />
    </>
  );
}
