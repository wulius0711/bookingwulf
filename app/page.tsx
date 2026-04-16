'use client';

import { FormEvent, useEffect, useState } from 'react';

type ThemeSettings = {
  backgroundColor?: string;
  textColor?: string;
  cardBackground?: string;
  accentColor?: string;
  borderColor?: string;
  mutedTextColor?: string;
  cardRadius?: number;
  buttonRadius?: number;
  showExtrasStep?: boolean;
};

type HotelExtra = {
  key: string;
  name: string;
  billingType: string;
  price: string | number;
};

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [hotel, setHotel] = useState('beimoser');
  const [extras, setExtras] = useState<HotelExtra[]>([]);
  const [showExtrasStep, setShowExtrasStep] = useState(true);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [nights, setNights] = useState(0);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const h = params.get('hotel') || 'beimoser';
    setHotel(h);

    async function loadHotelSettings() {
      try {
        const res = await fetch(`/api/hotel-settings?hotel=${h}`);
        if (!res.ok) { applyThemeDefaults(); return; }
        const data = await res.json();
        if (!data.success || !data.settings) { applyThemeDefaults(); return; }
        applyTheme(data.settings as ThemeSettings);
        setShowExtrasStep(data.settings.showExtrasStep !== false);
        setExtras(data.extras ?? []);
      } catch {
        applyThemeDefaults();
      }
    }

    loadHotelSettings();
  }, []);

  function applyThemeDefaults() {
    applyTheme({
      backgroundColor: '#ffffff',
      textColor: '#111111',
      cardBackground: '#ffffff',
      accentColor: '#111827',
      borderColor: '#dddddd',
      mutedTextColor: '#666666',
      cardRadius: 4,
      buttonRadius: 4,
    });
  }

  function applyTheme(settings: ThemeSettings) {
    const backgroundColor = settings.backgroundColor || '#ffffff';
    const textColor = settings.textColor || '#111111';
    const cardBackground = settings.cardBackground || '#ffffff';
    const accentColor = settings.accentColor || '#111827';
    const borderColor = settings.borderColor || '#dddddd';
    const mutedTextColor = settings.mutedTextColor || '#666666';
    const cardRadius = settings.cardRadius ?? 4;
    const buttonRadius = settings.buttonRadius ?? 4;

    document.documentElement.style.setProperty('--bg', backgroundColor);
    document.documentElement.style.setProperty('--text', textColor);
    document.documentElement.style.setProperty('--surface', cardBackground);
    document.documentElement.style.setProperty('--accent', accentColor);
    document.documentElement.style.setProperty('--line', borderColor);
    document.documentElement.style.setProperty('--muted', mutedTextColor);
    document.documentElement.style.setProperty('--card-radius', `${cardRadius}px`);
    document.documentElement.style.setProperty('--button-radius', `${buttonRadius}px`);
    document.body.style.background = backgroundColor;
    document.body.style.color = textColor;
  }

  function calcExtraPrice(extra: HotelExtra): number {
    const price = Number(extra.price);
    const guestCount = adults + children;
    if (extra.billingType === 'per_night') return price * nights;
    if (extra.billingType === 'per_person_per_night') return price * guestCount * nights;
    if (extra.billingType === 'per_person_per_stay') return price * guestCount;
    return price; // per_stay
  }

  function extraLabel(extra: HotelExtra): string {
    const price = Number(extra.price);
    if (extra.billingType === 'per_night') return `€ ${price.toFixed(2)} / Nacht`;
    if (extra.billingType === 'per_person_per_night') return `€ ${price.toFixed(2)} / Person / Nacht`;
    if (extra.billingType === 'per_person_per_stay') return `€ ${price.toFixed(2)} / Person`;
    return `€ ${price.toFixed(2)} / Aufenthalt`;
  }

  function toggleExtra(key: string) {
    setSelectedExtras((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

  const extrasTotal = extras
    .filter((e) => selectedExtras.includes(e.key))
    .reduce((sum, e) => sum + calcExtraPrice(e), 0);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const form = e.currentTarget;
    const formData = new FormData(form);

    const arrival = String(formData.get('arrival') || '');
    const departure = String(formData.get('departure') || '');

    const payload = {
      hotel,
      arrival,
      departure,
      nights,
      adults,
      children,
      selected_apartments: String(formData.get('selected_apartments') || ''),
      extras: selectedExtras,
      salutation: String(formData.get('salutation') || ''),
      lastname: String(formData.get('lastname') || ''),
      email: String(formData.get('email') || ''),
      country: String(formData.get('country') || ''),
      message: String(formData.get('message') || ''),
      newsletter: formData.get('newsletter') === 'on',
    };

    try {
      const res = await fetch('/api/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Anfrage erfolgreich gespeichert.');
        form.reset();
        setSelectedExtras([]);
        setNights(0);
      } else {
        setMessage('Fehler beim Speichern.');
      }
    } catch {
      setMessage('Serverfehler.');
    } finally {
      setLoading(false);
    }
  }

  const fieldStyle: React.CSSProperties = {
    width: '100%',
    minHeight: 52,
    padding: '14px 16px',
    border: '1px solid var(--line)',
    borderRadius: 'var(--card-radius)',
    background: 'var(--surface)',
    color: 'var(--text)',
    outline: 'none',
    font: 'inherit',
  };

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: '40px 20px' }}>
      <div style={{
        background: 'var(--surface)',
        padding: 30,
        borderRadius: 'var(--card-radius)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
        border: '1px solid var(--line)',
      }}>
        <h1 style={{ marginTop: 0, color: 'var(--text)' }}>Buchungsanfrage</h1>
        <p style={{ marginTop: 8, color: 'var(--muted)' }}>Hotel: {hotel}</p>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12, marginTop: 24 }}>
          <input
            name="arrival"
            type="date"
            required
            style={fieldStyle}
            onChange={(e) => {
              const dep = (document.querySelector('[name=departure]') as HTMLInputElement)?.value;
              if (dep && e.target.value) {
                const n = (new Date(dep).getTime() - new Date(e.target.value).getTime()) / 86400000;
                setNights(Math.max(0, Math.round(n)));
              }
            }}
          />
          <input
            name="departure"
            type="date"
            required
            style={fieldStyle}
            onChange={(e) => {
              const arr = (document.querySelector('[name=arrival]') as HTMLInputElement)?.value;
              if (arr && e.target.value) {
                const n = (new Date(e.target.value).getTime() - new Date(arr).getTime()) / 86400000;
                setNights(Math.max(0, Math.round(n)));
              }
            }}
          />
          <input
            name="adults"
            type="number"
            min="1"
            defaultValue={2}
            required
            style={fieldStyle}
            onChange={(e) => setAdults(Number(e.target.value) || 1)}
          />
          <input
            name="children"
            type="number"
            min="0"
            defaultValue={0}
            style={fieldStyle}
            onChange={(e) => setChildren(Number(e.target.value) || 0)}
          />
          <input name="selected_apartments" placeholder="Apartment-ID" required style={fieldStyle} />

          {/* EXTRAS STEP */}
          {showExtrasStep && extras.length > 0 && (
            <div style={{
              border: '1px solid var(--line)',
              borderRadius: 'var(--card-radius)',
              padding: '16px 20px',
              display: 'grid',
              gap: 12,
            }}>
              <p style={{ margin: 0, fontWeight: 600, color: 'var(--text)', fontSize: 15 }}>
                Zusatzleistungen
              </p>
              {extras.map((extra) => {
                const checked = selectedExtras.includes(extra.key);
                const subtotal = calcExtraPrice(extra);
                return (
                  <label
                    key={extra.key}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 14px',
                      border: `1px solid ${checked ? 'var(--accent)' : 'var(--line)'}`,
                      borderRadius: 'var(--card-radius)',
                      cursor: 'pointer',
                      background: checked ? 'color-mix(in srgb, var(--accent) 8%, var(--surface))' : 'var(--surface)',
                      transition: 'border-color 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleExtra(extra.key)}
                        style={{ accentColor: 'var(--accent)', width: 16, height: 16 }}
                      />
                      <span style={{ color: 'var(--text)', fontSize: 14, fontWeight: 500 }}>{extra.name}</span>
                      <span style={{ color: 'var(--muted)', fontSize: 12 }}>{extraLabel(extra)}</span>
                    </div>
                    {nights > 0 && (
                      <span style={{ color: checked ? 'var(--accent)' : 'var(--muted)', fontSize: 14, fontWeight: 600 }}>
                        € {subtotal.toFixed(2)}
                      </span>
                    )}
                  </label>
                );
              })}

              {selectedExtras.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 4, fontSize: 13, color: 'var(--muted)' }}>
                  Extras gesamt: <strong style={{ color: 'var(--text)', marginLeft: 6 }}>€ {extrasTotal.toFixed(2)}</strong>
                </div>
              )}
            </div>
          )}

          <input name="salutation" placeholder="Anrede" required style={fieldStyle} />
          <input name="lastname" placeholder="Nachname" required style={fieldStyle} />
          <input name="email" type="email" placeholder="E-Mail" required style={fieldStyle} />
          <input name="country" placeholder="Land" required style={fieldStyle} />
          <textarea
            name="message"
            placeholder="Nachricht"
            rows={5}
            style={{ ...fieldStyle, resize: 'vertical', paddingTop: 14 }}
          />

          <label style={{ color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <input name="newsletter" type="checkbox" /> Newsletter
          </label>

          <button
            type="submit"
            disabled={loading}
            style={{
              background: 'var(--accent)',
              color: '#fff',
              border: 'none',
              padding: '14px 20px',
              borderRadius: 'var(--button-radius)',
              cursor: 'pointer',
              fontWeight: 600,
              minHeight: 48,
            }}
          >
            {loading ? 'Speichert...' : 'Anfrage senden'}
          </button>
        </form>

        {message && <p style={{ marginTop: 16, color: 'var(--text)' }}>{message}</p>}
      </div>
    </main>
  );
}
