'use client';

import { useState } from 'react';
import { logout } from '../login/actions';

type NavItemDef = {
  href: string;
  label: string;
  locked: boolean;
  active: boolean;
  upgradeLabel?: string;
};

type Props = {
  navItems: NavItemDef[];
  email: string;
};

function SidebarNavItem({ href, label, locked, active, upgradeLabel }: NavItemDef) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [shaking, setShaking] = useState(false);
  const tourId = href.replace('/admin/', '').replace('/admin', 'overview') || 'overview';

  if (locked) {
    return (
      <span
        className={shaking ? 'shake' : undefined}
        onClick={() => { setShaking(true); setTimeout(() => setShaking(false), 400); }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
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
          position: 'relative',
        }}
      >
        {label} 🔒
        {showTooltip && upgradeLabel && (
          <span style={{
            position: 'absolute',
            left: '100%',
            top: '50%',
            transform: 'translateY(-50%)',
            marginLeft: 12,
            padding: '7px 12px',
            background: '#1e293b',
            color: '#fff',
            fontSize: 12,
            fontWeight: 500,
            borderRadius: 8,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 200,
          }}>
            Ab {upgradeLabel} Plan
          </span>
        )}
      </span>
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
        color: active ? '#111' : '#555',
        textDecoration: 'none',
        background: active ? '#f0f0f0' : 'transparent',
        borderLeft: active ? '3px solid #111' : '3px solid transparent',
        transition: 'background 0.12s ease, color 0.12s ease',
      }}
    >
      {label}
    </a>
  );
}

export default function Sidebar({ navItems, email }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <div className="mobile-topbar">
        <button
          className="sidebar-hamburger"
          onClick={() => setMobileOpen(true)}
          aria-label="Menü öffnen"
        >
          <span /><span /><span />
        </button>
        <img src="/bookingwulf-logo.png" alt="bookingwulf" style={{ height: 26 }} />
      </div>

      {/* Backdrop */}
      {mobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar${mobileOpen ? ' open' : ''}`}>
        {/* Logo */}
        <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid #f0f0f0' }}>
          <img src="/bookingwulf-logo.png" alt="bookingwulf" style={{ height: 28 }} />
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 8px' }}>
          {navItems.map((item) => (
            <SidebarNavItem key={item.href} {...item} />
          ))}
        </nav>

        {/* User + logout */}
        <div style={{
          borderTop: '1px solid #f0f0f0',
          padding: '12px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}>
          <span style={{ fontSize: 12, color: '#9ca3af', wordBreak: 'break-all' }}>{email}</span>
          <form action={logout}>
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '7px 0',
                borderRadius: 7,
                border: '1px solid #e5e5e5',
                background: 'transparent',
                fontSize: 13,
                color: '#444',
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >
              Abmelden
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
