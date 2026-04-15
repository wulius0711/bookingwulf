'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

type Settings = {
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  mutedTextColor: string;
  cardRadius: number;
  buttonRadius: number;
};

const defaultSettings: Settings = {
  accentColor: '#dc143c',
  backgroundColor: '#FAEBD7',
  textColor: '#2a2a2a',
  borderColor: '#d7c8b6',
  mutedTextColor: '#6d6258',
  cardRadius: 12,
  buttonRadius: 999,
};

export default function HotelSettingsPage() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const res = await fetch('/api/hotel-settings?hotel=beimoser');
      const data = await res.json();

      if (data.success && data.settings) {
        setSettings(data.settings);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function saveSettings() {
    setLoading(true);

    try {
      await fetch('/api/hotel-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hotel: 'beimoser', settings }),
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  function reset() {
    setSettings(defaultSettings);
  }

  const presets: Record<string, Settings> = {
    minimal: {
      accentColor: '#111',
      backgroundColor: '#fff',
      textColor: '#111',
      borderColor: '#ddd',
      mutedTextColor: '#666',
      cardRadius: 6,
      buttonRadius: 999,
    },
    warm: defaultSettings,
    luxury: {
      accentColor: '#c6a16e',
      backgroundColor: '#f8f5f0',
      textColor: '#1a1a1a',
      borderColor: '#e5dfd4',
      mutedTextColor: '#7a7368',
      cardRadius: 10,
      buttonRadius: 999,
    },
  };

  function applyPreset(preset: Settings) {
    setSettings(preset);
  }

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: 40 }}>
      <h1>Hotel Settings</h1>

      <Section title="Farben">
        <ColorField
          label="Accent"
          value={settings.accentColor}
          onChange={(v) => update('accentColor', v)}
        />
        <ColorField
          label="Background"
          value={settings.backgroundColor}
          onChange={(v) => update('backgroundColor', v)}
        />
        <ColorField
          label="Text"
          value={settings.textColor}
          onChange={(v) => update('textColor', v)}
        />
        <ColorField
          label="Border"
          value={settings.borderColor}
          onChange={(v) => update('borderColor', v)}
        />
      </Section>

      <Section title="Layout">
        <RangeField
          label="Card Radius"
          value={settings.cardRadius}
          onChange={(v) => update('cardRadius', v)}
        />
        <RangeField
          label="Button Radius"
          value={settings.buttonRadius}
          onChange={(v) => update('buttonRadius', v)}
        />
      </Section>

      <Section title="Presets">
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => applyPreset(presets.minimal)}>Minimal</button>
          <button onClick={() => applyPreset(presets.warm)}>Warm</button>
          <button onClick={() => applyPreset(presets.luxury)}>Luxury</button>
        </div>
      </Section>

      <Section title="Preview">
        <div
          style={{
            background: settings.backgroundColor,
            padding: 20,
            borderRadius: settings.cardRadius,
            border: `1px solid ${settings.borderColor}`,
          }}
        >
          <h3 style={{ color: settings.textColor }}>Booking Widget</h3>

          <button
            style={{
              marginTop: 10,
              background: settings.accentColor,
              color: '#fff',
              border: 'none',
              padding: '10px 16px',
              borderRadius: settings.buttonRadius,
              cursor: 'pointer',
            }}
          >
            Jetzt buchen
          </button>
        </div>
      </Section>

      <div style={{ marginTop: 30, display: 'flex', gap: 12 }}>
        <button onClick={saveSettings} disabled={loading}>
          {loading ? 'Speichert...' : 'Speichern'}
        </button>

        <button onClick={reset}>Reset</button>
      </div>
    </main>
  );
}

/* ---------- COMPONENTS ---------- */

type SectionProps = {
  title: string;
  children: ReactNode;
};

function Section({ title, children }: SectionProps) {
  return (
    <div style={{ marginTop: 30 }}>
      <h2>{title}</h2>
      <div style={{ display: 'grid', gap: 16 }}>{children}</div>
    </div>
  );
}

type ColorFieldProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
};

function ColorField({ label, value, onChange }: ColorFieldProps) {
  return (
    <div>
      <label>{label}</label>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: 100 }}
        />

        <div
          style={{
            width: 32,
            height: 32,
            background: value,
            border: '1px solid #ccc',
          }}
        />
      </div>
    </div>
  );
}

type RangeFieldProps = {
  label: string;
  value: number;
  onChange: (v: number) => void;
};

function RangeField({ label, value, onChange }: RangeFieldProps) {
  return (
    <div>
      <label>
        {label}: {value}px
      </label>

      <input
        type="range"
        min="0"
        max="40"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}
