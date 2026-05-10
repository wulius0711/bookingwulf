'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { href: '/v2/features', label: 'Features' },
  { href: '/v2/preise',   label: 'Preise' },
  { href: '/v2/demo',     label: 'Demo' },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const pathname        = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-50 bg-slate-950">
      <nav
        className="max-w-6xl mx-auto px-5 sm:px-8 flex items-center justify-between h-16"
        aria-label="Hauptnavigation"
      >
        {/* Logo */}
        <Link href="/v2" aria-label="bookingwulf – Zur Startseite" className="shrink-0">
          <img src="/bookingwulf-logo.png" alt="bookingwulf" className="h-7 sm:h-8 w-auto brightness-0 invert" />
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-7 list-none m-0 p-0" role="list">
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={`text-sm font-medium transition-colors duration-150 ${
                  pathname === href ? 'text-white' : 'text-slate-400 hover:text-white'
                }`}
                aria-current={pathname === href ? 'page' : undefined}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/admin/login"
            className="text-sm font-medium text-slate-400 hover:text-white transition-colors px-3 py-2"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="text-sm font-semibold px-4 py-2 rounded-lg bg-white text-slate-900 hover:bg-slate-100 transition-colors"
          >
            Kostenlos testen
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="v2-mobile-menu"
          aria-label={open ? 'Menü schließen' : 'Menü öffnen'}
        >
          {open ? <X size={22} aria-hidden /> : <Menu size={22} aria-hidden />}
        </button>
      </nav>

      {/* Mobile menu */}
      <div
        id="v2-mobile-menu"
        role="navigation"
        aria-label="Mobiles Menü"
        className={`md:hidden bg-slate-900 border-t border-white/10 overflow-hidden transition-all duration-300 ${
          open ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <ul className="px-5 pt-2 pb-4 flex flex-col gap-0.5 list-none m-0 p-0">
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className="block py-2.5 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                aria-current={pathname === href ? 'page' : undefined}
              >
                {label}
              </Link>
            </li>
          ))}
          <li className="pt-3 mt-1 border-t border-white/10 flex flex-col gap-2">
            <Link
              href="/admin/login"
              className="block text-center py-2.5 text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="block text-center py-2.5 text-sm font-semibold rounded-xl bg-white text-slate-900 hover:bg-slate-100 transition-colors"
            >
              Kostenlos testen
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
}
