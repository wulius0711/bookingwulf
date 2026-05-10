import type { Metadata } from 'next';
import Nav from './_components/Nav';
import Footer from './_components/Footer';
import './v2.css';

export const metadata: Metadata = {
  title: {
    template: '%s | bookingwulf',
    default: 'bookingwulf — Direktbuchungen für Hotels ohne Provision',
  },
  description:
    'Das moderne Buchungswidget für Pensionen, Ferienwohnungen und Hotels. Direktbuchungen ohne Provision, Setup in 5 Minuten, DSGVO-konform.',
  openGraph: {
    type: 'website',
    locale: 'de_AT',
    siteName: 'bookingwulf',
  },
  robots: { index: false, follow: false }, // draft — nicht indexieren
};

export default function V2Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen text-slate-900 antialiased" style={{ background: '#efefef' }}>
      {/* Skip-Link für Tastatur-Navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:z-[100] focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:bg-slate-900 focus:text-white focus:rounded-xl focus:shadow-xl focus:text-sm focus:font-semibold focus:outline-none"
      >
        Zum Hauptinhalt springen
      </a>

      <Nav />

      <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
        {children}
      </main>

      <Footer />
    </div>
  );
}
