'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Ban, Building2, Check, ConciergeBell, Palette, Plus, RefreshCw, ShieldCheck, Zap } from 'lucide-react';
import { PLANS } from '@/src/lib/plans';

const INTRO_WORDS = ['direkt.', 'modern.', 'unabhängig.', 'provisionsfrei.'];

const CONTENT = {
  hero: {
    badge: 'Beta · 14 Tage kostenlos testen',
    h1a:   'Direktbuchungen für',
    h1b:   'Ihre Unterkunft.',
    h1c:   'Ohne Provision.',
    sub:   'Modern und einfach — weil Sie es verdient haben.',
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
      { icon: ConciergeBell, title: 'Gäste-Lounge',       desc: 'Jeder Gast erhält mit der Buchungsbestätigung einen persönlichen Link — kein Login, kein Download. Buchungsdetails, Zugangscode, Hausinfos und Upselling automatisch befüllt. Lokale Ausflugstipps direkt aus Google Maps importieren — in Sekunden eingerichtet.' },
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

          <ul className="flex flex-wrap justify-center gap-2.5 list-none m-0 p-0 v4-animate v4-d3" aria-label="Kernvorteile">
            {CONTENT.hero.trust.map((t) => (
              <li key={t} className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-medium" style={{ background: 'rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.88)', border: '1px solid rgba(255,255,255,0.18)' }}>
                <Check size={12} strokeWidth={2.5} style={{ color: '#50DDFF' }} className="shrink-0" aria-hidden />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── What is bookingwulf ──────────────────────────────────── */}
      <section className="v4-section bg-white" aria-labelledby="intro-heading" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
        <div className="v4-container" style={{ maxWidth: 800 }}>
          <div className="v4-animate flex flex-col sm:flex-row gap-10 items-start">
            <div className="flex gap-4 items-start shrink-0">
              <div style={{ width: 3, alignSelf: 'stretch', background: 'var(--v4-green)', borderRadius: 2, minHeight: 56 }} aria-hidden />
              <AnimatedWord />
            </div>
            <p
              id="intro-heading"
              style={{ fontSize: 18, fontWeight: 400, lineHeight: 1.7, color: 'var(--v4-body)', margin: 0 }}
            >
              bookingwulf ist ein Buchungswidget für Pensionen, Hotels und Apartments.
              Kein Buchungsportal, <span style={{ color: 'var(--v4-green)', fontWeight: 600 }}>keine Provision</span> — Ihre Gäste buchen{' '}
              <span style={{ color: 'var(--v4-green)', fontWeight: 600 }}>direkt</span> über{' '}
              <span style={{ color: 'var(--v4-green)', fontWeight: 600 }}>Ihrer Website</span>.
              Einfach eingebaut, sofort einsatzbereit.
            </p>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────── */}
      <section id="features" className="v4-section" style={{ background: 'var(--v4-surface)' }} aria-labelledby="features-heading">
        <div className="v4-container">
          <div className="mb-24 text-center">
            <span className="v4-eyebrow v4-animate">{CONTENT.features.label}</span>
            <h2 id="features-heading" className="v4-h2 mb-3 v4-animate v4-d1">{CONTENT.features.h2}</h2>
            <p className="text-[17px] leading-[1.65] max-w-xl mx-auto v4-animate v4-d2" style={{ color: 'var(--v4-body)' }}>{CONTENT.features.sub}</p>
          </div>

          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 list-none m-0 p-0" role="list">
            {CONTENT.features.items.map((f, i) => {
              const Icon = f.icon;
              if (i === 0) return (
                <li key={f.title} className="v4-animate v4-d1 sm:col-span-2 lg:col-span-3 relative" style={{ overflow: 'visible' }}>
                  {/* Teal card — full width on mobile, 55% on lg, min-height ensures space for phone */}
                  <div className="v4-card group lg:max-w-[55%]" style={{ background: 'var(--v4-green-light)', borderColor: 'var(--v4-green-border)' }}>
                    <div className="p-8">
                      <div className="flex flex-col sm:flex-row gap-7 items-start">
                        <div className="shrink-0 w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: 'rgba(16,139,169,0.15)' }}>
                          <Icon size={28} strokeWidth={1.75} className="v4-icon-hover" style={{ color: 'var(--v4-green)' }} aria-hidden />
                        </div>
                        <div>
                          <span className="v4-eyebrow" style={{ marginBottom: 8 }}>Highlight</span>
                          <h3 className="text-[19px] font-bold mb-1" style={{ color: 'var(--v4-navy)' }}>{f.title}</h3>
                          <p className="text-[15px] font-normal mb-3" style={{ color: 'var(--v4-green)', opacity: 0.85 }}>Keine separate Gäste-App nötig.</p>
                          <p className="text-[15px] leading-[1.65] max-w-xl" style={{ color: 'var(--v4-body)' }}>{f.desc}</p>
                        </div>
                      </div>
                    </div>
                    {/* Mobile: phone inside card, below text, centered */}
                    <div className="flex justify-center px-6 pb-10 lg:hidden">
                      <GaesteLoungeMockup />
                    </div>
                  </div>
                  {/* Desktop: phone outside card, vertically centered via inset-y-0 flex */}
                  <div className="hidden lg:flex items-center absolute inset-y-0 z-10" style={{ right: 72 }}>
                    <GaesteLoungeMockup />
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
            <Link href="/v4/features" className="text-sm font-semibold hover:underline underline-offset-4" style={{ color: 'var(--v4-navy)' }}>… und noch viel mehr — alle Features ansehen →</Link>
          </div>
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
                className={`v4-animate v4-d${i + 1} relative p-7`}
                style={{
                  ...(key === 'pro'
                    ? { background: '#fff', borderRadius: 'var(--v4-radius-card)', borderTop: '3px solid var(--v4-green)', boxShadow: '0 12px 40px rgba(0,0,0,0.3)' }
                    : { background: 'rgba(255,255,255,0.06)', borderRadius: 'var(--v4-radius-card)', border: '1px solid rgba(255,255,255,0.1)' }),
                  transition: 'transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-10px) scale(1.02)';
                  if (key === 'pro') (e.currentTarget as HTMLDivElement).style.boxShadow = '0 24px 60px rgba(0,0,0,0.4)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform = '';
                  if (key === 'pro') (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 40px rgba(0,0,0,0.3)';
                }}
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

function AnimatedWord() {
  const [wordIdx, setWordIdx]     = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [fading, setFading]       = useState(false);
  const [cursorOn, setCursorOn]   = useState(true);
  const [reduced, setReduced]     = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const h = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);

  useEffect(() => {
    if (reduced) return;
    const t = setInterval(() => setCursorOn((v) => !v), 530);
    return () => clearInterval(t);
  }, [reduced]);

  useEffect(() => {
    if (reduced) return;
    const word = INTRO_WORDS[wordIdx];
    if (displayed.length < word.length) {
      const t = setTimeout(() => setDisplayed(word.slice(0, displayed.length + 1)), 80);
      return () => clearTimeout(t);
    }
    let inner: ReturnType<typeof setTimeout>;
    const t = setTimeout(() => {
      setFading(true);
      inner = setTimeout(() => {
        setFading(false);
        setDisplayed('');
        setWordIdx((i) => (i + 1) % INTRO_WORDS.length);
      }, 400);
    }, 1500);
    return () => { clearTimeout(t); clearTimeout(inner); };
  }, [displayed, wordIdx, reduced]);

  const wordStyle: React.CSSProperties = {
    fontSize: 48, fontWeight: 900, lineHeight: 1,
    color: 'var(--v4-green)', whiteSpace: 'nowrap', display: 'block',
  };

  const word   = reduced ? INTRO_WORDS[0] : displayed;
  const cursor = !reduced && !fading ? (cursorOn ? '|' : ' ') : '';

  return (
    <div style={{ position: 'relative' }} aria-label={INTRO_WORDS[wordIdx]}>
      {/* invisible spacer — keeps column at longest word's width */}
      <span aria-hidden style={{ ...wordStyle, visibility: 'hidden' }}>
        {INTRO_WORDS[INTRO_WORDS.length - 1]}
      </span>
      <span
        aria-hidden
        style={{
          ...wordStyle,
          position: 'absolute', top: 0, left: 0,
          opacity: fading ? 0 : 1,
          transition: fading ? 'opacity 0.4s ease' : 'none',
        }}
      >
        {word}<span style={{ fontWeight: 300, opacity: 0.7 }}>{cursor}</span>
      </span>
    </div>
  );
}

function GaesteLoungeMockup() {
  const [screen, setScreen] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setScreen((s) => (s + 1) % 5);
        setFading(false);
      }, 350);
    }, 2600);
    return () => clearInterval(id);
  }, []);

  const phoneScreens = [
    <PhoneScreen1 key="s1" />,
    <PhoneScreen2 key="s2" />,
    <PhoneScreen3 key="s3" />,
    <PhoneScreen4 key="s4" />,
    <PhoneScreen5 key="s5" />,
  ];

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px 48px' }}>
      {/* Radial glow */}
      <div style={{ position: 'absolute', width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,139,169,0.13) 0%, transparent 65%)', pointerEvents: 'none' }} aria-hidden />

      {/* Phone: float animation wraps perspective wrapper */}
      <div style={{ animation: 'v4PhoneFloat 3.4s ease-in-out infinite', position: 'relative', zIndex: 10 }}>
        {/* Ground shadow */}
        <div style={{ position: 'absolute', bottom: -14, left: '50%', transform: 'translateX(-50%)', width: '55%', height: 16, background: 'rgba(0,0,0,0.14)', borderRadius: '50%', filter: 'blur(10px)' }} aria-hidden />
        {/* Perspective tilt */}
        <div style={{ transform: 'perspective(900px) rotateY(-16deg) rotateX(2deg)' }}>
          <div style={{
            width: 192,
            borderRadius: 36,
            border: '4px solid #1a1a1c',
            background: '#111',
            overflow: 'hidden',
            boxShadow: '0 24px 64px rgba(10,15,30,0.5), inset 0 0 0 0.5px rgba(255,255,255,0.07)',
            position: 'relative',
          }}>
            {/* Notch */}
            <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 84, height: 7, background: '#1a1a1c', borderRadius: '0 0 10px 10px', zIndex: 30 }} aria-hidden />
            {/* White screen */}
            <div style={{ background: '#fff', position: 'relative', overflow: 'hidden', minHeight: 350 }}>
              {/* Status bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px 4px', fontSize: 9, fontWeight: 700, color: '#1C1C1E' }}>
                <span>9:41</span>
                <div style={{ width: 16, height: 8, border: '1.5px solid #1C1C1E', borderRadius: 2, position: 'relative', opacity: 0.6 }}>
                  <div style={{ position: 'absolute', inset: 1.5, background: '#1C1C1E', borderRadius: 1, width: '70%' }} />
                  <div style={{ position: 'absolute', right: -3.5, top: '50%', transform: 'translateY(-50%)', width: 2, height: 5, background: '#1C1C1E', borderRadius: 1, opacity: 0.45 }} />
                </div>
              </div>
              {/* Content */}
              <div style={{ opacity: fading ? 0 : 1, transition: 'opacity 0.35s ease' }}>
                {phoneScreens[screen]}
              </div>
              {/* Home indicator */}
              <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0 12px' }}>
                <div style={{ width: 88, height: 4, background: 'rgba(0,0,0,0.16)', borderRadius: 9999 }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dots */}
      <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
        {[0, 1, 2, 3, 4].map((dot) => (
          <div key={dot} style={{ width: 5, height: 5, borderRadius: '50%', background: screen === dot ? 'var(--v4-green)' : 'rgba(23,36,66,0.15)', transition: 'background 0.3s ease' }} />
        ))}
      </div>
    </div>
  );
}

const ACCENT = '#108ba9';
const gh = { background: ACCENT, color: '#fff', padding: '10px 12px 11px' } as const;
const ghHotel = { fontSize: 8, fontWeight: 700, opacity: 0.75, textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: 2 };
const ghTitle = { fontSize: 14, fontWeight: 800, letterSpacing: '-0.02em' };
const ghSub = { fontSize: 8, opacity: 0.8, marginTop: 2 };

function GuestHeader() {
  return (
    <div style={gh}>
      <div style={ghHotel}>Sonnental Hotel</div>
      <div style={ghTitle}>Gäste-Lounge</div>
      <div style={ghSub}>15.06. — 20.06. · 5 Nächte</div>
    </div>
  );
}

function GuestCard({ head, children }: { head: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', borderRadius: 9, boxShadow: '0 1px 6px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
      <div style={{ padding: '5px 10px', background: '#f9fafb', borderBottom: '1px solid #f0f0f0', fontSize: 8, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{head}</div>
      <div style={{ padding: '9px 10px' }}>{children}</div>
    </div>
  );
}

type GuestTab = 'arrival' | 'extras' | 'surroundings' | 'messages' | 'checkout';

function GuestNav({ active }: { active: GuestTab }) {
  const items: { id: GuestTab; label: string; path: string }[] = [
    { id: 'arrival',      label: 'Anreise',  path: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10' },
    { id: 'extras',       label: 'Extras',   path: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 8v8M8 12h8' },
    { id: 'surroundings', label: 'Umgebung', path: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 10m-3 0a3 3 0 1 0 6 0 3 3 0 0 0-6 0' },
    { id: 'messages',     label: 'Chat',     path: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' },
    { id: 'checkout',     label: 'Abreise',  path: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9' },
  ];
  return (
    <div style={{ position: 'absolute', bottom: 14, left: 8, right: 8, zIndex: 10 }}>
      <div style={{ background: 'rgba(14,14,14,0.84)', backdropFilter: 'blur(12px)', borderRadius: 13, padding: '4px 3px', display: 'flex', gap: 1, border: '1px solid rgba(255,255,255,0.09)' }}>
        {items.map((item) => (
          <div key={item.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '5px 2px', borderRadius: 10, background: active === item.id ? 'rgba(255,255,255,0.15)' : 'transparent', color: active === item.id ? '#fff' : 'rgba(255,255,255,0.45)' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d={item.path} />
            </svg>
            <span style={{ fontSize: 6, fontWeight: active === item.id ? 700 : 400 }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PhoneScreen1() {
  return (
    <div style={{ position: 'relative', minHeight: 350 }}>
      <GuestHeader />
      <div style={{ padding: '9px 9px 58px', display: 'grid', gap: 7 }}>
        <div style={{ background: 'rgba(16,139,169,0.08)', border: '1px solid rgba(16,139,169,0.28)', borderRadius: 9, padding: '9px 11px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, color: ACCENT, marginBottom: 1 }}>Online Check-In ausstehend</div>
            <div style={{ fontSize: 8, color: '#6b7280' }}>Jetzt ausfüllen und Zeit sparen →</div>
          </div>
        </div>
        <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: 9, padding: '10px', textAlign: 'center' }}>
          <div style={{ fontSize: 8, fontWeight: 700, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>🔑 Ihr Zugangscode</div>
          <div style={{ fontSize: 24, fontWeight: 900, letterSpacing: '0.22em', color: '#111' }}>4829</div>
          <div style={{ fontSize: 8, color: '#374151', marginTop: 3 }}>Gültig von Anreise bis Abreise</div>
        </div>
        <GuestCard head="📶 WLAN">
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, marginBottom: 5 }}>
            <span style={{ color: '#6b7280' }}>Netzwerk</span><span style={{ fontWeight: 600 }}>Sonnental_Guest</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9 }}>
            <span style={{ color: '#6b7280' }}>Passwort</span><span style={{ fontWeight: 600, fontFamily: 'monospace' }}>SunAlp2025</span>
          </div>
        </GuestCard>
      </div>
      <GuestNav active="arrival" />
    </div>
  );
}

function PhoneScreen2() {
  const [booked, setBooked] = useState(false);
  useEffect(() => { const t = setTimeout(() => setBooked(true), 650); return () => clearTimeout(t); }, []);
  const extras = [
    { name: 'Frühstückskorb', price: '€ 14,00', highlight: true },
    { name: 'Fahrradverleih', price: '€ 20,00', highlight: false },
    { name: 'Spa-Zugang', price: '€ 18,00', highlight: false },
  ];
  return (
    <div style={{ position: 'relative', minHeight: 350 }}>
      <GuestHeader />
      <div style={{ padding: '9px 9px 58px', display: 'grid', gap: 7 }}>
        {extras.map((e) => (
          <div key={e.name} style={{ border: `1.5px solid ${booked && e.highlight ? '#bbf7d0' : '#e5e7eb'}`, borderRadius: 9, padding: '9px 11px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: booked && e.highlight ? '#f0fdf4' : '#fff', transition: 'all 0.4s ease' }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, marginBottom: 2 }}>{e.name}</div>
              <div style={{ fontSize: 9, fontWeight: 800, color: booked && e.highlight ? '#166534' : ACCENT }}>{e.price}</div>
            </div>
            {booked && e.highlight
              ? <span style={{ background: '#dcfce7', color: '#166534', fontSize: 8, fontWeight: 700, padding: '3px 8px', borderRadius: 20 }}>✓ Gebucht</span>
              : <button style={{ background: ACCENT, color: '#fff', border: 'none', padding: '5px 9px', borderRadius: 6, fontSize: 8, fontWeight: 700 }}>Buchen</button>}
          </div>
        ))}
      </div>
      <GuestNav active="extras" />
    </div>
  );
}

function PhoneScreen3() {
  return (
    <div style={{ position: 'relative', minHeight: 350 }}>
      <GuestHeader />
      <div style={{ padding: '9px 9px 58px', display: 'grid', gap: 9 }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: '#111' }}>🍽️ Restaurant &amp; Café</div>
        <div style={{ background: '#fff', borderRadius: 9, boxShadow: '0 1px 6px rgba(0,0,0,0.06)', overflow: 'hidden', display: 'flex' }}>
          <div style={{ width: 46, height: 52, background: '#f3e8d0', flexShrink: 0 }} />
          <div style={{ padding: '8px 9px', flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 700, marginBottom: 2 }}>Restaurant Zur Post</div>
            <div style={{ fontSize: 8, color: '#6b7280' }}>500 m · Täglich ab 11 Uhr</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', padding: '0 9px', color: ACCENT, flexShrink: 0 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
        </div>
        <div style={{ fontSize: 10, fontWeight: 600, color: '#111', marginTop: 2 }}>🏔️ Aktivität</div>
        <div style={{ background: '#fff', borderRadius: 9, boxShadow: '0 1px 6px rgba(0,0,0,0.06)', overflow: 'hidden', display: 'flex' }}>
          <div style={{ width: 46, height: 52, background: '#c9dba2', flexShrink: 0 }} />
          <div style={{ padding: '8px 9px', flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 700, marginBottom: 2 }}>Wanderweg Almsee</div>
            <div style={{ fontSize: 8, color: '#6b7280' }}>2 km · Mittelschwer</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', padding: '0 9px', color: ACCENT, flexShrink: 0 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
        </div>
      </div>
      <GuestNav active="surroundings" />
    </div>
  );
}

function PhoneScreen4() {
  const [showGuest, setShowGuest] = useState(false);
  useEffect(() => { const t = setTimeout(() => setShowGuest(true), 650); return () => clearTimeout(t); }, []);
  return (
    <div style={{ position: 'relative', minHeight: 350 }}>
      <GuestHeader />
      <div style={{ padding: '9px 9px 58px' }}>
        <GuestCard head="Nachrichten">
          <div style={{ display: 'grid', gap: 8, paddingBottom: 4 }}>
            <div>
              <div style={{ background: '#f3f4f6', borderRadius: '9px 9px 9px 3px', padding: '7px 10px', fontSize: 9, lineHeight: 1.5, maxWidth: '88%' }}>
                Herzlich willkommen! Ihre Anreise am 15. Juni ist bestätigt.
              </div>
              <div style={{ fontSize: 7, color: '#9ca3af', marginTop: 2, paddingLeft: 2 }}>Sonnental Hotel · 10:32</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', opacity: showGuest ? 1 : 0, transform: showGuest ? 'none' : 'translateY(4px)', transition: 'all 0.45s ease' }}>
              <div style={{ background: ACCENT, color: '#fff', borderRadius: '9px 9px 3px 9px', padding: '7px 10px', fontSize: 9, lineHeight: 1.5, maxWidth: '75%' }}>
                Danke! Wir freuen uns drauf.
              </div>
              <div style={{ fontSize: 7, color: '#9ca3af', marginTop: 2, paddingRight: 2 }}>10:35</div>
            </div>
          </div>
        </GuestCard>
      </div>
      <GuestNav active="messages" />
    </div>
  );
}

function PhoneScreen5() {
  return (
    <div style={{ position: 'relative', minHeight: 350 }}>
      <GuestHeader />
      <div style={{ padding: '9px 9px 58px' }}>
        <GuestCard head="Abreise">
          <div style={{ display: 'grid', gap: 9 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
              <span style={{ color: '#6b7280' }}>Check-Out Zeit</span>
              <span style={{ fontWeight: 700 }}>11:00 Uhr</span>
            </div>
            <div style={{ height: 1, background: '#f0f0f0' }} />
            <p style={{ fontSize: 9, color: '#6b7280', lineHeight: 1.55 }}>Wenn Sie zur Abreise bereit sind, informieren Sie das Team mit einem Klick.</p>
            <button style={{ background: ACCENT, color: '#fff', border: 'none', padding: '9px', borderRadius: 7, fontSize: 10, fontWeight: 700, width: '100%' }}>
              Jetzt auschecken
            </button>
          </div>
        </GuestCard>
      </div>
      <GuestNav active="checkout" />
    </div>
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
