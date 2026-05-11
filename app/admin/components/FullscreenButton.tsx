'use client';

import { useState, useEffect } from 'react';

const LS_KEY = 'admin_fullscreen';

export default function FullscreenButton() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(LS_KEY) === 'true';
    setActive(stored);
    document.documentElement.setAttribute('data-fullscreen', String(stored));
  }, []);

  function toggle() {
    const next = !active;
    setActive(next);
    localStorage.setItem(LS_KEY, String(next));
    document.documentElement.setAttribute('data-fullscreen', String(next));
  }

  return (
    <button
      onClick={toggle}
      title={active ? 'Vollbild beenden' : 'Vollbild'}
      suppressHydrationWarning
      className="hide-on-mobile"
      style={{
        position: 'fixed', top: '8px', right: '60px', zIndex: 900,
        width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px',
        cursor: 'pointer', color: 'var(--text-subtle)',
      }}
    >
      {active ? (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/>
          <path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/>
        </svg>
      ) : (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 8V5a2 2 0 0 1 2-2h3"/><path d="M16 3h3a2 2 0 0 1 2 2v3"/>
          <path d="M21 16v3a2 2 0 0 1-2 2h-3"/><path d="M8 21H5a2 2 0 0 1-2-2v-3"/>
        </svg>
      )}
    </button>
  );
}
