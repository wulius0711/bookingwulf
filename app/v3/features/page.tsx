import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Features',
  description: 'Alle Features von bookingwulf im Überblick: Buchungswidget, Multi-Apartment, Channel Sync, Gäste-Lounge, DSGVO und mehr.',
};

// i18n: Strings hier zentral — bei next-intl Migration durch t('key') ersetzen
const FEATURE_GROUPS = [
  {
    label:  'Direktbuchungen',
    h3:     'Mehr Direktbuchungen, weniger Provision',
    items: [
      { icon: '🚫', title: 'Keine Provision',        desc: 'Sie behalten jeden Cent jeder Direktbuchung. Keine Transaktionsgebühren — egal wie viele Buchungen eingehen.' },
      { icon: '♊', title: 'Anfrage & Buchung',       desc: 'Das Widget ist zweifach konfigurierbar: gleichzeitig als Buchungs- und Anfrageformular einsetzbar.' },
      { icon: '🔄', title: 'Channel Sync',            desc: 'Echtzeit-Sync mit Airbnb & Booking.com via Beds24 Channel Manager — Doppelbuchungen ausgeschlossen.' },
      { icon: '📅', title: 'Live-Verfügbarkeit',      desc: 'Echtzeit-Prüfung der Verfügbarkeit. Sperrzeiten und Preissaisons frei konfigurierbar.' },
    ],
  },
  {
    label:  'Gasterlebnis',
    h3:     'Mehr als ein Buchungsformular',
    highlight: true,
    items: [
      { icon: '🛎️', title: 'Gäste-Lounge',           desc: 'Persönlicher Bereich für jeden Gast: Check-in-Infos, Hausregeln, lokale Tipps und Buchungsdetails — alles an einem Ort. Ideal für Upselling und eine reibungslose Anreise.' },
      { icon: '🔑', title: 'Online Check-in',         desc: 'Gäste checken digital ein und erhalten alle relevanten Informationen automatisch per E-Mail.' },
      { icon: '🌍', title: 'Mehrsprachig',             desc: 'Gäste-E-Mails in 9 Sprachen — automatisch erkannt, manuell anpassbar.' },
      { icon: '🗝️', title: 'Nuki-Integration',        desc: 'Schlüsselloser Zugang — Gäste erhalten ihren digitalen Schlüssel direkt in der Gäste-Lounge.' },
    ],
  },
  {
    label:  'Verwaltung',
    h3:     'Ihr Betrieb im Griff',
    items: [
      { icon: '🏠', title: 'Multi-Apartment',          desc: 'Beliebig viele Einheiten mit individuellen Preisen, Bildern und Ausstattungsmerkmalen verwalten.' },
      { icon: '📊', title: 'Zimmerplan',               desc: 'Belegungsstatus aller Apartments auf einen Blick — frei, belegt oder blockiert.' },
      { icon: '💶', title: 'Dynamic Pricing',          desc: 'Last-Minute-Rabatte, Mindestaufenthalte, Lückenrabatte und belegungsbasierte Preisaufschläge.' },
      { icon: '📋', title: 'Buchungsverwaltung',       desc: 'Alle Anfragen im Blick — Status ändern, filtern, exportieren. KI-Assistent im Admin (ab Pro).' },
    ],
  },
  {
    label:  'Technik & Sicherheit',
    h3:     'Einfach einbauen, sicher betreiben',
    items: [
      { icon: '⚡', title: 'Setup in 5 Minuten',       desc: 'Eine Zeile Code auf Ihrer Website — kein Entwickler nötig. Funktioniert mit WordPress, Framer, Wix & Co.' },
      { icon: '🎨', title: 'Individuelles Branding',   desc: 'Farben, Formen und Schrift passend zu Ihrem Auftritt — komplett anpassbar ohne Code.' },
      { icon: '🇪🇺', title: 'DSGVO-konform',          desc: 'Alle Daten auf Servern in Deutschland — sicher, rechtskonform, ohne US-Cloud.' },
      { icon: '📈', title: 'Analytics',                desc: 'Buchungsstatistiken und Auslastungsübersicht auf einen Blick (ab Business-Plan).' },
    ],
  },
];

export default function FeaturesPage() {
  return (
    <>
      {/* Hero */}
      <section className="text-center px-5 pt-20 pb-16 max-w-3xl mx-auto" aria-labelledby="features-hero-heading">
        <span className="bw-section-label">Features</span>
        <h1 id="features-hero-heading" className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-5 text-slate-950">
          Alles was Ihre Unterkunft braucht
        </h1>
        <p className="text-lg text-slate-500 leading-relaxed max-w-xl mx-auto mb-8">
          Von der ersten Anfrage bis zum Check-out — bookingwulf begleitet Gäste und Vermieter durch den gesamten Aufenthalt.
        </p>
        <Link href="/register" className="bw-btn bw-btn-primary">
          14 Tage kostenlos testen
        </Link>
      </section>

      {/* Feature groups */}
      {FEATURE_GROUPS.map((group, gi) => (
        <section
          key={group.label}
          className={`py-16 px-5 ${gi % 2 === 0 ? 'bg-slate-50' : 'bg-white'}`}
          aria-labelledby={`group-heading-${gi}`}
        >
          <div className="max-w-5xl mx-auto">
            <div className="mb-10">
              <span className="bw-section-label bw-animate">{group.label}</span>
              <h2
                id={`group-heading-${gi}`}
                className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 bw-animate bw-animate-delay-1"
              >
                {group.h3}
              </h2>
            </div>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-5 list-none m-0 p-0" role="list">
              {group.items.map((f, i) => (
                <li
                  key={f.title}
                  className={`bw-animate bw-animate-delay-${Math.min(i + 1, 4)} bw-card p-6 group ${
                    group.highlight && i === 0
                      ? 'sm:col-span-2 border-green-200 bg-green-50/50'
                      : ''
                  }`}
                >
                  <div className="text-2xl mb-3 inline-block transition-transform duration-300 group-hover:scale-110" aria-hidden>
                    {f.icon}
                  </div>
                  <h3 className={`font-bold mb-2 ${group.highlight && i === 0 ? 'text-lg text-green-900' : 'text-base text-slate-900'}`}>
                    {f.title}
                    {group.highlight && i === 0 && (
                      <span className="ml-2 text-xs font-bold px-2 py-0.5 rounded-full bg-green-500 text-white align-middle">
                        Beliebt
                      </span>
                    )}
                  </h3>
                  <p className={`text-sm leading-relaxed ${group.highlight && i === 0 ? 'text-green-800' : 'text-slate-500'}`}>
                    {f.desc}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ))}

      {/* CTA */}
      <section className="py-20 px-5 text-center" aria-labelledby="features-cta-heading">
        <div className="max-w-xl mx-auto bw-animate">
          <h2 id="features-cta-heading" className="text-3xl font-extrabold tracking-tight mb-4">
            Alle Features 14 Tage gratis testen
          </h2>
          <p className="text-slate-500 text-base mb-8">Keine Kreditkarte. Keine Mindestlaufzeit.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/register" className="bw-btn bw-btn-primary">Kostenlos starten</Link>
            <Link href="/v3/demo"  className="bw-btn bw-btn-secondary">Demo ansehen →</Link>
          </div>
        </div>
      </section>
    </>
  );
}
