'use client';

import { useTranslations } from 'next-intl';
import { STEP_ORDER, type StepKey } from './types';
import { cn } from '@/lib/cn';

interface Props {
  current: StepKey;
}

/** Horizontal step indicator at the top of the wizard. */
export function ProgressBar({ current }: Props): React.JSX.Element {
  const t = useTranslations('onboarding');
  const idx = STEP_ORDER.indexOf(current);

  return (
    <ol className="flex items-center gap-2">
      {STEP_ORDER.map((key, i) => {
        const done = i < idx;
        const active = i === idx;
        return (
          <li key={key} className="flex flex-1 items-center gap-2">
            <span
              className={cn(
                'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                done && 'bg-brand-primary text-white',
                active && 'bg-brand-primary-soft text-brand-primary-dark ring-2 ring-brand-primary',
                !done && !active && 'bg-surface-raised text-text-tertiary',
              )}
            >
              {i + 1}
            </span>
            <span
              className={cn(
                'truncate text-xs font-medium',
                active ? 'text-text-primary' : 'text-text-tertiary',
              )}
            >
              {t(`steps.${key}`)}
            </span>
            {i < STEP_ORDER.length - 1 ? (
              <span
                className={cn(
                  'mx-1 hidden h-px flex-1 sm:block',
                  done ? 'bg-brand-primary' : 'bg-border-subtle',
                )}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
