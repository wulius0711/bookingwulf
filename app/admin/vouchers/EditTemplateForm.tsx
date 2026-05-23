'use client';

import { useState } from 'react';
import { updateVoucherTemplate } from './actions';
import { Button } from '../components/ui';

type Template = {
  id: number;
  name: string;
  type: string;
  value: number | { toNumber: () => number };
  price: number | { toNumber: () => number };
  description: string | null;
  validDays: number;
};

const labelSt: React.CSSProperties = {
  fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)',
  letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 6,
};

function toNum(v: number | { toNumber: () => number }) {
  return typeof v === 'number' ? v : v.toNumber();
}

export default function EditTemplateForm({ template }: { template: Template }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    await updateVoucherTemplate(formData);
    setOpen(false);
    setPending(false);
  }

  return (
    <>
      <Button variant="secondary" size="sm" type="button" onClick={() => setOpen(o => !o)}>
        {open ? 'Abbrechen' : 'Bearbeiten'}
      </Button>

      {open && (
        <form action={handleSubmit} style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
          <input type="hidden" name="id" value={template.id} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={labelSt}>Name *</label>
              <input name="name" required defaultValue={template.name} className="ui-input" />
            </div>
            <div>
              <label style={labelSt}>Typ</label>
              <div className="ui-select-wrapper">
                <select name="type" defaultValue={template.type} className="ui-select-control">
                  <option value="value">Wertgutschein</option>
                  <option value="nights">Übernachtungsgutschein</option>
                  <option value="service">Leistungsgutschein</option>
                </select>
                <span className="ui-select-chevron">
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>
            </div>
            <div>
              <label style={labelSt}>Nennwert (€) *</label>
              <input name="value" type="number" min="1" step="0.01" required defaultValue={toNum(template.value)} className="ui-input" />
            </div>
            <div>
              <label style={labelSt}>Verkaufspreis (€) *</label>
              <input name="price" type="number" min="1" step="0.01" required defaultValue={toNum(template.price)} className="ui-input" />
            </div>
            <div>
              <label style={labelSt}>Gültig (Tage)</label>
              <input name="validDays" type="number" min="30" defaultValue={template.validDays} className="ui-input" />
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={labelSt}>Beschreibung</label>
            <input name="description" defaultValue={template.description ?? ''} className="ui-input" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="primary" type="submit" disabled={pending}>
              {pending ? 'Speichern …' : 'Speichern'}
            </Button>
          </div>
        </form>
      )}
    </>
  );
}
