'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';

interface FaqItem {
  q: string;
  a: string;
}

/** FAQ accordion — first item open by default. */
export function MarketingFaq(): React.JSX.Element {
  const t = useTranslations('marketing.faq');
  const items = t.raw('items') as FaqItem[];
  const [open, setOpen] = useState<number>(0);
  return (
    <section className="bg-surface-sunken py-24">
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="mb-8 text-center font-display text-4xl font-bold tracking-tight text-text-primary">{t('heading')}</h2>
        <div className="flex flex-col gap-3">
          {items.map((item, index) => (
            <div key={index} className="overflow-hidden rounded-2xl border border-border-subtle bg-surface-base">
              <button
                type="button"
                onClick={() => setOpen(open === index ? -1 : index)}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-start"
                aria-expanded={open === index}
              >
                <span className="font-display text-base font-semibold tracking-tight text-text-primary sm:text-lg">
                  {item.q}
                </span>
                <span
                  className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-raised transition-transform duration-200', open === index && 'rotate-45')}
                  aria-hidden
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 2v10M2 7h10" stroke="var(--text-secondary)" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </span>
              </button>
              {open === index && (
                <p className="px-6 pb-5 text-sm leading-relaxed text-text-secondary">{item.a}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
