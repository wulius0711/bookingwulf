'use client';

import Link from 'next/link';
import { Zap, Smartphone, Moon } from 'lucide-react';
import { useV4Animate } from '../_components/useV4Animate';

function CompetitorMockup() {
  return (
    <div style={{
      borderRadius: 14, aspectRatio: '4/3', overflow: 'hidden',
      border: '1px solid #c8d0d8', fontFamily: 'Arial, Helvetica, sans-serif',
      background: '#f0f2f5', display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ background: '#1e3a5f', padding: '8px 12px', color: '#c8d4e0', fontSize: 11, fontWeight: 700, borderBottom: '2px solid #2855a0' }}>
        🏨 Online-Buchungssystem — Zimmerverfügbarkeit
      </div>
      <div style={{ padding: '8px 12px', borderBottom: '1px solid #bbb', background: '#dce0e8' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5, marginBottom: 5 }}>
          {[['Ankunftsdatum *', 'TT.MM.JJJJ 📅'], ['Abreisedatum *', 'TT.MM.JJJJ 📅']].map(([l, p]) => (
            <div key={l}>
              <div style={{ fontSize: 8, color: '#444', marginBottom: 2, fontWeight: 700 }}>{l}</div>
              <div style={{ background: '#fff', border: '1px solid #888', padding: '3px 6px', color: '#777', fontSize: 10, borderRadius: 2 }}>{p}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4, marginBottom: 6 }}>
          {[['Erw.*', '2 ▾'], ['Kinder', '0 ▾'], ['Zimmer', '1 ▾'], ['Frühst.', '✓ ▾']].map(([l, v]) => (
            <div key={l}>
              <div style={{ fontSize: 8, color: '#444', fontWeight: 700, marginBottom: 1 }}>{l}</div>
              <div style={{ background: '#fff', border: '1px solid #888', padding: '3px 4px', color: '#333', fontSize: 9, borderRadius: 2, textAlign: 'center' }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button style={{ flex: 1, background: '#2855a0', color: '#fff', border: 'none', padding: '5px', fontSize: 9, fontWeight: 700, letterSpacing: '0.04em', cursor: 'pointer', borderRadius: 2 }}>
            ZIMMER SUCHEN
          </button>
          <button style={{ background: '#888', color: '#fff', border: 'none', padding: '5px 8px', fontSize: 9, cursor: 'pointer', borderRadius: 2 }}>
            RESET
          </button>
        </div>
      </div>
      <div style={{ flex: 1, background: '#fff', overflow: 'hidden' }}>
        <div style={{ padding: '3px 10px', background: '#f5f5f5', borderBottom: '1px solid #ddd', fontSize: 9, color: '#666' }}>
          3 Ergebnisse · 14.06.–17.06. · 3 Nächte · 2 Personen
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#dce0e8' }}>
              {['Kategorie', 'Ausstattung', 'Preis/N.', ''].map((h) => (
                <th key={h} style={{ padding: '4px 6px', textAlign: 'left', color: '#1e3a5f', fontWeight: 700, borderBottom: '1px solid #bbb', fontSize: 8, whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ['Doppelzimmer Std.', 'Du./WC, TV', '€ 89,–'],
              ['Einzelzimmer', 'Du./WC, TV', '€ 65,–'],
              ['Komfortzimmer Sup.', 'Bad/WC, Blk.', '€ 119,–'],
            ].map(([name, feat, price], i) => (
              <tr key={name} style={{ background: i % 2 === 0 ? '#fff' : '#f7f7f7', borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '5px 6px', color: '#333', fontSize: 9 }}>{name}</td>
                <td style={{ padding: '5px 6px', color: '#888', fontSize: 8 }}>{feat}</td>
                <td style={{ padding: '5px 6px', color: '#1e3a5f', fontWeight: 700, fontSize: 10, whiteSpace: 'nowrap' }}>{price}</td>
                <td style={{ padding: '5px 6px' }}>
                  <span style={{ background: '#d06000', color: '#fff', fontSize: 7, fontWeight: 700, padding: '2px 5px', borderRadius: 2, whiteSpace: 'nowrap' }}>BUCHEN</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ padding: '3px 8px', fontSize: 7, color: '#aaa', borderTop: '1px solid #eee' }}>
          * Pflichtfeld · Preise inkl. Frühstück · zzgl. Kurtaxe 1,80 €
        </div>
      </div>
    </div>
  );
}

function BookingwulfMockup() {
  return (
    <div style={{
      borderRadius: 14, aspectRatio: '4/3', overflow: 'hidden',
      border: '1px solid var(--v4-green-border)', fontFamily: 'Inter, ui-sans-serif, sans-serif',
      background: '#fff', display: 'flex', flexDirection: 'column',
      boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
    }}>
      <div style={{ background: 'var(--v4-green)', padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: '#fff', fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em' }}>Hotel Sonnblick</span>
        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10 }}>Direkt buchen</span>
      </div>
      <div style={{ padding: '10px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: 8 }}>
        {[['Anreise', '14. Jun'], ['Abreise', '17. Jun']].map(([l, v]) => (
          <div key={l} style={{ flex: 1, border: '1px solid #e2e8f0', borderRadius: 10, padding: '6px 10px', background: '#fafbfc' }}>
            <div style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 1 }}>{l}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{v}</div>
          </div>
        ))}
        <div style={{ border: '1px solid var(--v4-green-border)', borderRadius: 10, padding: '6px 10px', background: 'var(--v4-green-light)', textAlign: 'center', minWidth: 44 }}>
          <div style={{ fontSize: 9, color: 'var(--v4-green)', fontWeight: 600 }}>Nächte</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--v4-green)' }}>3</div>
        </div>
      </div>
      <div style={{ flex: 1, padding: '10px 16px', display: 'flex', flexDirection: 'column', gap: 8, overflow: 'hidden' }}>
        {[
          { name: 'Doppelzimmer Alpin', meta: '2 Pers. · 22 m²', price: '89', hue: '#43a047', bg: 'linear-gradient(135deg,#e8f5e9,#c8e6c9)' },
          { name: 'Suite Panorama', meta: '2 Pers. · 42 m² · Balkon', price: '159', hue: '#1e88e5', bg: 'linear-gradient(135deg,#e3f2fd,#bbdefb)' },
        ].map((room) => (
          <div key={room.name} style={{ display: 'flex', border: '1px solid #f1f5f9', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ width: 60, flexShrink: 0, background: room.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={room.hue} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
              </svg>
            </div>
            <div style={{ flex: 1, padding: '8px 12px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>{room.name}</div>
              <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 5 }}>{room.meta}</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--v4-green)' }}>€ {room.price}</span>
                  <span style={{ fontSize: 9, color: '#94a3b8' }}> /Nacht</span>
                </div>
                <div style={{ background: 'var(--v4-green)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 8 }}>
                  Auswählen →
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const MOCKUP_SHELL: React.CSSProperties = {
  borderRadius: 14, aspectRatio: '3/4', overflow: 'hidden',
  border: '1px solid var(--v4-green-border)', fontFamily: 'Inter, ui-sans-serif, sans-serif',
  background: '#f8fafc', display: 'flex', flexDirection: 'column',
  boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
};
const MOCKUP_HEADER = (step: string, title: string) => (
  <div style={{ background: 'var(--v4-green)', padding: '10px 14px', flexShrink: 0 }}>
    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>Schritt {step}</div>
    <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{title}</div>
  </div>
);

function Step1Mockup() {
  const days = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
  const grid = [null,null,null,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30];
  return (
    <div style={MOCKUP_SHELL}>
      {MOCKUP_HEADER('01', 'Reisedaten')}
      <div style={{ flex: 1, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8, overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {[['Anreise', '14. Jun'], ['Abreise', '17. Jun']].map(([l, v]) => (
            <div key={l} style={{ flex: 1, border: '1px solid var(--v4-green-border)', borderRadius: 8, padding: '5px 8px', background: 'var(--v4-green-light)' }}>
              <div style={{ fontSize: 8, color: 'var(--v4-green)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{l}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--v4-green)' }}>{v}</div>
            </div>
          ))}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: '5px 8px', background: '#fff', textAlign: 'center', minWidth: 38 }}>
            <div style={{ fontSize: 8, color: '#94a3b8', fontWeight: 600 }}>Erw.</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>2</div>
          </div>
        </div>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '8px 10px', flex: 1, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#0f172a' }}>Juni 2025</span>
            <div style={{ display: 'flex', gap: 4 }}>
              {['‹', '›'].map(a => <span key={a} style={{ fontSize: 11, color: '#94a3b8', cursor: 'pointer', padding: '0 2px' }}>{a}</span>)}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, marginBottom: 3 }}>
            {days.map(d => <div key={d} style={{ fontSize: 7, fontWeight: 600, color: '#94a3b8', textAlign: 'center' }}>{d}</div>)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
            {grid.map((d, i) => (
              <div key={i} style={{
                fontSize: 8, textAlign: 'center', padding: '2px 0', borderRadius: 4, fontWeight: d === 14 || d === 17 ? 700 : 400,
                background: d && d >= 14 && d <= 17 ? 'var(--v4-green-light)' : 'transparent',
                color: d === 14 || d === 17 ? 'var(--v4-green)' : d ? '#374151' : 'transparent',
                outline: d === 14 || d === 17 ? '1.5px solid var(--v4-green)' : 'none',
              }}>{d ?? ''}</div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ background: 'var(--v4-green)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '7px 16px', borderRadius: 8 }}>Weiter →</div>
        </div>
      </div>
    </div>
  );
}

function Step2Mockup() {
  return (
    <div style={MOCKUP_SHELL}>
      {MOCKUP_HEADER('02', 'Apartments')}
      <div style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0', background: '#fff', display: 'flex', gap: 4 }}>
        {[['14. Jun', ''], ['17. Jun', ''], ['2 Erw.', '']].map(([v], i) => (
          <span key={i} style={{ fontSize: 9, color: '#64748b', background: '#f1f5f9', borderRadius: 5, padding: '2px 6px', fontWeight: 500 }}>{v}</span>
        ))}
      </div>
      <div style={{ flex: 1, padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 7, overflow: 'hidden' }}>
        {[
          { name: 'Doppelzimmer Alpin', meta: '2 Pers. · 22 m²', price: '89', bg: 'linear-gradient(135deg,#e8f5e9,#c8e6c9)', hue: '#43a047', active: true },
          { name: 'Einzelzimmer Tauern', meta: '1 Pers. · 16 m²', price: '65', bg: 'linear-gradient(135deg,#fff3e0,#ffe0b2)', hue: '#fb8c00', active: false },
          { name: 'Suite Panorama',      meta: '2 Pers. · 42 m²', price: '149', bg: 'linear-gradient(135deg,#e3f2fd,#bbdefb)', hue: '#1e88e5', active: false },
        ].map((room) => (
          <div key={room.name} style={{ display: 'flex', border: `1.5px solid ${room.active ? 'var(--v4-green)' : '#f1f5f9'}`, borderRadius: 10, overflow: 'hidden', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ width: 48, flexShrink: 0, background: room.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={room.hue} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
              </svg>
            </div>
            <div style={{ flex: 1, padding: '6px 9px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#0f172a' }}>{room.name}</div>
              <div style={{ fontSize: 8, color: '#94a3b8', marginBottom: 3 }}>{room.meta}</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--v4-green)' }}>€ {room.price}<span style={{ fontSize: 8, fontWeight: 400, color: '#94a3b8' }}> / N</span></span>
                {room.active && <span style={{ background: 'var(--v4-green)', color: '#fff', fontSize: 8, fontWeight: 700, padding: '2px 7px', borderRadius: 5 }}>✓</span>}
              </div>
            </div>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'auto' }}>
          <div style={{ background: 'var(--v4-green)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '7px 16px', borderRadius: 8 }}>Weiter →</div>
        </div>
      </div>
    </div>
  );
}

function Step3Mockup() {
  return (
    <div style={MOCKUP_SHELL}>
      {MOCKUP_HEADER('03', 'Zusatzleistungen')}
      <div style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0', background: '#fff' }}>
        <div style={{ fontSize: 9, color: '#64748b' }}>Doppelzimmer Alpin · 14.–17. Jun · 3 Nächte</div>
      </div>
      <div style={{ flex: 1, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 7, overflow: 'hidden' }}>
        {[
          { label: 'Frühstück',       sub: '€ 14,– / Pers. / Tag', on: true  },
          { label: 'Parkplatz',       sub: '€ 8,– / Tag',           on: false },
          { label: 'Late Check-out',  sub: '€ 25,– einmalig',        on: true  },
          { label: 'Kindermenü',      sub: '€ 9,– / Tag',           on: false },
        ].map(({ label, sub, on }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: `1.5px solid ${on ? 'var(--v4-green-border)' : '#e2e8f0'}`, borderRadius: 9, padding: '7px 10px', background: on ? 'var(--v4-green-light)' : '#fff' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#0f172a' }}>{label}</div>
              <div style={{ fontSize: 9, color: '#94a3b8' }}>{sub}</div>
            </div>
            <div style={{ width: 28, height: 16, borderRadius: 999, background: on ? 'var(--v4-green)' : '#cbd5e1', display: 'flex', alignItems: 'center', padding: '0 2px', justifyContent: on ? 'flex-end' : 'flex-start', flexShrink: 0 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#fff' }} />
            </div>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'auto' }}>
          <div style={{ background: 'var(--v4-green)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '7px 16px', borderRadius: 8 }}>Weiter →</div>
        </div>
      </div>
    </div>
  );
}

function Step4Mockup() {
  return (
    <div style={MOCKUP_SHELL}>
      {MOCKUP_HEADER('04', 'Anfrage / Buchung')}
      <div style={{ margin: '8px 12px 0', border: '1px solid var(--v4-green-border)', borderRadius: 9, padding: '7px 10px', background: 'var(--v4-green-light)', flexShrink: 0 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--v4-green)', marginBottom: 1 }}>Doppelzimmer Alpin · 3 Nächte</div>
        <div style={{ fontSize: 10, color: 'var(--v4-green)' }}>14. – 17. Jun · Frühstück · Late Check-out · <strong>€ 334,–</strong></div>
      </div>
      <div style={{ flex: 1, padding: '8px 12px 10px', display: 'flex', flexDirection: 'column', gap: 7, overflow: 'hidden' }}>
        {[
          { label: 'Vor- und Nachname', val: 'Maria Müller' },
          { label: 'E-Mail-Adresse',   val: 'maria@beispiel.at' },
          { label: 'Telefon',          val: '+43 664 …' },
        ].map(({ label, val }) => (
          <div key={label}>
            <div style={{ fontSize: 9, fontWeight: 600, color: '#374151', marginBottom: 3 }}>{label}</div>
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 7, padding: '6px 9px', fontSize: 10, color: '#9ca3af' }}>{val}</div>
          </div>
        ))}
        <div>
          <div style={{ fontSize: 9, fontWeight: 600, color: '#374151', marginBottom: 3 }}>Nachricht <span style={{ fontWeight: 400, color: '#9ca3af' }}>(optional)</span></div>
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 7, height: 32 }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'auto' }}>
          <div style={{ background: 'var(--v4-green)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '7px 16px', borderRadius: 8 }}>Jetzt anfragen →</div>
        </div>
      </div>
    </div>
  );
}

const widgetSteps = [
  {
    step: '01',
    label: 'Reisedaten',
    body: 'Zeitraum und Gästeanzahl festlegen. Klare Kalenderansicht — der Gast sieht sofort, was verfügbar ist.',
    Mockup: Step1Mockup,
  },
  {
    step: '02',
    label: 'Apartment wählen',
    body: 'Bilder, Ausstattung und Preis auf einen Blick — passend zum gewählten Zeitraum und automatisch gefiltert.',
    Mockup: Step2Mockup,
  },
  {
    step: '03',
    label: 'Zusatzleistungen',
    body: 'Frühstück, Parkplatz, Late Check-out — der Gast wählt was er möchte, der Preis aktualisiert sich live.',
    Mockup: Step3Mockup,
  },
  {
    step: '04',
    label: 'Anfrage absenden',
    body: 'Nur die nötigsten Felder. Sofortige Bestätigung per E-Mail — für Gast und Hotel.',
    Mockup: Step4Mockup,
  },
];

export default function DerUnterschiedPage() {
  useV4Animate();

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="v4-section bg-white">
        <div className="v4-container" style={{ maxWidth: 760 }}>
          <span className="v4-eyebrow v4-animate">Der Unterschied</span>
          <h1 className="v4-h1 mb-8 v4-animate v4-d1">
            Warum sehen Buchungswidgets noch immer so aus?
          </h1>
          <p className="v4-animate v4-d2" style={{ fontSize: 18, lineHeight: 1.75, color: 'var(--v4-body)', marginBottom: 20 }}>
            Du hast in deine Website investiert. Die Fotografie stimmt, das Design passt zu deinem Haus. Und dann öffnet der Gast das Buchungswidget — und landet in einer anderen Welt. Genau so fühlt sich oft auch die tägliche Arbeit im Admin an: unübersichtlich, umständlich, zu viele Klicks für einfache Dinge.
          </p>
          <p className="v4-animate v4-d3" style={{ fontSize: 18, lineHeight: 1.75, color: 'var(--v4-body)' }}>
            Die meisten Systeme am Markt sind gebaut für Desktop, gebaut für Stabilität — nicht für Conversion oder einfache Bedienung. Weil ein Wechsel aufwändig ist, blieb das Interface wie es war.
          </p>
        </div>
      </section>

      {/* ── Screenshot-Vergleich ───────────────────────────────────── */}
      <section className="v4-section" style={{ background: 'var(--v4-surface)' }}>
        <div className="v4-container">
          <div className="text-center mb-14">
            <span className="v4-eyebrow v4-animate">Gegenüberstellung</span>
            <h2 className="v4-h2 v4-animate v4-d1">Widget. Einmal alt, einmal neu.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Alt */}
            <div className="v4-animate v4-d1">
              <CompetitorMockup />
              <div style={{ marginTop: 14, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', flexShrink: 0, marginTop: 5 }} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--v4-navy)', marginBottom: 4 }}>Typisches Buchungswidget</div>
                  <div style={{ fontSize: 13, color: 'var(--v4-body)', lineHeight: 1.6 }}>
                    Kein visueller Zusammenhang zur Website. Überladen, umständlich, kaum mobil nutzbar.
                  </div>
                </div>
              </div>
            </div>

            {/* bookingwulf */}
            <div className="v4-animate v4-d2">
              <BookingwulfMockup />
              <div style={{ marginTop: 14, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--v4-green)', flexShrink: 0, marginTop: 5 }} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--v4-navy)', marginBottom: 4 }}>bookingwulf</div>
                  <div style={{ fontSize: 13, color: 'var(--v4-body)', lineHeight: 1.6 }}>
                    Nahtlos integriert, mobil-first, an deine Farben angepasst. Der Gast merkt nicht, dass er ein fremdes System nutzt.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Admin-Sektion ─────────────────────────────────────────── */}
      <section className="v4-section v4-angled" style={{ background: 'var(--v4-navy)', paddingTop: 152, paddingBottom: 152 }}>
        <div className="v4-container">
          <div className="text-center v4-animate" style={{ marginBottom: 56 }}>
            <span className="v4-eyebrow" style={{ color: 'var(--v4-green)' }}>Admin</span>
            <h2 className="v4-h2 v4-animate v4-d1" style={{ color: '#fff' }}>Ein Admin der nicht nervt.</h2>
            <p className="v4-animate v4-d2" style={{ fontSize: 18, lineHeight: 1.75, color: 'var(--v4-muted)', maxWidth: 640, margin: '16px auto 0' }}>
              bookingwulf ist 2026 und von Grund auf neu gebaut — schnell, modern,
              und so intuitiv dass keine Einschulung nötig ist.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { Icon: Zap,        label: 'Blitzschnell',  desc: 'Next.js, server-side rendering, kein Reload.' },
              { Icon: Smartphone, label: 'Mobile-first',  desc: 'Funktioniert auf jedem Gerät, als App oder im Browser.' },
              { Icon: Moon,       label: 'Dark Mode',     desc: 'Weil gute Software auch gut aussieht.' },
            ].map((pillar, i) => (
              <div key={pillar.label} className={`v4-animate v4-d${i + 1} p-8`} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 'var(--v4-radius-card)' }}>
                <div className="mb-5 w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(16,139,169,0.25)' }}>
                  <pillar.Icon size={22} strokeWidth={1.75} style={{ color: 'var(--v4-green)' }} aria-hidden />
                </div>
                <div style={{ fontSize: 19, fontWeight: 700, color: '#fff', marginBottom: 8 }}>{pillar.label}</div>
                <div style={{ fontSize: 16, color: 'var(--v4-muted)', lineHeight: 1.65 }}>{pillar.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Widget-Sektion ────────────────────────────────────────── */}
      <section className="v4-section" style={{ background: 'var(--v4-surface)' }}>
        <div className="v4-container">
          <div className="text-center mb-16">
            <span className="v4-eyebrow v4-animate">Widget</span>
            <h2 className="v4-h2 v4-animate v4-d1">Buchungserlebnis das überzeugt.</h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {widgetSteps.map((item, i) => (
              <div key={item.label} className={`v4-animate v4-d${i + 1}`}>
                <item.Mockup />
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--v4-green)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
                    Schritt {item.step}
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--v4-navy)', marginBottom: 8, lineHeight: 1.3 }}>
                    {item.label}
                  </h3>
                  <p style={{ fontSize: 14, color: 'var(--v4-body)', lineHeight: 1.7 }}>{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Abschluss / CTA ───────────────────────────────────────── */}
      <section className="v4-section v4-grain" style={{ background: 'var(--v4-navy)' }}>
        <div className="v4-container text-center" style={{ maxWidth: 640 }}>
          <p className="v4-animate" style={{ fontSize: 22, fontWeight: 600, lineHeight: 1.5, color: '#fff', marginBottom: 6 }}>
            Für den Gast: ein Buchungserlebnis das überzeugt.
          </p>
          <p className="v4-animate v4-d1" style={{ fontSize: 22, fontWeight: 600, lineHeight: 1.5, color: 'var(--v4-green-border)', marginBottom: 44 }}>
            Für das Hotel: ein Admin der nicht nervt.
          </p>
          <Link href="/register" className="v4-btn v4-btn-primary v4-animate v4-d2">
            Demo anfragen
          </Link>
        </div>
      </section>
    </>
  );
}
