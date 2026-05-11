'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

const LS_KEY = 'admin_fullscreen';

export default function FullscreenButton() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const wants = useRef(false);
  const pathname = usePathname();

  useEffect(() => {
    wants.current = localStorage.getItem(LS_KEY) === 'true';
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  // Re-enter fullscreen after navigation (user gesture still active from link click)
  useEffect(() => {
    if (wants.current && !document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  }, [pathname]);

  function toggle() {
    if (!document.fullscreenElement) {
      wants.current = true;
      localStorage.setItem(LS_KEY, 'true');
      document.documentElement.requestFullscreen();
    } else {
      wants.current = false;
      localStorage.setItem(LS_KEY, 'false');
      document.exitFullscreen();
    }
  }

  return (
    <button
      onClick={toggle}
      title={isFullscreen ? 'Vollbild beenden' : 'Vollbild'}
      suppressHydrationWarning
      className="hide-on-mobile"
      style={{
        position: 'fixed', top: '8px', right: '60px', zIndex: 900,
        width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px',
        cursor: 'pointer', color: 'var(--text-subtle)',
      }}
    >
      {isFullscreen ? (
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
