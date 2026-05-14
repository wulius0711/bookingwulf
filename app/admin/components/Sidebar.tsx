'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { logout } from '../login/actions';
import dynamic from 'next/dynamic';
const ThemeSwitcher = dynamic(() => import('./ThemeSwitcher'), { ssr: false });

type NavItemDef = {
  href: string;
  label: string;
  locked: boolean;
  upgradeLabel?: string;
  icon?: string;
};

const NAV_ICONS: Record<string, React.ReactNode> = {
  overview: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  requests: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>,
  calendar: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  roomplan: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  analytics: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  apartments: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 22V8l9-6 9 6v14"/><path d="M9 22v-4h6v4"/><rect x="9" y="9" width="2" height="3"/><rect x="13" y="9" width="2" height="3"/></svg>,
  prices: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  blocked: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>,
  extras: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>,
  settings: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  emails: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  nuki: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>,
  beds24: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  billing: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  help: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  hotels: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 22V8l9-6 9 6v14"/><path d="M9 22v-4h6v4"/><rect x="9" y="9" width="2" height="3"/><rect x="13" y="9" width="2" height="3"/></svg>,
  users: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  outreach: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  chat: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
  feedback: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>,
  surroundings: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/></svg>,
  guestportal: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  hungrywulf: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>,
  eventwulf: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  vouchers: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12V22H4V12"/><path d="M22 7H2v5h20V7z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>,
};

type HotelOption = { id: number; name: string };

type NavGroup = {
  label: string;
  items: NavItemDef[];
};

type Props = {
  navGroups: NavGroup[];
  email: string;
  activeHotelId: number | null;
  userHotels: HotelOption[];
  isSuperAdmin?: boolean;
};

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function SidebarNavItem({ href, label, locked, upgradeLabel, icon }: NavItemDef) {
  const pathname = usePathname();
  const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);
  const [shaking, setShaking] = useState(false);
  const tooltipId = `tooltip-${slugify(href)}`;
  const tourId = href.replace('/admin/', '').replace('/admin', 'overview') || 'overview';
  const iconEl = icon ? NAV_ICONS[icon] : null;

  if (locked) {
    return (
      <button
        type="button"
        className={shaking ? 'shake sidebar-nav-item' : 'sidebar-nav-item'}
        aria-disabled="true"
        aria-describedby={upgradeLabel ? tooltipId : undefined}
        onClick={() => { setShaking(true); setTimeout(() => setShaking(false), 400); }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onMouseMove={(e) => setPos({ x: e.clientX, y: e.clientY })}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '9px 16px',
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 500,
          color: 'var(--text-subtle)',
          cursor: 'default',
          userSelect: 'none',
          background: 'none',
          border: 'none',
          width: '100%',
          textAlign: 'left',
        }}
      >
        {iconEl && <span aria-hidden="true" style={{ display: 'flex', flexShrink: 0, opacity: 0.5 }}>{iconEl}</span>}
        {label} 🔒
        {upgradeLabel && (
          <span
            id={tooltipId}
            role="tooltip"
            style={{
              position: 'fixed',
              left: pos.x + 14,
              top: pos.y + 14,
              zIndex: 9999,
              background: 'var(--text-primary)',
              color: 'var(--surface)',
              fontSize: 12,
              fontWeight: 500,
              padding: '5px 10px',
              borderRadius: 0,
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              boxShadow: '2px 2px 0 rgba(0,0,0,0.25)',
              visibility: showTooltip ? 'visible' : 'hidden',
            }}
          >
            <span aria-hidden="true" style={{
              position: 'absolute',
              top: -5,
              left: 10,
              width: 0,
              height: 0,
              borderLeft: '5px solid transparent',
              borderRight: '5px solid transparent',
              borderBottom: '5px solid var(--text-primary)',
            }} />
            Ab {upgradeLabel} Plan verfügbar
          </span>
        )}
      </button>
    );
  }

  return (
    <Link
      href={href}
      data-tour={`nav-${tourId}`}
      className="sidebar-nav-item"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '9px 16px',
        borderRadius: 8,
        fontSize: 13,
        fontWeight: active ? 600 : 500,
        color: active ? 'var(--accent)' : 'var(--text-secondary)',
        textDecoration: 'none',
        background: active ? 'var(--accent-light)' : 'transparent',
        borderLeft: active ? '3px solid var(--accent)' : '3px solid transparent',
        transition: 'background 0.12s ease, color 0.12s ease',
      }}
    >
      {iconEl && <span aria-hidden="true" style={{ display: 'flex', flexShrink: 0 }}>{iconEl}</span>}
      {label}
    </Link>
  );
}

function NavGroup({ group }: { group: NavGroup }) {
  const pathname = usePathname();
  const hasActive = group.items.some((item) =>
    item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)
  );
  const [open, setOpen] = useState(hasActive);

  useEffect(() => {
    if (hasActive) setOpen(true);
  }, [hasActive]);

  useEffect(() => {
    const sync = () => {
      const active = document.body.dataset.onboardingGroup;
      if (active) setOpen(active === group.label);
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.body, { attributes: true, attributeFilter: ['data-onboarding-group'] });
    return () => observer.disconnect();
  }, [group.label]);
  return (
    <div data-nav-group={group.label} style={{ position: 'relative', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', transition: 'opacity 0.25s ease' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={`nav-group-${slugify(group.label)}`}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 14px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: 14,
          fontWeight: 700,
          color: 'var(--text-primary)',
          letterSpacing: 0,
          textTransform: 'none',
        }}
      >
        {group.label}
        <svg
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', flexShrink: 0 }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <div id={`nav-group-${slugify(group.label)}`} style={{ padding: open ? '2px 4px 6px' : 0, overflow: 'hidden', maxHeight: open ? 1000 : 0, transition: 'max-height 0.2s ease, padding 0.2s ease', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {group.items.map((item) => (
          <SidebarNavItem key={item.href} {...item} />
        ))}
      </div>
    </div>
  );
}

export default function Sidebar({ navGroups, email, activeHotelId, userHotels, isSuperAdmin }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setMobileOpen(false); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [mobileOpen]);

  async function handleHotelSwitch(value: string) {
    const hotelId = value === '' ? null : Number(value);
    if (hotelId === activeHotelId) return;
    setSwitching(true);
    await fetch('/api/admin/switch-hotel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hotelId }),
    });
    window.location.reload();
  }

  return (
    <>
      {/* Mobile top bar */}
      <div className="mobile-topbar">
        <img src="/bookingwulf-logo.png" alt="bookingwulf" className="logo-light" role="button" tabIndex={0} onClick={() => setMobileOpen(true)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setMobileOpen(true); }} style={{ height: 36, cursor: 'pointer' }} />
        <img src="/bookingwulf-logo-wh.png" alt="bookingwulf" className="logo-dark" role="button" tabIndex={0} onClick={() => setMobileOpen(true)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setMobileOpen(true); }} style={{ height: 36, cursor: 'pointer' }} />
      </div>

      {/* Backdrop */}
      {mobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar${mobileOpen ? ' open' : ''}`} aria-label="Sidebar" style={{ background: 'var(--sidebar-bg)' }}>
        {/* Logo */}
        <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid var(--sidebar-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <img src="/bookingwulf-logo.png" alt="bookingwulf" className="logo-light" style={{ height: 36 }} />
          <img src="/bookingwulf-logo-wh.png" alt="bookingwulf" className="logo-dark" style={{ height: 36 }} />
          <form action={logout}>
            <button
              type="submit"
              title="Abmelden"
              aria-label="Abmelden"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}
            >
              <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              <span aria-hidden="true" style={{ fontSize: 9, letterSpacing: '0.04em' }}>logout</span>
            </button>
          </form>
        </div>

        {/* Nav items */}
        <nav aria-label="Admin Navigation" style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {navGroups.map((group) => (
            <NavGroup key={group.label} group={group} />
          ))}
        </nav>

        {/* User + logout */}
        <div style={{
          position: 'sticky',
          bottom: 0,
          background: 'var(--sidebar-bg)',
          borderTop: '1px solid var(--sidebar-border)',
          padding: '12px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}>
          {(isSuperAdmin ? userHotels.length > 0 : userHotels.length > 1) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label htmlFor="hotel-switcher" style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Anlage</label>
              <select
                id="hotel-switcher"
                value={activeHotelId ?? ''}
                disabled={switching}
                onChange={(e) => handleHotelSwitch(e.target.value)}
                style={{ padding: '6px 8px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 13, color: 'var(--text-primary)', background: 'var(--surface-2)', cursor: 'pointer', opacity: switching ? 0.5 : 1 }}
              >
                {isSuperAdmin && <option value="">Alle</option>}
                {userHotels.map((h) => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
            </div>
          )}
          <ThemeSwitcher />
          <span style={{ fontSize: 12, color: 'var(--text-muted)', wordBreak: 'break-all' }}>{email}</span>
        </div>
      </aside>
    </>
  );
}
