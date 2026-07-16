'use client';

import { useEffect, useRef, useState } from 'react';
import SignaturePad from 'signature_pad';

export default function SignatureField({ accent }: { accent: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const padRef = useRef<SignaturePad | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    canvas.getContext('2d')?.scale(ratio, ratio);

    const pad = new SignaturePad(canvas, { penColor: '#111827' });
    padRef.current = pad;

    const form = canvas.closest('form');
    const handleSubmit = (e: SubmitEvent) => {
      if (pad.isEmpty()) {
        e.preventDefault();
        setError(true);
        canvas.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      setError(false);
      if (inputRef.current) inputRef.current.value = pad.toDataURL('image/png');
    };
    form?.addEventListener('submit', handleSubmit);

    return () => {
      form?.removeEventListener('submit', handleSubmit);
      pad.off();
    };
  }, []);

  function handleClear() {
    padRef.current?.clear();
    setError(false);
  }

  return (
    <div>
      <label style={{ marginBottom: 4 }}>Unterschrift</label>
      <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 8px', lineHeight: 1.5 }}>
        Mit deiner Unterschrift bestätigst du die Richtigkeit der oben angegebenen Meldedaten (gesetzliche Vorgabe lt. Meldegesetz).
      </p>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: 150, border: '1px solid #e5e7eb', borderRadius: 8, touchAction: 'none', background: '#fff', display: 'block' }}
      />
      <input type="hidden" name="signature" ref={inputRef} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
        {error ? (
          <span style={{ fontSize: 12, color: '#dc2626' }}>Bitte unterschreibe, bevor du fortfährst.</span>
        ) : <span />}
        <button
          type="button"
          onClick={handleClear}
          style={{ fontSize: 12, color: accent, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
        >
          Löschen
        </button>
      </div>
    </div>
  );
}
