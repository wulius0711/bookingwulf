'use client';

import { useState, useEffect } from 'react';

export default function PwaInstallBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('pwa_banner_dismissed');
    if (dismissed) return;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) return;

    // beforeinstallprompt only fires in Chrome/Edge when PWA is installable
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
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0,
      zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
      background: 'var(--accent)', color: '#fff',
      padding: '8px 16px', fontSize: 13,
    }}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
        <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
      </svg>
      <span>Admin als App installieren: In der <strong>Adressleiste</strong> auf das Installieren-Icon klicken — öffnet ohne Browser-Chrome</span>
      <button onClick={dismiss} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.8)', fontSize: 18, padding: '0 4px', lineHeight: 1, marginLeft: 4 }}>×</button>
    </div>
  );
}
