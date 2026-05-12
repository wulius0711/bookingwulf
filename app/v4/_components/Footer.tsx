import Link from 'next/link';

const LEGAL_LINKS = [
  { href: '/impressum',                     label: 'Impressum' },
  { href: '/datenschutz',                   label: 'Datenschutz' },
  { href: '/agb',                           label: 'AGB' },
  { href: '/avv',                           label: 'AVV' },
  { href: 'mailto:support@bookingwulf.com', label: 'support@bookingwulf.com' },
];

export default function Footer() {
  return (
    <footer className="border-t bg-white" style={{ borderColor: 'var(--v4-border)' }} role="contentinfo">
      <div className="v4-container py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img src="/bookingwulf-logo-wh.png" alt="bookingwulf" className="h-5 w-auto opacity-40 brightness-0" />
          <span className="text-xs" style={{ color: 'var(--v4-muted)' }}>© {new Date().getFullYear()} bookingwulf</span>
        </div>
        <nav aria-label="Rechtliche Links">
          <ul className="flex flex-wrap justify-center gap-x-5 gap-y-1.5 list-none m-0 p-0">
            {LEGAL_LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className="text-xs transition-colors hover:text-slate-700" style={{ color: 'var(--v4-muted)' }}>{label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
