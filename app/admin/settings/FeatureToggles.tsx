'use client';

import { useState } from 'react';
import InfoTooltip from '../components/InfoTooltip';

type Props = {
  initialValues: Record<string, boolean>;
  checkboxRowStyle: React.CSSProperties;
  checkboxBoxStyle: React.CSSProperties;
  labelStyle: React.CSSProperties;
};

const toggles: [string, string][] = [
  ['showPrices', 'Preise anzeigen'],
  ['showAmenities', 'Ausstattung anzeigen'],
  ['showExtrasStep', 'Zusatzleistungen anzeigen'],
  ['showPhoneField', 'Telefonfeld anzeigen'],
  ['showMessageField', 'Nachrichtenfeld anzeigen'],
  ['enableImageSlider', 'Image Slider aktivieren'],
  ['enableInstantBooking', 'Verbindliche Buchung anbieten'],
];

export default function FeatureToggles({ initialValues, checkboxRowStyle, checkboxBoxStyle, labelStyle }: Props) {
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
    <>
      {toggles.map(([key, label]) => (
        <div key={key} className="settings-row" style={checkboxRowStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <label style={labelStyle}>{label}</label>
            {key === 'enableInstantBooking' && <InfoTooltip text="Gäste können verbindlich buchen statt nur anfragen. Buchungen werden sofort bestätigt." />}
          </div>
          <label style={checkboxBoxStyle}>
            <input
              type="checkbox"
              name={key}
              checked={!!values[key]}
              onChange={() => toggle(key)}
            />
            Aktiv
          </label>
        </div>
      ))}
      <div className="settings-row" style={{ ...checkboxRowStyle, paddingLeft: 20 }}>
        <label style={labelStyle}>Nur Buchung — Anfrage ausblenden</label>
        <label style={checkboxBoxStyle}>
          <input
            type="checkbox"
            name="hideRequestOption"
            checked={!!values.hideRequestOption}
            onChange={() => toggle('hideRequestOption')}
          />
          Aktiv
        </label>
      </div>
    </>
  );
}
