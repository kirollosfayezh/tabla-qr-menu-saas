'use client';

import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, arrayMove, rectSortingStrategy } from '@dnd-kit/sortable';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { ItemCard } from './item-card';
import { isPendingId } from './use-menu-actions';
import type { CategoryView, ItemView } from './types';

interface Props {
  category: CategoryView | null;
  items: ReadonlyArray<ItemView>;
  currencyCode: string;
  locale: string;
  onAdd: () => void;
  onEdit: (item: ItemView) => void;
  onDelete: (item: ItemView) => void;
  onToggle: (item: ItemView, next: boolean) => void;
  onReorder: (categoryId: string, ids: string[]) => Promise<void>;
  onBulkPrice: () => void;
}

export function ItemsPanel(props: Props): React.JSX.Element {
  const { category, items, currencyCode, locale, onAdd, onEdit, onDelete, onToggle, onReorder, onBulkPrice } = props;
  const t = useTranslations('owner.menu');
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));

  function onDragEnd(e: DragEndEvent): void {
    if (!category || !e.over || e.active.id === e.over.id) return;
    const oldIndex = items.findIndex((i) => i.id === e.active.id);
    const newIndex = items.findIndex((i) => i.id === e.over!.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const ids = arrayMove(items.slice(), oldIndex, newIndex).map((i) => i.id);
    void onReorder(category.id, ids);
  }

  if (!category) {
    return (
      <section className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-border-default bg-surface-base p-10 text-sm text-text-tertiary">
        {t('noCategories')}
      </section>
    );
  }

  return (
    <section className="flex flex-1 flex-col gap-4 rounded-2xl border border-border-subtle bg-surface-base p-4">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-lg font-semibold text-text-primary">{category.name}</h2>
        <div className="flex gap-2">
          {items.length > 0 ? (
            <Button type="button" variant="secondary" size="sm" onClick={onBulkPrice}>
              {t('bulkPrice')}
            </Button>
          ) : null}
          <Button
            type="button"
            size="sm"
            onClick={onAdd}
            disabled={isPendingId(category.id)}
          >
            {t('addItem')}
          </Button>
        </div>
      </header>

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border-default p-6 text-center text-sm text-text-tertiary">
          {t('noItems')}
        </p>
      ) : (
        <DndContext sensors={sensors} onDragEnd={onDragEnd}>
          <SortableContext items={items.map((i) => i.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  currencyCode={currencyCode}
                  locale={locale}
                  onEdit={() => onEdit(item)}
                  onDelete={() => onDelete(item)}
                  onToggle={(next) => onToggle(item, next)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </section>
  );
}
