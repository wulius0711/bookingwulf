'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

// i18n: Strings hier zentral
const COLOR_PRESETS = [
  { label: 'Klassisch',   settings: { accentColor: '#dc143c', backgroundColor: '#faebd7', cardBackground: '#fef9f2', textColor: '#111111', borderColor: '#dddddd', cardRadius: '12', buttonRadius: '44' } },
  { label: 'Modern Blau', settings: { accentColor: '#1a56db', backgroundColor: '#eff6ff', cardBackground: '#f8fbff', textColor: '#0f1941', borderColor: '#c3d9f8', cardRadius: '2',  buttonRadius: '2'  } },
  { label: 'Natur',       settings: { accentColor: '#3d5c3a', backgroundColor: '#f0f2e8', cardBackground: '#f6f7f0', textColor: '#1a2418', borderColor: '#c5cbb0', cardRadius: '20', buttonRadius: '44' } },
  { label: 'Minimal',     settings: { accentColor: '#111827', backgroundColor: '#f9fafb', cardBackground: '#ffffff', textColor: '#111827', borderColor: '#e5e7eb', cardRadius: '8',  buttonRadius: '8'  } },
];

const BASE_SETTINGS: Record<string, string> = {
  headlineFont: '', bodyFont: '', headlineFontSize: '28', bodyFontSize: '14', headlineFontWeight: '700', buttonColor: '#ffffff', mutedTextColor: '#666666',
};

export default function DemoPage() {
  const iframeRef    = useRef<HTMLIFrameElement>(null);
  const [active, setActive] = useState(0);
  const [ready, setReady]   = useState(false);

  function applyPreset(index: number) {
    setActive(index);
    iframeRef.current?.contentWindow?.postMessage(
      { type: 'booking-widget-preview-settings', settings: { ...BASE_SETTINGS, ...COLOR_PRESETS[index].settings } },
      '*'
    );
  }

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.data?.type === 'booking-widget-ready' && !ready) {
        setReady(true);
        applyPreset(0);
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  return (
    <>
      {/* Hero */}
      <section className="text-center px-5 pt-20 pb-10 max-w-2xl mx-auto" aria-labelledby="demo-heading">
        <span className="bw-section-label">Live-Demo</span>
        <h1 id="demo-heading" className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 text-slate-950">
          Probieren Sie es aus
        </h1>
        <p className="text-lg text-slate-500 leading-relaxed">
          So sieht das bookingwulf-Widget auf der Website eines Hotels aus. Wählen Sie ein Farbschema — oder testen Sie das Widget direkt.
        </p>
      </section>

      {/* Color preset switcher */}
      <div className="flex flex-wrap justify-center gap-2 px-5 mb-6" role="group" aria-label="Farbschema auswählen">
        {COLOR_PRESETS.map((preset, i) => (
          <button
            key={preset.label}
            onClick={() => applyPreset(i)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 border focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-900 ${
              active === i
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
            }`}
            aria-pressed={active === i}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Widget embed */}
      <section className="max-w-5xl mx-auto px-5 pb-16" aria-label="Widget-Demo">
        <div className="rounded-2xl overflow-hidden border border-slate-200" style={{ boxShadow: 'var(--bw-shadow-widget)' }}>
          {!ready && (
            <div className="flex items-center justify-center h-40 text-sm text-slate-400" aria-live="polite" aria-label="Widget wird geladen">
              Widget wird geladen …
            </div>
          )}
          <iframe
            ref={iframeRef}
            src="/widget.html?hotel=beiwumoser"
            className="w-full border-none block"
            style={{ height: 680, display: ready ? 'block' : 'none' }}
            scrolling="no"
            title="bookingwulf Widget Demo"
            aria-label="Interaktive Demo des bookingwulf Buchungswidgets"
          />
        </div>
        <p className="text-center text-xs text-slate-400 mt-4">
          Demo-Ansicht mit Beispieldaten · Nicht zur echten Buchung geeignet
        </p>
      </section>

      {/* Info cards */}
      <section className="py-12 px-5 bg-slate-50" aria-labelledby="demo-info-heading">
        <div className="max-w-4xl mx-auto">
          <h2 id="demo-info-heading" className="sr-only">Was Sie in der Demo sehen</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-3 gap-5 list-none m-0 p-0" role="list">
            {[
              { icon: '🎨', title: 'Vollständig anpassbar', desc: 'Farben, Formen und Schrift passen sich Ihrer Website an — ohne Code.' },
              { icon: '📅', title: 'Echtzeit-Verfügbarkeit', desc: 'Gäste sehen sofort welche Apartments in ihrem Zeitraum verfügbar sind.' },
              { icon: '⚡', title: 'Eine Zeile Code', desc: 'Das Widget ist mit einem einzigen Script-Tag auf jeder Website eingebunden.' },
            ].map((item) => (
              <li key={item.title} className="bw-card p-6">
                <div className="text-2xl mb-3" aria-hidden>{item.icon}</div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-5 text-center" aria-labelledby="demo-cta-heading">
        <div className="max-w-xl mx-auto bw-animate">
          <h2 id="demo-cta-heading" className="text-3xl font-extrabold tracking-tight mb-4">
            Gefällt Ihnen was Sie sehen?
          </h2>
          <p className="text-slate-500 text-base mb-8">14 Tage kostenlos testen — keine Kreditkarte erforderlich.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/register" className="bw-btn bw-btn-primary">Jetzt starten</Link>
            <Link href="/v3/preise" className="bw-btn bw-btn-secondary">Preise ansehen →</Link>
          </div>
        </div>
      </section>
    </>
  );
}
