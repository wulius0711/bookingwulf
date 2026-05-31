'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { href: '/features',        label: 'Features' },
  { href: '/der-unterschied', label: 'Der Unterschied' },
  { href: '/preise',          label: 'Preise' },
  { href: '/demo',            label: 'Demo' },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        background: scrolled ? 'var(--v4-navy)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
        transition: 'background 0.3s ease, backdrop-filter 0.3s ease, border-color 0.3s ease',
      }}
    >
      <nav
        className="v4-container flex items-center justify-between h-16"
        aria-label="Hauptnavigation"
      >
        <Link href="/" aria-label="bookingwulf – Zur Startseite" className="shrink-0">
          <img src="/bookingwulf-logo-wh.png" alt="bookingwulf" className="h-9 sm:h-10 w-auto" />
        </Link>

        <ul className="hidden md:flex items-center gap-7 list-none m-0 p-0" role="list">
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href}>
              <Link href={href} className="v4-nav-link" aria-current={pathname === href ? 'page' : undefined}>
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/admin/login" className="v4-nav-link px-3 py-2">Login</Link>
          <Link href="/register" className="v4-btn v4-btn-primary" style={{ height: 36, fontSize: 14 }}>
            Kostenlos testen
          </Link>
        </div>

        <button
          className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="v4-mobile-menu"
          aria-label={open ? 'Menü schließen' : 'Menü öffnen'}
        >
          {open ? <X size={22} aria-hidden /> : <Menu size={22} aria-hidden />}
        </button>
      </nav>

      <div
        id="v4-mobile-menu"
        role="navigation"
        aria-label="Mobiles Menü"
        className={`md:hidden border-t overflow-hidden transition-all duration-300 ${open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
        style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'var(--v4-navy)' }}
      >
        <ul className="px-5 pt-3 pb-5 flex flex-col gap-1 list-none m-0 p-0">
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href}>
              <Link href={href} onClick={() => setOpen(false)} className="block py-3 text-lg font-normal text-slate-200 hover:text-white transition-colors" aria-current={pathname === href ? 'page' : undefined}>
                {label}
              </Link>
            </li>
          ))}
          <li className="pt-3 mt-1 pb-6 flex flex-col items-center gap-3" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <Link href="/admin/login" onClick={() => setOpen(false)} className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Login</Link>
            <Link href="/register" onClick={() => setOpen(false)} className="v4-btn v4-btn-primary">Kostenlos testen</Link>
          </li>
        </ul>
      </div>
    </header>
  );
}
