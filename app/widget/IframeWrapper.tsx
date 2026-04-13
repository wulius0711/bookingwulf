'use client';

import { useEffect, useRef } from 'react';

export default function IframeWrapper({ hotel }: { hotel: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    function resize() {
      const iframeEl = iframeRef.current;
      if (!iframeEl) return;

      try {
        const doc = iframeEl.contentWindow?.document;
        if (!doc) return;

        const height = Math.max(
          doc.body.scrollHeight,
          doc.documentElement.scrollHeight,
          doc.body.offsetHeight,
          doc.documentElement.offsetHeight,
        );

        iframeEl.style.height = height + 'px';
      } catch (e) {
        iframeEl.style.height = '1800px';
      }
    }

    iframe.addEventListener('load', resize);
    resize();

    const interval = window.setInterval(resize, 500);

    return () => {
      iframe.removeEventListener('load', resize);
      window.clearInterval(interval);
    };
  }, []);

  return (
    <iframe
      ref={iframeRef}
      src={`https://booking-app-snowy-two.vercel.app/?hotel=${hotel}`}
      scrolling="no"
      style={{
        width: '100%',
        border: 'none',
        display: 'block',
        background: 'transparent',
        height: '1200px',
      }}
    />
  );
}
