'use client';

import { useState, useEffect, useCallback } from 'react';

const TOUR_STEPS = [
  {
    target: '[data-tour="nav-overview"]',
    title: 'Übersicht',
    text: 'Hier sehen Sie Ihr Dashboard mit den wichtigsten Kennzahlen auf einen Blick.',
  },
  {
    target: '[data-tour="nav-apartments"]',
    title: 'Apartments',
    text: 'Legen Sie Ihre Apartments mit Bildern, Preisen und Ausstattung an.',
  },
  {
    target: '[data-tour="nav-requests"]',
    title: 'Buchungen',
    text: 'Alle eingehenden Buchungsanfragen landen hier. Status ändern, Details einsehen.',
  },
  {
    target: '[data-tour="nav-settings"]',
    title: 'Einstellungen',
    text: 'Passen Sie Farben, Design und den Embed-Code für Ihre Website an.',
  },
  {
    target: '[data-tour="nav-extras"]',
    title: 'Zusatzleistungen',
    text: 'Konfigurieren Sie Extras und Versicherungsoptionen für Ihre Gäste.',
  },
  {
    target: '[data-tour="nav-billing"]',
    title: 'Abonnement',
    text: 'Verwalten Sie Ihren Plan und die Zahlungsinformationen.',
  },
];

const STORAGE_KEY = 'bookingwulf_tour_done';

export default function GuidedTour() {
  const [step, setStep] = useState(-1);
  const [rect, setRect] = useState<DOMRect | null>(null);

  const active = step >= 0 && step < TOUR_STEPS.length;
  const current = active ? TOUR_STEPS[step] : null;

  const updateRect = useCallback(() => {
    if (!current) return;
    const el = document.querySelector(current.target);
    if (el) {
      setRect(el.getBoundingClientRect());
    }
  }, [current]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (localStorage.getItem(STORAGE_KEY)) return;
    if (window.innerWidth < 768) return;
    const t = setTimeout(() => setStep(0), 600);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    updateRect();
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect);
    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect);
    };
  }, [updateRect]);

  function next() {
    if (step < TOUR_STEPS.length - 1) {
      setStep(step + 1);
    } else {
      finish();
    }
  }

  function finish() {
    setStep(-1);
    localStorage.setItem(STORAGE_KEY, '1');
  }

  if (!active || !rect) return null;

  const isLast = step === TOUR_STEPS.length - 1;

  // Position tooltip below the target
  const tooltipTop = rect.bottom + 12;
  const tooltipLeft = Math.max(16, Math.min(rect.left, window.innerWidth - 340));

  return (
    <>
      {/* Overlay with cutout */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99998,
          pointerEvents: 'auto',
        }}
        onClick={finish}
      >
        <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
          <defs>
            <mask id="tour-mask">
              <rect width="100%" height="100%" fill="white" />
              <rect
                x={rect.left - 6}
                y={rect.top - 4}
                width={rect.width + 12}
                height={rect.height + 8}
                rx="8"
                fill="black"
              />
            </mask>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="rgba(0,0,0,0.55)"
            mask="url(#tour-mask)"
          />
        </svg>
      </div>

      {/* Highlight ring */}
      <div
        style={{
          position: 'fixed',
          left: rect.left - 6,
          top: rect.top - 4,
          width: rect.width + 12,
          height: rect.height + 8,
          borderRadius: 8,
          border: '2px solid #fff',
          boxShadow: '0 0 0 4px rgba(255,255,255,0.2)',
          zIndex: 99999,
          pointerEvents: 'none',
          transition: 'all 0.3s ease',
        }}
      />

      {/* Tooltip */}
      <div
        style={{
          position: 'fixed',
          top: tooltipTop,
          left: tooltipLeft,
          width: 320,
          background: '#fff',
          borderRadius: 12,
          padding: '20px 22px',
          boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
          zIndex: 99999,
          fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
          animation: 'tourFadeIn 0.25s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`
          @keyframes tourFadeIn {
            from { opacity: 0; transform: translateY(-8px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>

        {/* Step indicator */}
        <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
          Schritt {step + 1} von {TOUR_STEPS.length}
        </div>

        <div style={{ fontWeight: 700, fontSize: 16, color: '#111', marginBottom: 6 }}>
          {current!.title}
        </div>

        <p style={{ fontSize: 14, color: '#555', lineHeight: 1.55, margin: '0 0 18px' }}>
          {current!.text}
        </p>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={finish}
            style={{
              padding: 0,
              border: 'none',
              background: 'none',
              fontSize: 13,
              color: '#999',
              cursor: 'pointer',
            }}
          >
            Überspringen
          </button>

          <button
            onClick={next}
            style={{
              padding: '8px 18px',
              borderRadius: 8,
              border: 'none',
              background: '#111',
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {isLast ? 'Fertig' : 'Nächster Schritt →'}
          </button>
        </div>
      </div>
    </>
  );
}
