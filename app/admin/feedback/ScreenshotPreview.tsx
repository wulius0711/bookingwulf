'use client';

import { useState } from 'react';

export default function ScreenshotPreview({ src }: { src: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <img
        src={src}
        alt="Screenshot"
        onClick={() => setOpen(true)}
        style={{
          maxWidth: '100%', maxHeight: 200, borderRadius: 8,
          border: '1px solid #e5e7eb', objectFit: 'cover',
          display: 'block', marginTop: 10, cursor: 'zoom-in',
        }}
      />

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 2000,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24, cursor: 'zoom-out',
          }}
        >
          <img
            src={src}
            alt="Screenshot"
            style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: 10, objectFit: 'contain' }}
          />
        </div>
      )}
    </>
  );
}
