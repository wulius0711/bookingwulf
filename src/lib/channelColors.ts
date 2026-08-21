// Central color mapping for the admin calendar/Zimmerplan — one source of truth so
// CalendarGrid and GanttView never drift into showing different colors for the same channel.

export type ChannelColor = { bg: string; border: string; text: string };

const CHANNEL_COLORS: Record<string, ChannelColor> = {
  direct:        { bg: '#16a34a', border: '#16a34a', text: '#fff' }, // Direktbuchung
  'Airbnb':      { bg: '#ec4899', border: '#ec4899', text: '#fff' },
  'Booking.com': { bg: '#2563eb', border: '#2563eb', text: '#fff' },
  'Expedia':     { bg: '#8b5cf6', border: '#8b5cf6', text: '#fff' },
  'Vrbo':        { bg: '#14b8a6', border: '#14b8a6', text: '#fff' },
  'FeWo-direkt': { bg: '#14b8a6', border: '#14b8a6', text: '#fff' },
  'Google':      { bg: '#6366f1', border: '#6366f1', text: '#fff' },
};

// Deterministic colors for channels we don't know about yet (e.g. a new OTA), so every
// new source gets a stable, distinct color without a code change.
const FALLBACK_PALETTE: ChannelColor[] = [
  { bg: '#f97316', border: '#f97316', text: '#fff' },
  { bg: '#06b6d4', border: '#06b6d4', text: '#fff' },
  { bg: '#84cc16', border: '#84cc16', text: '#1a2e05' },
  { bg: '#eab308', border: '#eab308', text: '#422006' },
];

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function getChannelColor(channel: string | null | undefined): ChannelColor {
  if (!channel || channel === 'direct') return CHANNEL_COLORS.direct;
  return CHANNEL_COLORS[channel] ?? FALLBACK_PALETTE[hashString(channel) % FALLBACK_PALETTE.length];
}

export const CHANNEL_LABELS: Record<string, string> = {
  direct: 'Direktbuchung',
  'Direct': 'Direkt in Beds24', // Beds24's own channel value for bookings entered directly in Beds24 (not via bookingwulf, not via an OTA) — distinct from bookingwulf's own "Direktbuchung"
};

export function channelLabel(channel: string): string {
  return CHANNEL_LABELS[channel] ?? channel;
}

// Host-blocked periods (Sperrzeiten/Eigennutzung) are a status, not a channel — grey +
// diagonal hatch keeps them visually distinct from OTA colors even for colorblind users.
export const BLOCKED_HOST_COLOR: ChannelColor = { bg: '#9ca3af', border: '#6b7280', text: '#1f2937' };
export const BLOCKED_HOST_PATTERN = 'repeating-linear-gradient(45deg, #9ca3af, #9ca3af 6px, #d1d5db 6px, #d1d5db 12px)';

export function parsePlatform(note: string | null | undefined): { platform: string; rest: string } | null {
  if (!note) return null;
  const m = note.match(/^\[(.+?)\]\s*(.*)/);
  return m ? { platform: m[1], rest: m[2] } : null;
}

// BlockedRange rows use a "[Platform] ..." note for OTA syncs and no prefix for host blocks
// (manual/other) — this one helper decides the right color+pattern for a chip either way.
export function blockedRangeColor(note: string | null | undefined): { color: ChannelColor; pattern?: string } {
  const parsed = parsePlatform(note);
  return parsed
    ? { color: getChannelColor(parsed.platform) }
    : { color: BLOCKED_HOST_COLOR, pattern: BLOCKED_HOST_PATTERN };
}
