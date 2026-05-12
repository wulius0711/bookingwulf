'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Ban, Building2, Check, ConciergeBell, Palette, Plus, RefreshCw, ShieldCheck, Zap } from 'lucide-react';
import { PLANS } from '@/src/lib/plans';

const CONTENT = {
  hero: {
    badge: 'Beta · 14 Tage kostenlos testen',
    h1a:   'Direktbuchungen für',
    h1b:   'Ihre Unterkunft.',
    h1c:   'Ohne Provision.',
    sub:   'Modernes Buchungssystem für Apartments und Hotels.\nIn 5 Minuten eingebaut, ohne Entwickler.',
    cta1:  'Kostenlos starten',
    cta2:  'Live-Demo ansehen',
    trust: ['Keine Provision', 'Setup in 5 Min', 'Kein Entwickler', 'DSGVO-konform'],
  },
  pain: {
    label:         'Der versteckte Kostenfaktor',
    h2:            'Was zahlen Sie wirklich für Buchungsportale?',
    sub:           'Jede Buchung über Booking.com oder Airbnb kostet Sie 15–25 % Provision. Mit bookingwulf buchen Gäste direkt — und Sie behalten jeden Cent.',
    commissionPct: 18,
    bwYearlyCost:  119 * 12,
  },
  features: {
    label: 'Features',
    h2:    'Alles was Sie brauchen',
    sub:   'Kein Schnickschnack — nur Features die Vermieter wirklich nutzen.',
    items: [
      { icon: ConciergeBell, title: 'Gäste-Lounge',       desc: 'Ein persönlicher Bereich für jeden Gast: Check-in-Infos, Hausregeln, Buchungsdetails und lokale Ausflugstipps aus Google Maps – mit wenigen Klicks eingebunden. Ideal zum Upselling und als roter Faden durch den Aufenthalt.' },
      { icon: Ban,           title: 'Keine Provision',    desc: 'Sie behalten jeden Cent jeder Direktbuchung. Keine Transaktionsgebühren.' },
      { icon: Zap,           title: 'Setup in 5 Minuten', desc: 'Eine Zeile Code — kein Entwickler nötig. Funktioniert mit WordPress, Framer, Wix & Co.' },
      { icon: Palette,       title: 'Ihr Branding',       desc: 'Farben, Formen und Schrift passend zu Ihrer Website — komplett anpassbar.' },
      { icon: Building2,     title: 'Multi-Apartment',    desc: 'Beliebig viele Einheiten mit individuellen Preisen, Bildern und Ausstattung.' },
      { icon: RefreshCw,     title: 'Channel Sync',       desc: 'Echtzeit-Sync mit Airbnb & Booking.com via Beds24 — keine Doppelbuchungen.' },
      { icon: ShieldCheck,   title: 'DSGVO-konform',      desc: 'Alle Daten auf Servern in Deutschland — sicher und rechtskonform.' },
    ],
  },
  steps: {
    h2:    'In 3 Schritten live',
    items: [
      { num: '1', title: 'Registrieren', desc: 'Konto in 30 Sekunden erstellen — keine Kreditkarte nötig.' },
      { num: '2', title: 'Einrichten',   desc: 'Apartments anlegen, Preise setzen, Widget-Design anpassen.' },
      { num: '3', title: 'Einbauen',     desc: 'Eine Zeile Code auf Ihrer Website — ab sofort direkt buchbar.' },
    ],
  },
  faq: {
    h2:    'Häufige Fragen',
    items: [
      { q: 'Wie baue ich das Widget ein?',                                        a: 'Sie fügen eine Zeile Code auf Ihrer Website ein — fertig. Kein Entwickler nötig. Funktioniert mit WordPress, Framer, Wix und mehr.' },
      { q: 'Gibt es versteckte Kosten oder Provisionen?',                         a: 'Nein. Nur der monatliche Fixpreis — keine Provision, keine Transaktionsgebühren.' },
      { q: 'Kann ich das Widget für Anfragen und Buchungen gleichzeitig nutzen?', a: 'Ja — zweifach konfigurierbar als Buchungs- und Anfrageformular.' },
      { q: 'Was passiert nach den 14 kostenlosen Tagen?',                         a: 'Sie wählen einen Plan. Kündigung jederzeit möglich — keine Mindestlaufzeit.' },
      { q: 'Wo werden meine Daten gespeichert?',                                  a: 'Auf Servern in Deutschland — sicher und DSGVO-konform.' },
      { q: 'Funktioniert der Sync mit Airbnb und Booking.com?',                   a: 'Ja — via Beds24 Channel Manager (separater Account nötig, kein Aufpreis von bookingwulf).' },
      { q: 'Wie migriere ich von Lodgify, Smoobu oder easybooking?',              a: 'Der Wechsel ist unkompliziert: Apartments neu anlegen, bestehendes Widget durch das bookingwulf-Widget ersetzen, fertig. Bei Fragen begleiten wir Sie persönlich durch die Umstellung.' },
      { q: 'Wer steckt hinter bookingwulf?',                                      a: 'bookingwulf ist ein Vollzeit-Projekt von Wolfgang Heis, Webentwickler aus Wien. Kein anonymes Konzern-Tool — Sie erreichen mich direkt unter support@bookingwulf.com.' },
    ],
  },
};



export default function HomePage() {
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('year');
  const [revenue, setRevenue] = useState(50_000);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('v4-visible'); }),
      { threshold: 0.1 }
    );
    document.querySelectorAll('.v4-animate').forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const plans      = (Object.entries(PLANS) as [string, typeof PLANS[keyof typeof PLANS]][]).filter(([k]) => k !== 'bundle_all');
  const commission = Math.round(revenue * CONTENT.pain.commissionPct / 100);
  const saving     = commission - CONTENT.pain.bwYearlyCost;

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section
        className="v4-section text-center relative overflow-hidden"
        aria-labelledby="hero-heading"
        style={{
          backgroundImage: 'url(https://plus.unsplash.com/premium_photo-1684863506009-c08cb110f40e?auto=format&fit=crop&w=1920&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.55)' }} aria-hidden />
        <div className="v4-container relative z-10 flex flex-col items-center">
          <div
            className="v4-badge-pulse inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-10 border"
            style={{ background: 'rgba(16,139,169,0.25)', color: '#90cce0', borderColor: 'rgba(144,204,224,0.35)' }}
            role="status"
          >
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#90cce0' }} aria-hidden />
            {CONTENT.hero.badge}
          </div>

          <h1
            id="hero-heading"
            className="v4-animate mb-6"
            style={{ fontSize: 'clamp(40px, 7vw, 72px)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.03em', color: '#fff' }}
          >
            {CONTENT.hero.h1a} {CONTENT.hero.h1b}<br />
            <span style={{ color: '#50DDFF' }}>{CONTENT.hero.h1c}</span>
          </h1>

          <p className="text-[17px] leading-[1.65] mb-10 v4-animate v4-d1" style={{ color: 'rgba(255,255,255,0.82)', maxWidth: 560, whiteSpace: 'pre-line' }}>
            {CONTENT.hero.sub}
          </p>

          <div className="flex flex-wrap justify-center gap-3 mb-8 v4-animate v4-d2">
            <Link href="/register" className="v4-btn v4-btn-primary">{CONTENT.hero.cta1}</Link>
            <Link href="/v4/demo"  className="v4-btn v4-btn-ghost-white">{CONTENT.hero.cta2} →</Link>
          </div>

          <ul className="flex flex-wrap justify-center gap-x-5 gap-y-1.5 list-none m-0 p-0 v4-animate v4-d3" aria-label="Kernvorteile">
            {CONTENT.hero.trust.map((t) => (
              <li key={t} className="flex items-center gap-1.5 text-[13px]" style={{ color: 'rgba(255,255,255,0.65)' }}>
                <Check size={13} strokeWidth={2.5} style={{ color: 'var(--v4-green)' }} className="shrink-0" aria-hidden />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Provisions-Rechner ───────────────────────────────────── */}
      <section className="v4-section" style={{ background: 'var(--v4-navy)' }} aria-labelledby="pain-heading">
        <div className="v4-container text-center">
          <span className="v4-eyebrow v4-animate">{CONTENT.pain.label}</span>
          <h2 id="pain-heading" className="v4-h2 mb-4 v4-animate v4-d1" style={{ color: '#fff' }}>
            {CONTENT.pain.h2}
          </h2>
          <p className="text-[17px] leading-[1.65] max-w-xl mx-auto mb-16 v4-animate v4-d2" style={{ color: 'var(--v4-muted)' }}>
            {CONTENT.pain.sub}
          </p>

          <div className="v4-animate v4-d2 v4-card-dark max-w-xl mx-auto mb-10 p-6 bg-white/12">
            <label htmlFor="revenue-slider" className="block text-sm font-semibold mb-1" style={{ color: '#cbd5e1' }}>
              Ihr Jahresumsatz über OTA-Portale
            </label>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[32px] font-extrabold text-white tracking-tight">
                € {revenue.toLocaleString('de-DE')}
              </span>
              <span className="text-xs" style={{ color: 'var(--v4-muted)' }}>pro Jahr</span>
            </div>
            <input
              id="revenue-slider"
              type="range"
              min={10_000} max={300_000} step={5_000}
              value={revenue}
              onChange={(e) => setRevenue(Number(e.target.value))}
              className="w-full cursor-pointer accent-[#108ba9]"
              aria-label="Jahresumsatz einstellen"
            />
            <div className="flex justify-between text-xs mt-1" style={{ color: '#475569' }}>
              <span>€ 10.000</span><span>€ 300.000</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: `${CONTENT.pain.commissionPct}% OTA-Provision`, value: `−€ ${commission.toLocaleString('de-DE')}/Jahr`, note: 'Was die Portale jährlich einbehalten',    tone: 'negative' as const },
              { label: 'bookingwulf Pro',                               value: `€ ${CONTENT.pain.bwYearlyCost.toLocaleString('de-DE')}/Jahr`, note: '€ 119/Monat · jederzeit kündbar', tone: 'neutral'  as const },
              { label: 'Ihre Ersparnis',                                value: saving > 0 ? `€ ${saving.toLocaleString('de-DE')}/Jahr` : 'Noch kein Vorteil', note: saving > 0 ? 'Steigt mit Ihrem Umsatz' : 'Ab ~€ 8k Umsatz lohnt sich bookingwulf', tone: 'positive' as const },
            ].map((item, i) => (
              <div
                key={item.label}
                className={`v4-animate v4-card-dark v4-d${i + 2} p-6 transition-all duration-300 ${item.tone !== 'positive' ? 'bg-white/12' : ''}`}
                style={item.tone === 'positive' ? { background: 'var(--v4-green)' } : undefined}
              >
                <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${item.tone === 'positive' ? 'text-white/80' : 'text-slate-400'}`}>{item.label}</p>
                {item.tone === 'positive' && saving > 0 && (
                  <span className="block text-xs font-semibold text-white/60 mb-0.5 uppercase tracking-widest">bis zu</span>
                )}
                <p className={`text-[32px] font-extrabold tracking-tight mb-1.5 whitespace-nowrap ${item.tone === 'negative' ? 'text-red-400' : 'text-white'}`}>{item.value}</p>
                <p className={`text-xs ${item.tone === 'positive' ? 'text-white/70' : 'text-slate-500'}`}>{item.note}</p>
              </div>
            ))}
          </div>
          <p className="text-xs mt-5" style={{ color: '#475569' }}>Provision-Annahme: {CONTENT.pain.commissionPct}% (Branchen-Durchschnitt Booking.com). Tatsächliche Einsparungen variieren.</p>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────── */}
      <section id="features" className="v4-section" style={{ background: 'var(--v4-surface)' }} aria-labelledby="features-heading">
        <div className="v4-container">
          <div className="mb-16 text-center">
            <span className="v4-eyebrow v4-animate">{CONTENT.features.label}</span>
            <h2 id="features-heading" className="v4-h2 mb-3 v4-animate v4-d1">{CONTENT.features.h2}</h2>
            <p className="text-[17px] leading-[1.65] max-w-xl mx-auto v4-animate v4-d2" style={{ color: 'var(--v4-body)' }}>{CONTENT.features.sub}</p>
          </div>

          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 list-none m-0 p-0" role="list">
            {CONTENT.features.items.map((f, i) => {
              const Icon = f.icon;
              if (i === 0) return (
                <li key={f.title} className="v4-card v4-animate v4-d1 p-8 group sm:col-span-2 lg:col-span-3 flex flex-col sm:flex-row gap-7 items-start"
                  style={{ background: 'var(--v4-green-light)', borderColor: 'var(--v4-green-border)' }}>
                  <div className="shrink-0 w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: 'rgba(16,139,169,0.15)' }}>
                    <Icon size={28} strokeWidth={1.75} className="v4-icon-hover" style={{ color: 'var(--v4-green)' }} aria-hidden />
                  </div>
                  <div>
                    <span className="v4-eyebrow" style={{ marginBottom: 8 }}>Highlight</span>
                    <h3 className="text-[19px] font-bold mb-2" style={{ color: 'var(--v4-navy)' }}>{f.title}</h3>
                    <p className="text-[15px] leading-[1.65] max-w-2xl" style={{ color: 'var(--v4-body)' }}>{f.desc}</p>
                  </div>
                </li>
              );
              return (
                <li key={f.title} className={`v4-card v4-animate v4-d${(i % 3) + 1} p-6 group`}>
                  <div className="mb-4">
                    <Icon size={24} strokeWidth={1.75} className="v4-icon-hover" style={{ color: 'var(--v4-green)' }} aria-hidden />
                  </div>
                  <h3 className="text-[17px] font-semibold mb-2" style={{ color: 'var(--v4-navy)' }}>{f.title}</h3>
                  <p className="text-[15px] leading-[1.65]" style={{ color: 'var(--v4-body)' }}>{f.desc}</p>
                </li>
              );
            })}
          </ul>

          <div className="mt-8 v4-animate">
            <Link href="/v4/features" className="text-sm font-semibold hover:underline underline-offset-4" style={{ color: 'var(--v4-navy)' }}>Alle Features ansehen →</Link>
          </div>
        </div>
      </section>

      {/* ── So geht's ────────────────────────────────────────────── */}
      <section className="v4-section bg-white" aria-labelledby="steps-heading">
        <div className="v4-container">
          <div className="text-center mb-16">
            <span className="v4-eyebrow v4-animate">So geht's</span>
            <h2 id="steps-heading" className="v4-h2 v4-animate v4-d1">{CONTENT.steps.h2}</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <ol className="flex flex-col gap-8 list-none m-0 p-0">
              {CONTENT.steps.items.map((s, i) => (
                <li key={s.num} className={`v4-animate v4-d${i + 1} flex gap-5 items-start group relative`}>
                  {i < CONTENT.steps.items.length - 1 && <span className="v4-step-connector" aria-hidden />}
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shrink-0 text-white transition-all duration-200 group-hover:scale-110 group-hover:shadow-lg relative z-10"
                    style={{ background: 'var(--v4-green)' }}
                    aria-label={`Schritt ${s.num}`}
                  >
                    {s.num}
                  </div>
                  <div className="pt-2.5">
                    <h3 className="text-[17px] font-semibold mb-1" style={{ color: 'var(--v4-navy)' }}>{s.title}</h3>
                    <p className="text-[15px] leading-[1.65]" style={{ color: 'var(--v4-body)' }}>{s.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="v4-animate v4-card p-8 flex flex-col gap-6">
              <p className="text-2xl font-bold tracking-tight" style={{ color: 'var(--v4-navy)' }}>Bereit in 5 Minuten?</p>
              <p className="text-[17px] leading-[1.65]" style={{ color: 'var(--v4-body)' }}>14 Tage kostenlos — keine Kreditkarte, keine Mindestlaufzeit.</p>
              <Link href="/register" className="v4-btn v4-btn-primary self-start">Jetzt starten</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────── */}
      <section id="pricing" className="v4-section v4-grain" style={{ background: 'var(--v4-navy)' }} aria-labelledby="pricing-heading">
        <div className="v4-container">
          <div className="mb-16 text-center">
            <span className="v4-eyebrow v4-animate">Preise</span>
            <h2 id="pricing-heading" className="v4-h2 mb-3 v4-animate v4-d1" style={{ color: '#fff' }}>Der richtige Plan für Ihren Betrieb</h2>
            <p className="text-[17px] leading-[1.65] v4-animate v4-d2 max-w-xl mx-auto" style={{ color: 'var(--v4-muted)' }}>Keine Provision. Keine versteckten Kosten. Jederzeit kündbar.</p>
          </div>

          <div className="flex items-center justify-center gap-3 mb-10 v4-animate">
            <span className="text-sm font-medium transition-colors" style={{ color: billingInterval === 'month' ? '#fff' : 'var(--v4-muted)' }}>Monatlich</span>
            <button
              onClick={() => setBillingInterval((v) => v === 'month' ? 'year' : 'month')}
              className="relative w-12 h-6 rounded-full transition-colors duration-200 shrink-0 focus-visible:outline-none focus-visible:ring-2"
              style={{ background: billingInterval === 'year' ? 'var(--v4-green)' : '#334155' }}
              role="switch" aria-checked={billingInterval === 'year'}
              aria-label={`Umschalten auf ${billingInterval === 'month' ? 'jährliche' : 'monatliche'} Abrechnung`}
            >
              <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-200" style={{ left: billingInterval === 'year' ? '1.375rem' : '0.125rem' }} />
            </button>
            <span className="text-sm font-medium transition-colors" style={{ color: billingInterval === 'year' ? '#fff' : 'var(--v4-muted)' }}>
              Jährlich
              {billingInterval === 'year' && <span className="ml-1.5 px-2 py-0.5 rounded-md text-xs font-bold" style={{ background: 'rgba(16,139,169,0.25)', color: 'var(--v4-green-border)' }}>spare 10%</span>}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 items-start">
            {plans.map(([key, plan], i) => (
              <div
                key={key}
                className={`v4-animate v4-d${i + 1} relative p-7 transition-all duration-300 hover:-translate-y-1.5`}
                style={key === 'pro'
                  ? { background: '#fff', borderRadius: 'var(--v4-radius-card)', borderTop: '3px solid var(--v4-green)', boxShadow: '0 12px 40px rgba(0,0,0,0.3)' }
                  : { background: 'rgba(255,255,255,0.06)', borderRadius: 'var(--v4-radius-card)', border: '1px solid rgba(255,255,255,0.1)' }
                }
              >
                {key === 'pro' && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-white text-xs font-bold whitespace-nowrap" style={{ background: 'var(--v4-green)' }}>Beliebt</div>
                )}
                <h3 className="text-[17px] font-semibold mb-1" style={{ color: key === 'pro' ? 'var(--v4-navy)' : '#fff' }}>{plan.name}</h3>
                <div className="text-[40px] font-extrabold tracking-tight my-4" style={{ color: key === 'pro' ? 'var(--v4-navy)' : '#fff' }}>
                  € {billingInterval === 'year' ? plan.priceYearly : plan.priceMonthly}
                  <span className="text-base font-normal" style={{ color: 'var(--v4-muted)' }}>/Mo</span>
                </div>
                <ul className="flex flex-col gap-2.5 mb-6 list-none m-0 p-0">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-2 items-start text-[15px]">
                      <Check size={14} strokeWidth={2.5} className="mt-0.5 shrink-0" style={{ color: 'var(--v4-green)' }} aria-hidden />
                      <span style={{ color: key === 'pro' ? 'var(--v4-body)' : '#cbd5e1' }}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/register" className={`v4-btn w-full ${key === 'pro' ? 'v4-btn-primary' : 'v4-btn-outline-green'}`}>
                  Kostenlos testen
                </Link>
              </div>
            ))}
          </div>
          <div className="mt-8 v4-animate text-center">
            <Link href="/v4/preise" className="text-sm font-semibold hover:underline underline-offset-4" style={{ color: 'var(--v4-muted)' }}>Alle Details zu den Preisen →</Link>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <section className="v4-section bg-white" aria-labelledby="faq-heading">
        <div className="v4-container">
          <div className="text-center mb-16">
            <span className="v4-eyebrow v4-animate">FAQ</span>
            <h2 id="faq-heading" className="v4-h2 mb-3 v4-animate v4-d1">{CONTENT.faq.h2}</h2>
            <p className="text-[15px] v4-animate v4-d2" style={{ color: 'var(--v4-body)' }}>
              Weitere Fragen? <a href="mailto:support@bookingwulf.com" className="font-semibold hover:underline underline-offset-2" style={{ color: 'var(--v4-navy)' }}>support@bookingwulf.com</a>
            </p>
          </div>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            {CONTENT.faq.items.map(({ q, a }, i) => (
              <V4FaqItem key={q} question={q} answer={a} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Founder ──────────────────────────────────────────────── */}
      <section className="v4-section" style={{ background: 'var(--v4-surface)' }} aria-labelledby="founder-heading">
        <div className="v4-container">
          <div className="text-center mb-16">
            <span className="v4-eyebrow v4-animate">Wer steckt dahinter</span>
            <h2 id="founder-heading" className="v4-h2 v4-animate v4-d1">Kein Konzern. Ein Entwickler aus Wien.</h2>
          </div>
          <div className="v4-animate v4-card max-w-2xl mx-auto p-8 flex flex-col sm:flex-row gap-8 items-center">
            <svg width="64" height="64" viewBox="0 0 96 96" fill="none" className="shrink-0" aria-hidden>
              <circle cx="48" cy="48" r="48" fill="#e4f4f8" />
              <circle cx="48" cy="48" r="47.5" stroke="#90cce0" strokeWidth="1" />
              <text
                x="48" y="48"
                textAnchor="middle"
                dominantBaseline="central"
                fontFamily="ui-sans-serif, system-ui, -apple-system, sans-serif"
                fontSize="26"
                fontWeight="700"
                fill="#108ba9"
                letterSpacing="2"
              >WH</text>
            </svg>
            <div>
              <h3 className="text-[17px] font-bold mb-1" style={{ color: 'var(--v4-navy)' }}>Wolfgang Heis</h3>
              <p className="text-[13px] mb-4" style={{ color: 'var(--v4-muted)' }}>Webentwickler · Wien, Österreich</p>
              <p className="text-[14px] font-normal leading-[1.65]" style={{ color: 'var(--v4-body)' }}>
                bookingwulf ist mein Vollzeit-Projekt. Ich entwickle seit über 15 Jahren Webanwendungen — und habe bookingwulf gebaut, weil ich gesehen habe, wie viel Geld kleine Unterkünfte unnötig an Buchungsportale abgeben. Bei Smoobu oder Lodgify erreichen Sie einen anonymen Support. Bei bookingwulf erreichen Sie mich direkt.
              </p>
              <a
                href="mailto:support@bookingwulf.com"
                className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold hover:underline underline-offset-4"
                style={{ color: 'var(--v4-navy)' }}
              >
                support@bookingwulf.com →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Finaler CTA ──────────────────────────────────────────── */}
      <section
        className="v4-section text-center relative overflow-hidden"
        aria-labelledby="cta-heading"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1920&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0" style={{ background: 'rgba(0,20,40,0.75)' }} aria-hidden />
        <div className="v4-container relative z-10">
          <div className="v4-animate max-w-xl mx-auto">
            <h2 id="cta-heading" className="v4-h2 mb-4" style={{ color: '#fff' }}>Bereit für Direktbuchungen?</h2>
            <p className="text-[17px] mb-8" style={{ color: 'rgba(255,255,255,0.75)' }}>14 Tage kostenlos testen — keine Kreditkarte erforderlich.</p>
            <Link href="/register" className="v4-btn v4-btn-white" style={{ height: 48, fontSize: 16, fontWeight: 700 }}>
              Jetzt Konto erstellen
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function V4FaqItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [open, setOpen] = useState(false);
  const id = `v4-faq-${index}`;
  return (
    <div className={`v4-animate v4-d${Math.min(index + 1, 4)} border-b`} style={{ borderColor: 'var(--v4-border)' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex justify-between items-center py-5 text-left gap-4 bg-transparent border-none cursor-pointer group focus-visible:outline-none focus-visible:ring-2 rounded"
        aria-expanded={open}
        aria-controls={id}
      >
        <span className="text-[15px] font-semibold leading-snug transition-opacity group-hover:opacity-70" style={{ color: 'var(--v4-navy)' }}>{question}</span>
        <Plus size={20} className="shrink-0 transition-transform duration-200" style={{ color: 'var(--v4-muted)', transform: open ? 'rotate(45deg)' : 'none' }} aria-hidden />
      </button>
      <div id={id} role="region" aria-label={question} className={`v4-faq-body ${open ? 'open' : ''}`}>
        <p className="pb-5 text-[15px] leading-[1.65]" style={{ color: 'var(--v4-body)' }}>{answer}</p>
      </div>
    </div>
  );
}
