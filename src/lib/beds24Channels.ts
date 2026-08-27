// Beds24's own API channel keys (lowercase, used in priceRules[].channels.<key> and
// ChannelPriceRange.channel) vs. the display names already used across the admin UI
// (channelColors.ts — capitalized, matching Request.channel/apiSource from the webhook).
// Two different vocabularies for the same 4 channels — this bridges them.

export type Beds24ChannelKey = 'airbnb' | 'booking' | 'expedia' | 'vrbo' | 'hrs' | 'traumferienwohnungen' | 'agoda' | 'feratel';

export const SUPPORTED_CHANNELS: Beds24ChannelKey[] = ['airbnb', 'booking', 'expedia', 'vrbo', 'hrs', 'traumferienwohnungen', 'agoda', 'feratel'];

// Display label matching channelColors.ts's CHANNEL_COLORS/CHANNEL_LABELS keys, so
// getChannelColor()/channelLabel() give the same color/label already used for bookings.
export const CHANNEL_DISPLAY_NAME: Record<Beds24ChannelKey, string> = {
  airbnb: 'Airbnb',
  booking: 'Booking.com',
  expedia: 'Expedia',
  vrbo: 'Vrbo',
  hrs: 'HRS',
  traumferienwohnungen: 'Traumferienwohnungen',
  agoda: 'Agoda',
  feratel: 'Feratel',
};

export function isSupportedChannel(value: string): value is Beds24ChannelKey {
  return (SUPPORTED_CHANNELS as string[]).includes(value);
}
