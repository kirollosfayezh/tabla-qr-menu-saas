'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { cn } from '@/lib/cn';
import { PERIOD_KEYS, PERIODS } from '@/lib/period';

/** Period pill tabs. Updates ?period= in URL → server re-renders with new data. */
export function PeriodSelector({ current }: { current: string }): React.JSX.Element {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const isAr = locale === 'ar';

  function select(key: string): void {
    const params = new URLSearchParams(searchParams.toString());
    params.set('period', key);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {PERIOD_KEYS.map((key) => {
        const def = PERIODS[key];
        const active = current === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => select(key)}
            className={cn(
              'h-8 rounded-full px-3.5 text-xs font-semibold transition',
              active
                ? 'bg-brand-primary text-white'
                : 'border border-border-default bg-surface-base text-text-secondary hover:bg-surface-raised',
            )}
          >
            {isAr ? def.labelAr : def.label}
          </button>
        );
      })}
    </div>
  );
}
