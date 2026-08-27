'use client';

import { useState } from 'react';
import { Button } from '../components/ui';
import { SUPPORTED_CHANNELS, CHANNEL_DISPLAY_NAME } from '@/src/lib/beds24Channels';

type Apartment = { id: number; name: string };

const lbl: React.CSSProperties = { fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' };

export default function NewChannelPriceForm({
  apartments,
  channelOfferIds,
  createChannelPrice,
}: {
  apartments: Apartment[];
  channelOfferIds: Record<number, Record<string, number>>;
  createChannelPrice: (formData: FormData) => Promise<void>;
}) {
  const [apartmentId, setApartmentId] = useState('');
  const [channel, setChannel] = useState('');
  const availableChannels = Object.keys(channelOfferIds[Number(apartmentId)] ?? {});

  return (
    <form action={createChannelPrice} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end', padding: '20px', borderTop: '1px solid var(--border)' }}>
      <div style={{ display: 'grid', gap: 4, flex: '2 1 160px' }}>
        <label style={lbl}>Apartment</label>
        <select name="apartmentId" required className="ui-input" value={apartmentId} onChange={(e) => { setApartmentId(e.target.value); setChannel(''); }}>
          <option value="">Auswählen</option>
          {apartments.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
      </div>
      <div style={{ display: 'grid', gap: 4, flex: '1 1 120px' }}>
        <label style={lbl}>Kanal</label>
        <select name="channel" required className="ui-input" value={channel} onChange={(e) => setChannel(e.target.value)}>
          <option value="" disabled>Auswählen</option>
          {SUPPORTED_CHANNELS.map((c) => {
            const disabled = !availableChannels.includes(c);
            return (
              <option key={c} value={c} disabled={disabled}>
                {CHANNEL_DISPLAY_NAME[c]}{disabled ? ' (nicht eingerichtet)' : ''}
              </option>
            );
          })}
        </select>
      </div>
      <div style={{ display: 'grid', gap: 4, flex: '1 1 130px' }}>
        <label style={lbl}>Von</label>
        <input name="startDate" type="date" required className="ui-input" />
      </div>
      <div style={{ display: 'grid', gap: 4, flex: '1 1 130px' }}>
        <label style={lbl}>Bis</label>
        <input name="endDate" type="date" required className="ui-input" />
      </div>
      <div style={{ display: 'grid', gap: 4, flex: '1 1 100px' }}>
        <label style={lbl}>€ / Nacht</label>
        <input name="pricePerNight" type="number" min="0" step="0.01" required placeholder="0.00" className="ui-input" />
      </div>
      <div style={{ display: 'grid', gap: 4, flex: '1 1 140px' }}>
        <label style={lbl}>Bezeichnung</label>
        <input name="name" type="text" placeholder="Optional" className="ui-input" />
      </div>
      <div style={{ alignSelf: 'flex-end', marginLeft: 'auto' }}>
        <Button variant="primary" size="sm" type="submit">Hinzufügen</Button>
      </div>
    </form>
  );
}
