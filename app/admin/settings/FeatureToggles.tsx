'use client';

import { useState } from 'react';
import InfoTooltip from '../components/InfoTooltip';

type Props = {
  initialValues: Record<string, boolean>;
};

function IosToggle({ name, checked, onChange }: { name: string; checked: boolean; onChange: () => void }) {
  return (
    <label style={{ position: 'relative', display: 'inline-block', width: 46, height: 26, flexShrink: 0, cursor: 'pointer' }}>
      <input type="checkbox" name={name} checked={checked} onChange={onChange} style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }} />
      <span style={{
        position: 'absolute', inset: 0,
        background: checked ? '#111827' : '#d1d5db',
        borderRadius: 26,
        transition: 'background 0.2s',
      }} />
      <span style={{
        position: 'absolute',
        width: 20, height: 20,
        left: 3, top: 3,
        background: '#fff',
        borderRadius: '50%',
        transform: checked ? 'translateX(20px)' : 'translateX(0)',
        transition: 'transform 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
        pointerEvents: 'none',
      }} />
    </label>
  );
}

const toggles: [string, string][] = [
  ['showPrices', 'Preise anzeigen'],
  ['showAmenities', 'Ausstattung anzeigen'],
  ['showExtrasStep', 'Zusatzleistungen anzeigen'],
  ['showPhoneField', 'Telefonfeld anzeigen'],
  ['showMessageField', 'Nachrichtenfeld anzeigen'],
  ['enableImageSlider', 'Image Slider aktivieren'],
  ['enableInstantBooking', 'Verbindliche Buchung anbieten'],
];

export default function FeatureToggles({ initialValues }: Props) {
  const [values, setValues] = useState(initialValues);

  function toggle(key: string) {
    setValues((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      if (key === 'enableInstantBooking' && !next.enableInstantBooking) {
        next.hideRequestOption = false;
      }
      if (key === 'hideRequestOption' && next.hideRequestOption) {
        next.enableInstantBooking = true;
      }
      return next;
    });
  }

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, overflow: 'hidden' }}>
      {toggles.map(([key, label], i) => (
        <div key={key}>
          {i > 0 && <div style={{ height: 1, background: '#e5e7eb', margin: '0 16px' }} />}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '13px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>{label}</span>
              {key === 'enableInstantBooking' && (
                <InfoTooltip text="Gäste können verbindlich buchen statt nur anfragen. Buchungen werden sofort bestätigt." />
              )}
            </div>
            <IosToggle name={key} checked={!!values[key]} onChange={() => toggle(key)} />
          </div>
        </div>
      ))}
      <div style={{ height: 1, background: '#f3f4f6' }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '13px 16px 13px 32px', background: '#fafafa' }}>
        <span style={{ fontSize: 13, color: '#6b7280' }}>Nur Buchung — Anfrage ausblenden</span>
        <IosToggle name="hideRequestOption" checked={!!values.hideRequestOption} onChange={() => toggle('hideRequestOption')} />
      </div>
    </div>
  );
}
