'use client';

import { useState } from 'react';

export default function NavItem({
  href,
  label,
  locked,
  upgradeLabel,
}: {
  href: string;
  label: string;
  locked: boolean;
  upgradeLabel?: string;
}) {
  const [hover, setHover] = useState(false);

  if (!locked) {
    return (
      <a
        href={href}
        style={{
          padding: '6px 12px',
          borderRadius: 6,
          fontSize: 13,
          fontWeight: 500,
          color: '#444',
          textDecoration: 'none',
        }}
      >
        {label}
      </a>
    );
  }

  return (
    <span
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
