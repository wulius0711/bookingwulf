'use client';

import { useState } from 'react';
import { updateVoucherTemplate, toggleVoucherTemplate, deleteVoucherTemplate } from './actions';
import { Button, ConfirmDialog } from '../components/ui';

type Template = {
  id: number;
  name: string;
  type: string;
  value: number;
  price: number;
  description: string | null;
  validDays: number;
  isActive: boolean;
};

const TYPE_LABELS: Record<string, string> = {
  value: 'Wertgutschein',
  nights: 'Übernachtungsgutschein',
  service: 'Leistungsgutschein',
};

const eur = (n: number) =>
  new Intl.NumberFormat('de-AT', { style: 'currency', currency: 'EUR' }).format(n);

const labelSt: React.CSSProperties = {
  fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)',
  letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 6,
};

export default function TemplateCard({ template }: { template: Template }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function handleSave(formData: FormData) {
    setSaving(true);
    await updateVoucherTemplate(formData);
    setEditing(false);
    setSaving(false);
  }

  async function handleToggle() {
    await toggleVoucherTemplate(template.id, !template.isActive);
  }

  async function handleDelete() {
    await deleteVoucherTemplate(template.id);
  }

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 16, opacity: template.isActive ? 1 : 0.55 }}>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{template.name}</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
            {TYPE_LABELS[template.type]} · Nennwert {eur(template.value)} · Verkauf {eur(template.price)} · {template.validDays} Tage gültig
          </div>
          {template.description && (
            <div style={{ fontSize: 13, color: 'var(--text-disabled)', marginTop: 2 }}>{template.description}</div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
          <Button variant="secondary" size="sm" onClick={() => setEditing(e => !e)}>
            {editing ? 'Abbrechen' : 'Bearbeiten'}
          </Button>
          <Button variant="secondary" size="sm" onClick={handleToggle}>
            {template.isActive ? 'Deaktivieren' : 'Aktivieren'}
          </Button>
          <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)}>Löschen</Button>
        </div>
      </div>

      {/* Edit form */}
      {editing && (
        <form action={handleSave} style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
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
              <input name="value" type="number" min="1" step="0.01" required defaultValue={template.value} className="ui-input" />
            </div>
            <div>
              <label style={labelSt}>Verkaufspreis (€) *</label>
              <input name="price" type="number" min="1" step="0.01" required defaultValue={template.price} className="ui-input" />
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
            <Button variant="primary" type="submit" disabled={saving}>
              {saving ? 'Speichern …' : 'Speichern'}
            </Button>
          </div>
        </form>
      )}

      <ConfirmDialog
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Vorlage löschen"
        description="Diese Vorlage wirklich löschen? Bereits verkaufte Gutscheine bleiben erhalten."
        confirmLabel="Löschen"
        dangerous
      />
    </div>
  );
}
