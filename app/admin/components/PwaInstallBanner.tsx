'use client';

import { useState, useEffect } from 'react';

export default function PwaInstallBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('pwa_banner_dismissed');
    if (dismissed) return;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (!isStandalone) setShow(true);
  }, []);

  function dismiss() {
    localStorage.setItem('pwa_banner_dismissed', '1');
    setShow(false);
  }

  if (!show) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
      zIndex: 1000, display: 'flex', alignItems: 'center', gap: 12,
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 12, padding: '12px 16px',
      boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
      fontSize: 13, color: 'var(--text-primary)',
      whiteSpace: 'nowrap',
    }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent)', flexShrink: 0 }}>
        <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
      </svg>
      <span>Als App installieren: Menü <strong>→ App installieren</strong> für Fullscreen ohne Browser-Chrome</span>
      <button onClick={dismiss} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 16, padding: '0 4px', lineHeight: 1 }}>×</button>
    </div>
  );
}
