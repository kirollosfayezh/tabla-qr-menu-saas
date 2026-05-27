'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';
import { formatPrice } from './format';
import type { ItemView } from './types';

interface Props {
  item: ItemView;
  currencyCode: string;
  locale: string;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: (next: boolean) => void;
}

export function ItemCard({ item, currencyCode, locale, onEdit, onDelete, onToggle }: Props): React.JSX.Element {
  const t = useTranslations('owner.menu');
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border bg-surface-base shadow-sm transition',
        item.isAvailable ? 'border-border-subtle' : 'border-border-subtle opacity-60',
      )}
    >
      <div className="relative h-32 bg-surface-raised">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
        ) : null}
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label="Drag"
          className="absolute start-2 top-2 cursor-grab rounded-full bg-surface-base/80 px-2 py-0.5 text-xs text-text-secondary backdrop-blur"
        >
          ⋮⋮
        </button>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 text-sm font-semibold text-text-primary">{item.name}</h3>
          <span className="shrink-0 text-sm font-medium text-text-primary">
            {formatPrice(item.priceCents, currencyCode, locale)}
          </span>
        </div>
        {item.description ? (
          <p className="line-clamp-2 text-xs text-text-secondary">{item.description}</p>
        ) : null}
        <div className="mt-auto flex items-center justify-between pt-2">
          <label className="flex items-center gap-1.5 text-xs text-text-secondary">
            <input
              type="checkbox"
              checked={item.isAvailable}
              onChange={(e) => onToggle(e.target.checked)}
              className="h-3.5 w-3.5 accent-brand-primary"
            />
            {item.isAvailable ? t('available') : t('unavailable')}
          </label>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={onEdit}
              className="rounded-full px-2 py-1 text-xs text-text-secondary hover:bg-surface-raised hover:text-text-primary"
            >
              {t('editItem')}
            </button>
            <button
              type="button"
              onClick={onDelete}
              aria-label={t('deleteItem')}
              className="rounded-full px-2 py-1 text-xs text-text-tertiary hover:text-danger"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
