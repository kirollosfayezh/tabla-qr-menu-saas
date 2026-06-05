'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';

type FilterValue = 'all' | 'DINE_IN' | 'DELIVERY';

/** Dine-in / Delivery filter pills. Updates ?type= in the URL → server re-renders. */
export function FulfillmentFilter({ current }: { current: FilterValue }): React.JSX.Element {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations('owner.orders');

  function select(value: FilterValue): void {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'all') params.delete('type');
    else params.set('type', value);
    router.push(`${pathname}?${params.toString()}`);
  }

  const options: ReadonlyArray<{ value: FilterValue; label: string }> = [
    { value: 'all', label: t('filterAll') },
    { value: 'DINE_IN', label: t('dineIn') },
    { value: 'DELIVERY', label: t('delivery') },
  ];

  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((option) => {
        const active = current === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => select(option.value)}
            className={cn(
              'h-8 rounded-full px-3.5 text-xs font-semibold transition',
              active
                ? 'bg-brand-primary text-white'
                : 'border border-border-default bg-surface-base text-text-secondary hover:bg-surface-raised',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
