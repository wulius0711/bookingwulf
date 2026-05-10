import './ui.css';

export type BadgeStatus = 'new' | 'pending' | 'booked' | 'cancelled' | 'error';
export type BadgeSize = 'sm' | 'md';

const STATUS_CONFIG: Record<
  BadgeStatus,
  { label: string; bg: string; color: string }
> = {
  new:       { label: 'Neu',         bg: 'var(--status-new-bg)',       color: 'var(--status-new-text)'       },
  pending:   { label: 'Ausstehend',  bg: 'var(--status-pending-bg)',   color: 'var(--status-pending-text)'   },
  booked:    { label: 'Gebucht',     bg: 'var(--status-booked-bg)',    color: 'var(--status-booked-text)'    },
  cancelled: { label: 'Storniert',   bg: 'var(--status-cancelled-bg)', color: 'var(--status-cancelled-text)' },
  error:     { label: 'Fehler',      bg: 'var(--status-error-bg)',     color: 'var(--status-error-text)'     },
};

export interface StatusBadgeProps {
  status: BadgeStatus;
  size?: BadgeSize;
  label?: string;
  className?: string;
}

export default function StatusBadge({
  status,
  size = 'md',
  label,
  className = '',
}: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const displayLabel = label ?? config.label;

  return (
    <span
      className={`ui-badge ui-badge-${size} ${className}`}
      style={{ background: config.bg, color: config.color }}
      aria-label={`Status: ${displayLabel}`}
    >
      {/* Dot — visual reinforcement beyond color alone */}
      <span aria-hidden="true" style={{ fontSize: '0.6em', lineHeight: 1 }}>●</span>
      {displayLabel}
    </span>
  );
}
