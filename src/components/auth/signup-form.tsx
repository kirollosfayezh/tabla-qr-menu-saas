'use client';

import { useCallback, useState, useTransition, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Button } from '@/components/ui/button';
import { TurnstileSlot } from './turnstile-slot';
import { PasswordRequirements } from './password-requirements';
import { signUpAction, type ActionResult } from '@/app/actions/auth.actions';
import { publicEnv } from '@/config/public-env';

/** Email + password signup form with Turnstile gate, live hints, and confirm-password. */
export function SignupForm(): React.JSX.Element {
  const t = useTranslations('auth');
  const [pending, start] = useTransition();
  const [token, setToken] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirm, setConfirm] = useState<string>('');
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
      const res = await signUpAction(data);
      if (res) applyFailure(res);
      // Token is single-use — issue a new challenge for any subsequent submit.
      setToken('');
      setResetKey((k) => k + 1);
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <Field label={t('name')} htmlFor="signup-name" error={errors.name}>
        <Input id="signup-name" name="name" type="text" autoComplete="name" required invalid={!!errors.name} />
      </Field>
      <Field label={t('email')} htmlFor="signup-email" error={errors.email}>
        <Input id="signup-email" name="email" type="email" autoComplete="email" required invalid={!!errors.email} />
      </Field>
      <Field label={t('password')} htmlFor="signup-password" error={errors.password}>
        <PasswordInput
          id="signup-password"
          name="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          invalid={!!errors.password}
        />
      </Field>
      <Field
        label={t('confirmPassword')}
        htmlFor="signup-confirm"
        error={errors.confirmPassword}
      >
        <PasswordInput
          id="signup-confirm"
          name="confirmPassword"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          invalid={!!errors.confirmPassword}
        />
      </Field>

      <PasswordRequirements password={password} confirm={confirm} />

      <TurnstileSlot
        action="signup"
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
        {t('createAccount')}
      </Button>
    </form>
  );
}
