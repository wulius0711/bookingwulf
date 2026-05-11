'use client';

import { useState, useEffect } from 'react';

export default function PwaInstallBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('pwa_banner_dismissed');
    if (dismissed) return;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) return;

    const handler = () => setShow(true);
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  function dismiss() {
    localStorage.setItem('pwa_banner_dismissed', '1');
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="pwa-banner" style={{
      position: 'fixed', top: 56, left: '50%',
      zIndex: 1000, display: 'flex', alignItems: 'center', gap: 12,
      background: '#eff6ff', border: '1px solid #bfdbfe',
      borderRadius: 12, padding: '12px 16px',
      boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
      fontSize: 13, color: '#1e40af',
      whiteSpace: 'nowrap',
    }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#3b82f6', flexShrink: 0 }}>
        <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
      </svg>
      <span>Tipp: bookingwulf als App installieren: In der <strong>Adressleiste</strong> auf das Installieren-Icon klicken — öffnet ohne Browser</span>
      <button onClick={dismiss} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#93c5fd', fontSize: 18, padding: '0 4px', lineHeight: 1 }}>×</button>
    </div>
  );
}
