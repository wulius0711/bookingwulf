'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Ban, Building2, Check, ConciergeBell, Palette, Plus, RefreshCw, ShieldCheck, Zap } from 'lucide-react';
import { PLANS } from '@/src/lib/plans';

const CONTENT = {
  hero: {
    badge:  'Beta · 14 Tage kostenlos testen',
    h1a:    'Direktbuchungen für',
    h1b:    'Ihre Unterkunft.',
    h1c:    'Ohne Provision.',
    sub:    'Modernes Buchungssystem für Pensionen und Apartments. In 5 Minuten eingebaut, ohne Entwickler.',
    cta1:   'Kostenlos starten',
    cta2:   'Live-Demo ansehen',
    trust:  ['Keine Provision', 'Setup in 5 Min', 'Kein Entwickler', 'DSGVO-konform'],
  },
  pain: {
    label:          'Der versteckte Kostenfaktor',
    h2:             'Was zahlen Sie wirklich für Buchungsportale?',
    sub:            'Jede Buchung über Booking.com oder Airbnb kostet Sie 15–25 % Provision. Mit bookingwulf buchen Gäste direkt — und Sie behalten jeden Cent.',
    revenueExample: 50_000,
    commissionPct:  18,
    bwYearlyCost:   119 * 12,
  },
  features: {
    label: 'Features',
    h2:    'Alles was Sie brauchen',
    sub:   'Kein Schnickschnack — nur Features die Vermieter wirklich nutzen.',
    featured: {
      icon:   ConciergeBell,
      title:  'Gäste-Lounge — das digitale Gästeportal Ihres Hauses',
      badge:  'Highlight',
      desc:   'Ein persönlicher Bereich für jeden Gast: Check-in-Infos, Hausregeln, Buchungsdetails und lokale Ausflugstipps aus Google Maps – mit wenigen Klicks eingebunden. Ideal zum Upselling und als roter Faden durch den Aufenthalt.',
    },
    items: [
      { icon: Ban,         title: 'Keine Provision',    desc: 'Sie behalten jeden Cent jeder Direktbuchung. Keine Transaktionsgebühren.' },
      { icon: Zap,         title: 'Setup in 5 Minuten', desc: 'Eine Zeile Code — kein Entwickler nötig. Funktioniert mit WordPress, Framer, Wix & Co.' },
      { icon: Palette,     title: 'Ihr Branding',       desc: 'Farben, Formen und Schrift passend zu Ihrer Website — komplett anpassbar.' },
      { icon: Building2,   title: 'Multi-Apartment',    desc: 'Beliebig viele Einheiten mit individuellen Preisen, Bildern und Ausstattung.' },
      { icon: RefreshCw,   title: 'Channel Sync',       desc: 'Echtzeit-Sync mit Airbnb & Booking.com via Beds24 — keine Doppelbuchungen.' },
      { icon: ShieldCheck, title: 'DSGVO-konform',      desc: 'Alle Daten auf Servern in Deutschland — sicher und rechtskonform.' },
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

const WIDGET_BASE: Record<string, string> = {
  accentColor: '#dc143c', backgroundColor: '#faebd7', cardBackground: '#fef9f2',
  textColor: '#111111', mutedTextColor: '#666666', borderColor: '#dddddd',
  cardRadius: '12', buttonRadius: '44', buttonColor: '#ffffff',
  headlineFont: '', bodyFont: '', headlineFontSize: '28', bodyFontSize: '14', headlineFontWeight: '700',
};

const WIDGET_PRESETS: Record<string, string>[] = [
  { accentColor: '#1a56db', backgroundColor: '#eff6ff', cardBackground: '#f8fbff', textColor: '#0f1941', borderColor: '#c3d9f8', cardRadius: '2',  buttonRadius: '2'  },
  { accentColor: '#3d5c3a', backgroundColor: '#f0f2e8', cardBackground: '#f6f7f0', textColor: '#1a2418', borderColor: '#c5cbb0', cardRadius: '20', buttonRadius: '44' },
  { accentColor: '#111827', backgroundColor: '#f9fafb', cardBackground: '#ffffff', textColor: '#111827', borderColor: '#e5e7eb', cardRadius: '8',  buttonRadius: '8'  },
];

const JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'bookingwulf',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      url: 'https://bookingwulf.com',
      description: 'Buchungswidget für Hotels, Pensionen und Ferienwohnungen. Direktbuchungen ohne Provision.',
      offers: { '@type': 'Offer', price: '59', priceCurrency: 'EUR' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: CONTENT.faq.items.map(({ q, a }) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: { '@type': 'Answer', text: a },
      })),
    },
  ],
};

export default function HomePage() {
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('year');
  const [revenue, setRevenue] = useState(50_000);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('bw-visible'); }),
      { threshold: 0.1 }
    );
    document.querySelectorAll('.bw-animate').forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let idx = 0;
    let started = false;

    function send(s: Record<string, string>) {
      iframeRef.current?.contentWindow?.postMessage({ type: 'booking-widget-preview-settings', settings: s }, '*');
    }
    function cycle() {
      send({ ...WIDGET_BASE, ...WIDGET_PRESETS[idx % WIDGET_PRESETS.length] });
      idx++;
      timer = setTimeout(() => { send(WIDGET_BASE); timer = setTimeout(cycle, 3000); }, 5000);
    }
    function onMessage(e: MessageEvent) {
      if (e.data?.type === 'booking-widget-ready' && !started) {
        started = true; send(WIDGET_BASE); timer = setTimeout(cycle, 4000);
      }
    }
    window.addEventListener('message', onMessage);
    return () => { window.removeEventListener('message', onMessage); clearTimeout(timer); };
  }, []);

  const FeaturedIcon = CONTENT.features.featured.icon;
  const plans      = (Object.entries(PLANS) as [string, typeof PLANS[keyof typeof PLANS]][]).filter(([k]) => k !== 'bundle_all');
  const commission = Math.round(revenue * CONTENT.pain.commissionPct / 100);
  const saving     = commission - CONTENT.pain.bwYearlyCost;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />

      {/* ── Split-Hero ───────────────────────────────────────────── */}
      <section className="max-w-275 mx-auto px-5 sm:px-8 py-30 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center" aria-labelledby="hero-heading">

        {/* Text-Seite */}
        <div>
          <div
            className="bw-badge-pulse inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-50 text-green-700 text-sm font-semibold mb-8 border border-green-100"
            role="status"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" aria-hidden />
            {CONTENT.hero.badge}
          </div>

          <h1
            id="hero-heading"
            className="text-4xl sm:text-5xl lg:text-[3.25rem] font-extrabold leading-[1.08] tracking-tight mb-6 text-slate-950"
          >
            {CONTENT.hero.h1a}<br />
            {CONTENT.hero.h1b}<br />
            {CONTENT.hero.h1c}
          </h1>

          <p className="text-lg text-slate-500 leading-relaxed mb-10 max-w-md">
            {CONTENT.hero.sub}
          </p>

          <div className="flex flex-wrap gap-3 mb-8">
            <Link href="/register" className="bw-btn bw-btn-primary">{CONTENT.hero.cta1}</Link>
            <Link href="/v3/demo"  className="bw-btn bw-btn-secondary">{CONTENT.hero.cta2} →</Link>
          </div>

          <ul className="flex flex-wrap gap-x-5 gap-y-1.5 list-none m-0 p-0" aria-label="Kernvorteile">
            {CONTENT.hero.trust.map((t) => (
              <li key={t} className="flex items-center gap-1.5 text-sm text-slate-500">
                <Check size={14} strokeWidth={2.5} className="text-green-500 shrink-0" aria-hidden={true} />
                {t}
              </li>
            ))}
          </ul>
        </div>

        {/* Widget-Seite */}
        <div className="bw-animate relative">
          <div
            className="rounded-2xl overflow-hidden border border-slate-200 bw-float"
            style={{ boxShadow: 'var(--bw-shadow-widget)', height: 560, pointerEvents: 'none' }}
          >
            <iframe
              ref={iframeRef}
              src="/widget.html?hotel=beiwumoser"
              className="w-full border-none block"
              style={{ height: 560 }}
              scrolling="no"
              title="bookingwulf Buchungswidget Live-Vorschau"
              aria-label="Vorschau des bookingwulf Buchungswidgets"
              suppressHydrationWarning
            />
          </div>
          {/* Dekorativer Hintergrund-Blob */}
          <div className="absolute -z-10 -top-8 -right-8 w-64 h-64 rounded-full opacity-40 blur-3xl" style={{ background: 'radial-gradient(circle, #dbeafe, transparent)' }} aria-hidden />
        </div>
      </section>

      {/* ── Provisions-Rechner ───────────────────────────────────── */}
      <section className="bg-slate-950 text-white py-30 px-5" aria-labelledby="pain-heading">
        <div className="max-w-275 mx-auto text-center">
          <span className="bw-section-label bw-animate">{CONTENT.pain.label}</span>
          <h2 id="pain-heading" className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4 bw-animate bw-animate-delay-1">
            {CONTENT.pain.h2}
          </h2>
          <p className="text-slate-400 text-base leading-relaxed max-w-xl mx-auto mb-16 bw-animate bw-animate-delay-2">
            {CONTENT.pain.sub}
          </p>

          {/* Interaktiver Rechner */}
          <div className="bw-animate bw-animate-delay-2 bw-card-dark max-w-xl mx-auto mb-10 bg-white/12 p-6">
            <label htmlFor="revenue-slider" className="block text-sm font-semibold text-slate-300 mb-1">
              Ihr Jahresumsatz über OTA-Portale
            </label>
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl font-extrabold text-white tracking-tight">
                €{revenue.toLocaleString('de-AT')}
              </span>
              <span className="text-xs text-slate-500">pro Jahr</span>
            </div>
            <input
              id="revenue-slider"
              type="range"
              min={10_000}
              max={300_000}
              step={5_000}
              value={revenue}
              onChange={(e) => setRevenue(Number(e.target.value))}
              className="w-full accent-green-500 cursor-pointer"
              aria-label="Jahresumsatz einstellen"
            />
            <div className="flex justify-between text-xs text-slate-600 mt-1">
              <span>€10.000</span><span>€300.000</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: `${CONTENT.pain.commissionPct}% OTA-Provision`, value: `−€${commission.toLocaleString('de-AT')}/Jahr`, note: 'Was die Portale jährlich einbehalten',    tone: 'negative' as const },
              { label: 'bookingwulf Pro',       value: `€${CONTENT.pain.bwYearlyCost.toLocaleString('de-AT')}/Jahr`, note: '€119/Monat · jederzeit kündbar', tone: 'neutral'  as const },
              { label: 'Ihre Ersparnis',        value: saving > 0 ? `bis zu €${saving.toLocaleString('de-AT')}/Jahr` : 'Noch kein Vorteil', note: saving > 0 ? 'Steigt mit Ihrem Umsatz' : 'Ab ~€8k Umsatz lohnt sich bookingwulf', tone: 'positive' as const },
            ].map((item, i) => (
              <div key={item.label} className={`bw-animate bw-card-dark bw-animate-delay-${i + 2} p-6 transition-all duration-300 ${item.tone === 'positive' ? 'bg-green-500' : 'bg-white/12'}`}>
                <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${item.tone === 'positive' ? 'text-green-100' : 'text-slate-400'}`}>{item.label}</p>
                <p className={`text-2xl font-extrabold tracking-tight mb-1.5 ${item.tone === 'negative' ? 'text-red-400' : 'text-white'}`}>{item.value}</p>
                <p className={`text-xs ${item.tone === 'positive' ? 'text-green-100' : 'text-slate-500'}`}>{item.note}</p>
              </div>
            ))}
          </div>
          <p className="text-slate-600 text-xs mt-5">Provision-Annahme: {CONTENT.pain.commissionPct}% (Branchen-Durchschnitt Booking.com). Tatsächliche Einsparungen variieren.</p>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────── */}
      <section id="features" className="py-30 px-5 bg-white" aria-labelledby="features-heading">
        <div className="max-w-275 mx-auto">
          <div className="mb-16 text-center">
            <span className="bw-section-label bw-animate">{CONTENT.features.label}</span>
            <h2 id="features-heading" className="text-3xl font-extrabold tracking-tight text-slate-900 mb-3 bw-animate bw-animate-delay-1">
              {CONTENT.features.h2}
            </h2>
            <p className="text-slate-500 text-base max-w-xl mx-auto bw-animate bw-animate-delay-2">{CONTENT.features.sub}</p>
          </div>

          {/* Gäste-Lounge — Featured */}
          <div className="bw-animate mb-5 rounded-2xl border border-(--bw-green-border) bg-linear-to-br from-green-50 to-emerald-50 p-7 flex flex-col sm:flex-row gap-5 items-start group hover:-translate-y-1 transition-all duration-300" style={{ boxShadow: 'var(--bw-shadow-card)' }}>
            <FeaturedIcon size={32} strokeWidth={1.75} className="shrink-0 text-green-700 transition-transform duration-300 group-hover:scale-110" aria-hidden={true} />
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <h3 className="text-lg font-bold text-green-900">{CONTENT.features.featured.title}</h3>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-green-500 text-white">{CONTENT.features.featured.badge}</span>
              </div>
              <p className="text-sm text-green-800 leading-relaxed">{CONTENT.features.featured.desc}</p>
            </div>
          </div>

          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 list-none m-0 p-0" role="list">
            {CONTENT.features.items.map((f, i) => {
              const Icon = f.icon;
              return (
                <li key={f.title} className={`bw-card bw-animate bw-animate-delay-${Math.min(i + 1, 4)} p-6 group`}>
                  <div className="mb-3 transition-transform duration-300 group-hover:scale-110">
                    <Icon size={22} strokeWidth={1.75} className="text-slate-700" aria-hidden={true} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
                </li>
              );
            })}
          </ul>

          <div className="mt-8 bw-animate">
            <Link href="/v3/features" className="text-sm font-semibold text-slate-900 hover:underline underline-offset-4">Alle Features ansehen →</Link>
          </div>
        </div>
      </section>

      {/* ── So geht's ────────────────────────────────────────────── */}
      <section className="py-30 px-5" aria-labelledby="steps-heading">
        <div className="max-w-275 mx-auto">
          <div className="text-center mb-16">
            <span className="bw-section-label bw-animate">So geht's</span>
            <h2 id="steps-heading" className="text-3xl font-extrabold tracking-tight bw-animate bw-animate-delay-1">
              {CONTENT.steps.h2}
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <ol className="flex flex-col gap-8 list-none m-0 p-0">
              {CONTENT.steps.items.map((s, i) => (
                <li key={s.num} className={`bw-animate bw-animate-delay-${i + 1} flex gap-5 items-start group relative`}>
                  {i < CONTENT.steps.items.length - 1 && <span className="bw-step-connector" aria-hidden />}
                  <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center text-lg font-bold shrink-0 transition-all duration-200 group-hover:scale-110 group-hover:shadow-lg" aria-label={`Schritt ${s.num}`}>
                    {s.num}
                  </div>
                  <div className="pt-2.5">
                    <h3 className="text-lg font-bold text-slate-900 mb-1">{s.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          {/* Rechts: CTA-Box */}
          <div className="bw-animate bw-card p-8 flex flex-col gap-6">
            <p className="text-2xl font-extrabold tracking-tight text-slate-900">Bereit in 5 Minuten?</p>
            <p className="text-slate-500 text-base leading-relaxed">14 Tage kostenlos — keine Kreditkarte, keine Mindestlaufzeit.</p>
            <Link href="/register" className="bw-btn bw-btn-primary self-start">Jetzt starten</Link>
          </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────── */}
      <section id="pricing" className="py-30 px-5 bg-white" aria-labelledby="pricing-heading">
        <div className="max-w-275 mx-auto">
          <div className="mb-16 text-center">
            <span className="bw-section-label bw-animate">Preise</span>
            <h2 id="pricing-heading" className="text-3xl font-extrabold tracking-tight mb-3 bw-animate bw-animate-delay-1">
              Der richtige Plan für Ihren Betrieb
            </h2>
            <p className="text-slate-500 text-base bw-animate bw-animate-delay-2 max-w-xl mx-auto">Keine Provision. Keine versteckten Kosten. Jederzeit kündbar.</p>
          </div>

          <div className="flex items-center justify-center gap-3 mb-10 bw-animate">
            <span className={`text-sm font-medium transition-colors ${billingInterval === 'month' ? 'text-slate-900' : 'text-slate-400'}`}>Monatlich</span>
            <button
              onClick={() => setBillingInterval((v) => v === 'month' ? 'year' : 'month')}
              className="relative w-12 h-6 rounded-full transition-colors duration-200 shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
              style={{ background: billingInterval === 'year' ? 'var(--bw-black)' : '#cbd5e1' }}
              role="switch" aria-checked={billingInterval === 'year'}
              aria-label={`Umschalten auf ${billingInterval === 'month' ? 'jährliche' : 'monatliche'} Abrechnung`}
            >
              <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-200" style={{ left: billingInterval === 'year' ? '1.375rem' : '0.125rem' }} />
            </button>
            <span className={`text-sm font-medium transition-colors ${billingInterval === 'year' ? 'text-slate-900' : 'text-slate-400'}`}>
              Jährlich
              {billingInterval === 'year' && <span className="ml-1.5 px-2 py-0.5 rounded-md bg-green-100 text-green-700 text-xs font-bold">spare 10%</span>}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 items-start">
            {plans.map(([key, plan], i) => (
              <div key={key} className={`bw-animate bw-animate-delay-${i + 1} relative rounded-2xl p-7 transition-all duration-300 ${key === 'pro' ? 'bg-slate-900 text-white border border-slate-700 hover:-translate-y-1.5' : 'bw-card hover:-translate-y-1'}`} style={key === 'pro' ? { boxShadow: 'var(--bw-shadow-card-hover)' } : { boxShadow: 'var(--bw-shadow-card-hover)', borderColor: '#cbd5e1' }}>
                {key === 'pro' && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-green-500 text-white text-xs font-bold whitespace-nowrap">Beliebt</div>}
                <h3 className={`text-lg font-bold mb-1 ${key === 'pro' ? 'text-white' : 'text-slate-900'}`}>{plan.name}</h3>
                <div className={`text-4xl font-extrabold tracking-tight my-4 ${key === 'pro' ? 'text-white' : 'text-slate-900'}`}>
                  €{billingInterval === 'year' ? plan.priceYearly : plan.priceMonthly}
                  <span className="text-base font-normal text-slate-400">/Mo</span>
                </div>
                <ul className="flex flex-col gap-2.5 mb-6 list-none m-0 p-0">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-2 items-start text-sm">
                      <Check size={14} strokeWidth={2.5} className={`mt-0.5 shrink-0 ${key === 'pro' ? 'text-green-400' : 'text-green-600'}`} aria-hidden={true} />
                      <span className={key === 'pro' ? 'text-slate-300' : 'text-slate-600'}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/register" className={`bw-btn block text-center py-2.5 text-sm ${key === 'pro' ? 'bg-white text-slate-900 hover:bg-slate-100' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
                  Kostenlos testen
                </Link>
              </div>
            ))}
          </div>
          <div className="mt-8 bw-animate">
            <Link href="/v3/preise" className="text-sm font-semibold text-slate-900 hover:underline underline-offset-4">Alle Details zu den Preisen →</Link>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <section className="py-30 px-5" aria-labelledby="faq-heading">
        <div className="max-w-275 mx-auto">
          <div className="text-center mb-16">
            <span className="bw-section-label bw-animate">FAQ</span>
            <h2 id="faq-heading" className="text-3xl font-extrabold tracking-tight mb-3 bw-animate bw-animate-delay-1">
              {CONTENT.faq.h2}
            </h2>
            <p className="text-slate-500 text-sm bw-animate bw-animate-delay-2">
              Weitere Fragen? <a href="mailto:support@bookingwulf.com" className="text-slate-700 font-semibold hover:underline underline-offset-2">support@bookingwulf.com</a>
            </p>
          </div>
          <div>
            {CONTENT.faq.items.map(({ q, a }, i) => (
              <FaqItem key={q} question={q} answer={a} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Founder ──────────────────────────────────────────────── */}
      <section className="py-30 px-5 bg-white" aria-labelledby="founder-heading">
        <div className="max-w-275 mx-auto">
          <div className="text-center mb-16">
            <span className="bw-section-label bw-animate">Wer steckt dahinter</span>
            <h2 id="founder-heading" className="text-3xl font-extrabold tracking-tight bw-animate bw-animate-delay-1">
              Kein Konzern. Ein Entwickler aus Wien.
            </h2>
          </div>
          <div className="bw-animate bw-card max-w-2xl mx-auto p-8 flex flex-col sm:flex-row gap-8 items-center sm:items-start">
            <svg width="96" height="96" viewBox="0 0 96 96" fill="none" className="shrink-0" aria-hidden={true}>
              <circle cx="48" cy="48" r="48" fill="#f0fdf4" />
              <circle cx="48" cy="48" r="47.5" stroke="#bbf7d0" strokeWidth="1" />
              <text
                x="48" y="48"
                textAnchor="middle"
                dominantBaseline="central"
                fontFamily="ui-sans-serif, system-ui, -apple-system, sans-serif"
                fontSize="26"
                fontWeight="700"
                fill="#16a34a"
                letterSpacing="2"
              >WH</text>
            </svg>
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">Wolfgang Heis</h3>
              <p className="text-sm text-slate-400 mb-4">Webentwickler · Wien, Österreich</p>
              <p className="text-slate-600 leading-relaxed text-sm">
                bookingwulf ist mein Vollzeit-Projekt. Ich entwickle seit über 15 Jahren Webanwendungen — und habe bookingwulf gebaut, weil ich gesehen habe, wie viel Geld kleine Unterkünfte unnötig an Buchungsportale abgeben. Bei Smoobu oder Lodgify erreichen Sie einen anonymen Support. Bei bookingwulf erreichen Sie mich direkt.
              </p>
              <a
                href="mailto:support@bookingwulf.com"
                className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold text-slate-900 hover:underline underline-offset-4"
              >
                support@bookingwulf.com →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Finaler CTA ──────────────────────────────────────────── */}
      <section className="py-30 px-5 bg-slate-950 text-white text-center" aria-labelledby="cta-heading">
        <div className="max-w-xl mx-auto bw-animate">
          <h2 id="cta-heading" className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Bereit für Direktbuchungen?
          </h2>
          <p className="text-slate-400 text-base mb-8">14 Tage kostenlos testen — keine Kreditkarte erforderlich.</p>
          <Link href="/register" className="bw-btn bg-white text-slate-900 hover:bg-slate-100 px-8 py-4 text-base font-bold">
            Jetzt Konto erstellen
          </Link>
        </div>
      </section>
    </>
  );
}

function FaqItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [open, setOpen] = useState(false);
  const id = `v3-faq-${index}`;
  return (
    <div className={`bw-animate bw-animate-delay-${Math.min(index + 1, 4)} border-b border-slate-200`}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex justify-between items-center py-5 text-left gap-4 bg-transparent border-none cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 rounded"
        aria-expanded={open} aria-controls={id}
      >
        <span className="text-base font-semibold text-slate-900 group-hover:text-slate-600 transition-colors leading-snug">{question}</span>
        <Plus size={20} className="text-slate-400 shrink-0 transition-transform duration-200" style={{ transform: open ? 'rotate(45deg)' : 'none' }} aria-hidden={true} />
      </button>
      <div id={id} role="region" aria-label={question} className={`bw-faq-answer ${open ? 'bw-faq-open' : ''}`}>
        <p className="pb-5 text-sm text-slate-600 leading-relaxed">{answer}</p>
      </div>
    </div>
  );
}
