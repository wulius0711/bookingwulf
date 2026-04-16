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
};

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [hotel, setHotel] = useState('default');
  const [dog, setDog] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const h = params.get('hotel') || 'default';

    setHotel(h);
    console.log('ACTIVE HOTEL:', h);

    async function loadHotelSettings() {
      try {
        const res = await fetch(`/api/hotel-settings?hotel=${h}`);

        if (!res.ok) {
          console.error('Hotel settings request failed:', res.status);
          applyThemeDefaults();
          return;
        }

        const data = await res.json();

        if (!data.success || !data.settings) {
          applyThemeDefaults();
          return;
        }

        applyTheme(data.settings as ThemeSettings);
      } catch (error) {
        console.error('Failed to load hotel settings:', error);
        applyThemeDefaults();
      }
    }

    loadHotelSettings();
  }, []);

  function applyThemeDefaults() {
    applyTheme({
      backgroundColor: '#FAEBD7',
      textColor: '#2a2a2a',
      cardBackground: '#ffffff',
      accentColor: '#dc143c',
      borderColor: '#d7c8b6',
      mutedTextColor: '#6d6258',
      cardRadius: 12,
      buttonRadius: 999,
    });
  }

  function applyTheme(settings: ThemeSettings) {
    const backgroundColor = settings.backgroundColor || '#FAEBD7';
    const textColor = settings.textColor || '#2a2a2a';
    const cardBackground = settings.cardBackground || '#ffffff';
    const accentColor = settings.accentColor || '#dc143c';
    const borderColor = settings.borderColor || '#d7c8b6';
    const mutedTextColor = settings.mutedTextColor || '#6d6258';
    const cardRadius = settings.cardRadius ?? 12;
    const buttonRadius = settings.buttonRadius ?? 999;

    document.documentElement.style.setProperty('--bg', backgroundColor);
    document.documentElement.style.setProperty('--text', textColor);
    document.documentElement.style.setProperty('--surface', cardBackground);
    document.documentElement.style.setProperty('--accent', accentColor);
    document.documentElement.style.setProperty('--line', borderColor);
    document.documentElement.style.setProperty('--muted', mutedTextColor);
    document.documentElement.style.setProperty(
      '--card-radius',
      `${cardRadius}px`,
    );
    document.documentElement.style.setProperty(
      '--button-radius',
      `${buttonRadius}px`,
    );

    document.body.style.background = backgroundColor;
    document.body.style.color = textColor;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const form = e.currentTarget;
    const formData = new FormData(form);

    const arrival = String(formData.get('arrival') || '');
    const departure = String(formData.get('departure') || '');

    const nights =
      (new Date(departure).getTime() - new Date(arrival).getTime()) /
      (1000 * 60 * 60 * 24);

    const payload = {
      hotel,
      arrival,
      departure,
      nights,
      adults: Number(formData.get('adults') || 0),
      children: Number(formData.get('children') || 0),
      selected_apartments: String(formData.get('selected_apartments') || ''),
      salutation: String(formData.get('salutation') || ''),
      lastname: String(formData.get('lastname') || ''),
      email: String(formData.get('email') || ''),
      country: String(formData.get('country') || ''),
      message: String(formData.get('message') || ''),
      newsletter: formData.get('newsletter') === 'on',
      dog,
    };

    try {
      const res = await fetch('/api/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        setMessage('Buchung erfolgreich gespeichert.');
        form.reset();
        setDog(false);
      } else {
        setMessage('Fehler beim Speichern.');
      }
    } catch (error) {
      console.error(error);
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
    <main
      style={{
        maxWidth: 900,
        margin: '0 auto',
        padding: '40px 20px',
      }}
    >
      <div
        style={{
          background: 'var(--surface)',
          padding: 30,
          borderRadius: 'var(--card-radius)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
          border: '1px solid var(--line)',
        }}
      >
        <h1 style={{ marginTop: 0, color: 'var(--text)' }}>
          Booking Formular Test
        </h1>

        <p
          style={{
            marginTop: 8,
            color: 'var(--muted)',
          }}
        >
          Aktives Hotel: {hotel}
        </p>

        <form
          onSubmit={handleSubmit}
          style={{
            display: 'grid',
            gap: 12,
            marginTop: 24,
          }}
        >
          <input name="arrival" type="date" required style={fieldStyle} />
          <input name="departure" type="date" required style={fieldStyle} />
          <input
            name="adults"
            type="number"
            min="1"
            defaultValue={2}
            required
            style={fieldStyle}
          />
          <input
            name="children"
            type="number"
            min="0"
            defaultValue={0}
            style={fieldStyle}
          />
          <input
            name="selected_apartments"
            placeholder="Apartment"
            required
            style={fieldStyle}
          />
          <input
            name="salutation"
            placeholder="Anrede"
            required
            style={fieldStyle}
          />
          <input
            name="lastname"
            placeholder="Nachname"
            required
            style={fieldStyle}
          />
          <input
            name="email"
            type="email"
            placeholder="E-Mail"
            required
            style={fieldStyle}
          />
          <input
            name="country"
            placeholder="Land"
            required
            style={fieldStyle}
          />
          <textarea
            name="message"
            placeholder="Nachricht"
            rows={5}
            style={{
              ...fieldStyle,
              resize: 'vertical',
              paddingTop: 14,
            }}
          />

          <label
            style={{
              color: 'var(--text)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <input name="newsletter" type="checkbox" /> Newsletter
          </label>

          <label
            style={{
              color: 'var(--text)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <input
              type="checkbox"
              checked={dog}
              onChange={(e) => setDog(e.target.checked)}
            />
            Hund
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
            {loading ? 'Speichert...' : 'Buchung senden'}
          </button>
        </form>

        {message && (
          <p
            style={{
              marginTop: 16,
              color: 'var(--text)',
            }}
          >
            {message}
          </p>
        )}
      </div>
    </main>
  );
}
