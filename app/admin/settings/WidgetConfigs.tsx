'use client';

import { useState } from 'react';
import { saveWidgetConfig, deleteWidgetConfig } from './widget-config-actions';
import InfoTooltip from '../components/InfoTooltip';
import { EmbedCode } from './EmbedCode';
import Button from '../components/ui/Button';

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
        <div key={c.id} style={{ border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px', background: 'var(--surface-2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{c.name}</div>
              <code style={{ fontSize: 12, color: '#6b7280' }}>data-config=&quot;{c.slug}&quot;</code>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant="secondary" size="sm" type="button" onClick={() => openEdit(c)}>Bearbeiten</Button>
              <form action={deleteWidgetConfig} onSubmit={(e) => { if (!confirm(`Config „${c.name}" löschen?`)) e.preventDefault(); }}>
                <input type="hidden" name="id" value={c.id} />
                <Button variant="danger" size="sm" type="submit">Löschen</Button>
              </form>
            </div>
          </div>

          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Deutsch</div>
            <EmbedCode code={`<script src="https://${host}/widget.js" data-hotel="${hotelSlug}" data-config="${c.slug}"></script>`} />
            <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 4 }}>English</div>
            <EmbedCode code={`<script src="https://${host}/widget.js" data-hotel="${hotelSlug}" data-config="${c.slug}" data-lang="en"></script>`} />
          </div>
        </div>
      ))}

      {editing ? (
        <div style={{ border: '1px solid #111', borderRadius: 12, padding: '20px 24px', background: 'var(--surface)', display: 'grid', gap: 16 }}>
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
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="z.B. Anfrage oder Buchung"
                  required
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14 }}
                />
              </div>

              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
                {toggles.map(([key, label], i) => (
                  <div key={key}>
                    {i > 0 && <div style={{ height: 1, background: 'var(--border)', margin: '0 16px' }} />}
                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '13px 16px', cursor: 'pointer' }}>
                      <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        {label}
                        {key === 'enableInstantBooking' && <InfoTooltip text="Gäste können verbindlich buchen statt nur anfragen. Buchungen werden sofort bestätigt." />}
                      </span>
                      <span style={{ position: 'relative', display: 'inline-block', width: 46, height: 26, flexShrink: 0 }}>
                        <input type="checkbox" name={key} checked={!!(form as Record<string, unknown>)[key]} onChange={() => toggle(key as keyof typeof defaults)} style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }} />
                        <span style={{ position: 'absolute', inset: 0, background: (form as Record<string, unknown>)[key] ? 'var(--accent)' : 'var(--border-strong)', borderRadius: 26, transition: 'background 0.2s' }} />
                        <span style={{ position: 'absolute', width: 20, height: 20, left: 3, top: 3, background: '#fff', borderRadius: '50%', transform: (form as Record<string, unknown>)[key] ? 'translateX(20px)' : 'translateX(0)', transition: 'transform 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.25)', pointerEvents: 'none' }} />
                      </span>
                    </label>
                  </div>
                ))}
                {form.enableInstantBooking && (
                  <>
                    <div style={{ height: 1, background: 'var(--border)' }} />
                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '13px 16px 13px 32px', background: 'var(--surface-2)', cursor: 'pointer' }}>
                      <span style={{ fontSize: 13, color: '#6b7280' }}>Nur Buchung — Anfrage ausblenden</span>
                      <span style={{ position: 'relative', display: 'inline-block', width: 46, height: 26, flexShrink: 0 }}>
                        <input type="checkbox" name="hideRequestOption" checked={form.hideRequestOption} onChange={() => toggle('hideRequestOption')} style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }} />
                        <span style={{ position: 'absolute', inset: 0, background: form.hideRequestOption ? 'var(--accent)' : 'var(--border-strong)', borderRadius: 26, transition: 'background 0.2s' }} />
                        <span style={{ position: 'absolute', width: 20, height: 20, left: 3, top: 3, background: '#fff', borderRadius: '50%', transform: form.hideRequestOption ? 'translateX(20px)' : 'translateX(0)', transition: 'transform 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.25)', pointerEvents: 'none' }} />
                      </span>
                    </label>
                  </>
                )}
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <Button variant="primary" loading={saving} type="submit">{saving ? 'Speichern…' : 'Speichern'}</Button>
                <Button variant="secondary" type="button" onClick={() => setEditing(null)}>Abbrechen</Button>
              </div>
            </div>
          </form>
        </div>
      ) : totalCount < 1 ? (
        <button type="button" onClick={openNew} style={{ padding: '10px 20px', borderRadius: 8, background: 'var(--surface)', color: 'var(--text-primary)', border: '1px dashed var(--border)', fontSize: 14, fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}>
          + Neue Konfiguration
        </button>
      ) : null}
    </div>
  );
}
