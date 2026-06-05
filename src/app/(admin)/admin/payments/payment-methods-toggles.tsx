'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import type { PaymentMethodKey } from '@prisma/client';
import { setPaymentMethodAction } from '@/app/actions/admin.actions';
import { cn } from '@/lib/cn';

export interface MethodSetting {
  method: PaymentMethodKey;
  isActive: boolean;
}

const META: Record<PaymentMethodKey, { labelKey: string; subKey: string }> = {
  CARD: { labelKey: 'methodCard', subKey: 'methodCardSub' },
  APPLE_PAY: { labelKey: 'methodApplePay', subKey: 'methodApplePaySub' },
  INSTAPAY: { labelKey: 'methodInstapay', subKey: 'methodInstapaySub' },
};

/** Admin toggles for the platform-wide checkout methods (Card / Apple Pay / InstaPay). */
export function PaymentMethodsToggles({ settings }: { settings: ReadonlyArray<MethodSetting> }): React.JSX.Element {
  const t = useTranslations('admin.payments');
  const [state, setState] = useState<ReadonlyArray<MethodSetting>>(settings);
  const noneActive = state.every((s) => !s.isActive);

  return (
    <section className="rounded-xl border border-border-subtle bg-surface-base p-5">
      <header className="mb-1">
        <h2 className="font-display text-base font-bold text-text-primary">{t('methodsTitle')}</h2>
        <p className="text-xs text-text-tertiary">{t('methodsHint')}</p>
      </header>
      {noneActive ? (
        <p className="mt-3 rounded-lg bg-warning/10 px-3 py-2 text-xs font-semibold text-warning">{t('methodsAllOffWarning')}</p>
      ) : null}
      <ul className="mt-4 divide-y divide-border-subtle">
        {state.map((setting) => (
          <MethodRow
            key={setting.method}
            setting={setting}
            onChange={(isActive) =>
              setState((prev) => prev.map((s) => (s.method === setting.method ? { ...s, isActive } : s)))
            }
          />
        ))}
      </ul>
    </section>
  );
}

function MethodRow({ setting, onChange }: { setting: MethodSetting; onChange: (isActive: boolean) => void }): React.JSX.Element {
  const t = useTranslations('admin.payments');
  const [pending, startTransition] = useTransition();
  const meta = META[setting.method];

  function toggle(): void {
    const next = !setting.isActive;
    onChange(next); // optimistic
    startTransition(async () => {
      const res = await setPaymentMethodAction({ method: setting.method, isActive: next });
      if (!res.ok) onChange(!next); // revert on failure
    });
  }

  return (
    <li className="flex items-center justify-between gap-4 py-3.5">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-text-primary">{t(meta.labelKey)}</p>
        <p className="text-xs text-text-tertiary">{t(meta.subKey)}</p>
      </div>
      <div className="flex items-center gap-3">
        <span className={cn('text-xs font-bold', setting.isActive ? 'text-success' : 'text-text-tertiary')}>
          {setting.isActive ? t('methodOn') : t('methodOff')}
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={setting.isActive}
          disabled={pending}
          onClick={toggle}
          className={cn(
            'relative h-6 w-11 shrink-0 rounded-full transition disabled:opacity-50',
            setting.isActive ? 'bg-brand-primary' : 'bg-border-default',
          )}
        >
          <span
            className={cn(
              'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all',
              setting.isActive ? 'start-[22px]' : 'start-0.5',
            )}
          />
        </button>
      </div>
    </li>
  );
}
