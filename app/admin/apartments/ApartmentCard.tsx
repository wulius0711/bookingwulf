'use client';

import { useState } from 'react';
import Link from 'next/link';

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
  duplicateAction: (formData: FormData) => void;
  deleteAction: (formData: FormData) => void;
};

export default function ApartmentCard({ apartment: a, duplicateAction, deleteAction }: ApartmentCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{
        border: '1px solid #ddd',
        borderRadius: 14,
        background: '#fff',
        color: '#111',
        overflow: 'hidden',
      }}
    >
      {/* Header - always visible */}
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
          background: open ? '#fafafa' : '#fff',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 18 }}>{a.name}</div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '3px 10px',
              borderRadius: 999,
              background: a.hotel?.accentColor || '#eee',
              color: '#fafafa',
              fontSize: 11,
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: 999,
                background: 'rgba(255,255,255,0.9)',
                display: 'inline-block',
              }}
            />
            {a.hotel?.name ?? 'Kein Hotel'}
          </div>

          {!a.isActive && (
            <span
              style={{
                padding: '2px 8px',
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 700,
                background: '#fef2f2',
                color: '#b91c1c',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                flexShrink: 0,
              }}
            >
              Inaktiv
            </span>
          )}
        </div>

        <span
          style={{
            fontSize: 18,
            color: '#999',
            transition: 'transform 0.2s ease',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            flexShrink: 0,
          }}
        >
          ▾
        </span>
      </div>

      {/* Body - collapsible */}
      <div
        style={{
          display: 'grid',
          gridTemplateRows: open ? '1fr' : '0fr',
          transition: 'grid-template-rows 0.25s ease',
        }}
      >
        <div style={{ overflow: 'hidden' }}>
          <div style={{ padding: '0 20px 20px', borderTop: '1px solid #eee' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '8px 24px',
                marginTop: 16,
                fontSize: 14,
              }}
            >
              <div><strong>ID:</strong> {a.id}</div>
              <div><strong>Slug:</strong> {a.slug}</div>
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
              <div style={{ marginTop: 10, color: '#555', fontSize: 14, lineHeight: 1.5 }}>
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
              <Link
                href={`/admin/apartments/${a.id}`}
                style={{
                  textDecoration: 'none',
                  padding: '10px 14px',
                  border: '1px solid #111',
                  borderRadius: 999,
                  color: '#111',
                  background: '#fff',
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                Bearbeiten
              </Link>

              <form action={duplicateAction}>
                <input type="hidden" name="id" value={a.id} />
                <button
                  type="submit"
                  style={{
                    padding: '10px 14px',
                    border: '1px solid #111',
                    borderRadius: 999,
                    color: '#111',
                    background: '#fff',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                >
                  Duplizieren
                </button>
              </form>

              <form action={deleteAction}>
                <input type="hidden" name="id" value={a.id} />
                <button
                  type="submit"
                  style={{
                    padding: '10px 14px',
                    border: '1px solid #c43c57',
                    borderRadius: 999,
                    color: '#c43c57',
                    background: '#fff',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                >
                  Löschen
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
