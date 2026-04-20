'use client';

import { useState } from 'react';

type Props = {
  hotelName: string;
  hotelSlug: string;
  hasApartments: boolean;
};

export default function OnboardingSteps({ hotelName, hotelSlug, hasApartments }: Props) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: 'Willkommen!',
      content: (
        <div>
          <p style={{ fontSize: 18, color: '#374151', lineHeight: 1.6, margin: '0 0 12px' }}>
            <strong>{hotelName}</strong> wurde erfolgreich erstellt.
          </p>
          <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.6, margin: 0 }}>
            In den nächsten Schritten richten wir Ihr Buchungssystem ein.
            Das dauert nur wenige Minuten.
          </p>
        </div>
      ),
    },
    {
      title: 'Apartment anlegen',
      content: (
        <div>
          <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.6, margin: '0 0 16px' }}>
            Legen Sie Ihr erstes Apartment an — mit Name, Preis, Fotos und Ausstattung.
            Ihre Gäste sehen diese Informationen direkt im Widget.
          </p>
          {hasApartments ? (
            <div style={{ padding: '12px 16px', background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: 10, fontSize: 14, color: '#16a34a', marginBottom: 12 }}>
              Sie haben bereits Apartments angelegt.
            </div>
          ) : (
            <a
              href="/admin/apartments/new"
              style={{
                display: 'inline-block',
                padding: '11px 24px',
                background: 'var(--accent)',
                color: '#fff',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Apartment anlegen
            </a>
          )}
        </div>
      ),
    },
    {
      title: 'Widget einbauen',
      content: (
        <div>
          <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.6, margin: '0 0 16px' }}>
            Kopieren Sie diesen Code und fügen Sie ihn auf Ihrer Hotel-Website ein — z.B. auf der Seite &bdquo;Buchen&ldquo;.
          </p>
          <div style={{ position: 'relative' }}>
            <pre
              style={{
                padding: '16px 18px',
                background: '#0f172a',
                color: '#e2e8f0',
                borderRadius: 12,
                fontSize: 13,
                lineHeight: 1.6,
                overflowX: 'auto',
                margin: 0,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
              }}
            >
              {`<script src="${typeof window !== 'undefined' ? window.location.origin : ''}/widget.js" data-hotel="${hotelSlug}"></script>`}
            </pre>
            <button
              type="button"
              onClick={() => {
                const code = `<script src="${window.location.origin}/widget.js" data-hotel="${hotelSlug}"></script>`;
                navigator.clipboard.writeText(code);
              }}
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
                padding: '6px 14px',
                borderRadius: 8,
                border: 'none',
                background: '#334155',
                color: '#fff',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Kopieren
            </button>
          </div>
          <p style={{ fontSize: 13, color: '#9ca3af', marginTop: 10 }}>
            Das Widget passt sich automatisch an Ihre Seite an.
          </p>
        </div>
      ),
    },
    {
      title: 'Fertig!',
      content: (
        <div>
          <p style={{ fontSize: 18, color: '#374151', lineHeight: 1.6, margin: '0 0 12px' }}>
            Ihr Buchungssystem ist einsatzbereit.
          </p>
          <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.6, margin: '0 0 24px' }}>
            Im Admin-Bereich können Sie jederzeit Apartments bearbeiten, Design anpassen, Extras hinzufügen und Buchungen verwalten.
          </p>
          <a
            href="/admin"
            style={{
              display: 'inline-block',
              padding: '12px 28px',
              background: 'var(--accent)',
              color: '#fff',
              borderRadius: 8,
              fontSize: 15,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Zum Dashboard
          </a>
        </div>
      ),
    },
  ];

  const current = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f5f7',
        padding: 24,
        fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, sans-serif',
      }}
    >
      <div style={{ width: '100%', maxWidth: 560 }}>

        {/* Progress */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 28 }}>
          {steps.map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 8,
                background: i <= step ? '#111' : '#ddd',
                transition: 'background 0.3s ease',
              }}
            />
          ))}
        </div>

        {/* Card */}
        <div
          style={{
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: 20,
            padding: '36px 40px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            Schritt {step + 1} von {steps.length}
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 20px', color: '#111', letterSpacing: '-0.02em' }}>
            {current.title}
          </h2>

          {current.content}

          {/* Navigation */}
          {!isLast && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28, gap: 12 }}>
              <button
                type="button"
                onClick={() => setStep(Math.max(0, step - 1))}
                disabled={step === 0}
                style={{
                  padding: '10px 20px',
                  borderRadius: 8,
                  border: '1px solid #ddd',
                  background: '#fff',
                  color: step === 0 ? '#ccc' : '#111',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: step === 0 ? 'default' : 'pointer',
                }}
              >
                Zurück
              </button>
              <button
                type="button"
                onClick={() => setStep(Math.min(steps.length - 1, step + 1))}
                style={{
                  padding: '10px 24px',
                  borderRadius: 8,
                  border: 'none',
                  background: 'var(--accent)',
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Weiter
              </button>
            </div>
          )}
        </div>

        {/* Skip */}
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <a href="/admin" style={{ fontSize: 13, color: '#999', textDecoration: 'none' }}>
            Onboarding überspringen
          </a>
        </div>
      </div>
    </div>
  );
}
