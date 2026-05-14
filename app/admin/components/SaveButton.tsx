'use client';

import { useFormStatus } from 'react-dom';
import { useEffect, useRef, useState } from 'react';

export default function SaveButton({
  label = 'Speichern',
  style,
}: {
  label?: string;
  style?: React.CSSProperties;
}) {
  const { pending } = useFormStatus();
  const [saved, setSaved] = useState(false);
  const wasPending = useRef(false);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    if (wasPending.current && !pending) {
      setSaved(true);
      const t = setTimeout(() => setSaved(false), 2500);
      return () => clearTimeout(t);
    }
    wasPending.current = pending;
  }, [pending]);

  useEffect(() => {
    let instantBooking = false;
    let anyPayment = true;

    function update() { setBlocked(instantBooking && !anyPayment); }

    const onInstant = (e: Event) => { instantBooking = (e as CustomEvent<{ enabled: boolean }>).detail.enabled; update(); };
    const onPayment = (e: Event) => { anyPayment = (e as CustomEvent<{ anyEnabled: boolean }>).detail.anyEnabled; update(); };

    window.addEventListener('bw:instant-booking-change', onInstant);
    window.addEventListener('bw:payment-change', onPayment);
    return () => {
      window.removeEventListener('bw:instant-booking-change', onInstant);
      window.removeEventListener('bw:payment-change', onPayment);
    };
  }, []);

  const isDisabled = pending || blocked;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <button
        type={blocked ? 'button' : 'submit'}
        disabled={isDisabled}
        className="btn-shine"
        title={blocked ? 'Bitte zuerst eine Zahlungsart aktivieren' : undefined}
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
      {saved && !blocked && (
        <span style={{ fontSize: 13, color: '#16a34a', fontWeight: 500 }}>✓ Gespeichert</span>
      )}
      {blocked && (
        <span style={{ fontSize: 13, color: 'var(--primitive-yellow-700)', fontWeight: 500 }}>
          Zahlungsart fehlt
        </span>
      )}
    </div>
  );
}
