import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { HTMLAttributes, ReactNode } from 'react';

export interface SortableControls {
  /** Tempimo rankenėlės atributai (uždedami ant mygtuko). */
  handleProps: HTMLAttributes<HTMLElement>;
  index: number;
  count: number;
  moveUp: () => void;
  moveDown: () => void;
}

interface Props<T extends { id: string }> {
  items: T[];
  onReorder: (items: T[]) => void;
  renderItem: (item: T, controls: SortableControls) => ReactNode;
  className?: string;
}

/** Sąrašas, kurį galima rikiuoti tempiant už rankenėlės arba rodyklėmis. */
export function SortableList<T extends { id: string }>({ items, onReorder, renderItem, className }: Props<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    onReorder(arrayMove(items, from, to));
  };

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    move(
      items.findIndex((i) => i.id === active.id),
      items.findIndex((i) => i.id === over.id),
    );
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <div className={className}>
          {items.map((item, index) => (
            <SortableRow key={item.id} id={item.id}>
              {(handleProps) =>
                renderItem(item, {
                  handleProps,
                  index,
                  count: items.length,
                  moveUp: () => move(index, index - 1),
                  moveDown: () => move(index, index + 1),
                })
              }
            </SortableRow>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortableRow({ id, children }: { id: string; children: (h: HTMLAttributes<HTMLElement>) => ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      className={isDragging ? 'sortable-row dragging' : 'sortable-row'}
      style={{ transform: CSS.Translate.toString(transform), transition }}
    >
      {children({ ...attributes, ...listeners })}
    </div>
  );
}
