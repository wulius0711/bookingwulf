'use client';

import { FormEvent, useEffect, useState } from 'react';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [hotel, setHotel] = useState('beimoser');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const h = params.get('hotel') || 'beimoser';

    setHotel(h);
    console.log('ACTIVE HOTEL:', h);

    async function loadHotelSettings() {
      try {
        const res = await fetch(`/api/hotel-settings?hotel=${h}`);

        if (!res.ok) {
          console.error('Hotel settings request failed:', res.status);
          return;
        }

        const data = await res.json();

        if (!data.success || !data.settings) return;

        const settings = data.settings;

        // 🌐 CSS Variables setzen
        document.documentElement.style.setProperty(
          '--bg',
          settings.backgroundColor || '#FAEBD7',
        );

        document.documentElement.style.setProperty(
          '--text',
          settings.textColor || '#2a2a2a',
        );

        document.documentElement.style.setProperty(
          '--surface',
          settings.cardBackground || '#ffffff',
        );

        document.documentElement.style.setProperty(
          '--accent',
          settings.accentColor || '#dc143c',
        );

        // fallback direkt setzen
        document.body.style.background = settings.backgroundColor || '#FAEBD7';
        document.body.style.color = settings.textColor || '#2a2a2a';
      } catch (error) {
        console.error('Failed to load hotel settings:', error);
      }
    }

    loadHotelSettings();
  }, []);

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
          borderRadius: 12,
          boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
        }}
      >
        <h1>Booking Formular Test</h1>

        <form
          onSubmit={handleSubmit}
          style={{
            display: 'grid',
            gap: 12,
            marginTop: 24,
          }}
        >
          <input name="arrival" type="date" required />
          <input name="departure" type="date" required />
          <input
            name="adults"
            type="number"
            min="1"
            defaultValue={2}
            required
          />
          <input name="children" type="number" min="0" defaultValue={0} />
          <input name="selected_apartments" placeholder="Apartment" required />
          <input name="salutation" placeholder="Anrede" required />
          <input name="lastname" placeholder="Nachname" required />
          <input name="email" type="email" placeholder="E-Mail" required />
          <input name="country" placeholder="Land" required />
          <textarea name="message" placeholder="Nachricht" rows={5} />

          <label>
            <input name="newsletter" type="checkbox" /> Newsletter
          </label>

          <button
            type="submit"
            disabled={loading}
            style={{
              background: 'var(--accent)',
              color: '#fff',
              border: 'none',
              padding: '12px 20px',
              borderRadius: 999,
              cursor: 'pointer',
            }}
          >
            {loading ? 'Speichert...' : 'Anfrage senden'}
          </button>
        </form>

        {message && <p style={{ marginTop: 16 }}>{message}</p>}
      </div>
    </main>
  );
}
