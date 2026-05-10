'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, ConfirmDialog } from '../components/ui';

type ApartmentCardProps = {
  apartment: {
    id: number;
    name: string;
    slug: string;
    hotelId: number;
    isActive: boolean;
    maxAdults: number;
    maxChildren: number;
    bedrooms: number | null;
    size: number | null;
    view: string | null;
    basePrice: number | null;
    cleaningFee: number | null;
    sortOrder: number;
    description: string | null;
    amenities: string[];
    hotel: { id: number; name: string; slug: string; accentColor: string | null } | null;
    images: { imageUrl: string; altText: string | null }[];
  };
  showHotelBadge?: boolean;
  duplicateAction: (formData: FormData) => void | Promise<void>;
  deleteAction: (formData: FormData) => void | Promise<void>;
};

export default function ApartmentCard({ apartment: a, showHotelBadge = true, duplicateAction, deleteAction }: ApartmentCardProps) {
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function handleDelete() {
    const fd = new FormData();
    fd.set('id', String(a.id));
    await deleteAction(fd);
  }

  return (
    <>
      <div
        style={{
          border: '1px solid var(--border)',
          borderRadius: 14,
          background: 'var(--bg-surface)',
          color: 'var(--text-primary)',
          overflow: 'hidden',
        }}
      >
        <div
          onClick={() => setOpen(!open)}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
            padding: '16px 20px',
            cursor: 'pointer',
            userSelect: 'none',
            transition: 'background 0.15s ease',
            background: open ? 'var(--bg-surface-raised)' : 'var(--bg-surface)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 18 }}>{a.name}</div>

            {!a.isActive && (
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: 8,
                  fontSize: 11,
                  fontWeight: 700,
                  background: 'var(--status-cancelled-bg)',
                  color: 'var(--status-cancelled-text)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  flexShrink: 0,
                }}
              >
                Inaktiv
              </span>
            )}

            {showHotelBadge && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '3px 10px',
                  borderRadius: 8,
                  background: a.hotel?.accentColor || '#eee',
                  color: '#fafafa',
                  fontSize: 11,
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                <span style={{ width: 7, height: 7, borderRadius: 8, background: 'rgba(255,255,255,0.9)', display: 'inline-block' }} />
                {a.hotel?.name ?? 'Kein Hotel'}
              </div>
            )}
          </div>

          <span
            style={{
              fontSize: 18,
              color: 'var(--text-disabled)',
              transition: 'transform 0.2s ease',
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
              flexShrink: 0,
            }}
          >
            ▾
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateRows: open ? '1fr' : '0fr',
            transition: 'grid-template-rows 0.25s ease',
          }}
        >
          <div style={{ overflow: 'hidden' }}>
            <div style={{ padding: '0 20px 20px', borderTop: '1px solid var(--border)' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '8px 24px',
                  marginTop: 16,
                  fontSize: 14,
                }}
              >
                <div><strong>Erwachsene:</strong> {a.maxAdults}</div>
                <div><strong>Kinder:</strong> {a.maxChildren}</div>
                <div><strong>Schlafzimmer:</strong> {a.bedrooms ?? '—'}</div>
                <div><strong>Größe:</strong> {a.size != null ? `${a.size} m²` : '—'}</div>
                <div><strong>Ausblick:</strong> {a.view || '—'}</div>
                <div><strong>Preis/Nacht:</strong> {a.basePrice != null ? `€${a.basePrice}` : '—'}</div>
                <div><strong>Reinigung:</strong> {a.cleaningFee != null ? `€${a.cleaningFee}` : '—'}</div>
                <div><strong>Sortierung:</strong> {a.sortOrder}</div>
                <div><strong>Bilder:</strong> {a.images.length}</div>
              </div>

              {a.amenities?.length > 0 && (
                <div style={{ marginTop: 12, fontSize: 14 }}>
                  <strong>Ausstattung:</strong> {a.amenities.join(', ')}
                </div>
              )}

              {a.description && (
                <div style={{ marginTop: 10, color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.5 }}>
                  <strong>Beschreibung:</strong> {a.description}
                </div>
              )}

              {a.images[0] && (
                <div style={{ marginTop: 14 }}>
                  <img
                    src={a.images[0].imageUrl}
                    alt={a.images[0].altText || a.name}
                    style={{ width: 220, height: 140, objectFit: 'cover', borderRadius: 10 }}
                  />
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
                <Link href={`/admin/apartments/${a.id}`} className="ui-btn ui-btn-secondary ui-btn-sm" style={{ textDecoration: 'none' }}>
                  Bearbeiten
                </Link>

                <form action={duplicateAction}>
                  <input type="hidden" name="id" value={a.id} />
                  <Button variant="secondary" size="sm" type="submit">Duplizieren</Button>
                </form>

                <Button variant="danger" size="sm" onClick={() => setConfirmOpen(true)}>Löschen</Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Apartment löschen"
        description={`„${a.name}" wirklich löschen? Alle zugehörigen Daten werden entfernt.`}
        confirmLabel="Löschen"
        dangerous
      />
    </>
  );
}
