'use client';

import { useEffect, useRef, useState } from 'react';

const ACCENT = '#108ba9';
const ACCENT_DARK = '#0e7d99';

type BubbleMsg = { kind: 'bubble'; role: 'guest' | 'bot'; text: string };
type CardsMsg  = { kind: 'cards' };
type ButtonMsg = { kind: 'button' };
type Step = { show: BubbleMsg | CardsMsg | ButtonMsg; delayAfter: number } & (
  | { typing: false }
  | { typing: true; typingMs: number }
);

const STEPS: Step[] = [
  {
    show: { kind: 'bubble', role: 'guest', text: 'Hallo, habt ihr noch was frei vom 14. bis 18. August? Wir sind 2 Erwachsene und 1 Kind (6 Jahre).' },
    typing: false,
    delayAfter: 1000,
  },
  {
    show: { kind: 'bubble', role: 'bot', text: 'Hallo! Ja, für diesen Zeitraum haben wir noch zwei Apartments frei:' },
    typing: true,
    typingMs: 2200,
    delayAfter: 500,
  },
  {
    show: { kind: 'cards' },
    typing: false,
    delayAfter: 1400,
  },
  {
    show: { kind: 'bubble', role: 'guest', text: 'Der Bergblick klingt super. Gibt es einen Kinderspielplatz?' },
    typing: false,
    delayAfter: 1000,
  },
  {
    show: { kind: 'bubble', role: 'bot', text: 'Ja! Direkt auf dem Gelände gibt es einen Spielplatz, außerdem einen Streichelzoo 5 Minuten zu Fuß. Frühstück ist inklusive — Kinder unter 7 Jahren kostenlos.' },
    typing: true,
    typingMs: 2600,
    delayAfter: 1000,
  },
  {
    show: { kind: 'bubble', role: 'guest', text: 'Perfekt, dann nehmen wir den Bergblick. Wie buche ich?' },
    typing: false,
    delayAfter: 1000,
  },
  {
    show: { kind: 'bubble', role: 'bot', text: 'Sehr gerne! Hier ist euer Buchungslink, alles ist schon vorausgefüllt:' },
    typing: true,
    typingMs: 2000,
    delayAfter: 600,
  },
  {
    show: { kind: 'button' },
    typing: false,
    delayAfter: 4000,
  },
];

type Visible =
  | { kind: 'bubble'; role: 'guest' | 'bot'; text: string; id: number }
  | { kind: 'cards'; id: number }
  | { kind: 'button'; id: number }
  | { kind: 'typing'; id: number };

export default function ChatDemo() {
  const [visible, setVisible] = useState<Visible[]>([]);
  const runningRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const idRef = useRef(0);

  function clearAll() {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }

  function schedule(fn: () => void, ms: number) {
    const t = setTimeout(fn, ms);
    timeoutsRef.current.push(t);
  }

  function runSequence() {
    clearAll();
    runningRef.current = true;
    setVisible([]);

    function next(stepIdx: number) {
      if (stepIdx >= STEPS.length) {
        schedule(() => {
          runningRef.current = false;
          setVisible([]);
          schedule(runSequence, 800);
        }, 4000);
        return;
      }

      const step = STEPS[stepIdx];
      const id = ++idRef.current;

      if (step.typing) {
        // show typing indicator
        setVisible(prev => [...prev, { kind: 'typing', id }]);
        scrollBottom();

        schedule(() => {
          // replace typing with actual bubble
          setVisible(prev => {
            const without = prev.filter(v => v.id !== id);
            return [...without, { kind: step.show.kind as 'bubble', role: (step.show as BubbleMsg).role, text: (step.show as BubbleMsg).text, id }];
          });
          scrollBottom();
          schedule(() => next(stepIdx + 1), step.delayAfter);
        }, step.typingMs);
      } else {
        setVisible(prev => [...prev, { ...step.show, id } as Visible]);
        scrollBottom();
        schedule(() => next(stepIdx + 1), step.delayAfter);
      }
    }

    schedule(() => next(0), 400);
  }

  function scrollBottom() {
    setTimeout(() => {
      const el = messagesRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    }, 50);
  }

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !runningRef.current) {
          runSequence();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => { observer.disconnect(); clearAll(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => clearAll(), []);

  return (
    <div ref={containerRef} style={{ display: 'flex', justifyContent: 'center' }}>
      {/* Widget shell */}
      <div style={{
        width: 340, height: 520,
        borderRadius: 20,
        boxShadow: '0 8px 40px rgba(0,0,0,0.13)',
        border: '1px solid #e2e8f0',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
        background: '#fff',
      }}>

        {/* Header */}
        <div style={{ background: ACCENT, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
            A
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
              Anna
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', display: 'inline-block', flexShrink: 0 }} />
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 1 }}>Pension Alpenblick</div>
          </div>
        </div>

        {/* Messages */}
        <div ref={messagesRef} style={{ flex: 1, overflowY: 'auto', padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: 8, scrollBehavior: 'smooth' }}>
          {visible.map((item) => {
            if (item.kind === 'typing') return (
              <div key={item.id} style={{ display: 'flex', gap: 6, alignItems: 'center', alignSelf: 'flex-start', background: '#f1f5f9', borderRadius: 14, borderBottomLeftRadius: 4, padding: '10px 14px' }}>
                {[0, 0.2, 0.4].map((delay, i) => (
                  <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#94a3b8', display: 'inline-block', animation: `bwBounce 1.2s ${delay}s infinite` }} />
                ))}
              </div>
            );

            if (item.kind === 'bubble') return (
              <div
                key={item.id}
                style={{
                  maxWidth: '82%',
                  alignSelf: item.role === 'guest' ? 'flex-end' : 'flex-start',
                  background: item.role === 'guest' ? ACCENT : '#f1f5f9',
                  color: item.role === 'guest' ? '#fff' : '#1e293b',
                  borderRadius: 14,
                  borderBottomRightRadius: item.role === 'guest' ? 4 : 14,
                  borderBottomLeftRadius: item.role === 'bot' ? 4 : 14,
                  padding: '9px 13px',
                  fontSize: 13,
                  lineHeight: 1.5,
                  animation: 'bwFadeUp 0.25s ease',
                }}
              >
                {item.text}
              </div>
            );

            if (item.kind === 'cards') return (
              <div key={item.id} style={{ alignSelf: 'flex-start', display: 'flex', flexDirection: 'column', gap: 7, width: '100%', animation: 'bwFadeUp 0.3s ease' }}>
                {[
                  { name: 'Bergblick', beds: '2 Schlafzimmer', size: '65m²', price: '148', badge: '⭐ Familientipp' },
                  { name: 'Gartenblick', beds: '1 SZ + Schlafsofa', size: '48m²', price: '112', badge: null },
                ].map((apt) => (
                  <div key={apt.name} style={{ background: '#fff', border: `1.5px solid ${apt.badge ? ACCENT : '#e2e8f0'}`, borderRadius: 10, padding: '9px 11px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6 }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#172442' }}>{apt.name}</div>
                        <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{apt.beds} · {apt.size}</div>
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: ACCENT, whiteSpace: 'nowrap' }}>ab €{apt.price}/Nacht</div>
                    </div>
                    {apt.badge && (
                      <div style={{ marginTop: 5, display: 'inline-block', fontSize: 10, fontWeight: 600, background: '#e4f4f8', color: ACCENT_DARK, borderRadius: 4, padding: '2px 6px' }}>
                        {apt.badge}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            );

            if (item.kind === 'button') return (
              <div key={item.id} style={{ alignSelf: 'stretch', animation: 'bwFadeUp 0.3s ease' }}>
                <div style={{
                  display: 'block', width: '100%', padding: '11px 16px',
                  background: ACCENT, color: '#fff',
                  borderRadius: 10, fontSize: 13, fontWeight: 700,
                  textAlign: 'center', cursor: 'default',
                  animation: 'bwPulse 2.5s ease-in-out infinite',
                }}>
                  Jetzt verbindlich buchen →
                </div>
              </div>
            );

            return null;
          })}
        </div>

        {/* Input (disabled demo hint) */}
        <div style={{ padding: '10px 12px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
          <div style={{ flex: 1, padding: '8px 12px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 12, color: '#94a3b8', background: '#f8fafc', userSelect: 'none' }}>
            Demo-Modus
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bwBounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }
        @keyframes bwFadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes bwPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(16,139,169,0.3); }
          50%       { box-shadow: 0 0 0 7px rgba(16,139,169,0); }
        }
      `}</style>
    </div>
  );
}
