'use client';

import { useState } from 'react';
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CategoryRow } from './category-row';
import type { CategoryView } from './types';

interface Props {
  categories: ReadonlyArray<CategoryView>;
  activeId: string | null;
  onSelect: (id: string) => void;
  onCreate: (name: string) => Promise<void>;
  onRename: (id: string, name: string, nameAr: string) => Promise<void>;
  onDelete: (id: string) => void;
  onReorder: (ids: string[]) => Promise<void>;
}

export function CategoriesPanel(props: Props): React.JSX.Element {
  const { categories, activeId, onSelect, onCreate, onRename, onDelete, onReorder } = props;
  const t = useTranslations('owner.menu');
  const [draft, setDraft] = useState('');
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));

  function onDragEnd(e: DragEndEvent): void {
    if (!e.over || e.active.id === e.over.id) return;
    const oldIndex = categories.findIndex((c) => c.id === e.active.id);
    const newIndex = categories.findIndex((c) => c.id === e.over!.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const reordered = arrayMove(categories.slice(), oldIndex, newIndex).map((c) => c.id);
    void onReorder(reordered);
  }

  async function submit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    const name = draft.trim();
    if (!name) return;
    setDraft('');
    await onCreate(name);
  }

  return (
    <section className="flex w-full flex-col gap-3 rounded-2xl border border-border-subtle bg-surface-base p-4 lg:max-w-xs">
      <h2 className="font-display text-base font-semibold text-text-primary">{t('title')}</h2>
      <form onSubmit={submit} className="flex gap-2">
        <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={t('newCategory')} />
        <Button type="submit" size="sm">{t('addCategory')}</Button>
      </form>
      {categories.length === 0 ? (
        <p className="text-xs text-text-tertiary">{t('noCategories')}</p>
      ) : (
        <DndContext sensors={sensors} onDragEnd={onDragEnd}>
          <SortableContext items={categories.map((c) => c.id)} strategy={verticalListSortingStrategy}>
            <ul className="space-y-1">
              {categories.map((c) => (
                <CategoryRow
                  key={c.id}
                  category={c}
                  active={c.id === activeId}
                  onSelect={() => onSelect(c.id)}
                  onRename={(name, nameAr) => onRename(c.id, name, nameAr)}
                  onDelete={() => onDelete(c.id)}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}
    </section>
  );
}
