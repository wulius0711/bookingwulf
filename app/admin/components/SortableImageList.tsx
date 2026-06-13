'use client';

import { useState } from 'react';
import { upload } from '@vercel/blob/client';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type ImageItem = { id: string; url: string; alt: string };

interface SortableImageProps {
  item: ImageItem;
  onRemove: () => void;
  onUrlChange: (url: string) => void;
  onAltChange: (alt: string) => void;
}

function SortableImage({ item, onRemove, onUrlChange, onAltChange }: SortableImageProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const blob = await upload(file.name, file, { access: 'public', handleUploadUrl: '/api/upload' });
      onUrlChange(blob.url);
    } catch {
      setError('Upload fehlgeschlagen');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        border: '1px solid var(--border)',
        borderRadius: 10,
        padding: 10,
        background: 'var(--surface)',
        display: 'grid',
        gap: 8,
        width: 200,
        flexShrink: 0,
        ...(isDragging && { zIndex: 1, position: 'relative' }),
      }}
    >
      {/* Hidden inputs — DOM order = sortOrder for the server action */}
      <input type="hidden" name="imageUrl" value={item.url} />

      <div
        {...attributes}
        {...listeners}
        style={{ display: 'flex', justifyContent: 'center', cursor: isDragging ? 'grabbing' : 'grab', color: 'var(--text-disabled)', fontSize: 16, touchAction: 'none', userSelect: 'none' }}
      >
        ⠿
      </div>

      <div style={{ position: 'relative' }}>
        {item.url ? (
          <img src={item.url} alt={item.alt || 'Bild'} style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 6, display: 'block' }} />
        ) : (
          <div style={{ width: '100%', height: 120, borderRadius: 6, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-disabled)', fontSize: 13 }}>
            Kein Bild
          </div>
        )}
        <button
          type="button"
          onClick={onRemove}
          style={{ position: 'absolute', top: 5, right: 5, width: 22, height: 22, borderRadius: 6, background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          ×
        </button>
      </div>

      <label style={{ display: 'block', padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-muted)', fontSize: 12, cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.6 : 1, textAlign: 'center' }}>
        {uploading ? 'Lädt…' : item.url ? 'Anderes Bild' : 'Bild hochladen'}
        <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleFile} disabled={uploading} style={{ display: 'none' }} />
      </label>

      {error && <span style={{ fontSize: 11, color: '#dc2626' }}>{error}</span>}

      <input
        name="altText"
        value={item.alt}
        onChange={(e) => onAltChange(e.target.value)}
        placeholder="Alt Text"
        style={{ padding: '6px 8px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12, fontFamily: 'inherit', color: 'var(--text-primary)', background: 'var(--surface)' }}
      />
    </div>
  );
}

export function SortableImageList({ initialImages }: { initialImages: { imageUrl: string; altText: string | null }[] }) {
  const [images, setImages] = useState<ImageItem[]>(
    initialImages.map((img, i) => ({ id: String(i), url: img.imageUrl, alt: img.altText ?? '' }))
  );

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setImages((prev) => arrayMove(prev, prev.findIndex((i) => i.id === active.id), prev.findIndex((i) => i.id === over.id)));
  }

  function addImage() {
    setImages((prev) => [...prev, { id: crypto.randomUUID(), url: '', alt: '' }]);
  }

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={images.map((i) => i.id)} strategy={rectSortingStrategy}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {images.map((item) => (
              <SortableImage
                key={item.id}
                item={item}
                onRemove={() => setImages((prev) => prev.filter((i) => i.id !== item.id))}
                onUrlChange={(url) => setImages((prev) => prev.map((i) => i.id === item.id ? { ...i, url } : i))}
                onAltChange={(alt) => setImages((prev) => prev.map((i) => i.id === item.id ? { ...i, alt } : i))}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <div>
        <button
          type="button"
          onClick={addImage}
          style={{ padding: '7px 14px', borderRadius: 8, border: '1px dashed var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          + Bild hinzufügen
        </button>
      </div>
    </div>
  );
}
