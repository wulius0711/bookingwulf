'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProLockOverlay() {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const router = useRouter();

  return (
    <>
      <div
        onMouseMove={(e) => setPos({ x: e.clientX, y: e.clientY })}
        onMouseLeave={() => setPos(null)}
        onClick={() => { setPos(null); setShowBanner(true); }}
        style={{ position: 'absolute', inset: 0, cursor: 'pointer', zIndex: 10 }}
      >
        {pos && (
          <span style={{
            position: 'fixed',
            left: pos.x + 14,
            top: pos.y + 14,
            padding: '7px 14px',
            background: '#1e293b',
            color: '#fff',
            fontSize: 12,
            fontWeight: 500,
            borderRadius: 8,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 9999,
          }}>
            Ab Pro Plan verfügbar
          </span>
        )}
      </div>

      {showBanner && (
        <div
          onClick={() => setShowBanner(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 24,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: 20,
              padding: '32px 28px',
              maxWidth: 420,
              width: '100%',
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 12 }}>🔒</div>
            <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 700, color: '#0f172a' }}>
              Pro Feature
            </h2>
            <p style={{ margin: '0 0 24px', fontSize: 14, color: '#475569', lineHeight: 1.6 }}>
              Dieses Feature ist ab dem Pro Plan verfügbar. Upgrade jetzt und schalte alle Pro-Features frei.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button
                onClick={() => router.push('/admin/billing')}
                style={{ padding: '10px 20px', borderRadius: 8, background: 'var(--accent)', color: '#fff', border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
              >
                Zu den Plänen
              </button>
              <button
                onClick={() => setShowBanner(false)}
                style={{ padding: '10px 20px', borderRadius: 8, background: '#fff', color: '#374151', border: '1px solid #d1d5db', fontSize: 14, cursor: 'pointer' }}
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
