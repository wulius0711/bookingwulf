'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { PLANS } from '@/src/lib/plans';

// i18n: Alle Strings hier zentral — bei next-intl Migration durch t('key') ersetzen
const CONTENT = {
  hero: {
    badge:  'Beta · 14 Tage kostenlos testen',
    h1:     'Direktbuchungen für Ihre Unterkunft. Ohne Provision.',
    sub:    'Ein professionelles Buchungswidget direkt auf Ihrer Website — in 5 Minuten eingebaut, ohne Entwickler. Ihre Gäste buchen direkt bei Ihnen.',
    trust:  ['Keine Provision', 'Setup in 5 Minuten', 'Kein Entwickler nötig', 'DSGVO-konform'],
    cta1:   'Kostenlos starten',
    cta2:   'Live-Demo ansehen',
  },
  preview: {
    h2:  'So buchen Ihre Gäste direkt bei Ihnen',
    sub: 'Das Widget fügt sich nahtlos in Ihre Website ein — Farben, Formen und Schrift vollständig anpassbar.',
  },
  pain: {
    label: 'Der versteckte Kostenfaktor',
    h2:    'Was zahlen Sie wirklich für Buchungsportale?',
    sub:   'Jede Buchung über Booking.com oder Airbnb kostet Sie 15–25 % Provision. Mit bookingwulf buchen Gäste direkt — und Sie behalten jeden Cent.',
    revenueExample: 50_000,
    commissionPct:  18,
    bwYearlyCost:   119 * 12,
  },
  features: {
    h2:  'Alles was Sie brauchen',
    sub: 'Kein Schnickschnack — nur Features die Vermieter wirklich nutzen.',
    featured: {
      icon: '🛎️',
      title: 'Gäste-Lounge',
      desc: 'Ein persönlicher Bereich für jeden Gast — Check-in-Infos, Hausregeln, Buchungsdetails und lokale Sehenswürdigkeiten aus Google Maps, alles auf einen Klick eingebunden. Für Hotels ideal zum Upselling. So etwas bietet kein anderes Buchungssystem.',
    },
    items: [
      { icon: '🚫',  title: 'Keine Provision',      desc: 'Sie behalten jeden Cent jeder Direktbuchung. Keine Transaktionsgebühren, egal wie viele Buchungen eingehen.' },
      { icon: '⚡',  title: 'Setup in 5 Minuten',   desc: 'Eine Zeile Code auf Ihrer Website — kein Entwickler, kein Aufwand. Funktioniert mit WordPress, Framer, Wix & Co.' },
      { icon: '🎨',  title: 'Ihr Branding',         desc: 'Farben, Formen und Schrift passend zu Ihrer Website — komplett anpassbar, ohne Code.' },
      { icon: '🏠',  title: 'Multi-Apartment',       desc: 'Beliebig viele Einheiten mit individuellen Preisen, Bildern und Ausstattungsmerkmalen verwalten.' },
      { icon: '🔄',  title: 'Channel Sync',         desc: 'Echtzeit-Sync mit Airbnb & Booking.com via Beds24 Channel Manager — Doppelbuchungen ausgeschlossen.' },
      { icon: '🇪🇺', title: 'DSGVO-konform',        desc: 'Alle Daten auf Servern in Deutschland — sicher, rechtskonform und ohne US-Cloud.' },
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
      { q: 'Wie baue ich das Widget ein?',                                    a: 'Sie fügen eine Zeile Code auf Ihrer Website ein — das war\'s. Kein Entwickler nötig. Funktioniert mit jeder Website: WordPress, Framer, Wix oder individuelle Lösungen.' },
      { q: 'Gibt es versteckte Kosten oder Provisionen?',                     a: 'Nein. Sie zahlen nur den monatlichen Fixpreis — keine Provision, keine Transaktionsgebühren, egal wie viele Buchungen eingehen.' },
      { q: 'Kann ich das Widget gleichzeitig für Anfragen und Buchungen nutzen?', a: 'Ja — das Widget ist zweifach konfigurierbar. Sie können es gleichzeitig als Buchungs- und Anfrageformular einsetzen.' },
      { q: 'Was passiert nach den 14 kostenlosen Tagen?',                     a: 'Sie wählen einen Plan und können regulär starten. Kündigung ist jederzeit möglich — ohne Mindestlaufzeit.' },
      { q: 'Wo werden meine Daten gespeichert?',                              a: 'Alle Daten werden auf Servern in Deutschland gespeichert — sicher und DSGVO-konform.' },
      { q: 'Funktioniert der Sync mit Airbnb und Booking.com?',               a: 'Ja — via Beds24 Channel Manager (separater Beds24-Account notwendig). bookingwulf erhebt keine zusätzliche Gebühr dafür.' },
    ],
  },
  cta: {
    h2:  'Bereit für Direktbuchungen?',
    sub: '14 Tage kostenlos testen — keine Kreditkarte erforderlich.',
    btn: 'Jetzt Konto erstellen',
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

// JSON-LD structured data für SEO & KI-Suche
const JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'bookingwulf',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      url: 'https://bookingwulf.com',
      description: 'Buchungswidget für Hotels, Pensionen und Ferienwohnungen. Direktbuchungen ohne Provision, DSGVO-konform, Setup in 5 Minuten.',
      offers: {
        '@type': 'Offer',
        price: '59',
        priceCurrency: 'EUR',
        priceSpecification: { '@type': 'UnitPriceSpecification', billingDuration: 'P1M' },
      },
      featureList: [
        'Buchungswidget ohne Provision',
        'Multi-Apartment-Verwaltung',
        'Airbnb & Booking.com Sync via Beds24',
        'DSGVO-konform, Server in Deutschland',
        'Individuelle Farbgestaltung',
        'Setup in 5 Minuten',
      ],
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
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Scroll-Animationen aktivieren
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('bw-visible'); }),
      { threshold: 0.1 }
    );
    document.querySelectorAll('.bw-animate').forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  // Widget-Farbzyklus
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let idx = 0;
    let started = false;

    function send(settings: Record<string, string>) {
      iframeRef.current?.contentWindow?.postMessage({ type: 'booking-widget-preview-settings', settings }, '*');
    }

    function cycle() {
      send({ ...WIDGET_BASE, ...WIDGET_PRESETS[idx % WIDGET_PRESETS.length] });
      idx++;
      timer = setTimeout(() => { send(WIDGET_BASE); timer = setTimeout(cycle, 3000); }, 5000);
    }

    function onMessage(e: MessageEvent) {
      if (e.data?.type === 'booking-widget-ready' && !started) {
        started = true;
        send(WIDGET_BASE);
        timer = setTimeout(cycle, 4000);
      }
    }

    window.addEventListener('message', onMessage);
    return () => { window.removeEventListener('message', onMessage); clearTimeout(timer); };
  }, []);

  const plans       = (Object.entries(PLANS) as [string, typeof PLANS[keyof typeof PLANS]][]).filter(([k]) => k !== 'bundle_all');
  const commission  = Math.round(CONTENT.pain.revenueExample * CONTENT.pain.commissionPct / 100);
  const saving      = commission - CONTENT.pain.bwYearlyCost;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section
        className="text-center px-5 pt-24 pb-24 max-w-2xl mx-auto"
        aria-labelledby="hero-heading"
      >
        <div
          className="bw-badge-pulse inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-50 text-green-700 text-sm font-semibold mb-8 border border-green-100"
          role="status"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" aria-hidden />
          {CONTENT.hero.badge}
        </div>

        <h1
          id="hero-heading"
          className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold leading-[1.06] tracking-tight mb-6 text-slate-950"
        >
          Direktbuchungen für Ihre Unterkunft.<br />Ohne Provision.
        </h1>

        <p className="text-lg text-slate-500 leading-relaxed max-w-lg mx-auto mb-10">
          Ein professionelles Buchungswidget direkt auf Ihrer Website — in 5 Minuten eingebaut, ohne Entwickler.<br />
          Ihre Gäste buchen direkt bei Ihnen.
        </p>

        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/register" className="bw-btn bw-btn-primary">
            {CONTENT.hero.cta1}
          </Link>
          <Link href="/v2/demo" className="bw-btn bw-btn-secondary">
            {CONTENT.hero.cta2} →
          </Link>
        </div>
      </section>

      {/* ── Widget-Vorschau ──────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-5 pt-10 pb-24" aria-labelledby="preview-heading">
        <div className="text-center mb-10 bw-animate">
          <h2 id="preview-heading" className="text-2xl font-bold tracking-tight text-slate-900 mb-2">
            {CONTENT.preview.h2}
          </h2>
          <p className="text-slate-500 text-base">{CONTENT.preview.sub}</p>
        </div>
        <div
          className="bw-animate bw-float rounded-2xl overflow-hidden border border-slate-200"
          style={{ boxShadow: 'var(--bw-shadow-widget)' }}
        >
          <iframe
            ref={iframeRef}
            src="/widget.html?hotel=beiwumoser"
            className="w-full border-none block"
            style={{ height: 680 }}
            scrolling="no"
            title="bookingwulf Buchungswidget Live-Vorschau"
            aria-label="Interaktive Vorschau des bookingwulf Buchungswidgets — zeigt automatisch verschiedene Farbschemas"
            suppressHydrationWarning
          />
        </div>
      </section>

      {/* ── Provisions-Rechner ───────────────────────────────────── */}
      <section className="bg-slate-950 text-white py-20 px-5" aria-labelledby="pain-heading">
        <div className="max-w-4xl mx-auto text-center">
          <span className="bw-section-label bw-animate">{CONTENT.pain.label}</span>
          <h2
            id="pain-heading"
            className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4 bw-animate bw-animate-delay-1"
          >
            {CONTENT.pain.h2}
          </h2>
          <p className="text-slate-400 text-base leading-relaxed max-w-xl mx-auto mb-12 bw-animate bw-animate-delay-2">
            {CONTENT.pain.sub}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            {[
              {
                label:    `${CONTENT.pain.commissionPct}% OTA-Provision`,
                value:    `−€${commission.toLocaleString('de-AT')}/Jahr`,
                note:     `Beispiel: €${(CONTENT.pain.revenueExample / 1000).toFixed(0)}k Jahresumsatz über Portale`,
                tone:     'negative' as const,
              },
              {
                label:    'bookingwulf Pro',
                value:    `€${CONTENT.pain.bwYearlyCost.toLocaleString('de-AT')}/Jahr`,
                note:     '€119/Monat · jederzeit kündbar',
                tone:     'neutral' as const,
              },
              {
                label:    'Potenzielle Ersparnis',
                value:    `bis zu €${saving.toLocaleString('de-AT')}/Jahr`,
                note:     'Mehr bei höherem Jahresumsatz',
                tone:     'positive' as const,
              },
            ].map((item, i) => (
              <div
                key={item.label}
                className={`bw-animate bw-animate-delay-${i + 2} rounded-2xl p-6 ${
                  item.tone === 'positive' ? 'bg-green-500 text-white' : 'bg-white/[0.05] text-white'
                }`}
              >
                <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${item.tone === 'positive' ? 'text-green-100' : 'text-slate-400'}`}>
                  {item.label}
                </p>
                <p className={`text-2xl font-extrabold tracking-tight mb-1.5 ${item.tone === 'negative' ? 'text-red-400' : 'text-white'}`}>
                  {item.value}
                </p>
                <p className={`text-xs ${item.tone === 'positive' ? 'text-green-100' : 'text-slate-500'}`}>
                  {item.note}
                </p>
              </div>
            ))}
          </div>

          <p className="text-slate-600 text-xs mt-5 bw-animate">
            * Beispielrechnung. Tatsächliche Einsparungen variieren je nach Umsatz und Provisionssatz.
          </p>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────── */}
      <section id="features" className="py-20 px-5 bg-slate-50" aria-labelledby="features-heading">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 id="features-heading" className="text-3xl font-extrabold tracking-tight text-slate-900 mb-3 bw-animate">
              {CONTENT.features.h2}
            </h2>
            <p className="text-slate-500 text-base bw-animate bw-animate-delay-1">{CONTENT.features.sub}</p>
          </div>

          {/* Gäste-Lounge — Featured Card */}
          <div className="bw-animate mb-5 rounded-2xl border border-green-200 bg-linear-to-br from-green-50 to-emerald-50 p-7 flex flex-col sm:flex-row gap-5 items-start group hover:-translate-y-1 transition-all duration-300" style={{ boxShadow: 'var(--bw-shadow-card)' }}>
            <div className="text-4xl shrink-0 transition-transform duration-300 group-hover:scale-110" aria-hidden>
              {CONTENT.features.featured.icon}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <h3 className="text-lg font-bold text-green-900">{CONTENT.features.featured.title}</h3>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-green-500 text-white">Einzigartig</span>
              </div>
              <p className="text-sm text-green-800 leading-relaxed">{CONTENT.features.featured.desc}</p>
            </div>
          </div>

          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 list-none m-0 p-0" role="list">
            {CONTENT.features.items.map((f, i) => (
              <li
                key={f.title}
                className={`bw-card bw-animate bw-animate-delay-${Math.min(i + 1, 4)} p-6 group`}
              >
                <div className="text-2xl mb-3 inline-block transition-transform duration-300 group-hover:scale-110" aria-hidden>
                  {f.icon}
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </li>
            ))}
          </ul>

          <p className="text-center mt-10 bw-animate">
            <Link href="/v2/features" className="text-sm font-semibold text-slate-900 hover:underline underline-offset-4 transition-colors">
              Alle Features ansehen →
            </Link>
          </p>
        </div>
      </section>

      {/* ── So geht's ────────────────────────────────────────────── */}
      <section className="py-20 px-5" aria-labelledby="steps-heading">
        <div className="max-w-2xl mx-auto">
          <h2 id="steps-heading" className="text-3xl font-extrabold tracking-tight text-center mb-12 bw-animate">
            {CONTENT.steps.h2}
          </h2>
          <ol className="flex flex-col gap-8 list-none m-0 p-0">
            {CONTENT.steps.items.map((s, i) => (
              <li key={s.num} className={`bw-animate bw-animate-delay-${i + 1} flex gap-5 items-start group relative`}>
                {i < CONTENT.steps.items.length - 1 && (
                  <span className="bw-step-connector" aria-hidden />
                )}
                <div
                  className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center text-lg font-bold shrink-0 transition-all duration-200 group-hover:scale-110 group-hover:shadow-lg"
                  aria-label={`Schritt ${s.num}`}
                >
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
      </section>

      {/* ── Pricing-Teaser ───────────────────────────────────────── */}
      <section id="pricing" className="py-20 px-5 bg-white border-t border-slate-100" aria-labelledby="pricing-heading">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 id="pricing-heading" className="text-3xl font-extrabold tracking-tight mb-3 bw-animate">
              Der richtige Plan für Ihren Betrieb
            </h2>
            <p className="text-slate-500 text-base bw-animate bw-animate-delay-1">
              Keine Provision. Keine versteckten Kosten. Jederzeit kündbar.
            </p>
          </div>

          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-3 mb-10 bw-animate">
            <span className={`text-sm font-medium transition-colors ${billingInterval === 'month' ? 'text-slate-900' : 'text-slate-400'}`}>
              Monatlich
            </span>
            <button
              onClick={() => setBillingInterval((v) => v === 'month' ? 'year' : 'month')}
              className="relative w-12 h-6 rounded-full transition-colors duration-200 shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
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
                <span className="ml-1.5 px-2 py-0.5 rounded-md bg-green-100 text-green-700 text-xs font-bold">
                  spare 10%
                </span>
              )}
            </span>
          </div>

          {/* Plan cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 items-start">
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
                <h3 className={`text-lg font-bold mb-1 ${key === 'pro' ? 'text-white' : 'text-slate-900'}`}>
                  {plan.name}
                </h3>
                <div className={`text-4xl font-extrabold tracking-tight my-4 ${key === 'pro' ? 'text-white' : 'text-slate-900'}`}>
                  €{billingInterval === 'year' ? plan.priceYearly : plan.priceMonthly}
                  <span className="text-base font-normal text-slate-400">/Mo</span>
                </div>
                <ul className="flex flex-col gap-2.5 mb-6 list-none m-0 p-0 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-2 items-start text-sm">
                      <span className={`mt-0.5 shrink-0 font-bold ${key === 'pro' ? 'text-green-400' : 'text-green-600'}`} aria-hidden>✓</span>
                      <span className={key === 'pro' ? 'text-slate-300' : 'text-slate-600'}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`bw-btn block text-center py-2.5 text-sm ${
                    key === 'pro'
                      ? 'bg-white text-slate-900 hover:bg-slate-100 focus-visible:outline-white'
                      : 'bg-transparent text-slate-900 border-2 border-slate-900 hover:bg-slate-900 hover:text-white focus-visible:outline-slate-900'
                  }`}
                >
                  Kostenlos testen
                </Link>
              </div>
            ))}
          </div>

          <p className="text-center mt-8 bw-animate">
            <Link href="/v2/preise" className="text-sm font-semibold text-slate-900 hover:underline underline-offset-4">
              Alle Details zu den Preisen →
            </Link>
          </p>
          <p className="text-center mt-3 text-sm text-slate-400">
            Fragen?{' '}
            <a href="mailto:support@bookingwulf.com" className="text-slate-700 font-semibold hover:underline underline-offset-2">
              support@bookingwulf.com
            </a>
          </p>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <section className="py-20 px-5 bg-slate-50" aria-labelledby="faq-heading">
        <div className="max-w-2xl mx-auto">
          <h2 id="faq-heading" className="text-3xl font-extrabold tracking-tight text-center mb-12 bw-animate">
            {CONTENT.faq.h2}
          </h2>
          <div role="list">
            {CONTENT.faq.items.map(({ q, a }, i) => (
              <FaqItem key={q} question={q} answer={a} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Finaler CTA ──────────────────────────────────────────── */}
      <section className="py-24 px-5 text-center" aria-labelledby="cta-heading">
        <div className="max-w-xl mx-auto bw-animate">
          <h2 id="cta-heading" className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            {CONTENT.cta.h2}
          </h2>
          <p className="text-slate-500 text-base mb-8">{CONTENT.cta.sub}</p>
          <Link href="/register" className="bw-btn bw-btn-primary">
            {CONTENT.cta.btn}
          </Link>
        </div>
      </section>
    </>
  );
}

function FaqItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [open, setOpen] = useState(false);
  const answerId = `faq-answer-${index}`;

  return (
    <div className={`bw-animate bw-animate-delay-${Math.min(index + 1, 4)} border-b border-slate-200`} role="listitem">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex justify-between items-center py-5 text-left gap-4 bg-transparent border-none cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 rounded"
        aria-expanded={open}
        aria-controls={answerId}
      >
        <span className="text-base font-semibold text-slate-900 group-hover:text-slate-600 transition-colors leading-snug">
          {question}
        </span>
        <span
          className="text-slate-400 text-xl shrink-0 transition-transform duration-200"
          style={{ transform: open ? 'rotate(45deg)' : 'none' }}
          aria-hidden
        >
          +
        </span>
      </button>
      <div
        id={answerId}
        role="region"
        aria-label={question}
        className={`bw-faq-answer ${open ? 'bw-faq-open' : ''}`}
      >
        <p className="pb-5 text-sm text-slate-600 leading-relaxed">{answer}</p>
      </div>
    </div>
  );
}
