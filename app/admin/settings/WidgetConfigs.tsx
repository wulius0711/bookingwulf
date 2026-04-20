'use client';

import { useState } from 'react';
import { saveWidgetConfig, deleteWidgetConfig } from './widget-config-actions';
import InfoTooltip from '../components/InfoTooltip';
import { EmbedCode } from './EmbedCode';

// persists across React re-renders and remounts within the same browser session
const sessionCreated = new Map<number, number>();

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
  hideRequestOption: boolean;
};

type Props = {
  hotelId: number;
  hotelSlug: string;
  configs: Config[];
  host: string;
};

const toggles: [keyof Config, string][] = [
  ['showPrices', 'Preise anzeigen'],
  ['showAmenities', 'Ausstattung anzeigen'],
  ['showExtrasStep', 'Zusatzleistungen anzeigen'],
  ['showPhoneField', 'Telefonfeld anzeigen'],
  ['showMessageField', 'Nachrichtenfeld anzeigen'],
  ['enableImageSlider', 'Image Slider aktivieren'],
  ['enableInstantBooking', 'Verbindliche Buchung anbieten'],
];

const defaults: Omit<Config, 'id' | 'name' | 'slug'> = {
  showPrices: true,
  showAmenities: true,
  showExtrasStep: true,
  showPhoneField: true,
  showMessageField: true,
  enableImageSlider: true,
  enableInstantBooking: false,
  hideRequestOption: false,
};

export default function WidgetConfigs({ hotelId, hotelSlug, configs, host }: Props) {
  const [editing, setEditing] = useState<Config | 'new' | null>(null);
  const [saving, setSaving] = useState(false);
  const [, forceRender] = useState(0);
  const [form, setForm] = useState<Omit<Config, 'id' | 'slug'>>(
    { name: '', ...defaults }
  );

  const totalCount = configs.length + (sessionCreated.get(hotelId) ?? 0);

  function openNew() {
    setForm({ name: '', ...defaults });
    setEditing('new');
  }

  function openEdit(c: Config) {
    setForm({ name: c.name, showPrices: c.showPrices, showAmenities: c.showAmenities, showExtrasStep: c.showExtrasStep, showPhoneField: c.showPhoneField, showMessageField: c.showMessageField, enableImageSlider: c.enableImageSlider, enableInstantBooking: c.enableInstantBooking, hideRequestOption: c.hideRequestOption });
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

          <div style={{ marginTop: 10 }}>
            <EmbedCode code={`<script src="https://${host}/widget.js" data-hotel="${hotelSlug}" data-config="${c.slug}"></script>`} />
          </div>
        </div>
      ))}

      {editing ? (
        <div style={{ border: '1px solid #111', borderRadius: 12, padding: '20px 24px', background: '#fff', display: 'grid', gap: 16 }}>
          <strong style={{ fontSize: 15 }}>{editing === 'new' ? 'Neue Konfiguration' : `„${(editing as Config).name}" bearbeiten`}</strong>

          <form onSubmit={async (e) => {
            e.preventDefault();
            setSaving(true);
            await saveWidgetConfig(new FormData(e.currentTarget));
            if (editing === 'new') {
              sessionCreated.set(hotelId, (sessionCreated.get(hotelId) ?? 0) + 1);
            }
            setSaving(false);
            setEditing(null);
            forceRender(n => n + 1);
          }}>
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
                {toggles.map(([key, label]) => (
                  <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 10, background: '#fafafa', cursor: 'pointer', fontSize: 14 }}>
                    <input
                      type="checkbox"
                      name={key}
                      checked={!!(form as Record<string, unknown>)[key]}
                      onChange={() => toggle(key as keyof typeof defaults)}
                    />
                    <span style={{ flex: 1 }}>{label}</span>
                    {key === 'enableInstantBooking' && <InfoTooltip text="Gäste können verbindlich buchen statt nur anfragen. Buchungen werden sofort bestätigt." />}
                  </label>
                ))}
                {form.enableInstantBooking && (
                  <label style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 10, background: '#fffbeb', cursor: 'pointer', fontSize: 14, marginLeft: 20 }}>
                    <input
                      type="checkbox"
                      name="hideRequestOption"
                      checked={form.hideRequestOption}
                      onChange={() => toggle('hideRequestOption')}
                    />
                    <span style={{ flex: 1 }}>Nur Buchung — Anfrage ausblenden</span>
                  </label>
                )}
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" disabled={saving} style={{ padding: '10px 20px', borderRadius: 8, background: saving ? '#6b7280' : '#111', color: '#fff', border: 'none', fontSize: 14, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer' }}>{saving ? 'Speichern…' : 'Speichern'}</button>
                <button type="button" onClick={() => setEditing(null)} style={{ padding: '10px 20px', borderRadius: 8, background: '#fff', color: '#111', border: '1px solid #d1d5db', fontSize: 14, cursor: 'pointer' }}>Abbrechen</button>
              </div>
            </div>
          </form>
        </div>
      ) : totalCount < 2 ? (
        <button type="button" onClick={openNew} style={{ padding: '10px 20px', borderRadius: 8, background: '#fff', color: '#111', border: '1px dashed #d1d5db', fontSize: 14, fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}>
          + Neue Konfiguration
        </button>
      ) : null}
    </div>
  );
}
