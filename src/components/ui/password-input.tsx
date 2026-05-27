'use client';

import { forwardRef, useState, type InputHTMLAttributes } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';

export interface PasswordInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  invalid?: boolean;
}

/** Password input with an in-field show/hide eye toggle. */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput({ className, invalid, ...rest }, ref) {
    const t = useTranslations('auth');
    const [shown, setShown] = useState(false);

    return (
      <div className="relative">
        <input
          ref={ref}
          type={shown ? 'text' : 'password'}
          className={cn(
            'block w-full rounded-lg bg-surface-base ps-3.5 pe-11 h-11 text-sm text-text-primary',
            'border border-border-default placeholder:text-text-tertiary',
            'focus:border-brand-primary focus:outline-none',
            invalid && 'border-danger focus:border-danger',
            className,
          )}
          {...rest}
        />
        <button
          type="button"
          onClick={() => setShown((s) => !s)}
          aria-label={shown ? t('hidePassword') : t('showPassword')}
          aria-pressed={shown}
          className="absolute end-2 top-1/2 -translate-y-1/2 inline-flex h-7 w-7 items-center justify-center rounded-md text-text-tertiary hover:bg-surface-raised hover:text-text-primary"
        >
          {shown ? <EyeOff /> : <Eye />}
        </button>
      </div>
    );
  },
);

function Eye(): React.JSX.Element {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOff(): React.JSX.Element {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M3 3l18 18" />
      <path d="M10.6 6.1A10.9 10.9 0 0 1 12 6c6.5 0 10 6 10 6a17 17 0 0 1-3.2 4.1M6.2 6.2A17 17 0 0 0 2 12s3.5 7 10 7c1.4 0 2.7-.2 3.8-.6" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </svg>
  );
}
