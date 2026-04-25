'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { logout } from '../login/actions';
import ThemeSwitcher from './ThemeSwitcher';

type NavItemDef = {
  href: string;
  label: string;
  locked: boolean;
  upgradeLabel?: string;
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

function SidebarNavItem({ href, label, locked, upgradeLabel }: NavItemDef) {
  const pathname = usePathname();
  const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);
  const [shaking, setShaking] = useState(false);
  const tourId = href.replace('/admin/', '').replace('/admin', 'overview') || 'overview';

  if (locked) {
    return (
      <button
        type="button"
        className={shaking ? 'shake sidebar-nav-item' : 'sidebar-nav-item'}
        aria-disabled="true"
        onClick={() => { setShaking(true); setTimeout(() => setShaking(false), 400); }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onMouseMove={(e) => setPos({ x: e.clientX, y: e.clientY })}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '9px 16px',
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 500,
          color: '#c0c5ce',
          cursor: 'default',
          userSelect: 'none',
          background: 'none',
          border: 'none',
          width: '100%',
          textAlign: 'left',
        }}
      >
        {label} 🔒
        {showTooltip && upgradeLabel && (
          <span role="tooltip" style={{
            position: 'fixed',
            left: pos.x + 14,
            top: pos.y + 14,
            zIndex: 9999,
            background: '#1e293b',
            color: '#fff',
            fontSize: 12,
            fontWeight: 500,
            padding: '5px 10px',
            borderRadius: 0,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            boxShadow: '2px 2px 0 rgba(0,0,0,0.25)',
          }}>
            <span style={{
              position: 'absolute',
              top: -5,
              left: 10,
              width: 0,
              height: 0,
              borderLeft: '5px solid transparent',
              borderRight: '5px solid transparent',
              borderBottom: '5px solid #1e293b',
            }} />
            Ab {upgradeLabel} Plan verfügbar
          </span>
        )}
      </button>
    );
  }

  return (
    <a
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
        color: active ? 'var(--accent)' : '#555',
        textDecoration: 'none',
        background: active ? 'var(--accent-light)' : 'transparent',
        borderLeft: active ? '3px solid var(--accent)' : '3px solid transparent',
        transition: 'background 0.12s ease, color 0.12s ease',
      }}
    >
      {label}
    </a>
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
      if (document.body.dataset.onboardingGroup === group.label) setOpen(true);
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
          color: '#6b7280',
          letterSpacing: 0,
          textTransform: 'none',
        }}
      >
        {group.label}
        <svg
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
      <div style={{ padding: open ? '2px 4px 6px' : 0, overflow: 'hidden', maxHeight: open ? 1000 : 0, transition: 'max-height 0.2s ease', display: 'flex', flexDirection: 'column', gap: 2 }}>
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
        <img
          src="/bookingwulf-logo.png"
          alt="bookingwulf"
          onClick={() => setMobileOpen(true)}
          style={{ height: 36, cursor: 'pointer' }}
        />
      </div>

      {/* Backdrop */}
      {mobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar${mobileOpen ? ' open' : ''}`} style={{ background: 'var(--sidebar-bg)' }}>
        {/* Logo */}
        <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid var(--sidebar-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <img src="/bookingwulf-logo.png" alt="bookingwulf" style={{ height: 36 }} />
          <form action={logout}>
            <button
              type="submit"
              title="Abmelden"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#9ca3af', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              <span style={{ fontSize: 9, letterSpacing: '0.04em' }}>logout</span>
            </button>
          </form>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {navGroups.map((group) => (
            <NavGroup key={group.label} group={group} />
          ))}
        </nav>

        {/* User + logout */}
        <div style={{
          position: 'sticky',
          bottom: 0,
          background: 'var(--sidebar-bg, #fff)',
          borderTop: '1px solid var(--sidebar-border)',
          padding: '12px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}>
          {(isSuperAdmin ? userHotels.length > 0 : userHotels.length > 1) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label htmlFor="hotel-switcher" style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Anlage</label>
              <select
                id="hotel-switcher"
                value={activeHotelId ?? ''}
                disabled={switching}
                onChange={(e) => handleHotelSwitch(e.target.value)}
                style={{ padding: '6px 8px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, color: '#111', background: '#fafafa', cursor: 'pointer', opacity: switching ? 0.5 : 1 }}
              >
                {isSuperAdmin && <option value="">Alle</option>}
                {userHotels.map((h) => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
            </div>
          )}
          <ThemeSwitcher />
          <span style={{ fontSize: 12, color: '#9ca3af', wordBreak: 'break-all' }}>{email}</span>
        </div>
      </aside>
    </>
  );
}
