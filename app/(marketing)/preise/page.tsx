'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Minus } from 'lucide-react';
import { PLANS } from '@/src/lib/plans';
import { useV4Animate } from '../_components/useV4Animate';
import BridgeSection from '../_components/BridgeSection';

const PLAN_KEYS = ['starter', 'pro', 'business'] as const;

type CellVal = string | boolean;

type FeatureRow = { label: string; starter: CellVal; pro: CellVal; business: CellVal };
type FeatureGroup = { group: string; rows: FeatureRow[] };

const COMPARISON: FeatureGroup[] = [
  {
    group: 'Kapazität',
    rows: [
      { label: 'Apartments', starter: '3', pro: '15', business: 'Unlimitiert' },
      { label: 'Admin-User', starter: '1', pro: '3', business: 'Unlimitiert' },
      { label: 'Hotelanlagen', starter: '1', pro: '1', business: '2' },
    ],
  },
  {
    group: 'Buchungswidget',
    rows: [
      { label: 'Buchungsanfrage', starter: true, pro: true, business: true },
      { label: 'Direktbuchung mit Zahlung', starter: true, pro: true, business: true },
      { label: 'Zimmerplan', starter: true, pro: true, business: true },
      { label: 'Mini-Widget (einbettbar)', starter: true, pro: true, business: true },
      { label: 'Online Check-in für Gäste', starter: true, pro: true, business: true },
      { label: 'Widget doppelt einsetzbar (Anfrage & Buchung)', starter: false, pro: true, business: true },
    ],
  },
  {
    group: 'Preise & Verfügbarkeit',
    rows: [
      { label: 'Verfügbarkeits-Widget (einbettbar)', starter: false, pro: true, business: true },
      { label: 'iCal-Sync (Airbnb & Booking.com)', starter: true, pro: true, business: true },
      { label: 'Preissaisons & Mindestaufenthalt', starter: false, pro: true, business: true },
      { label: 'Last-Minute Rabatt', starter: false, pro: true, business: true },
      { label: 'Lücken-Rabatt', starter: false, pro: true, business: true },
      { label: 'Belegungsbasierter Preisaufschlag', starter: false, pro: false, business: true },
    ],
  },
  {
    group: 'Integrationen',
    rows: [
      { label: 'Nuki Smartlock', starter: false, pro: true, business: true },
      { label: 'Beds24 Channel Manager', starter: false, pro: true, business: true },
    ],
  },
  {
    group: 'Branding & E-Mails',
    rows: [
      { label: 'Basis Branding (Farbe, Logo)', starter: true, pro: true, business: true },
      { label: 'Erweitertes Branding', starter: false, pro: true, business: true },
      { label: 'Anpassbare E-Mail-Texte', starter: false, pro: true, business: true },
      { label: 'Volles Branding', starter: false, pro: false, business: true },
      { label: 'Ohne bookingwulf-Logo', starter: false, pro: false, business: true },
    ],
  },
  {
    group: 'Admin & Kommunikation',
    rows: [
      { label: 'Konfigurierbare Extras & Zusatzleistungen', starter: false, pro: true, business: true },
      { label: 'KI-Assistent im Admin', starter: false, pro: true, business: true },
      { label: 'Gäste-Assistent (KI-Chatbot)', starter: false, pro: true, business: true },
      { label: 'Direktnachrichten an Gäste', starter: false, pro: false, business: true },
      { label: 'Analytics', starter: false, pro: false, business: true },
    ],
  },
  {
    group: 'Support',
    rows: [
      { label: 'E-Mail Support', starter: true, pro: true, business: true },
      { label: 'Priority Support', starter: false, pro: false, business: true },
    ],
  },
];

const FAQ_ITEMS = [
  {
    q: 'Gibt es eine kostenlose Testphase?',
    a: 'Ja — 14 Tage kostenlos, keine Kreditkarte erforderlich. Du kannst alle Features deines gewählten Plans uneingeschränkt testen.',
  },
  {
    q: 'Kann ich jederzeit kündigen?',
    a: 'Ja, jederzeit ohne Angabe von Gründen. Keine Mindestlaufzeit. Bei monatlicher Abrechnung endet der Zugang zum Ende des laufenden Monats.',
  },
  {
    q: 'Gibt es versteckte Kosten oder Buchungsprovisionen?',
    a: 'Nein. Du zahlst nur den monatlichen Fixpreis — keine Provision pro Buchung, keine Transaktionsgebühren, keine Setupkosten.',
  },
  {
    q: 'Was ist der Unterschied zwischen monatlicher und jährlicher Abrechnung?',
    a: 'Bei jährlicher Abrechnung sparst du ~10% gegenüber der monatlichen Rate. Der Betrag wird einmalig für 12 Monate in Rechnung gestellt.',
  },
  {
    q: 'Was kostet der Beds24 Channel Manager (Airbnb / Booking.com)?',
    a: 'Beds24 ist ein separater Drittanbieter mit eigenem kostenpflichtigen Account (ab ca. €9/Mo). bookingwulf verlangt dafür keinen Aufpreis — Du verbindest einfach deinen bestehenden Beds24-Account.',
  },
  {
    q: 'Was passiert wenn ich mehr Apartments brauche als mein Plan erlaubt?',
    a: 'Du kannst jederzeit in einen größeren Plan wechseln. Deine bestehenden Daten, Buchungen und Einstellungen bleiben vollständig erhalten.',
  },
];

function FaqItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`v4-animate v4-d${Math.min(index + 1, 4)}`} style={{ borderBottom: '1px solid var(--v4-border)' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: '100%', textAlign: 'left', padding: '18px 0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 16, fontWeight: 600, color: 'var(--v4-navy)', gap: 12,
        }}
        aria-expanded={open}
      >
        <span>{q}</span>
        <span style={{ fontSize: 22, color: 'var(--v4-green)', flexShrink: 0, lineHeight: 1, display: 'inline-block', transform: open ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s ease' }}>+</span>
      </button>
      <div className={`v4-faq-body${open ? ' open' : ''}`}>
        <p style={{ paddingBottom: 18, fontSize: 15, lineHeight: 1.7, color: 'var(--v4-body)', margin: 0 }}>{a}</p>
      </div>
    </div>
  );
}

function Cell({ val, isPro }: { val: CellVal; isPro: boolean }) {
  if (typeof val === 'string') {
    return <span style={{ fontSize: 15, fontWeight: 600, color: isPro ? 'var(--v4-navy)' : 'var(--v4-body)' }}>{val}</span>;
  }
  if (val) return <Check size={18} strokeWidth={2.5} style={{ color: 'var(--v4-green)' }} aria-label="Inklusive" />;
  return <Minus size={16} strokeWidth={2} style={{ color: '#cbd5e1' }} aria-label="Nicht enthalten" />;
}

export default function PreisePage() {
  const [billing, setBilling] = useState<'month' | 'year'>('month');

  useV4Animate();

  const plans = PLAN_KEYS.map((k) => ({ key: k, ...PLANS[k] }));

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="v4-section bg-white">
        <div className="v4-container text-center" style={{ maxWidth: 680 }}>
          <span className="v4-eyebrow v4-animate">Preise</span>
          <h1 className="v4-h1 mb-5 v4-animate v4-d1">Drei klare Pläne.<br />Kein Abo-Dschungel.</h1>
          <p className="v4-animate v4-d2" style={{ fontSize: 18, lineHeight: 1.75, color: 'var(--v4-body)', marginBottom: 36 }}>
            Keine Provision. Keine versteckten Kosten. 14 Tage kostenlos testen — ohne Kreditkarte.
          </p>
        </div>
      </section>

      {/* ── Plan Cards ───────────────────────────────────────────── */}
      <section className="v4-angled" style={{ background: 'var(--v4-navy)', padding: '100px 0 152px' }}>
        <div className="v4-container">
          {/* Toggle */}
          <div className="flex items-center justify-center gap-3 v4-animate mb-10">
            <span style={{ fontSize: 14, fontWeight: 500, color: billing === 'month' ? '#fff' : 'var(--v4-muted)' }}>Monatlich</span>
            <button
              onClick={() => setBilling((v) => v === 'month' ? 'year' : 'month')}
              className="relative w-12 h-6 rounded-full shrink-0"
              style={{ background: billing === 'year' ? 'var(--v4-green)' : '#334155', transition: 'background 0.2s', border: 'none', cursor: 'pointer' }}
              role="switch" aria-checked={billing === 'year'}
              aria-label="Jährliche Abrechnung"
            >
              <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow" style={{ left: billing === 'year' ? '1.375rem' : '0.125rem', transition: 'left 0.2s' }} />
            </button>
            <span style={{ fontSize: 14, fontWeight: 500, color: billing === 'year' ? '#fff' : 'var(--v4-muted)' }}>
              Jährlich
              <span
                style={{
                  marginLeft: 8, padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                  background: 'rgba(16,139,169,0.25)', color: 'var(--v4-green-border)',
                  opacity: billing === 'year' ? 1 : 0, transition: 'opacity 0.2s',
                }}
              >~10% sparen</span>
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 items-start">
            {plans.map(({ key, name, priceMonthly, priceYearly, features }, i) => {
              const isPro = key === 'pro';
              return (
                <div
                  key={key}
                  className={`v4-animate v4-d${i + 1} relative p-7`}
                  style={isPro
                    ? { background: '#fff', borderRadius: 'var(--v4-radius-card)', borderTop: '3px solid var(--v4-green)', boxShadow: '0 12px 40px rgba(0,0,0,0.3)', transition: 'transform 0.35s ease, box-shadow 0.35s ease' }
                    : { background: 'rgba(255,255,255,0.06)', borderRadius: 'var(--v4-radius-card)', border: '1px solid rgba(255,255,255,0.1)', transition: 'transform 0.35s ease' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-8px)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = ''; }}
                >
                  {isPro && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-white text-xs font-bold whitespace-nowrap" style={{ background: 'var(--v4-green)' }}>
                      Beliebt
                    </div>
                  )}
                  <div style={{ fontSize: 12, fontWeight: 700, color: isPro ? 'var(--v4-green)' : 'var(--v4-green-border)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>{name}</div>
                  <div style={{ marginBottom: 20 }}>
                    <span style={{ fontSize: 42, fontWeight: 800, letterSpacing: '-0.03em', color: isPro ? 'var(--v4-navy)' : '#fff' }}>
                      € {billing === 'year' ? priceYearly : priceMonthly}
                    </span>
                    <span style={{ fontSize: 14, color: 'var(--v4-muted)', marginLeft: 3 }}> / Mo</span>
                    {billing === 'year' && (
                      <div style={{ fontSize: 12, color: isPro ? 'var(--v4-body)' : '#64748b', marginTop: 3 }}>
                        = € {(priceYearly * 12).toLocaleString('de-AT')} / Jahr
                      </div>
                    )}
                  </div>
                  <ul style={{ listStyle: 'none', margin: '0 0 24px', padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {(features as readonly string[]).map((f) => (
                      <li key={f} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 14 }}>
                        <Check size={13} strokeWidth={2.5} style={{ color: 'var(--v4-green)', marginTop: 2, flexShrink: 0 }} aria-hidden />
                        <span style={{ color: isPro ? 'var(--v4-body)' : '#cbd5e1' }}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/register" className={`v4-btn w-full ${isPro ? 'v4-btn-primary' : 'v4-btn-outline-green'}`}>
                    14 Tage kostenlos testen
                  </Link>
                </div>
              );
            })}
          </div>
          <p className="text-center v4-animate mt-8" style={{ fontSize: 13, color: 'var(--v4-muted)' }}>
            Keine Kreditkarte erforderlich · Kündigung jederzeit möglich
          </p>
          <div className="mt-10">
            <BridgeSection />
          </div>
        </div>
      </section>

      {/* ── Comparison Table ──────────────────────────────────────── */}
      <section className="v4-section bg-white">
        <div className="v4-container">
          <div className="text-center mb-14">
            <span className="v4-eyebrow v4-animate">Vergleich</span>
            <h2 className="v4-h2 v4-animate v4-d1">Was ist in welchem Plan enthalten?</h2>
          </div>

          <div className="v4-table-wrap v4-table-wrap-pricing">
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, minWidth: 440, tableLayout: 'fixed' }}>
              <thead>
                <tr>
                  <th className="sticky-col-header" style={{ textAlign: 'left', padding: '12px 16px', width: '40%', boxShadow: 'inset 0 -2px 0 var(--v4-border)', position: 'sticky', top: 64, background: '#fff', zIndex: 5 }} />
                  {plans.map(({ key, name }) => (
                    <th key={key} style={{ padding: '12px 16px', textAlign: 'center', boxShadow: `inset 0 -2px 0 ${key === 'pro' ? 'var(--v4-green)' : 'var(--v4-border)'}`, width: '20%', position: 'sticky', top: 64, background: key === 'pro' ? '#f0fafd' : '#fff', zIndex: 5 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: key === 'pro' ? 'var(--v4-green)' : 'var(--v4-navy)' }}>{name}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON.flatMap(({ group, rows }, gi) => [
                  // spacer before each group (including first — creates gap to thead)
                  <tr key={`spacer-${group}`} aria-hidden>
                    <td colSpan={4} style={{ height: gi === 0 ? 16 : 12, padding: 0 }} />
                  </tr>,
                  // group header
                  <tr key={`g-${group}`}>
                    <td colSpan={4} className="v4-table-group">{group}</td>
                  </tr>,
                  // data rows
                  ...rows.map((row, ri) => {
                    const isLast = ri === rows.length - 1;
                    return (
                      <tr key={`${group}-${row.label}`}>
                        <td style={{
                          padding: '10px 16px', fontSize: 15, color: 'var(--v4-body)',
                          borderLeft: '1px solid var(--v4-border)',
                          borderBottom: isLast ? '1px solid var(--v4-border)' : '1px solid #f1f5f9',
                          borderRadius: isLast ? '0 0 0 8px' : undefined,
                        }}>
                          {row.label}
                        </td>
                        {PLAN_KEYS.map((k, ki) => {
                          const isLastCol = ki === PLAN_KEYS.length - 1;
                          return (
                            <td key={k} style={{
                              padding: '10px 16px', textAlign: 'center',
                              background: k === 'pro' ? 'rgba(16,139,169,0.04)' : 'transparent',
                              borderRight: isLastCol ? '1px solid var(--v4-border)' : undefined,
                              borderBottom: isLast ? '1px solid var(--v4-border)' : '1px solid #f1f5f9',
                              borderRadius: isLast && isLastCol ? '0 0 8px 0' : undefined,
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'center' }}>
                                <Cell val={row[k]} isPro={k === 'pro'} />
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  }),
                ])}
                {/* spacer before price row */}
                <tr aria-hidden><td colSpan={4} style={{ height: 20, padding: 0 }} /></tr>
                {/* Price + CTA at bottom */}
                <tr>
                  <td style={{ padding: '20px 16px 8px', fontSize: 15, fontWeight: 600, color: 'var(--v4-navy)', borderTop: '2px solid var(--v4-border)' }}>
                    {billing === 'year' ? 'Preis / Monat (jährlich)' : 'Preis / Monat'}
                  </td>
                  {plans.map(({ key, priceMonthly, priceYearly }) => (
                    <td key={key} style={{ padding: '20px 16px 8px', textAlign: 'center', background: key === 'pro' ? 'rgba(16,139,169,0.04)' : 'transparent', borderTop: '2px solid var(--v4-border)' }}>
                      <div style={{ fontSize: 26, fontWeight: 800, color: key === 'pro' ? 'var(--v4-green)' : 'var(--v4-navy)' }}>
                        € {billing === 'year' ? priceYearly : priceMonthly}
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--v4-muted)' }}>/ Mo</div>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td style={{ padding: '8px 16px 24px' }} />
                  {plans.map(({ key }) => (
                    <td key={key} style={{ padding: '8px 16px 24px', textAlign: 'center', background: key === 'pro' ? 'rgba(16,139,169,0.04)' : 'transparent' }}>
                      <Link href="/register" className={`v4-btn ${key === 'pro' ? 'v4-btn-primary' : 'v4-btn-ghost'}`} style={{ width: '100%', fontSize: 13, whiteSpace: 'normal', height: 'auto', paddingTop: 8, paddingBottom: 8, lineHeight: 1.3 }}>
                        Kostenlos testen
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <section className="v4-section" style={{ background: 'var(--v4-surface)' }}>
        <div className="v4-container" style={{ maxWidth: 720 }}>
          <div className="text-center mb-14">
            <span className="v4-eyebrow v4-animate">FAQ</span>
            <h2 className="v4-h2 v4-animate v4-d1">Häufige Fragen zu Preisen & Plänen</h2>
          </div>
          {FAQ_ITEMS.map(({ q, a }, i) => (
            <FaqItem key={q} q={q} a={a} index={i} />
          ))}
          <p className="text-center mt-12 v4-animate" style={{ fontSize: 15, color: 'var(--v4-body)' }}>
            Weitere Fragen?{' '}
            <a href="mailto:support@bookingwulf.com" style={{ color: 'var(--v4-green)', fontWeight: 600 }}>support@bookingwulf.com</a>
          </p>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section className="v4-section v4-grain" style={{ background: 'var(--v4-navy)' }}>
        <div className="v4-container text-center" style={{ maxWidth: 600 }}>
          <p className="v4-animate" style={{ fontSize: 22, fontWeight: 600, color: '#fff', marginBottom: 8, lineHeight: 1.4 }}>
            14 Tage kostenlos — ohne Kreditkarte.
          </p>
          <p className="v4-animate v4-d1" style={{ fontSize: 16, color: 'var(--v4-muted)', marginBottom: 40 }}>
            Danach wähle einen Plan oder hör einfach auf. Kein Risiko.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/register" className="v4-btn v4-btn-primary v4-animate v4-d2">Jetzt starten</Link>
            <Link href="/der-unterschied" className="v4-btn v4-btn-ghost-white v4-animate v4-d3">Warum bookingwulf?</Link>
          </div>
        </div>
      </section>
    </>
  );
}
