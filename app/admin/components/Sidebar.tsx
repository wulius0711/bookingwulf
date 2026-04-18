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

type HotelOption = { id: number; name: string };

type Props = {
  navItems: NavItemDef[];
  email: string;
  activeHotelId: number | null;
  userHotels: HotelOption[];
};

function SidebarNavItem({ href, label, locked, active, upgradeLabel }: NavItemDef) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);
  const [shaking, setShaking] = useState(false);
  const tourId = href.replace('/admin/', '').replace('/admin', 'overview') || 'overview';

  if (locked) {
    return (
      <span
        className={shaking ? 'shake sidebar-nav-item' : 'sidebar-nav-item'}
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
        }}
      >
        {label} 🔒
        {showTooltip && upgradeLabel && (
          <span style={{
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

export default function Sidebar({ navItems, email, activeHotelId, userHotels }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

  async function handleHotelSwitch(hotelId: number) {
    if (hotelId === activeHotelId) return;
    setSwitching(true);
    await fetch('/api/admin/switch-hotel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hotelId }),
    });
    window.location.href = '/admin';
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
      <aside className={`admin-sidebar${mobileOpen ? ' open' : ''}`}>
        {/* Logo */}
        <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid #f0f0f0' }}>
          <img src="/bookingwulf-logo.png" alt="bookingwulf" style={{ height: 36 }} />
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, overflow: 'visible', padding: '12px 8px' }}>
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
          {userHotels.length > 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Anlage</span>
              <select
                value={activeHotelId ?? ''}
                disabled={switching}
                onChange={(e) => handleHotelSwitch(Number(e.target.value))}
                style={{ padding: '6px 8px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, color: '#111', background: '#fafafa', cursor: 'pointer', opacity: switching ? 0.5 : 1 }}
              >
                {userHotels.map((h) => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
            </div>
          )}
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
