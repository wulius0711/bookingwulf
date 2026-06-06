'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { LockOpen, Lock, CheckCircle2, Download, DoorOpen } from 'lucide-react';
import type { Theme } from './FeatureGrid';

type VisualProps = { isHovered: boolean; theme: Theme };

// ── NukiVisual ─────────────────────────────────────────────────────────────

export function NukiVisual({ isHovered, theme }: VisualProps) {
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    if (isHovered) {
      const t = setTimeout(() => setLocked(true), 300);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => setLocked(false), 200);
      return () => clearTimeout(t);
    }
  }, [isHovered]);

  return (
    <div className="flex flex-col items-center justify-center h-full gap-5 py-6">
      <AnimatePresence mode="wait">
        {locked ? (
          <motion.div
            key="locked"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ color: theme.accent }}
          >
            <Lock size={52} strokeWidth={1.5} />
          </motion.div>
        ) : (
          <motion.div
            key="unlocked"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ color: theme.muted }}
          >
            <LockOpen size={52} strokeWidth={1.5} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {locked && (
          <motion.div
            className="flex gap-2"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
          >
            {['4', '7', '2', '8'].map((digit, i) => (
              <motion.span
                key={i}
                variants={{ hidden: { opacity: 0, y: 6 }, visible: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.2 }}
                className="w-9 h-10 flex items-center justify-center rounded-lg font-mono text-lg font-bold"
                style={{
                  background: theme.accentLight,
                  border: `1px solid ${theme.accentBorder}`,
                  color: theme.accent,
                }}
              >
                {digit}
              </motion.span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── GuestLoungeVisual ──────────────────────────────────────────────────────

const loungeCards = [
  { text: '#1042 · 24.–27. Juli', badge: 'Bestätigt', icon: null },
  { text: 'Rechnung · €247,00',   badge: null, icon: <Download size={14} /> },
  { text: 'Check-in · 15:00 Uhr', badge: null, icon: <DoorOpen size={14} /> },
];

export function GuestLoungeVisual({ isHovered, theme }: VisualProps) {
  return (
    <div className="flex flex-col gap-2 p-4 h-full justify-center">
      <div
        className="rounded-lg px-3 py-1.5 font-mono text-xs mb-1 truncate"
        style={{ background: theme.accentLight, color: theme.muted }}
      >
        gaeste.meinpension.at/g/a7f3k
      </div>

      <motion.div
        className="flex flex-col gap-2"
        animate={isHovered ? 'visible' : 'hidden'}
        initial="hidden"
        variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
      >
        {loungeCards.map((card, i) => (
          <motion.div
            key={i}
            variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm"
            style={{ background: theme.accentLight, border: `1px solid ${theme.accentBorder}` }}
          >
            <span style={{ color: theme.title, fontWeight: 500 }}>{card.text}</span>
            {card.badge && (
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ background: theme.accent, color: '#fff' }}
              >
                {card.badge}
              </span>
            )}
            {card.icon && (
              <span style={{ color: theme.muted }}>{card.icon}</span>
            )}
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

// ── ChatbotVisual ──────────────────────────────────────────────────────────

const chatMessages = [
  { role: 'guest', text: 'Gibt es noch freie Zimmer für den 24. Juli?', lang: 'DE' },
  { role: 'bot',   text: 'Ja! Das Doppelzimmer Bergblick ist verfügbar.', lang: 'DE' },
  { role: 'guest', text: 'Perfect, 3 nights please.', lang: 'EN' },
];

export function ChatbotVisual({ isHovered, theme }: VisualProps) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [showTyping, setShowTyping] = useState(false);

  useEffect(() => {
    if (!isHovered) {
      const t = setTimeout(() => setVisibleCount(0), 400);
      return () => clearTimeout(t);
    }

    setVisibleCount(1);
    let current = 1;

    const advance = () => {
      if (current >= chatMessages.length) return;
      const next = chatMessages[current];
      if (next.role === 'bot') {
        setShowTyping(true);
        setTimeout(() => {
          setShowTyping(false);
          current++;
          setVisibleCount(current);
          setTimeout(advance, 1200);
        }, 600);
      } else {
        current++;
        setVisibleCount(current);
        setTimeout(advance, 1200);
      }
    };

    const t = setTimeout(advance, 1200);
    return () => clearTimeout(t);
  }, [isHovered]);

  return (
    <div className="flex flex-col gap-2 p-4 h-full justify-end">
      <AnimatePresence mode="popLayout">
        {chatMessages.slice(0, visibleCount).map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
            className={`flex gap-2 items-end ${msg.role === 'guest' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className="rounded-2xl px-3 py-2 text-sm max-w-[80%]"
              style={{
                background: msg.role === 'bot' ? theme.accentLight : theme.accent,
                color: msg.role === 'bot' ? theme.title : '#fff',
                borderBottomLeftRadius: msg.role === 'bot' ? 4 : undefined,
                borderBottomRightRadius: msg.role === 'guest' ? 4 : undefined,
              }}
            >
              {msg.text}
            </div>
            <span className="font-mono text-[10px] pb-1" style={{ color: theme.muted }}>
              {msg.lang}
            </span>
          </motion.div>
        ))}

        {showTyping && (
          <motion.div
            key="typing"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex gap-1 px-3 py-2.5 rounded-2xl w-fit"
            style={{ background: theme.accentLight, borderBottomLeftRadius: 4 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="w-1.5 h-1.5 rounded-full block"
                style={{ background: theme.accent }}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── DynamicPricingVisual ───────────────────────────────────────────────────

const priceRules = [
  { label: 'Hochsaison',    badge: '+20%' },
  { label: 'Wochenende',    badge: '+15%' },
  { label: 'Langaufenthalt', badge: '−10%' },
];

export function DynamicPricingVisual({ isHovered, theme }: VisualProps) {
  const price = useMotionValue(89);
  const spring = useSpring(price, { stiffness: 80, damping: 20 });
  const rounded = useTransform(spring, (v) => Math.round(v));

  useEffect(() => {
    price.set(isHovered ? 107 : 89);
  }, [isHovered, price]);

  return (
    <div className="flex flex-col justify-center h-full px-5 py-4 gap-4">
      <div className="flex items-end gap-1">
        <span className="text-xs font-mono" style={{ color: theme.muted }}>€</span>
        <motion.span className="text-5xl font-bold leading-none" style={{ color: theme.title }}>
          {rounded}
        </motion.span>
        <span className="text-xs pb-1" style={{ color: theme.muted }}>/Nacht</span>
      </div>

      <div className="flex flex-col gap-1.5">
        {priceRules.map((rule) => (
          <div
            key={rule.label}
            className="flex items-center justify-between rounded-lg px-3 py-2 text-sm"
            style={{ background: theme.accentLight, border: `1px solid ${theme.accentBorder}` }}
          >
            <span style={{ color: theme.title, fontWeight: 500 }}>{rule.label}</span>
            <span className="text-xs font-semibold font-mono" style={{ color: theme.accent }}>
              {rule.badge}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── BookingWidgetVisual ────────────────────────────────────────────────────

const calendarDays = Array.from({ length: 35 }, (_, i) => i);
const highlightedDay = 17;

function CalendarScreen({ theme }: { theme: Theme }) {
  return (
    <div className="flex flex-col gap-3 px-5 py-4">
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((i) => (
          <div
            key={i}
            className="aspect-square rounded-md"
            style={{
              background: i === highlightedDay
                ? theme.accent
                : theme.accentLight,
              opacity: i < 5 || i > 30 ? 0.35 : 1,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function FormScreen({ theme }: { theme: Theme }) {
  return (
    <div className="flex flex-col gap-2.5 px-5 py-4">
      {['Name', 'Datum', 'Personen'].map((label) => (
        <div key={label} className="flex flex-col gap-1">
          <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: theme.muted }}>
            {label}
          </div>
          <div
            className="h-9 rounded-lg"
            style={{ background: theme.accentLight, border: `1px solid ${theme.accentBorder}` }}
          />
        </div>
      ))}
    </div>
  );
}

function ConfirmScreen({ theme }: { theme: Theme }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 h-full py-4">
      <CheckCircle2 size={44} strokeWidth={1.5} style={{ color: theme.accent }} />
      <span className="text-sm font-semibold" style={{ color: theme.title }}>
        Buchung bestätigt
      </span>
    </div>
  );
}

export function BookingWidgetVisual({ isHovered, theme }: VisualProps) {
  const [screenIdx, setScreenIdx] = useState(0);

  useEffect(() => {
    if (!isHovered) { setScreenIdx(0); return; }
    const interval = setInterval(() => {
      setScreenIdx((prev) => (prev + 1) % 3);
    }, 2500);
    return () => clearInterval(interval);
  }, [isHovered]);

  const screens = [
    <CalendarScreen key="cal" theme={theme} />,
    <FormScreen key="form" theme={theme} />,
    <ConfirmScreen key="confirm" theme={theme} />,
  ];

  return (
    <div
      className="mx-4 my-4 rounded-xl overflow-hidden flex flex-col h-[calc(100%-2rem)]"
      style={{ border: `1px solid ${theme.accentBorder}`, background: theme.browserBg }}
    >
      <div
        className="flex items-center gap-1.5 px-3 py-2 shrink-0"
        style={{ borderBottom: `1px solid ${theme.browserBorder}`, background: theme.browserBg }}
      >
        {['#ef4444', '#f59e0b', '#22c55e'].map((c) => (
          <span key={c} className="w-2 h-2 rounded-full" style={{ background: c }} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={screenIdx}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="flex-1"
        >
          {screens[screenIdx]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
