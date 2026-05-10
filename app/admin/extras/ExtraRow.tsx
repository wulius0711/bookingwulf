'use client';

import { useState } from 'react';
import { Button, ConfirmDialog } from '../components/ui';

const BILLING_LABELS: Record<string, string> = {
  per_night: 'pro Nacht',
  per_person_per_night: 'pro Person / Nacht',
  per_stay: 'pro Aufenthalt',
  per_person_per_stay: 'pro Person / Aufenthalt',
};

const TYPE_LABELS: Record<string, string> = {
  extra: 'Zusatzleistung',
  insurance: 'Versicherung',
};

type Extra = {
  id: number;
  name: string;
  nameEn: string | null;
  nameIt: string | null;
  type: string;
  billingType: string;
  price: number;
  description: string | null;
  descriptionEn: string | null;
  descriptionIt: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  exclusiveGroup: string | null;
  isActive: boolean;
  showInWidget: boolean;
  showInUpsell: boolean;
  sortOrder: number;
};

type Props = {
  extra: Extra;
  updateAction: (formData: FormData) => void | Promise<void>;
  toggleAction: (formData: FormData) => void | Promise<void>;
  toggleWidgetAction: (formData: FormData) => void | Promise<void>;
  toggleUpsellAction: (formData: FormData) => void | Promise<void>;
  deleteAction: (formData: FormData) => void | Promise<void>;
};

const labelSt: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  color: 'var(--text-secondary)',
  textTransform: 'uppercase',
};

const chevron = (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function ExtraRow({ extra, updateAction, toggleAction, toggleWidgetAction, toggleUpsellAction, deleteAction }: Props) {
  const [editing, setEditing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState(extra.imageUrl || '');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload-single', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload fehlgeschlagen.');
      setImageUrl(data.url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload fehlgeschlagen.');
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete() {
    const fd = new FormData();
    fd.set('id', String(extra.id));
    await deleteAction(fd);
  }

  if (editing) {
    return (
      <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
        <td colSpan={8} style={{ padding: 16 }}>
          <form action={updateAction} style={{ display: 'grid', gap: 12 }}>
            <input type="hidden" name="id" value={extra.id} />

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr 1fr 80px', gap: 10, alignItems: 'end' }}>
              <div style={{ display: 'grid', gap: 4 }}>
                <label style={labelSt}>Name</label>
                <input name="name" required defaultValue={extra.name} className="ui-input" style={{ fontSize: 13 }} />
              </div>
              <div style={{ display: 'grid', gap: 4 }}>
                <label style={labelSt}>Typ</label>
                <div className="ui-select-wrapper">
                  <select name="type" defaultValue={extra.type} className="ui-select-control" style={{ fontSize: 13 }}>
                    <option value="extra">Zusatzleistung</option>
                    <option value="insurance">Versicherung</option>
                  </select>
                  <span className="ui-select-chevron">{chevron}</span>
                </div>
              </div>
              <div style={{ display: 'grid', gap: 4 }}>
                <label style={labelSt}>Abrechnung</label>
                <div className="ui-select-wrapper">
                  <select name="billingType" defaultValue={extra.billingType} className="ui-select-control" style={{ fontSize: 13 }}>
                    <option value="per_stay">pro Aufenthalt</option>
                    <option value="per_night">pro Nacht</option>
                    <option value="per_person_per_night">pro Person / Nacht</option>
                    <option value="per_person_per_stay">pro Person / Aufenthalt</option>
                  </select>
                  <span className="ui-select-chevron">{chevron}</span>
                </div>
              </div>
              <div style={{ display: 'grid', gap: 4 }}>
                <label style={labelSt}>Preis</label>
                <input name="price" type="number" min="0" step="0.01" required defaultValue={extra.price} className="ui-input" style={{ fontSize: 13 }} />
              </div>
              <div style={{ display: 'grid', gap: 4 }}>
                <label style={labelSt}>Nr.</label>
                <input name="sortOrder" type="number" min="0" defaultValue={extra.sortOrder} className="ui-input" style={{ fontSize: 13 }} />
              </div>
            </div>

            <div style={{ display: 'grid', gap: 4 }}>
              <label style={labelSt}>Beschreibung</label>
              <input name="description" defaultValue={extra.description || ''} placeholder="Kurze Beschreibung (optional)" className="ui-input" />
            </div>

            <div style={{ display: 'grid', gap: 4 }}>
              <label style={labelSt}>
                Bild{' '}
                <span style={{ fontWeight: 400, textTransform: 'none', fontSize: 10, color: 'var(--text-disabled)' }}>(optional)</span>
              </label>
              <input type="hidden" name="imageUrl" value={imageUrl} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                {imageUrl && (
                  <div style={{ position: 'relative' }}>
                    <img src={imageUrl} alt="" style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border)', display: 'block' }} />
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%', background: 'var(--primitive-gray-700)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      ×
                    </button>
                  </div>
                )}
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-secondary)', fontSize: 12, cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.6 : 1 }}>
                  {uploading ? 'Lädt…' : imageUrl ? 'Anderes Bild' : 'Hochladen'}
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} disabled={uploading} style={{ display: 'none' }} />
                </label>
                {uploadError && <span style={{ fontSize: 11, color: 'var(--danger)' }}>{uploadError}</span>}
              </div>
            </div>

            <div style={{ display: 'grid', gap: 4 }}>
              <label style={labelSt}>
                Link-URL{' '}
                <span style={{ fontWeight: 400, textTransform: 'none', fontSize: 10, color: 'var(--text-disabled)' }}>(optional)</span>
              </label>
              <input name="linkUrl" type="url" defaultValue={extra.linkUrl || ''} placeholder="https://..." className="ui-input" />
            </div>

            <div style={{ display: 'grid', gap: 4 }}>
              <label style={labelSt}>
                Varianten-Gruppe{' '}
                <span style={{ fontWeight: 400, textTransform: 'none', fontSize: 10, color: 'var(--text-disabled)' }}>(optional)</span>
              </label>
              <input name="exclusiveGroup" defaultValue={extra.exclusiveGroup || ''} placeholder="z. B. hotelstorno" className="ui-input" />
              <p style={{ margin: 0, fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Extras mit dem gleichen Gruppen-Namen schließen sich aus — der Gast kann nur eine davon buchen.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Button variant="ghost" size="sm" type="button" onClick={() => setEditing(false)}>Abbrechen</Button>
              <Button variant="primary" size="sm" type="submit">Speichern</Button>
            </div>
          </form>
        </td>
      </tr>
    );
  }

  return (
    <>
      <tr style={{ borderBottom: '1px solid var(--border)' }}>
        <td style={{ padding: '12px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {extra.imageUrl && (
              <img src={extra.imageUrl} alt="" style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
            )}
            <div>
              <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{extra.name}</div>
              {extra.description && <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{extra.description}</div>}
            </div>
          </div>
        </td>
        <td style={{ padding: '12px 16px' }}>
          <span style={{
            padding: '2px 8px',
            borderRadius: 8,
            fontSize: 11,
            fontWeight: 600,
            background: extra.type === 'insurance' ? 'var(--status-pending-bg)' : 'var(--status-new-bg)',
            color: extra.type === 'insurance' ? 'var(--status-pending-text)' : 'var(--status-new-text)',
          }}>
            {TYPE_LABELS[extra.type] ?? extra.type}
          </span>
        </td>
        <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{BILLING_LABELS[extra.billingType] ?? extra.billingType}</td>
        <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-primary)' }}>{'€'} {extra.price.toFixed(2)}</td>
        <td style={{ padding: '12px 16px' }}>
          {extra.linkUrl ? (
            <a href={extra.linkUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-text)', textDecoration: 'none' }}>Link</a>
          ) : '—'}
        </td>
        <td style={{ padding: '12px 16px' }}>
          <form action={toggleAction} style={{ margin: 0 }}>
            <input type="hidden" name="id" value={extra.id} />
            <input type="hidden" name="isActive" value={extra.isActive ? 'false' : 'true'} />
            <button
              type="submit"
              title={extra.isActive ? 'Klicken zum Deaktivieren' : 'Klicken zum Aktivieren'}
              style={{
                padding: '3px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer',
                background: extra.isActive ? 'var(--status-booked-bg)' : 'var(--bg-surface-sunken)',
                color: extra.isActive ? 'var(--status-booked-text)' : 'var(--text-secondary)',
              }}
            >
              {extra.isActive ? 'Aktiv' : 'Inaktiv'}
            </button>
          </form>
        </td>
        <td style={{ padding: '12px 16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <form action={toggleWidgetAction} style={{ margin: 0 }}>
              <input type="hidden" name="id" value={extra.id} />
              <input type="hidden" name="showInWidget" value={extra.showInWidget ? 'false' : 'true'} />
              <button
                type="submit"
                title="Im Buchungs-Widget anzeigen"
                style={{
                  padding: '2px 8px', borderRadius: 20, border: 'none', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                  background: extra.showInWidget ? 'var(--status-new-bg)' : 'var(--bg-surface-sunken)',
                  color: extra.showInWidget ? 'var(--status-new-text)' : 'var(--text-disabled)',
                }}
              >
                Widget{extra.showInWidget ? ' ✓' : ''}
              </button>
            </form>
            <form action={toggleUpsellAction} style={{ margin: 0 }}>
              <input type="hidden" name="id" value={extra.id} />
              <input type="hidden" name="showInUpsell" value={extra.showInUpsell ? 'false' : 'true'} />
              <button
                type="submit"
                title="Im Bestätigungs-E-Mail als Upsell anbieten"
                style={{
                  padding: '2px 8px', borderRadius: 20, border: 'none', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                  background: extra.showInUpsell ? 'var(--status-booked-bg)' : 'var(--bg-surface-sunken)',
                  color: extra.showInUpsell ? 'var(--status-booked-text)' : 'var(--text-disabled)',
                }}
              >
                Upsell{extra.showInUpsell ? ' ✓' : ''}
              </button>
            </form>
          </div>
        </td>
        <td style={{ padding: '12px 16px' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>Bearbeiten</Button>
            <Button variant="danger" size="sm" onClick={() => setConfirmOpen(true)}>Löschen</Button>
          </div>
        </td>
      </tr>
      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Zusatzleistung löschen"
        description={`„${extra.name}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`}
        confirmLabel="Löschen"
        dangerous
      />
    </>
  );
}
