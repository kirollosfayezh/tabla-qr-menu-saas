'use client';

import { useCallback, useState, useTransition, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Button } from '@/components/ui/button';
import { TurnstileSlot } from './turnstile-slot';
import { signInAction, type ActionResult } from '@/app/actions/auth.actions';
import { publicEnv } from '@/config/public-env';

/** Email + password login form with Turnstile gate. */
export function LoginForm(): React.JSX.Element {
  const t = useTranslations('auth');
  const [pending, start] = useTransition();
  const [token, setToken] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [topError, setTopError] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);

  const turnstileRequired = Boolean(publicEnv.turnstileSiteKey);
  const submitDisabled = pending || (turnstileRequired && !token);

  const handleToken = useCallback((value: string) => setToken(value), []);
  const handleExpire = useCallback(() => setToken(''), []);

  function applyFailure(res: ActionResult): void {
    if (res.ok) return;
    setErrors(res.fieldErrors ?? {});
    setTopError(res.fieldErrors ? null : res.message);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setErrors({});
    setTopError(null);
    const data = new FormData(event.currentTarget);
    data.set('turnstileToken', token || 'dev-bypass');
    start(async () => {
      const res = await signInAction(data);
      if (res) applyFailure(res);
      // Token is single-use — issue a new challenge for any subsequent submit.
      setToken('');
      setResetKey((k) => k + 1);
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <Field label={t('email')} htmlFor="login-email" error={errors.email}>
        <Input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          invalid={!!errors.email}
        />
      </Field>
      <Field label={t('password')} htmlFor="login-password" error={errors.password}>
        <PasswordInput
          id="login-password"
          name="password"
          autoComplete="current-password"
          required
          invalid={!!errors.password}
        />
      </Field>

      <div className="flex justify-end">
        <Link
          href="/forgot-password"
          className="text-xs font-medium text-brand-primary hover:underline"
        >
          {t('forgotPassword')}
        </Link>
      </div>

      <TurnstileSlot
        action="login"
        onToken={handleToken}
        onExpire={handleExpire}
        resetKey={resetKey}
      />

      {topError ? (
        <p role="alert" className="text-sm text-danger">
          {topError}
        </p>
      ) : null}

      <Button type="submit" size="lg" fullWidth loading={pending} disabled={submitDisabled}>
        {t('signIn')}
      </Button>
    </form>
  );
}
