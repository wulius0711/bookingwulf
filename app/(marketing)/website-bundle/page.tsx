'use client';

import Link from 'next/link';
import { Check, ArrowRight, ExternalLink } from 'lucide-react';
import { useV4Animate } from '../_components/useV4Animate';

const PACKAGES = [
  {
    name: 'Website Start',
    normalPrice: 2200,
    bundlePrice: 900,
    pages: 'bis 5 Seiten',
    languages: 'einsprachig',
    features: [
      'Individuelle Website',
      'Mobil optimiert',
      'SEO-Basics',
      'bookingwulf Widget eingebaut',
      'Schnelle Ladezeiten',
      '1 Überarbeitungsrunde',
    ],
  },
  {
    name: 'Website Pro',
    normalPrice: 3000,
    bundlePrice: 1500,
    pages: '6–10 Seiten',
    languages: 'zweisprachig',
    highlight: true,
    features: [
      'Alles aus Start',
      'Erweiterte Seitenstruktur',
      'Klare Nutzerführung',
      'Zweisprachig (z.B. DE + EN)',
      'Skalierbar erweiterbar',
      '2 Überarbeitungsrunden',
    ],
  },
  {
    name: 'Website Premium',
    normalPrice: null,
    bundlePrice: null,
    pages: '11+ Seiten',
    languages: 'mehrsprachig',
    features: [
      'Alles aus Pro',
      'Strategische Konzeption',
      'Mehrsprachig',
      'Fokus auf Markenauftritt',
      'Content-Beratung',
      'Laufende Betreuung möglich',
    ],
  },
];

const STEPS = [
  { num: '1', title: 'Anfrage', desc: 'Kurze Beschreibung deiner Unterkunft, deines Stils und deiner Wünsche per E-Mail.' },
  { num: '2', title: 'Design & Abstimmung', desc: 'Ich entwerfe deine Site — du gibst Feedback, wir verfeinern gemeinsam.' },
  { num: '3', title: 'Launch', desc: 'Deine Site geht live auf deiner Domain. Das bookingwulf-Widget ist bereits eingebunden.' },
];

const INCLUDED = [
  'Individuelles Design für deine Unterkunft',
  'bookingwulf-Widget bereits fertig eingebaut',
  'Mobil optimiert für alle Geräte',
  'SEO-Basics',
  'Moderne, schnelle Technologie',
  'Übergabe auf deine Domain inklusive',
];

export default function WebsitePage() {
  useV4Animate();

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section
        className="v4-section relative"
        style={{
          background: 'var(--v4-navy)',
          marginTop: -64,
          paddingTop: 164,
          paddingBottom: 120,
          backgroundImage: 'url(/website-bundle-hero_v3.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(23,36,66,0.97) 0%, rgba(23,36,66,0.75) 40%, rgba(23,36,66,0.5) 100%)' }} aria-hidden />
        <div className="v4-container relative z-10">
          <span className="v4-eyebrow v4-animate">Website-Bundle</span>
          <h1 className="v4-animate v4-d1 text-white" style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 900, lineHeight: 1.07, letterSpacing: '-0.03em', margin: '0 0 20px' }}>
            Deine Unterkunft verdient<br />eine individuelle Website.
          </h1>
          <p className="v4-animate v4-d2 v4-text-white-soft" style={{ fontSize: 18, lineHeight: 1.7, margin: '0 0 36px', maxWidth: 580 }}>
            Individuelle Website — speziell für Hotels, Pensionen und Ferienwohnungen. Ab <strong style={{ color: '#fff' }}>€ 900</strong> mit bookingwulf-Abo.
          </p>
          <div className="v4-animate v4-d3 flex flex-wrap gap-3">
            <a href="mailto:support@bookingwulf.com?subject=Website-Anfrage" className="v4-btn v4-btn-primary">
              Anfrage stellen <ArrowRight size={16} style={{ marginLeft: 6 }} aria-hidden />
            </a>
            <Link href="#pakete" className="v4-btn v4-btn-ghost-white">Pakete ansehen</Link>
          </div>
        </div>
      </section>

      {/* ── Der Unterschied ──────────────────────────────────────── */}
      <section className="v4-section bg-white" aria-labelledby="why-heading">
        <div className="v4-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="v4-eyebrow v4-animate">Der Unterschied</span>
              <h2 id="why-heading" className="v4-h2 mb-4 v4-animate v4-d1">
                Individuell gestaltet.<br />Nicht von der Stange.
              </h2>
              <p className="text-[17px] leading-[1.7] v4-text-body mb-6 v4-animate v4-d2">
                Viele Buchungssysteme bieten einen Website-Baukasten an — schnell eingerichtet, aber für alle gleich. Gäste sehen den Unterschied.
              </p>
              <p className="text-[17px] leading-[1.7] v4-text-body mb-8 v4-animate v4-d3">
                Eine bookingwulf Website entsteht individuell für deine Unterkunft — mit deiner Geschichte, deinem Stil, deiner Atmosphäre.
              </p>
              <div className="v4-animate v4-d4 flex flex-col gap-3">
                {INCLUDED.map((item) => (
                  <div key={item} className="flex items-start gap-3 text-[15px] v4-text-body">
                    <Check size={16} strokeWidth={2.5} style={{ color: 'var(--v4-green)', marginTop: 3, flexShrink: 0 }} aria-hidden />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Portfolio Card */}
            <div className="v4-animate v4-d2">
              <div className="v4-card overflow-hidden">
                <div style={{ height: 220, overflow: 'hidden', position: 'relative' }}>
                  <img
                    src="/sa-chessa-screen.jpg"
                    alt="Sa Chessa Website Screenshot"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
                  />
                </div>
                <div className="p-6">
                  <p className="text-[15px] leading-[1.65] v4-text-body mb-4">
                    Individuell gestaltete Website für Ferienwohnungen in Sardinien — persönlich, atmosphärisch, mehrsprachig.
                  </p>
                  <a
                    href="https://sa-chessa.framer.website/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[14px] font-semibold v4-text-green hover:underline underline-offset-4"
                  >
                    Live ansehen <ExternalLink size={13} aria-hidden />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pakete ───────────────────────────────────────────────── */}
      <section id="pakete" className="v4-section v4-grain v4-angled" style={{ background: 'radial-gradient(ellipse 80% 55% at 10% 0%, rgba(16,139,169,0.30) 0%, transparent 60%), radial-gradient(ellipse 60% 45% at 90% 100%, rgba(16,139,169,0.20) 0%, transparent 60%), var(--v4-navy)', paddingTop: 152, paddingBottom: 152 }} aria-labelledby="pakete-heading">
        <div className="v4-container">
          <div className="mb-16 text-center">
            <span className="v4-eyebrow v4-animate">Pakete</span>
            <h2 id="pakete-heading" className="v4-h2 mb-3 v4-animate v4-d1" style={{ color: '#fff' }}>Das richtige Paket für dein Haus</h2>
            <p className="text-[17px] leading-[1.65] v4-animate v4-d2 max-w-xl mx-auto v4-text-muted">
              Alle Preise gelten bei gleichzeitigem bookingwulf-Abo. Ohne Abo auf Anfrage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
            {PACKAGES.map((pkg, i) => (
              <div
                key={pkg.name}
                className={`v4-animate v4-d${i + 1} relative p-7`}
                style={pkg.highlight
                  ? { background: '#fff', borderRadius: 'var(--v4-radius-card)', borderTop: '3px solid var(--v4-green)', boxShadow: '0 12px 40px rgba(0,0,0,0.3)' }
                  : { background: 'rgba(255,255,255,0.06)', borderRadius: 'var(--v4-radius-card)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                {pkg.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-white text-xs font-bold whitespace-nowrap" style={{ background: 'var(--v4-green)' }}>
                    Beliebt
                  </div>
                )}

                <h3 className="text-[17px] font-semibold mb-1" style={{ color: pkg.highlight ? 'var(--v4-navy)' : '#fff' }}>{pkg.name}</h3>
                <p className="text-[13px] mb-4" style={{ color: pkg.highlight ? 'var(--v4-muted)' : 'rgba(255,255,255,0.5)' }}>{pkg.pages} · {pkg.languages}</p>

                {pkg.bundlePrice ? (
                  <div className="mb-6">
                    <div className="text-[13px] line-through mb-0.5" style={{ color: pkg.highlight ? '#94a3b8' : 'rgba(255,255,255,0.35)' }}>
                      Normalpreis € {pkg.normalPrice?.toLocaleString('de-DE')}
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-[40px] font-extrabold tracking-tight" style={{ color: pkg.highlight ? 'var(--v4-navy)' : '#fff' }}>
                        € {pkg.bundlePrice.toLocaleString('de-DE')}
                      </span>
                    </div>
                    <div className="inline-flex items-center gap-1 mt-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold" style={{ background: 'rgba(16,139,169,0.15)', color: 'var(--v4-green)' }}>
                      mit bookingwulf · € {((pkg.normalPrice ?? 0) - pkg.bundlePrice).toLocaleString('de-DE')} gespart
                    </div>
                  </div>
                ) : (
                  <div className="mb-6">
                    <div className="text-[28px] font-extrabold tracking-tight" style={{ color: '#fff' }}>Auf Anfrage</div>
                    <p className="text-[13px] mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>Preis nach Absprache</p>
                  </div>
                )}

                <ul className="flex flex-col gap-2.5 mb-6 list-none m-0 p-0">
                  {pkg.features.map((f) => (
                    <li key={f} className="flex gap-2 items-start text-[14px]">
                      <Check size={13} strokeWidth={2.5} style={{ color: 'var(--v4-green)', marginTop: 3, flexShrink: 0 }} aria-hidden />
                      <span style={{ color: pkg.highlight ? 'var(--v4-body)' : '#cbd5e1' }}>{f}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href={`mailto:support@bookingwulf.com?subject=Website-Anfrage: ${pkg.name}`}
                  className={`v4-btn w-full ${pkg.highlight ? 'v4-btn-primary' : 'v4-btn-outline-green'}`}
                >
                  Anfrage stellen
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Ablauf ───────────────────────────────────────────────── */}
      <section className="v4-section bg-white" aria-labelledby="ablauf-heading">
        <div className="v4-container" style={{ maxWidth: 760 }}>
          <div className="text-center mb-16">
            <span className="v4-eyebrow v4-animate">So läuft es ab</span>
            <h2 id="ablauf-heading" className="v4-h2 v4-animate v4-d1">In 3 Schritten zur fertigen Website</h2>
          </div>
          <ol className="flex flex-col gap-8 list-none m-0 p-0">
            {STEPS.map((s, i) => (
              <li key={s.num} className={`v4-animate v4-d${i + 1} flex gap-5 items-start group relative`}>
                {i < STEPS.length - 1 && <span className="v4-step-connector" aria-hidden />}
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shrink-0 text-white transition-all duration-200 group-hover:scale-110 group-hover:shadow-lg relative z-10"
                  style={{ background: 'var(--v4-green)' }}
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
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section
        className="v4-section text-center relative overflow-hidden"
        aria-labelledby="cta-heading"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1920&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0" style={{ background: 'rgba(0,20,40,0.78)' }} aria-hidden />
        <div className="v4-container relative z-10">
          <div className="v4-animate max-w-xl mx-auto">
            <h2 id="cta-heading" className="v4-h2 mb-4" style={{ color: '#fff' }}>Interesse?</h2>
            <p className="text-[17px] mb-3 v4-text-white-soft">Schreib mir kurz — ich melde mich innerhalb von 24 Stunden.</p>
            <p className="text-[15px] mb-8" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Kein Formular-Chaos. Direkt an{' '}
              <a href="mailto:support@bookingwulf.com" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'underline', textUnderlineOffset: 3 }}>
                support@bookingwulf.com
              </a>
            </p>
            <a
              href="mailto:support@bookingwulf.com?subject=Website-Anfrage"
              className="v4-btn v4-btn-white"
              style={{ height: 48, fontSize: 16, fontWeight: 700 }}
            >
              Jetzt anfragen
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
