'use client';

import { useFormStatus } from 'react-dom';
import { useEffect, useRef, useState } from 'react';

export default function SaveButton({
  label = 'Speichern',
  style,
  initialInstantBooking = false,
  initialAnyPayment = true,
}: {
  label?: string;
  style?: React.CSSProperties;
  initialInstantBooking?: boolean;
  initialAnyPayment?: boolean;
}) {
  const { pending } = useFormStatus();
  const [saved, setSaved] = useState(false);
  const wasPending = useRef(false);
  const instantBookingRef = useRef(initialInstantBooking);
  const anyPaymentRef = useRef(initialAnyPayment);
  const [blocked, setBlocked] = useState(false);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (wasPending.current && !pending) {
      setSaved(true);
      const t = setTimeout(() => setSaved(false), 2500);
      return () => clearTimeout(t);
    }
    wasPending.current = pending;
  }, [pending]);

  useEffect(() => {
    function update() { setBlocked(instantBookingRef.current && !anyPaymentRef.current); }

    update();

    const onInstant = (e: Event) => { instantBookingRef.current = (e as CustomEvent<{ enabled: boolean }>).detail.enabled; update(); };
    const onPayment = (e: Event) => { anyPaymentRef.current = (e as CustomEvent<{ anyEnabled: boolean }>).detail.anyEnabled; update(); };

    window.addEventListener('bw:instant-booking-change', onInstant);
    window.addEventListener('bw:payment-change', onPayment);
    return () => {
      window.removeEventListener('bw:instant-booking-change', onInstant);
      window.removeEventListener('bw:payment-change', onPayment);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isDisabled = pending || blocked;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <button
        type={blocked ? 'button' : 'submit'}
        disabled={pending}
        className="btn-shine"
        onMouseMove={blocked ? (e) => setTooltipPos({ x: e.clientX, y: e.clientY }) : undefined}
        onMouseLeave={blocked ? () => setTooltipPos(null) : undefined}
        style={{
          padding: '10px 20px',
          background: blocked ? 'var(--primitive-gray-300)' : 'var(--accent)',
          color: blocked ? 'var(--primitive-gray-600)' : 'var(--text-on-accent)',
          border: 'none',
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 600,
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          opacity: pending ? 0.7 : 1,
          ...style,
        }}
      >
        {pending ? `${label}…` : label}
      </button>
      {tooltipPos && (
        <span style={{
          position: 'fixed',
          left: tooltipPos.x + 14,
          top: tooltipPos.y + 14,
          padding: '7px 14px',
          background: 'var(--surface-2)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border)',
          fontSize: 12,
          fontWeight: 500,
          borderRadius: 8,
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 9999,
        }}>
          Verbindliche Buchung ist aktiv. Bitte zuerst eine Zahlungsart aktivieren.
        </span>
      )}
      {saved && !blocked && (
        <span style={{ fontSize: 13, color: '#16a34a', fontWeight: 500 }}>✓ Gespeichert</span>
      )}
    </div>
  );
}
