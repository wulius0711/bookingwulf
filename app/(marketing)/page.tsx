'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Ban, BotMessageSquare, Check, ConciergeBell, Globe, Palette, Plus, RefreshCw, Zap } from 'lucide-react';
import RotatingBadge from './_components/RotatingBadge';
import BridgeSection from './_components/BridgeSection';
import { PLANS, calculatePlanPrice } from '@/src/lib/plans';
import { useV4Animate } from './_components/useV4Animate';
import ChatDemo from './_components/ChatDemo';
import FlipCard from './_components/FlipCard';
import HeroBg from './_components/HeroBg';

const INTRO_WORDS = ['direkt.', 'modern.', 'unabhängig.', 'provisionsfrei.'];

const CONTENT = {
  hero: {
    badge: 'Beta · 14 Tage kostenlos testen',
    h1a:   'Direktbuchungen für',
    h1b:   'deine Unterkunft.',
    h1c:   'Ohne Provision.',
    sub:   'Modern und einfach — weil du es verdient hast.',
    cta1:  'Kostenlos starten',
    cta2:  'Live-Demo ansehen',
    trust: ['Setup in 5 Min', 'Kein Entwickler', 'DSGVO-konform'],
  },
  pain: {
    label:         'Der versteckte Kostenfaktor',
    h2:            'Was zahlst du wirklich für Buchungsportale?',
    sub:           'Über Buchungsportale kosten dich Buchungen bis zu 25% Provision. Mit bookingwulf buchen Gäste direkt — und du behältst jeden Cent.',
    commissionPct: 15,
  },
  features: {
    label: 'Features',
    h2:    'Alles was du brauchst',
    sub:   'Kein Schnickschnack — nur Features die Vermieter wirklich nutzen.',
    items: [
      { icon: ConciergeBell, title: 'Gäste-Lounge',       desc: 'Jeder Gast erhält mit der Buchungsbestätigung einen persönlichen Link — kein Login, kein Download. Buchungsdetails, Zugangscode, Hausinfos und Upselling automatisch befüllt. Lokale Ausflugstipps direkt aus Google Maps importieren — in Sekunden eingerichtet.' },
      { icon: Ban,           title: 'Keine Provision',    desc: 'Du behältst jeden Cent jeder Direktbuchung. Keine Transaktionsgebühren.' },
      { icon: Zap,           title: 'Setup in 5 Minuten', desc: 'Eine Zeile Code — kein Entwickler nötig. Funktioniert mit WordPress, Framer, Wix & Co.' },
      { icon: Palette,       title: 'Dein Branding',      desc: 'Farben, Formen und Schrift passend zu deiner Website — komplett anpassbar.' },
      { icon: Globe,         title: 'Gäste-Kommunikation', desc: 'Automatische E-Mails in 9 Sprachen — Bestätigung, Angebot, Erinnerung. Kein manuelles Eingreifen.' },
      { icon: BotMessageSquare, title: 'Gäste-Assistent',    desc: 'KI-Assistent auf deiner Website: beantwortet Fragen, empfiehlt Apartments und generiert Buchungslinks.' },
      { icon: RefreshCw,     title: 'Channel Sync',       desc: 'Echtzeit-Sync mit Airbnb & Booking.com via Beds24 — keine Doppelbuchungen.' },
    ],
  },
  steps: {
    h2:    'In 3 Schritten live',
    items: [
      { num: '1', title: 'Registrieren', desc: 'Konto in 30 Sekunden erstellen — keine Kreditkarte nötig.' },
      { num: '2', title: 'Einrichten',   desc: 'Apartments anlegen, Preise setzen, Widget-Design anpassen.' },
      { num: '3', title: 'Einbauen',     desc: 'Eine Zeile Code auf deiner Website — ab sofort direkt buchbar.' },
    ],
  },
  faq: {
    h2:    'Häufige Fragen',
    items: [
      { q: 'Wie baue ich das Widget ein?',                                        a: 'Du fügst eine Zeile Code auf deiner Website ein — fertig. Kein Entwickler nötig. Funktioniert mit WordPress, Framer, Wix und mehr.' },
      { q: 'Gibt es versteckte Kosten oder Provisionen?',                         a: 'Nein. Nur der monatliche Fixpreis — keine Provision, keine Transaktionsgebühren.' },
      { q: 'Kann ich das Widget für Anfragen und Buchungen gleichzeitig nutzen?', a: 'Ja — zweifach konfigurierbar als Buchungs- und Anfrageformular.' },
      { q: 'Was passiert nach den 14 kostenlosen Tagen?',                         a: 'Du wählst einen Plan. Kündigung jederzeit möglich — keine Mindestlaufzeit.' },
      { q: 'Wo werden meine Daten gespeichert?',                                  a: 'Auf Servern in der EU — sicher und DSGVO-konform.' },
      { q: 'Funktioniert der Sync mit Airbnb und Booking.com?',                   a: 'Ja — via Beds24 Channel Manager (separater Account nötig, kein Aufpreis von bookingwulf).' },
      { q: 'Wie migriere ich von anderen Anbietern oder Buchungsportalen?',        a: 'Der Wechsel ist unkompliziert: Apartments neu anlegen, bestehendes Widget durch das bookingwulf-Widget ersetzen, fertig. Bei Fragen begleiten wir dich persönlich durch die Umstellung.' },
      { q: 'Wer steckt hinter bookingwulf?',                                      a: 'bookingwulf ist ein Vollzeit-Projekt von Wolfgang Heis, Webentwickler aus Wien. Kein anonymes Konzern-Tool — du erreichst mich direkt unter support@bookingwulf.com.' },
    ],
  },
};



export default function HomePage() {
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('year');
  const [apartmentCount, setApartmentCount] = useState(1);
  const [revenue, setRevenue] = useState(50_000);

  const heroRef = useRef<HTMLElement>(null);
  const [heroBgY, setHeroBgY] = useState('50%');
  const [heroOpacity, setHeroOpacity] = useState(1);

  useEffect(() => {
    function onScroll() {
      const el = heroRef.current;
      if (!el) return;
      const y = window.scrollY;
      const h = el.offsetHeight;
      setHeroBgY(`calc(50% + ${Math.round(y * 0.35)}px)`);
      setHeroOpacity(Math.max(0, 1 - y / (h * 0.65)));
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useV4Animate();

  const plans       = (Object.entries(PLANS) as [string, typeof PLANS[keyof typeof PLANS]][]).filter(([k]) => k !== 'bundle_all');
  const commission  = Math.round(revenue * CONTENT.pain.commissionPct / 100);
  const bwMonthly   = calculatePlanPrice('pro', apartmentCount, 'year');
  const bwYearlyCost = bwMonthly * 12;
  const saving      = commission - bwYearlyCost;

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="v4-section relative"
        aria-labelledby="hero-heading"
        style={{ background: 'var(--v4-navy)', marginTop: -64, paddingTop: 164 }}
      >
        <HeroBg />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.55) 30%, rgba(0,0,0,0.2) 60%, transparent 80%), linear-gradient(to right, rgba(0,0,0,0.5) 0%, transparent 50%)' }} aria-hidden />
        <div className="v4-container relative z-10 flex flex-col justify-end" style={{ opacity: heroOpacity, willChange: 'opacity', minHeight: 520 }}>
          <div className="v4-animate" style={{ marginBottom: 16 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.85)',
              background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.18)',
              borderRadius: 999, padding: '5px 12px',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#50DDFF', display: 'inline-block', flexShrink: 0 }} />
              {CONTENT.hero.badge}
            </span>
          </div>
          <h1
            id="hero-heading"
            className="v4-animate text-white"
            style={{ fontSize: 'clamp(40px, 7vw, 72px)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.03em', margin: 0 }}
          >
            Direktbuchungen<br />für deine Unterkunft.<br />
            <span style={{ color: '#50DDFF' }}>{CONTENT.hero.h1c}</span>
          </h1>
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
              className="v4-text-body" style={{ fontSize: 18, fontWeight: 400, lineHeight: 1.7, margin: 0 }}
            >
              bookingwulf ist das österreichische Buchungswidget für Pensionen, Hotels und Apartments.
              Kein Buchungsportal, <span className="v4-text-green font-semibold">keine Provision</span> — deine Gäste buchen{' '}
              <span className="v4-text-green font-semibold">direkt</span> über{' '}
              <span className="v4-text-green font-semibold">deine Website</span>.
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
            <p className="text-[17px] leading-[1.65] max-w-xl mx-auto v4-animate v4-d2 v4-text-body">{CONTENT.features.sub}</p>
          </div>

          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 list-none m-0 p-0" role="list">
            {CONTENT.features.items.map((f, i) => {
              const Icon = f.icon;
              if (i === 0) return (
                <li key={f.title} className="v4-animate v4-d1 sm:col-span-2 lg:col-span-3">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-center" style={{ gap: 8 }}>
                    <div className="v4-card group" style={{ background: '#24314D', borderColor: 'rgba(255,255,255,0.1)', maxWidth: 520 }}>
                      <div className="p-8">
                        <div className="flex flex-col sm:flex-row gap-7 items-start">
                          <div className="shrink-0 w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: 'rgba(16,139,169,0.2)' }}>
                            <Icon size={28} strokeWidth={1.75} className="v4-icon-hover v4-text-green" aria-hidden />
                          </div>
                          <div>
                            <span className="v4-eyebrow" style={{ marginBottom: 8 }}>Highlight</span>
                            <h3 className="text-[19px] font-bold mb-1 text-white">{f.title}</h3>
                            <p className="text-[15px] font-normal mb-3 v4-text-green">Keine separate Gäste-App nötig.</p>
                            <p className="text-[15px] leading-[1.65] max-w-xl" style={{ color: 'rgba(255,255,255,0.85)' }}>{f.desc}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-center px-6 pb-10 lg:hidden">
                        <GaesteLoungeMockup />
                      </div>
                    </div>
                    <div className="hidden lg:flex items-center shrink-0">
                      <GaesteLoungeMockup />
                    </div>
                  </div>
                </li>
              );
              return (
                <li key={f.title} className={`v4-card v4-animate v4-d${(i % 3) + 1} p-6 group`}>
                  <div className="mb-4">
                    <Icon size={24} strokeWidth={1.75} className="v4-icon-hover v4-text-green" aria-hidden />
                  </div>
                  <h3 className="text-[17px] font-semibold mb-2 v4-text-navy">{f.title}</h3>
                  <p className="text-[15px] leading-[1.65] v4-text-body">{f.desc}</p>
                </li>
              );
            })}
          </ul>

          <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 v4-animate">
            <Link href="/features" className="font-semibold hover:underline underline-offset-4 v4-text-navy" style={{ fontSize: 15 }}>.. alle Features ansehen →</Link>
            <span className="flex items-center gap-1.5" style={{ fontSize: 14, color: '#475569' }}>
              🇪🇺 DSGVO-konform · Server in Amsterdam
            </span>
          </div>
        </div>
      </section>

      {/* ── ChatDemo ─────────────────────────────────────────────── */}
      <section className="v4-section bg-white" aria-labelledby="chatdemo-heading">
        <div className="v4-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="v4-eyebrow v4-animate">Gäste-Assistent</span>
              <h2 id="chatdemo-heading" className="v4-h2 mb-4 v4-animate v4-d1">Dein KI-Assistent auf der Website - rund um die Uhr</h2>
              <p className="text-[17px] leading-[1.65] v4-text-body mb-8 v4-animate v4-d2">
                Gäste fragen, der Assistent antwortet - empfiehlt das passende Apartment, erklärt Extras und erstellt am Ende den vorausgefüllten Buchungslink. Ohne Wartezeit, ohne Aufwand für dich.
              </p>
              <ul className="flex flex-col gap-3 list-none m-0 p-0 v4-animate v4-d3">
                {[
                  'Verfügbarkeit & Preise in Echtzeit',
                  'Empfiehlt passend zu Familie, Paar, Haustier, Budget …',
                  'Buchungslink direkt im Chat - vorausgefüllt',
                  'Einbindung per Script-Tag, eine Minute Setup',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[15px] v4-text-body">
                    <span style={{ color: '#108ba9', fontWeight: 700, fontSize: 16, lineHeight: 1.4, flexShrink: 0 }}>✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="v4-animate v4-d2 flex justify-center">
              <ChatDemo />
            </div>
          </div>
        </div>
      </section>

      {/* ── Provisions-Rechner ───────────────────────────────────── */}
      <section className="v4-section v4-angled" style={{ background: 'radial-gradient(ellipse 80% 55% at 10% 0%, rgba(16,139,169,0.30) 0%, transparent 60%), radial-gradient(ellipse 60% 45% at 90% 100%, rgba(16,139,169,0.20) 0%, transparent 60%), var(--v4-navy)', paddingTop: 152, paddingBottom: 152 }} aria-labelledby="pain-heading">
        <div className="v4-container text-center">
          <span className="v4-eyebrow v4-animate">{CONTENT.pain.label}</span>
          <h2 id="pain-heading" className="v4-h2 mb-4 v4-animate v4-d1" style={{ color: '#fff' }}>
            {CONTENT.pain.h2}
          </h2>
          <p className="text-[17px] leading-[1.65] max-w-xl mx-auto mb-16 v4-animate v4-d2 v4-text-white-soft">
            {CONTENT.pain.sub}
          </p>

          <div className="v4-animate v4-d2 v4-card-dark max-w-xl mx-auto mb-10 p-6 bg-white/12">
            <label htmlFor="revenue-slider" className="block text-sm font-semibold mb-1" style={{ color: '#cbd5e1' }}>
              Dein Jahresumsatz über OTA-Portale
            </label>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[32px] font-extrabold text-white tracking-tight">
                € {revenue.toLocaleString('de-DE')}
              </span>
              <span className="text-xs v4-text-muted">pro Jahr</span>
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
              { label: 'OTA-Provision*', value: `−€ ${commission.toLocaleString('de-DE')}/Jahr`, note: 'Was die Portale jährlich einbehalten',    tone: 'negative' as const },
              { label: 'bookingwulf Pro',                               value: `€ ${bwYearlyCost.toLocaleString('de-DE')}/Jahr`, note: `€ ${bwMonthly}/Monat · jederzeit kündbar`, tone: 'neutral'  as const },
              { label: 'Deine Ersparnis',                               value: saving > 0 ? `€ ${saving.toLocaleString('de-DE')}/Jahr` : 'Noch kein Vorteil', note: saving > 0 ? 'Steigt mit deinem Umsatz' : 'Ab ~€ 8k Umsatz lohnt sich bookingwulf', tone: 'positive' as const },
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
          <p className="text-xs mt-5" style={{ color: '#64748b' }}>*Provision-Annahme: {CONTENT.pain.commissionPct}% (Branchen-Durchschnitt Booking.com). Tatsächliche Einsparungen variieren.</p>
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
                    <h3 className="text-[17px] font-semibold mb-1 v4-text-navy">{s.title}</h3>
                    <p className="text-[15px] leading-[1.65] v4-text-body">{s.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="v4-animate v4-card p-8 flex flex-col gap-6">
              <p className="text-2xl font-bold tracking-tight v4-text-navy">Jetzt starten</p>
              <p className="text-[17px] leading-[1.65] v4-text-body">14 Tage kostenlos — keine Kreditkarte, keine Mindestlaufzeit.</p>
              <Link href="/register" className="v4-btn v4-btn-primary self-start">Jetzt starten</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────── */}
      <section id="pricing" className="v4-section v4-grain v4-angled" style={{ background: 'radial-gradient(ellipse 80% 55% at 10% 0%, rgba(16,139,169,0.30) 0%, transparent 60%), radial-gradient(ellipse 60% 45% at 90% 100%, rgba(16,139,169,0.20) 0%, transparent 60%), var(--v4-navy)', paddingTop: 152, paddingBottom: 152 }} aria-labelledby="pricing-heading">
        <div className="v4-container">
          <div className="mb-16 text-center">
            <span className="v4-eyebrow v4-animate">Preise</span>
            <h2 id="pricing-heading" className="v4-h2 mb-3 v4-animate v4-d1" style={{ color: '#fff' }}>Der richtige Plan für deinen Betrieb</h2>
            <p className="text-[17px] leading-[1.65] v4-animate v4-d2 max-w-xl mx-auto v4-text-muted">Keine Provision. Keine versteckten Kosten. Jederzeit kündbar.</p>
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
              <span className="ml-1.5 px-2 py-0.5 rounded-md text-xs font-bold transition-opacity" style={{ background: 'rgba(16,139,169,0.25)', color: 'var(--v4-green-border)', opacity: billingInterval === 'year' ? 1 : 0 }}>10% sparen</span>
            </span>
          </div>

          <div className="flex items-center justify-center gap-4 mb-10 v4-animate">
            <span className="text-sm font-medium" style={{ color: 'var(--v4-muted)' }}>Anzahl Apartments</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setApartmentCount((v) => Math.max(1, v - 1))}
                aria-label="Weniger Apartments"
                className="w-8 h-8 rounded-full shrink-0"
                style={{ border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#fff', fontSize: 18, cursor: 'pointer', lineHeight: 1 }}
              >−</button>
              <span className="text-lg font-bold" style={{ color: '#fff', minWidth: 24, textAlign: 'center' }}>{apartmentCount}</span>
              <button
                onClick={() => setApartmentCount((v) => v + 1)}
                aria-label="Mehr Apartments"
                className="w-8 h-8 rounded-full shrink-0"
                style={{ border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#fff', fontSize: 18, cursor: 'pointer', lineHeight: 1 }}
              >+</button>
            </div>
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
                  € {calculatePlanPrice(key as keyof typeof PLANS, apartmentCount, billingInterval)}
                  <span className="text-base font-normal v4-text-muted"> / Mo</span>
                </div>
                <div className="text-xs mb-2" style={{ color: key === 'pro' ? 'var(--v4-body)' : '#94a3b8' }}>
                  inkl. 1 Apartment, +{billingInterval === 'year' ? plan.apartmentFeeYearly : plan.apartmentFeeMonthly}€ je weiterem
                </div>
                <ul className="flex flex-col gap-2.5 mb-6 list-none m-0 p-0">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-2 items-start text-[15px]">
                      <Check size={14} strokeWidth={2.5} className="mt-0.5 shrink-0 v4-text-green" aria-hidden />
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
            <Link href="/preise" className="text-sm font-semibold hover:underline underline-offset-4 v4-text-muted">Alle Details zu den Preisen →</Link>
          </div>
          <div className="mt-12 v4-animate">
            <div style={{ height: 1, background: 'rgba(255,255,255,0.12)', marginBottom: 32 }} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <BridgeSection />
              {/* Website-Bundle Card */}
              <div className="flex flex-col sm:flex-row overflow-hidden h-full" style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.12)', borderRadius: 'var(--v4-radius-card)' }}>
                <div className="flex-1 p-7">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-2.5 py-1 mb-3" style={{ background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' }}>
                    🌐 Noch keine Website?
                  </span>
                  <h3 className="text-[17px] font-semibold mb-2" style={{ color: 'var(--v4-navy)' }}>
                    Individuelle Website — mit Abo-Rabatt.
                  </h3>
                  <p className="text-[15px] mb-4" style={{ color: 'var(--v4-body)', lineHeight: 1.6 }}>
                    Zum bookingwulf-Abo gibt es eine individuell gestaltete Hotel-Website — speziell für deine Unterkunft, mit bookingwulf-Widget bereits eingebaut.
                  </p>
                  <ul className="flex flex-col gap-2.5 list-none m-0 p-0">
                    {[
                      'Individuell gestaltet — nicht von der Stange',
                      'bookingwulf-Widget bereits eingebaut',
                      'SEO-Basics inklusive',
                    ].map((t) => (
                      <li key={t} className="flex gap-2 items-start text-[15px]">
                        <span className="mt-0.5 shrink-0 font-bold v4-text-green">✓</span>
                        <span style={{ color: 'var(--v4-body)' }}>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-col items-center justify-center gap-1 p-7 text-center border-t sm:border-t-0 sm:border-l" style={{ borderColor: 'rgba(0,0,0,0.10)' }}>
                  <span className="text-xs font-medium" style={{ color: 'var(--v4-body)' }}>ab</span>
                  <div className="text-[40px] font-extrabold tracking-tight" style={{ color: 'var(--v4-navy)', lineHeight: 1 }}>
                    €900<span className="text-base font-normal v4-text-muted"> einmalig</span>
                  </div>
                  <p className="text-xs mt-1 mb-4" style={{ lineHeight: 1.5, color: 'var(--v4-body)' }}>
                    Nur ab<br />bookingwulf Pro.<br />Statt ab € 2.200.
                  </p>
                  <Link
                    href="/website-bundle"
                    className="text-[13px] font-semibold px-5 py-2.5 rounded-[10px] whitespace-nowrap transition-all duration-200"
                    style={{ border: '1.5px solid var(--v4-navy)', background: '#fff', color: 'var(--v4-navy)', display: 'inline-block', textDecoration: 'none' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'var(--v4-green)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--v4-green)'; (e.currentTarget as HTMLAnchorElement).style.color = '#fff'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#fff'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--v4-navy)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--v4-navy)'; }}
                  >
                    Mehr erfahren ↗
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <section className="v4-section bg-white" aria-labelledby="faq-heading">
        <div className="v4-container">
          <div className="text-center mb-16">
            <span className="v4-eyebrow v4-animate">FAQ</span>
            <h2 id="faq-heading" className="v4-h2 mb-3 v4-animate v4-d1">{CONTENT.faq.h2}</h2>
            <p className="text-[15px] v4-animate v4-d2 v4-text-body">
              Weitere Fragen? <a href="mailto:support@bookingwulf.com" className="font-semibold hover:underline underline-offset-2 v4-text-navy">support@bookingwulf.com</a>
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
            <h2 id="founder-heading" className="v4-h2 v4-animate v4-d1">Kein Konzern. Menschen aus Österreich.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <FlipCard
              initials="WH"
              name="Wolfgang Heis, MSc"
              subtitle="Gründer, Designer & Entwickler"
              photo="/team/profilbild-wolfgang-heis.avif"
              text="Seit über 15 Jahren gestalte und entwickle ich Webanwendungen — weil gute UX/UI und reibungslose Funktionalität für mich nie getrennte Disziplinen waren. bookingwulf ist mein Vollzeit-Projekt: gebaut, weil ich gesehen habe, wie viel Geld kleine Unterkünfte unnötig an Buchungsportale abgeben. Bei anderen Anbietern erreichst du einen anonymen Support. Bei bookingwulf erreichst du mich direkt."
              linkLabel="wulius.at"
              linkHref="https://wulius.at/"
            />
            <FlipCard
              initials="SM"
              name="Sebastian Mercz, MSc"
              subtitle="Vermieter & Branchenkenner"
              photo="/team/profilbild-sebastian-mercz.avif"
              bgSize="130%"
              bgPosition="center 35%"
              text="Sebastian verwaltet seit über 10 Jahren Apartments in Wien — mit einer Reviewrate von 4,74 auf Airbnb, 8,5 auf Booking.com und über 1.500 Bewertungen. Er kennt den Alltag eines Vermieters von innen: was funktioniert, was nervt, und wo Tools wie bookingwulf den Unterschied machen. Als aktiver Vermieter begleitet er die Produktentwicklung von bookingwulf — damit das System nicht am Schreibtisch entsteht, sondern in der Praxis."
              linkLabel="msq-vienna.com"
              linkHref="https://msq-vienna.com/"
            />
            <FlipCard
              initials="DP"
              name="Mag. David Paci"
              subtitle="Web-Entwickler & Technologieberater"
              photo="/team/profilbild-david-paci.webp"
              text="David bringt fast drei Jahrzehnte Erfahrung mit — vom E-Commerce-Aufbau bei der Media-Saturn Gruppe bis hin zu komplexen Online-Auftritten im Modulhausbereich. Er begleitet bookingwulf von Anfang an technisch: mit Code-Reviews, Architektur-Feedback und dem Blick eines Entwicklers, der weiß, was in der Praxis funktioniert — und was nicht."
              linkLabel="webse.at"
              linkHref="https://www.webse.at/"
            />
          </div>
          <div className="text-center mt-8">
            <a
              href="mailto:support@bookingwulf.com"
              className="inline-flex items-center gap-1.5 text-sm font-semibold hover:underline underline-offset-4 v4-text-navy"
            >
              support@bookingwulf.com →
            </a>
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
            <p className="text-[17px] mb-8 v4-text-white-soft">14 Tage kostenlos testen — keine Kreditkarte erforderlich.</p>
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
  const [pos, setPos] = useState(0);
  const [lastDir, setLastDir] = useState<1 | -1>(1);
  const [dragDelta, setDragDelta] = useState(0);
  const [dragging, setDragging] = useState(false);
  const pointerStartX = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const TOTAL = 5;

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => { setPos((p) => p + 1); setLastDir(1); }, 2600);
  };

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const cur = ((pos % TOTAL) + TOTAL) % TOTAL;

  const onPointerStart = (x: number) => { pointerStartX.current = x; setDragging(true); };
  const onPointerMove  = (x: number) => { if (pointerStartX.current !== null) setDragDelta(x - pointerStartX.current); };
  const onPointerEnd   = (x: number) => {
    if (pointerStartX.current === null) return;
    const dx = x - pointerStartX.current;
    if (Math.abs(dx) > 40) { const d = dx < 0 ? 1 : -1; setPos((p) => p + d); setLastDir(d); resetTimer(); }
    setDragDelta(0); setDragging(false); pointerStartX.current = null;
  };
  const onPointerCancel = () => { setDragDelta(0); setDragging(false); pointerStartX.current = null; };

  const phoneScreens = [
    <PhoneScreen1 key="s1" />,
    <PhoneScreen2 key="s2" />,
    <PhoneScreen3 key="s3" />,
    <PhoneScreen4 key="s4" />,
    <PhoneScreen5 key="s5" />,
  ];

  return (
    <div
      style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px 48px', cursor: dragging ? 'grabbing' : 'grab', userSelect: 'none' }}
      onTouchStart={(e) => onPointerStart(e.touches[0].clientX)}
      onTouchMove={(e) => onPointerMove(e.touches[0].clientX)}
      onTouchEnd={(e) => onPointerEnd(e.changedTouches[0].clientX)}
      onMouseDown={(e) => onPointerStart(e.clientX)}
      onMouseMove={(e) => onPointerMove(e.clientX)}
      onMouseUp={(e) => onPointerEnd(e.clientX)}
      onMouseLeave={onPointerCancel}
    >
      {/* Radial glow */}
      <div style={{ position: 'absolute', width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,139,169,0.13) 0%, transparent 65%)', pointerEvents: 'none' }} aria-hidden />

      <div style={{ animation: 'v4PhoneFloat 3.4s ease-in-out infinite', position: 'relative', zIndex: 10 }}>
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
            <div style={{ background: '#fff', position: 'relative', overflow: 'hidden' }}>
              {/* Status bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px 4px', fontSize: 9, fontWeight: 700, color: '#1C1C1E' }}>
                <span>9:41</span>
                <div style={{ width: 16, height: 8, border: '1.5px solid #1C1C1E', borderRadius: 2, position: 'relative', opacity: 0.6 }}>
                  <div style={{ position: 'absolute', inset: 1.5, background: '#1C1C1E', borderRadius: 1, width: '70%' }} />
                  <div style={{ position: 'absolute', right: -3.5, top: '50%', transform: 'translateY(-50%)', width: 2, height: 5, background: '#1C1C1E', borderRadius: 1, opacity: 0.45 }} />
                </div>
              </div>
              {/* Sliding screens */}
              <div style={{ height: 362, overflow: 'hidden', position: 'relative' }}>
                {phoneScreens.map((sc, i) => {
                  let r = i - cur;
                  if (r > 2) r -= TOTAL;
                  if (r < -2) r += TOTAL;
                  if (Math.abs(r) > 1) return null;
                  const animate = lastDir === 1 ? r === 0 || r === -1 : r === 0 || r === 1;
                  return (
                    <div key={i} style={{
                      position: 'absolute', top: 0, left: 0, width: '100%',
                      transform: `translateX(calc(${r * 100}% + ${dragDelta}px))`,
                      transition: (dragging || !animate) ? 'none' : 'transform 0.38s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    }}>
                      {sc}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
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
          <div style={{ fontSize: 8, fontWeight: 700, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>🔑 Dein Zugangscode</div>
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
                Herzlich willkommen! Deine Anreise am 15. Juni ist bestätigt.
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
            <p style={{ fontSize: 9, color: '#6b7280', lineHeight: 1.55 }}>Wenn du zur Abreise bereit bist, informiere das Team mit einem Klick.</p>
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
        <span className="text-[15px] font-semibold leading-snug transition-opacity group-hover:opacity-70 v4-text-navy">{question}</span>
        <Plus size={20} className="shrink-0 transition-transform duration-200" style={{ color: 'var(--v4-muted)', transform: open ? 'rotate(45deg)' : 'none' }} aria-hidden />
      </button>
      <div id={id} role="region" aria-label={question} className={`v4-faq-body ${open ? 'open' : ''}`}>
        <p className="pb-5 text-[15px] leading-[1.65] v4-text-body">{answer}</p>
      </div>
    </div>
  );
}
