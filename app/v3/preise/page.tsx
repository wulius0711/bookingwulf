'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PLANS } from '@/src/lib/plans';

// i18n: Strings hier zentral
const COMPARISON_ROWS = [
  { label: 'Provision pro Buchung',             bw: '0 %',              ota: '15–25 %'     },
  { label: 'Widget auf eigener Website',        bw: true,               ota: false          },
  { label: 'Eigene Gästedaten',                 bw: true,               ota: false          },
  { label: 'Direkte Gästekommunikation',        bw: true,               ota: 'Eingeschränkt'},
  { label: 'Individuelles Branding',            bw: true,               ota: false          },
  { label: 'Gäste-Lounge mit Upselling',        bw: true,               ota: false          },
  { label: 'DSGVO-konform (EU-Server)',          bw: true,               ota: 'Teilweise'    },
  { label: 'Monatliche Fixkosten',              bw: 'ab €54/Mo',        ota: '–'            },
];

const PRICING_FAQ = [
  { q: 'Gibt es eine Mindestlaufzeit?',              a: 'Nein. Sie können jederzeit kündigen — monatlich oder jährlich.' },
  { q: 'Was passiert nach dem kostenlosen Test?',    a: 'Sie wählen einen Plan und werden erst dann belastet. Keine automatische Umstellung auf einen kostenpflichtigen Plan ohne Ihre Zustimmung.' },
  { q: 'Gibt es Rabatte für mehrere Hotels?',        a: 'Ab 2 Hotels gilt der Business-Plan. Für größere Setups kontaktieren Sie uns direkt.' },
  { q: 'Kann ich den Plan jederzeit wechseln?',      a: 'Ja — Upgrade und Downgrade sind jederzeit möglich.' },
  { q: 'Sind Buchungsgebühren oder Provisionen enthalten?', a: 'Nein. Sie zahlen ausschließlich den Monats- oder Jahrespreis — keine Provision, keine Transaktionsgebühren.' },
];

export default function PreisePage() {
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('year');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const plans = (Object.entries(PLANS) as [string, typeof PLANS[keyof typeof PLANS]][]).filter(([k]) => k !== 'bundle_all');

  return (
    <>
      {/* Hero */}
      <section className="text-center px-5 pt-20 pb-12 max-w-2xl mx-auto" aria-labelledby="pricing-hero-heading">
        <span className="bw-section-label">Preise</span>
        <h1 id="pricing-hero-heading" className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 text-slate-950">
          Transparent. Fair. Ohne Provision.
        </h1>
        <p className="text-lg text-slate-500 leading-relaxed">
          Ein monatlicher Fixpreis — keine Provision, keine versteckten Gebühren, egal wie viele Buchungen eingehen.
        </p>
      </section>

      {/* Billing toggle */}
      <div className="flex items-center justify-center gap-3 mb-10 px-5">
        <span className={`text-sm font-medium transition-colors ${billingInterval === 'month' ? 'text-slate-900' : 'text-slate-400'}`}>
          Monatlich
        </span>
        <button
          onClick={() => setBillingInterval((v) => v === 'month' ? 'year' : 'month')}
          className="relative w-12 h-6 rounded-full transition-colors duration-200 flex-shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-900"
          style={{ background: billingInterval === 'year' ? 'var(--bw-black)' : '#cbd5e1' }}
          role="switch"
          aria-checked={billingInterval === 'year'}
          aria-label={`Umschalten auf ${billingInterval === 'month' ? 'jährliche' : 'monatliche'} Abrechnung`}
        >
          <span
            className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-200"
            style={{ left: billingInterval === 'year' ? '1.375rem' : '0.125rem' }}
          />
        </button>
        <span className={`text-sm font-medium transition-colors ${billingInterval === 'year' ? 'text-slate-900' : 'text-slate-400'}`}>
          Jährlich
          {billingInterval === 'year' && (
            <span className="ml-1.5 px-2 py-0.5 rounded-md bg-green-100 text-green-700 text-xs font-bold">spare 10%</span>
          )}
        </span>
      </div>

      {/* Plan cards */}
      <section className="px-5 pb-16" aria-label="Preispläne">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-5 items-start">
          {plans.map(([key, plan], i) => (
            <div
              key={key}
              className={`bw-animate bw-animate-delay-${i + 1} relative rounded-2xl p-7 transition-all duration-300 ${
                key === 'pro'
                  ? 'bg-slate-900 text-white shadow-2xl shadow-slate-200 hover:-translate-y-1.5'
                  : 'bw-card hover:-translate-y-1'
              }`}
            >
              {key === 'pro' && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-green-500 text-white text-xs font-bold whitespace-nowrap">
                  Beliebt
                </div>
              )}
              <h2 className={`text-lg font-bold mb-1 ${key === 'pro' ? 'text-white' : 'text-slate-900'}`}>
                {plan.name}
              </h2>
              <div className={`text-4xl font-extrabold tracking-tight my-4 ${key === 'pro' ? 'text-white' : 'text-slate-900'}`}>
                €{billingInterval === 'year' ? plan.priceYearly : plan.priceMonthly}
                <span className="text-base font-normal text-slate-400">/Mo</span>
              </div>
              {billingInterval === 'year' && (
                <p className={`text-xs mb-4 -mt-2 ${key === 'pro' ? 'text-slate-400' : 'text-slate-400'}`}>
                  €{plan.priceYearly * 12} / Jahr · spare €{(plan.priceMonthly - plan.priceYearly) * 12}
                </p>
              )}
              <ul className="flex flex-col gap-2.5 mb-6 list-none m-0 p-0">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-2 items-start text-sm">
                    <span className={`mt-0.5 flex-shrink-0 font-bold ${key === 'pro' ? 'text-green-400' : 'text-green-600'}`} aria-hidden>✓</span>
                    <span className={key === 'pro' ? 'text-slate-300' : 'text-slate-600'}>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className={`bw-btn block text-center py-2.5 text-sm ${
                  key === 'pro'
                    ? 'bg-white text-slate-900 hover:bg-slate-100'
                    : 'bg-transparent text-slate-900 border-2 border-slate-900 hover:bg-slate-900 hover:text-white'
                }`}
              >
                14 Tage kostenlos testen
              </Link>
            </div>
          ))}
        </div>
        <p className="text-center mt-6 text-sm text-slate-400">
          Fragen?{' '}
          <a href="mailto:support@bookingwulf.com" className="text-slate-700 font-semibold hover:underline underline-offset-2">
            support@bookingwulf.com
          </a>
        </p>
      </section>

      {/* Vergleich vs. OTAs */}
      <section className="py-16 px-5 bg-slate-50" aria-labelledby="comparison-heading">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10 bw-animate">
            <span className="bw-section-label">Vergleich</span>
            <h2 id="comparison-heading" className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              bookingwulf vs. Buchungsportale
            </h2>
          </div>
          <div className="bw-animate bw-animate-delay-1 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <table className="w-full border-collapse text-sm" role="table" aria-label="Vergleich bookingwulf mit Buchungsportalen">
              <thead>
                <tr className="border-b border-slate-100">
                  <th scope="col" className="text-left px-5 py-4 text-slate-500 font-semibold w-1/2">Merkmal</th>
                  <th scope="col" className="px-5 py-4 text-slate-900 font-bold bg-slate-50">bookingwulf</th>
                  <th scope="col" className="px-5 py-4 text-slate-400 font-semibold">OTA-Portale</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map(({ label, bw, ota }, i) => (
                  <tr key={label} className={`border-b border-slate-100 last:border-0 ${i % 2 === 0 ? '' : 'bg-slate-50/50'}`}>
                    <td className="px-5 py-3.5 text-slate-600 font-medium">{label}</td>
                    <td className="px-5 py-3.5 text-center bg-slate-50/80 font-semibold">
                      {bw === true  ? <span className="text-green-600 text-base" aria-label="Ja">✓</span>
                       : bw === false ? <span className="text-slate-300 text-base" aria-label="Nein">✗</span>
                       : <span className="text-slate-700 text-xs">{bw}</span>}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {ota === true  ? <span className="text-green-600 text-base" aria-label="Ja">✓</span>
                       : ota === false ? <span className="text-slate-300 text-base" aria-label="Nein">✗</span>
                       : <span className="text-amber-600 text-xs font-medium">{ota}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Pricing FAQ */}
      <section className="py-16 px-5" aria-labelledby="pricing-faq-heading">
        <div className="max-w-2xl mx-auto">
          <h2 id="pricing-faq-heading" className="text-2xl font-extrabold tracking-tight text-center mb-10 bw-animate">
            Fragen zu den Preisen
          </h2>
          <div role="list">
            {PRICING_FAQ.map(({ q, a }, i) => (
              <div key={q} className={`bw-animate bw-animate-delay-${Math.min(i + 1, 4)} border-b border-slate-200`} role="listitem">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex justify-between items-center py-5 text-left gap-4 bg-transparent border-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 rounded"
                  aria-expanded={openFaq === i}
                >
                  <span className="text-base font-semibold text-slate-900 leading-snug">{q}</span>
                  <span className="text-slate-400 text-xl flex-shrink-0 transition-transform duration-200" style={{ transform: openFaq === i ? 'rotate(45deg)' : 'none' }} aria-hidden>+</span>
                </button>
                <div className={`bw-faq-answer ${openFaq === i ? 'bw-faq-open' : ''}`}>
                  <p className="pb-5 text-sm text-slate-600 leading-relaxed">{a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-5 text-center bg-slate-50">
        <div className="max-w-xl mx-auto bw-animate">
          <h2 className="text-3xl font-extrabold tracking-tight mb-4">Jetzt 14 Tage kostenlos testen</h2>
          <p className="text-slate-500 mb-8">Keine Kreditkarte. Keine Mindestlaufzeit. Jederzeit kündbar.</p>
          <Link href="/register" className="bw-btn bw-btn-primary">Kostenlos starten</Link>
        </div>
      </section>
    </>
  );
}
