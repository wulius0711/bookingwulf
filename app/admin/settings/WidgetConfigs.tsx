'use client';

import { useState } from 'react';
import { saveWidgetConfig, deleteWidgetConfig } from './widget-config-actions';

type Config = {
  id: number;
  name: string;
  slug: string;
  showPrices: boolean;
  showAmenities: boolean;
  showExtrasStep: boolean;
  showPhoneField: boolean;
  showMessageField: boolean;
  enableImageSlider: boolean;
  enableInstantBooking: boolean;
};

type Props = {
  hotelId: number;
  hotelSlug: string;
  configs: Config[];
  host: string;
};

const toggles: [keyof Config, string, string][] = [
  ['showPrices', 'Preise anzeigen', 'Zeigt Preise und Gesamtkosten im Widget an. Deaktivieren für reine Anfrage-Widgets ohne Preisangabe.'],
  ['showAmenities', 'Ausstattung anzeigen', 'Zeigt die Ausstattungsliste jedes Apartments an.'],
  ['showExtrasStep', 'Zusatzleistungen anzeigen', 'Zeigt Schritt 3 mit Zusatzleistungen und Versicherungsoptionen.'],
  ['showPhoneField', 'Telefonfeld anzeigen', 'Fügt ein optionales Telefonfeld im Buchungsformular hinzu.'],
  ['showMessageField', 'Nachrichtenfeld anzeigen', 'Fügt ein Nachrichtenfeld für besondere Wünsche hinzu.'],
  ['enableImageSlider', 'Image Slider aktivieren', 'Aktiviert den Bild-Slider für Apartment-Fotos.'],
  ['enableInstantBooking', 'Verbindliche Buchung anbieten', 'Gäste können verbindlich buchen statt nur anfragen. Buchungen werden sofort bestätigt.'],
];

const defaults: Omit<Config, 'id' | 'name' | 'slug'> = {
  showPrices: true,
  showAmenities: true,
  showExtrasStep: true,
  showPhoneField: true,
  showMessageField: true,
  enableImageSlider: true,
  enableInstantBooking: false,
};

export default function WidgetConfigs({ hotelId, hotelSlug, configs, host }: Props) {
  const [editing, setEditing] = useState<Config | 'new' | null>(null);
  const [form, setForm] = useState<Omit<Config, 'id' | 'slug'>>(
    { name: '', ...defaults }
  );

  function openNew() {
    setForm({ name: '', ...defaults });
    setEditing('new');
  }

  function openEdit(c: Config) {
    setForm({ name: c.name, showPrices: c.showPrices, showAmenities: c.showAmenities, showExtrasStep: c.showExtrasStep, showPhoneField: c.showPhoneField, showMessageField: c.showMessageField, enableImageSlider: c.enableImageSlider, enableInstantBooking: c.enableInstantBooking });
    setEditing(c);
  }

  function toggle(key: keyof typeof defaults) {
    setForm((f) => ({ ...f, [key]: !f[key] }));
  }

  const configId = editing !== 'new' && editing ? editing.id : undefined;

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {configs.map((c) => (
        <div key={c.id} style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px 20px', background: '#fafafa' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{c.name}</div>
              <code style={{ fontSize: 12, color: '#6b7280' }}>data-config=&quot;{c.slug}&quot;</code>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" onClick={() => openEdit(c)} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', fontSize: 13, cursor: 'pointer' }}>Bearbeiten</button>
              <form action={deleteWidgetConfig} onSubmit={(e) => { if (!confirm(`Config „${c.name}" löschen?`)) e.preventDefault(); }}>
                <input type="hidden" name="id" value={c.id} />
                <button type="submit" style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #fca5a5', background: '#fff', color: '#dc2626', fontSize: 13, cursor: 'pointer' }}>Löschen</button>
              </form>
            </div>
          </div>

          <div style={{ marginTop: 10, fontSize: 12, color: '#6b7280', wordBreak: 'break-all' }}>
            Einbindung: <code>{`<script src="https://${host}/widget.js" data-hotel="${hotelSlug}" data-config="${c.slug}"></script>`}</code>
          </div>
        </div>
      ))}

      {editing ? (
        <div style={{ border: '1px solid #111', borderRadius: 12, padding: '20px 24px', background: '#fff', display: 'grid', gap: 16 }}>
          <strong style={{ fontSize: 15 }}>{editing === 'new' ? 'Neue Konfiguration' : `„${(editing as Config).name}" bearbeiten`}</strong>

          <form action={saveWidgetConfig} onSubmit={() => setEditing(null)}>
            <input type="hidden" name="hotelId" value={hotelId} />
            {configId && <input type="hidden" name="configId" value={configId} />}

            <div style={{ display: 'grid', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#4b5563', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="z.B. Anfrage oder Buchung"
                  required
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14 }}
                />
              </div>

              <div style={{ display: 'grid', gap: 8 }}>
                {toggles.map(([key, label, tooltip]) => (
                  <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 10, background: '#fafafa', cursor: 'pointer', fontSize: 14 }}>
                    <input
                      type="checkbox"
                      name={key}
                      checked={!!(form as Record<string, unknown>)[key]}
                      onChange={() => toggle(key as keyof typeof defaults)}
                    />
                    <span style={{ flex: 1 }}>{label}</span>
                    <span title={tooltip} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 16, height: 16, borderRadius: '50%', background: '#e5e7eb', color: '#6b7280', fontSize: 10, fontWeight: 700, cursor: 'help', flexShrink: 0 }}>i</span>
                  </label>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" style={{ padding: '10px 20px', borderRadius: 8, background: '#111', color: '#fff', border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Speichern</button>
                <button type="button" onClick={() => setEditing(null)} style={{ padding: '10px 20px', borderRadius: 8, background: '#fff', color: '#111', border: '1px solid #d1d5db', fontSize: 14, cursor: 'pointer' }}>Abbrechen</button>
              </div>
            </div>
          </form>
        </div>
      ) : (
        <button type="button" onClick={openNew} style={{ padding: '10px 20px', borderRadius: 8, background: '#fff', color: '#111', border: '1px dashed #d1d5db', fontSize: 14, fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}>
          + Neue Konfiguration
        </button>
      )}
    </div>
  );
}
