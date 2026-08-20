'use client';

import { useState } from 'react';

export default function CapacityFields({
  defaultMaxAdults,
  defaultMaxChildren,
  labelStyle,
  inputStyle,
  fieldStyle,
}: {
  defaultMaxAdults: number;
  defaultMaxChildren: number;
  labelStyle: React.CSSProperties;
  inputStyle: React.CSSProperties;
  fieldStyle: React.CSSProperties;
}) {
  const [maxAdults, setMaxAdults] = useState(String(defaultMaxAdults));

  return (
    <>
      <div style={fieldStyle}>
        <label style={labelStyle}>Max. Erwachsene</label>
        <input
          type="number"
          name="maxAdults"
          min={1}
          value={maxAdults}
          onChange={(e) => setMaxAdults(e.target.value)}
          style={inputStyle}
        />
      </div>
      <div style={fieldStyle}>
        <label style={labelStyle}>Max. Kinder</label>
        <input type="number" name="maxChildren" min={0} defaultValue={defaultMaxChildren} style={inputStyle} />
      </div>
      {Number(maxAdults) < 1 && (
        <div style={{ gridColumn: '1 / -1', fontSize: 13, color: '#b45309', background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: 6, padding: '8px 10px' }}>
          ⚠️ Mindestens 1 Erwachsener empfohlen — Booking.com erlaubt keine reinen Kinder-Buchungen ohne Erwachsenen.
        </div>
      )}
    </>
  );
}
