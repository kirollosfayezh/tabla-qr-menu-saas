'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/cn';
import { localizedField } from '../helpers';
import type { CategoryWithItems } from '../theme.types';

interface Props {
  categories: ReadonlyArray<CategoryWithItems>;
  locale: 'en' | 'ar';
}

/**
 * Sticky horizontal tabs. Clicking a tab smooth-scrolls to its section.
 * Active tab tracks the most recently visible section via IntersectionObserver.
 */
export function ClassicTabs({ categories, locale }: Props): React.JSX.Element {
  const [active, setActive] = useState<string>(categories[0]?.id ?? '');

  useEffect(() => {
    if (categories.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: '-30% 0px -60% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    for (const cat of categories) {
      const el = document.getElementById(cat.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [categories]);

  function go(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <nav className="no-scrollbar sticky top-0 z-30 overflow-x-auto border-y border-[var(--d-border)] bg-[var(--d-bg)]/95 py-2 backdrop-blur">
      <ul className="flex w-max gap-2 px-4">
        {categories.map((cat) => {
          const isActive = cat.id === active;
          return (
            <li key={cat.id}>
              <button
                type="button"
                onClick={() => go(cat.id)}
                className={cn(
                  'h-8 whitespace-nowrap rounded-full px-4 text-sm font-semibold transition',
                  isActive
                    ? 'bg-[var(--d-primary)] text-[var(--d-on-primary)] shadow'
                    : 'border border-[var(--d-border)] text-[var(--d-text-soft)] hover:bg-[var(--d-surface)]',
                )}
              >
                {localizedField(cat.name, cat.nameAr, locale)}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
