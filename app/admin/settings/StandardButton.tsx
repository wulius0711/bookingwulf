'use client';

import { useTransition } from 'react';
import { resetHotelSettings } from './actions';
import Button from '../components/ui/Button';

export default function StandardButton({ hotelId }: { hotelId: number }) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm('Alle Einstellungen auf Standard zurücksetzen? Design-Presets und Widget-Konfigurationen bleiben erhalten.')) return;
    const fd = new FormData();
    fd.append('hotelId', String(hotelId));
    startTransition(() => resetHotelSettings(fd));
  }

  return (
    <Button variant="secondary" type="button" onClick={handleClick} loading={pending}>
      {pending ? 'Wird zurückgesetzt…' : 'Standard'}
    </Button>
  );
}
