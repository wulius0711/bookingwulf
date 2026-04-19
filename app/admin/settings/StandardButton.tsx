'use client';

import { useTransition } from 'react';
import { resetHotelSettings } from './actions';

export default function StandardButton({ hotelId, style }: { hotelId: number; style?: React.CSSProperties }) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm('Alle Einstellungen auf Standard zurücksetzen? Design-Presets und Widget-Konfigurationen bleiben erhalten.')) return;
    const fd = new FormData();
    fd.append('hotelId', String(hotelId));
    startTransition(() => resetHotelSettings(fd));
  }

  return (
    <button type="button" onClick={handleClick} style={style} disabled={pending}>
      {pending ? 'Wird zurückgesetzt…' : 'Standard'}
    </button>
  );
}
