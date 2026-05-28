'use client';

import { useCallback, useState, useTransition, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TurnstileSlot } from './turnstile-slot';
import { forgotPasswordAction, type ActionResult } from '@/app/actions/auth.actions';
import { publicEnv } from '@/config/public-env';

export function ForgotPasswordForm(): React.JSX.Element {
  const t = useTranslations('auth');
  const [pending, start] = useTransition();
  const [token, setToken] = useState<string>('');
  const [sent, setSent] = useState(false);
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
      const res = await forgotPasswordAction(data);
      if (res.ok) {
        setSent(true);
      } else {
        applyFailure(res);
      }
      setToken('');
      setResetKey((k) => k + 1);
    });
  }

  if (sent) {
    return (
      <p className="rounded-2xl border border-border-subtle bg-surface-base p-5 text-sm text-text-secondary">
        {t('resetSentGeneric')}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <Field label={t('email')} htmlFor="forgot-email" error={errors.email}>
        <Input
          id="forgot-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          invalid={!!errors.email}
        />
      </Field>
      <TurnstileSlot action="forgot" onToken={handleToken} onExpire={handleExpire} resetKey={resetKey} />
      {topError ? <p role="alert" className="text-sm text-danger">{topError}</p> : null}
      <Button type="submit" size="lg" fullWidth loading={pending} disabled={submitDisabled}>
        {t('sendResetLink')}
      </Button>
    </form>
  );
}
