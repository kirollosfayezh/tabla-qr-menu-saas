'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';
import { localizedField } from '../helpers';
import type { CategoryWithItems } from '../theme.types';

interface Props {
  categories: ReadonlyArray<CategoryWithItems>;
  locale: 'en' | 'ar';
}

/** Modern tabs — underline-style typography, no pills. */
export function ModernTabs({ categories, locale }: Props): React.JSX.Element {
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

  return (
    <nav className="no-scrollbar sticky top-0 z-30 overflow-x-auto bg-[var(--d-bg)]/95 px-5 py-3 backdrop-blur">
      <ul className="flex w-max gap-5">
        {categories.map((cat) => {
          const isActive = cat.id === active;
          return (
            <li key={cat.id}>
              <button
                type="button"
                onClick={() => document.getElementById(cat.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                className={cn(
                  'whitespace-nowrap pb-1.5 font-display text-[17px] tracking-tight transition',
                  isActive
                    ? 'border-b-2 border-[var(--d-primary)] font-bold text-[var(--d-text)]'
                    : 'border-b-2 border-transparent font-medium text-[var(--d-text-soft)]',
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
