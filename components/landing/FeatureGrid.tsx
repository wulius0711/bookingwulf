'use client';

import { useState } from 'react';
import { motion, MotionConfig } from 'framer-motion';
import {
  BookingWidgetVisual,
  DynamicPricingVisual,
  NukiVisual,
  ChatbotVisual,
  GuestLoungeVisual,
} from './FeatureVisuals';

export type Theme = {
  card: string;
  cardBorder: string;
  cardHoverShadow: string;
  cardDivider: string;
  title: string;
  body: string;
  accent: string;
  accentLight: string;
  accentBorder: string;
  muted: string;
  browserBg: string;
  browserBorder: string;
};

export const lightTheme: Theme = {
  card:            'var(--v4-surface)',
  cardBorder:      'var(--v4-border)',
  cardHoverShadow: '0 0 0 1px var(--v4-green-border)',
  cardDivider:     'var(--v4-border)',
  title:           'var(--v4-navy)',
  body:            'var(--v4-body)',
  accent:          'var(--v4-green)',
  accentLight:     'var(--v4-green-light)',
  accentBorder:    'var(--v4-green-border)',
  muted:           'var(--v4-muted)',
  browserBg:       'var(--v4-surface)',
  browserBorder:   'var(--v4-border)',
};

export const darkTheme: Theme = {
  card:            '#1e2d4a',
  cardBorder:      'rgba(255,255,255,0.07)',
  cardHoverShadow: '0 0 0 1px rgba(144,204,224,0.35)',
  cardDivider:     'rgba(255,255,255,0.07)',
  title:           '#ffffff',
  body:            'rgba(255,255,255,0.55)',
  accent:          'var(--v4-green)',
  accentLight:     'rgba(16,139,169,0.18)',
  accentBorder:    'rgba(16,139,169,0.35)',
  muted:           'rgba(255,255,255,0.3)',
  browserBg:       '#172442',
  browserBorder:   'rgba(255,255,255,0.07)',
};

type CardProps = {
  id: string;
  title: string;
  description: string;
  className?: string;
  theme: Theme;
  children: (isHovered: boolean) => React.ReactNode;
};

function FeatureCard({ id, title, description, className = '', theme, children }: CardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.article
      aria-labelledby={`feature-${id}`}
      className={`group relative flex flex-col overflow-hidden rounded-2xl transition-colors duration-300 ${className}`}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onViewportEnter={() => setIsHovered(true)}
      onViewportLeave={() => setIsHovered(false)}
      viewport={{ amount: 0.8 }}
      style={{
        background: theme.card,
        border: `1px solid ${theme.cardBorder}`,
        boxShadow: isHovered ? theme.cardHoverShadow : 'none',
      }}
    >
      <div className="flex-1 min-h-48" aria-hidden="true">
        {children(isHovered)}
      </div>
      <div className="p-5 space-y-1.5" style={{ borderTop: `1px solid ${theme.cardDivider}` }}>
        <h3 id={`feature-${id}`} className="text-base font-semibold" style={{ color: theme.title }}>
          {title}
        </h3>
        <p className="text-sm leading-relaxed" style={{ color: theme.body }}>
          {description}
        </p>
      </div>
    </motion.article>
  );
}

export function FeatureGrid({ dark = false }: { dark?: boolean }) {
  const theme = dark ? darkTheme : lightTheme;

  return (
    <MotionConfig reducedMotion="user">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">

        <FeatureCard
          id="widget" theme={theme}
          title="Direkt buchen. Auf deiner Website."
          description="Kein Redirect, keine Drittanbieter-Seite. Das Widget läuft auf deiner Domain."
          className="md:row-span-2"
        >
          {(isHovered) => <BookingWidgetVisual isHovered={isHovered} theme={theme} />}
        </FeatureCard>

        <FeatureCard
          id="pricing" theme={theme}
          title="Preise, die sich anpassen."
          description="Saison, Nachfrage, Aufenthaltsdauer — einmal einrichten, automatisch optimieren."
        >
          {(isHovered) => <DynamicPricingVisual isHovered={isHovered} theme={theme} />}
        </FeatureCard>

        <FeatureCard
          id="nuki" theme={theme}
          title="Schlüssel? Braucht kein Mensch mehr."
          description="Zugangscode wird automatisch mit der Buchungsbestätigung verschickt."
        >
          {(isHovered) => <NukiVisual isHovered={isHovered} theme={theme} />}
        </FeatureCard>

        <FeatureCard
          id="chatbot" theme={theme}
          title="Rund um die Uhr für deine Gäste da."
          description="Beantwortet Anfragen automatisch — in 9 Sprachen, zu jeder Zeit."
          className="md:col-span-2 md:row-span-2"
        >
          {(isHovered) => <ChatbotVisual isHovered={isHovered} theme={theme} />}
        </FeatureCard>

        <FeatureCard
          id="lounge" theme={theme}
          title="Alles für den Gast. Ohne App, ohne Login."
          description="Buchungsdetails, Rechnung und Infos per Link."
        >
          {(isHovered) => <GuestLoungeVisual isHovered={isHovered} theme={theme} />}
        </FeatureCard>

      </div>
    </MotionConfig>
  );
}
