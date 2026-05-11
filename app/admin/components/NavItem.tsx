'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function NavItem({
  href,
  label,
  locked,
  active,
  upgradeLabel,
}: {
  href: string;
  label: string;
  locked: boolean;
  active?: boolean;
  upgradeLabel?: string;
}) {
  const [hover, setHover] = useState(false);
  const [shaking, setShaking] = useState(false);

  const tourId = href.replace('/admin/', '').replace('/admin', 'overview') || 'overview';

  if (!locked) {
    return (
      <Link
        href={href}
        data-tour={`nav-${tourId}`}
        style={{
          padding: '6px 12px',
          borderRadius: 6,
          fontSize: 13,
          fontWeight: active ? 600 : 500,
          color: active ? '#111' : '#444',
          textDecoration: 'none',
          borderBottom: active ? '2px solid #111' : '2px solid transparent',
          marginBottom: -1,
          transition: 'color 0.15s ease, border-color 0.15s ease',
        }}
      >
        {label}
      </Link>
    );
  }

  return (
    <span
      className={shaking ? 'shake' : undefined}
      onClick={() => {
        setShaking(true);
        setTimeout(() => setShaking(false), 400);
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: '6px 12px',
        borderRadius: 6,
        fontSize: 13,
        fontWeight: 500,
        color: '#c0c5ce',
        cursor: 'default',
        position: 'relative',
        userSelect: 'none',
        borderBottom: '2px solid transparent',
        marginBottom: -1,
      }}
    >
      {label} 🔒
      {hover && upgradeLabel && (
        <span
          style={{
            position: 'absolute',
            left: '50%',
            top: '100%',
            transform: 'translateX(-50%)',
            marginTop: 8,
            padding: '7px 14px',
            background: '#1e293b',
            color: '#fff',
            fontSize: 12,
            fontWeight: 500,
            borderRadius: 8,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 50,
          }}
        >
          Ab {upgradeLabel} Plan verfügbar
          <span
            style={{
              position: 'absolute',
              bottom: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              borderWidth: 5,
              borderStyle: 'solid',
              borderColor: 'transparent transparent #1e293b transparent',
            }}
          />
        </span>
      )}
    </span>
  );
}
