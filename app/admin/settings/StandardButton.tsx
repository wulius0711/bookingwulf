'use client';

import { resetHotelSettings } from './actions';

export default function StandardButton({ hotelId, style }: { hotelId: number; style?: React.CSSProperties }) {
  return (
    <form
      action={resetHotelSettings}
      onSubmit={(e) => {
        if (!confirm('Alle Einstellungen auf Standard zurücksetzen? Design-Presets und Widget-Konfigurationen bleiben erhalten.')) e.preventDefault();
      }}
    >
      <input type="hidden" name="hotelId" value={hotelId} />
      <button type="submit" style={style}>
        Standard
      </button>
    </form>
  );
}
