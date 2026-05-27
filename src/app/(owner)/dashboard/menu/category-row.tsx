'use client';

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/cn';
import type { CategoryView } from './types';

interface Props {
  category: CategoryView;
  active: boolean;
  onSelect: () => void;
  onRename: (name: string, nameAr: string) => Promise<void> | void;
  onDelete: () => void;
}

/** Single sortable row in the categories sidebar. */
export function CategoryRow({ category, active, onSelect, onRename, onDelete }: Props): React.JSX.Element {
  const t = useTranslations('owner.menu');
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: category.id,
  });
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(category.name);
  const [nameAr, setNameAr] = useState(category.nameAr ?? '');

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  function commit(): void {
    setEditing(false);
    if (name.trim() === category.name && (nameAr.trim() || '') === (category.nameAr ?? '')) return;
    void onRename(name.trim() || category.name, nameAr.trim());
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        'group flex items-center gap-2 rounded-lg px-2 py-2 text-sm',
        active ? 'bg-brand-primary-soft text-brand-primary-dark' : 'hover:bg-surface-raised',
      )}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label="Drag"
        className="cursor-grab text-text-tertiary hover:text-text-secondary"
      >
        ⋮⋮
      </button>
      {editing ? (
        <div className="flex flex-1 flex-col gap-1">
          <Input value={name} onChange={(e) => setName(e.target.value)} onBlur={commit} autoFocus />
          <Input dir="rtl" value={nameAr} placeholder={t('categoryNameAr')} onChange={(e) => setNameAr(e.target.value)} onBlur={commit} />
        </div>
      ) : (
        <button type="button" onClick={onSelect} className="flex-1 truncate text-start font-medium">
          {category.name}
        </button>
      )}
      <button
        type="button"
        onClick={() => setEditing((v) => !v)}
        aria-label={t('rename')}
        className="invisible text-text-tertiary group-hover:visible hover:text-text-primary"
      >
        ✎
      </button>
      <button
        type="button"
        onClick={onDelete}
        aria-label={t('deleteCategory')}
        className="invisible text-text-tertiary group-hover:visible hover:text-danger"
      >
        ✕
      </button>
    </li>
  );
}
