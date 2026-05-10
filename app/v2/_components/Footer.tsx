import Link from 'next/link';

const LEGAL_LINKS = [
  { href: '/impressum',                      label: 'Impressum' },
  { href: '/datenschutz',                    label: 'Datenschutz' },
  { href: '/agb',                            label: 'AGB' },
  { href: '/avv',                            label: 'AVV' },
  { href: 'mailto:support@bookingwulf.com',  label: 'support@bookingwulf.com' },
];

export default function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-white" role="contentinfo">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img src="/bookingwulf-logo.png" alt="bookingwulf" className="h-5 w-auto opacity-50" />
          <span className="text-xs text-slate-400">© {new Date().getFullYear()} bookingwulf</span>
        </div>
        <nav aria-label="Rechtliche Links">
          <ul className="flex flex-wrap justify-center gap-x-5 gap-y-1.5 list-none m-0 p-0">
            {LEGAL_LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className="text-xs text-slate-400 hover:text-slate-700 transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
