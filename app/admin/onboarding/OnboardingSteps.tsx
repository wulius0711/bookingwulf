'use client';

import { useState, useEffect } from 'react';

const STEP_GROUPS = ['', 'Betrieb', 'Verwaltung', 'Konfiguration', 'Konto'];

type Props = {
  hotelName: string;
};

export default function OnboardingSteps({ hotelName }: Props) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const group = STEP_GROUPS[step] || '';
    if (group) {
      document.body.dataset.onboardingGroup = group;
    } else {
      delete document.body.dataset.onboardingGroup;
    }
    return () => { delete document.body.dataset.onboardingGroup; };
  }, [step]);

  const featureRow = (icon: string, title: string, desc: string) => (
    <div key={title} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <span style={{ fontSize: 18, lineHeight: 1, marginTop: 1 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#111', marginBottom: 2 }}>{title}</div>
        <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.5 }}>{desc}</div>
      </div>
    </div>
  );

  const steps = [
    {
      title: 'Willkommen!',
      content: (
        <div>
          <p style={{ fontSize: 17, color: '#374151', lineHeight: 1.6, margin: '0 0 16px' }}>
            <strong>{hotelName}</strong> wurde erfolgreich erstellt. Wir zeigen Ihnen kurz, was bookingwulf alles kann.
          </p>
          <div style={{ padding: '12px 16px', background: 'var(--status-booked-bg)', border: '1px solid var(--primitive-green-100)', borderRadius: 10, fontSize: 14, color: 'var(--status-booked-text)', fontWeight: 500 }}>
            ✓ 14 Tage kostenlos testen — alle Funktionen inklusive, keine Kreditkarte nötig.
          </div>
        </div>
      ),
    },
    {
      title: 'Betrieb',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontSize: 14, color: '#6b7280', margin: 0, lineHeight: 1.5 }}>
            Hier verwalten Sie den laufenden Betrieb — von der ersten Anfrage bis zur Abreise.
          </p>
          {featureRow('📋', 'Anfragen', 'Alle Gästeanfragen laufen hier ein. Status ändern (Neu → Beantwortet → Gebucht) — die E-Mail an den Gast geht automatisch raus.')}

          {/* Kalender highlight */}
          <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>📅</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Kalender</span>
              <span style={{ fontSize: 11, fontWeight: 600, background: '#111', color: '#fff', borderRadius: 4, padding: '2px 7px', letterSpacing: '0.03em' }}>Tipp</span>
            </div>
            <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.55 }}>
              Monatsansicht aller Buchungen und Sperrzeiten. Zeitraum per <strong style={{ color: 'var(--text-primary)' }}>Drag & Drop</strong> markieren — dann direkt eine Buchung, Sperrzeit oder Preiszeitraum anlegen, ohne die Seite zu verlassen.
            </div>
          </div>

          <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>🏠</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Zimmerplan</span>
              <span style={{ fontSize: 11, fontWeight: 600, background: '#111', color: '#fff', borderRadius: 4, padding: '2px 7px', letterSpacing: '0.03em' }}>Tipp</span>
            </div>
            <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.55 }}>
              Gantt-Übersicht aller Apartments. Zeitraum per <strong style={{ color: 'var(--text-primary)' }}>Drag & Drop</strong> markieren — dann direkt eine Buchung, Sperrzeit oder Preiszeitraum anlegen, ohne die Seite zu verlassen.
            </div>
          </div>
          {featureRow('📊', 'Analytics', 'Buchungsstatistiken: Auslastung, Umsatz, beliebteste Zeiträume (ab Business-Plan).')}
        </div>
      ),
    },
    {
      title: 'Verwaltung',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontSize: 14, color: '#6b7280', margin: 0, lineHeight: 1.5 }}>
            Alles rund um Ihr Angebot — Apartments, Preise und Verfügbarkeiten.
          </p>
          {featureRow('🛏️', 'Apartments', 'Legen Sie Apartments mit Name, Beschreibung, Fotos, Ausstattung und Basispreis an. Alles erscheint direkt im Buchungs-Widget.')}
          {featureRow('💶', 'Preise', 'Saisonale Preisregeln: Hochsaison, Nebensaison, Wochenend-Aufschläge, Mindestaufenthalte.')}
          {featureRow('🚫', 'Sperrzeiten', 'Eigennutzung, Renovierung oder andere Blockierungen direkt im Kalender eintragen.')}
          {featureRow('➕', 'Zusatzleistungen', 'Optionale Extras für Gäste: Frühstück, Parkplatz, Haustier-Aufschlag u.v.m.')}
        </div>
      ),
    },
    {
      title: 'Konfiguration',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontSize: 14, color: '#6b7280', margin: 0, lineHeight: 1.5 }}>
            Passen Sie bookingwulf an Ihr Hotel an.
          </p>
          <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>🎨</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Widget & Design</span>
              <span style={{ fontSize: 11, fontWeight: 600, background: '#111', color: '#fff', borderRadius: 4, padding: '2px 7px', letterSpacing: '0.03em' }}>Tipp</span>
            </div>
            <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.55 }}>
              Akzentfarbe, Widget-Layout und Schrift festlegen — das Widget übernimmt das Design automatisch.
            </div>
            <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.55 }}>
              Benachrichtigungs-E-Mail, AGB-Link und Datenschutz-URL hinterlegen. Diese erscheinen im Buchungsformular für Gäste.
            </div>
          </div>
          {featureRow('✉️', 'E-Mail Templates', 'Texte der automatischen Gast-E-Mails anpassen — in mehreren Sprachen (de, en, it, fr u.a.).')}
          {featureRow('🔑', 'Schlüsselloses Einchecken', 'Nuki-Integration: Türschlösser mit Buchungen verknüpfen (ab Pro-Plan).')}
          {featureRow('🔗', 'Beds24 Channel Manager', 'Synchronisiert Verfügbarkeiten und Buchungen mit Airbnb und booking.com (ab Business-Plan). In Vorbereitung — Diese Integration wird schrittweise ausgebaut. Die Verbindung kann bereits konfiguriert werden; automatischer Sync wird mit einem Update aktiviert.')}
        </div>
      ),
    },
    {
      title: 'Paket wählen',
      content: (
        <div>
          <p style={{ fontSize: 17, color: '#374151', lineHeight: 1.6, margin: '0 0 12px' }}>
            Sie sind startklar!
          </p>
          <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.6, margin: '0 0 20px' }}>
            Ihr 14-tägiger Testzeitraum läuft. Wählen Sie ein Paket und entdecken Sie alle Funktionen — kostenlos bis zum Ende des Tests.
          </p>
          <a
            href="/admin/billing"
            className="btn-shine"
            style={{
              display: 'inline-block',
              padding: '12px 28px',
              background: 'var(--accent)',
              color: '#fff',
              borderRadius: 8,
              fontSize: 15,
              fontWeight: 600,
              textDecoration: 'none',
              marginRight: 12,
            }}
          >
            Paket auswählen →
          </a>
          <a
            href="/admin"
            style={{
              display: 'inline-block',
              padding: '12px 20px',
              background: 'transparent',
              color: '#6b7280',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 500,
              textDecoration: 'none',
              border: '1px solid #e5e7eb',
            }}
          >
            Später
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
        padding: 24,
        fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, sans-serif',
        position: 'relative',
        zIndex: 42,
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
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 20,
            padding: '36px 40px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            Schritt {step + 1} von {steps.length}
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 20px', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
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
                  border: '1px solid var(--border)',
                  background: 'var(--surface)',
                  color: step === 0 ? 'var(--text-subtle)' : 'var(--text-primary)',
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
                className="btn-shine"
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
        {!isLast && (
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <a href="/admin/billing" style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>
              Onboarding überspringen
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
