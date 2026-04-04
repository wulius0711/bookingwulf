'use client';

import { useMemo, useState } from 'react';

type ApartmentImage = {
  id: number;
  imageUrl: string;
  altText?: string | null;
  sortOrder?: number;
};

type ApartmentGalleryProps = {
  images: ApartmentImage[];
  apartmentName?: string;
};

const buttonBase: React.CSSProperties = {
  width: 44,
  height: 44,
  borderRadius: 999,
  border: '1px solid rgba(255,255,255,0.22)',
  background: 'rgba(0,0,0,0.38)',
  color: '#fff',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 22,
  lineHeight: 1,
};

export default function ApartmentGallery({
  images,
  apartmentName = 'Apartment',
}: ApartmentGalleryProps) {
  const sortedImages = useMemo(
    () => [...images].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    [images],
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (!sortedImages.length) {
    return (
      <div
        style={{
          border: '1px solid #e8e8e8',
          borderRadius: 20,
          padding: 24,
          background: '#fafafa',
          color: '#666',
        }}
      >
        Keine Bilder vorhanden.
      </div>
    );
  }

  const activeImage = sortedImages[activeIndex];

  function goPrev() {
    setActiveIndex((prev) => (prev === 0 ? sortedImages.length - 1 : prev - 1));
  }

  function goNext() {
    setActiveIndex((prev) => (prev === sortedImages.length - 1 ? 0 : prev + 1));
  }

  return (
    <>
      <div style={{ display: 'grid', gap: 14 }}>
        <div
          style={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 24,
            background: '#f3f3f3',
            minHeight: 420,
          }}
        >
          <img
            src={activeImage.imageUrl}
            alt={activeImage.altText || apartmentName}
            style={{
              width: '100%',
              height: 420,
              objectFit: 'cover',
              display: 'block',
              cursor: 'zoom-in',
            }}
            onClick={() => setLightboxOpen(true)}
          />

          {sortedImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={goPrev}
                aria-label="Vorheriges Bild"
                style={{
                  ...buttonBase,
                  position: 'absolute',
                  left: 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                }}
              >
                ‹
              </button>

              <button
                type="button"
                onClick={goNext}
                aria-label="Nächstes Bild"
                style={{
                  ...buttonBase,
                  position: 'absolute',
                  right: 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                }}
              >
                ›
              </button>
            </>
          )}

          <div
            style={{
              position: 'absolute',
              left: 16,
              bottom: 16,
              background: 'rgba(0,0,0,0.48)',
              color: '#fff',
              padding: '8px 12px',
              borderRadius: 999,
              fontSize: 13,
            }}
          >
            {activeIndex + 1} / {sortedImages.length}
          </div>
        </div>

        {sortedImages.length > 1 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
              gap: 10,
            }}
          >
            {sortedImages.map((image, index) => (
              <button
                key={image.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                style={{
                  padding: 0,
                  borderRadius: 14,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border:
                    index === activeIndex ? '2px solid #111' : '1px solid #ddd',
                  background: '#fff',
                }}
                aria-label={`Bild ${index + 1}`}
              >
                <img
                  src={image.imageUrl}
                  alt={image.altText || `${apartmentName} ${index + 1}`}
                  style={{
                    width: '100%',
                    height: 78,
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {lightboxOpen && (
        <div
          onClick={() => setLightboxOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.88)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              width: 'min(1200px, 100%)',
              maxHeight: '90vh',
            }}
          >
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              aria-label="Lightbox schließen"
              style={{
                ...buttonBase,
                position: 'absolute',
                top: 12,
                right: 12,
                zIndex: 2,
              }}
            >
              ×
            </button>

            <img
              src={activeImage.imageUrl}
              alt={activeImage.altText || apartmentName}
              style={{
                width: '100%',
                maxHeight: '90vh',
                objectFit: 'contain',
                display: 'block',
                borderRadius: 20,
              }}
            />

            {sortedImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={goPrev}
                  aria-label="Vorheriges Bild"
                  style={{
                    ...buttonBase,
                    position: 'absolute',
                    left: 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                  }}
                >
                  ‹
                </button>

                <button
                  type="button"
                  onClick={goNext}
                  aria-label="Nächstes Bild"
                  style={{
                    ...buttonBase,
                    position: 'absolute',
                    right: 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                  }}
                >
                  ›
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
