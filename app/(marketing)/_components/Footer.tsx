'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LEGAL_LINKS = [
  { href: '/impressum',                     label: 'Impressum' },
  { href: '/datenschutz',                   label: 'Datenschutz' },
  { href: '/agb',                           label: 'AGB' },
  { href: '/avv',                           label: 'AVV' },
  { href: 'mailto:support@bookingwulf.com', label: 'support@bookingwulf.com' },
];

export default function Footer() {
  const pathname = usePathname();
  return (
    <footer className="border-t bg-white" style={{ borderColor: 'var(--v4-border)' }} role="contentinfo">
      <div className="v4-container py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 order-2 sm:order-1">
          <Link href="/" aria-label="bookingwulf – Zur Startseite" onClick={e => { if (pathname === '/') { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); } }}>
            <img src="/bookingwulf-logo.png" alt="bookingwulf" className="h-6 w-auto" />
          </Link>
          <span className="text-xs" style={{ color: 'var(--v4-muted)' }}>© {new Date().getFullYear()} bookingwulf</span>
        </div>
        <nav aria-label="Rechtliche Links" className="order-1 sm:order-2">
          <ul className="flex flex-wrap justify-center gap-x-5 gap-y-1.5 list-none m-0 p-0">
            {LEGAL_LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className="text-sm transition-colors hover:text-slate-900" style={{ color: '#475569' }}>{label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
