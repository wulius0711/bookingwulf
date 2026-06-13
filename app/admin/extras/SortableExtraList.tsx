'use client';

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';
import ExtraRow from './ExtraRow';

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

type Actions = {
  updateAction: (formData: FormData) => void | Promise<void>;
  toggleAction: (formData: FormData) => void | Promise<void>;
  toggleWidgetAction: (formData: FormData) => void | Promise<void>;
  toggleUpsellAction: (formData: FormData) => void | Promise<void>;
  deleteAction: (formData: FormData) => void | Promise<void>;
};

function SortableExtraRow({ extra, actions }: { extra: Extra; actions: Actions }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: extra.id });

  const dragHandle = (
    <div
      {...attributes}
      {...listeners}
      style={{
        cursor: isDragging ? 'grabbing' : 'grab',
        color: 'var(--text-disabled)',
        fontSize: 18,
        flexShrink: 0,
        touchAction: 'none',
        userSelect: 'none',
        padding: '0 4px',
      }}
    >
      ⠿
    </div>
  );

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        ...(isDragging && { zIndex: 1, position: 'relative' }),
      }}
    >
      <ExtraRow extra={extra} {...actions} dragHandle={dragHandle} />
    </div>
  );
}

export default function SortableExtraList({ initialExtras, actions }: { initialExtras: Extra[]; actions: Actions }) {
  const [extras, setExtras] = useState(initialExtras);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = extras.findIndex((e) => e.id === active.id);
    const newIndex = extras.findIndex((e) => e.id === over.id);
    const reordered = arrayMove(extras, oldIndex, newIndex);
    const updated = reordered.map((e, i) => ({ ...e, sortOrder: i * 10 }));

    setExtras(updated);

    const changed = updated.filter((e) => {
      const orig = extras.find((o) => o.id === e.id);
      return orig?.sortOrder !== e.sortOrder;
    });

    await Promise.all(changed.map((e) =>
      fetch(`/api/admin/extras/${e.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sortOrder: e.sortOrder }),
      })
    ));
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={extras.map((e) => e.id)} strategy={verticalListSortingStrategy}>
        <div style={{ display: 'grid', gap: 10, padding: 16 }}>
          {extras.map((extra) => (
            <SortableExtraRow key={extra.id} extra={extra} actions={actions} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
