'use client';

import { useState, useTransition, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Field } from '@/components/ui/field';
import { PasswordInput } from '@/components/ui/password-input';
import { Button } from '@/components/ui/button';
import { resetPasswordAction, type ActionResult } from '@/app/actions/auth.actions';

export function ResetPasswordForm({ token }: { token: string }): React.JSX.Element {
  const t = useTranslations('auth');
  const router = useRouter();
  const [pending, start] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [topError, setTopError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

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
    data.set('token', token);
    start(async () => {
      const res = await resetPasswordAction(data);
      if (res.ok) {
        setDone(true);
        setTimeout(() => router.push('/login'), 1500);
      } else {
        applyFailure(res);
      }
    });
  }

  if (done) {
    return (
      <p className="rounded-2xl border border-border-subtle bg-surface-base p-5 text-sm text-text-secondary">
        {t('resetDoneRedirecting')}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <Field label={t('newPassword')} htmlFor="rp-password" error={errors.password}>
        <PasswordInput id="rp-password" name="password" autoComplete="new-password" required invalid={!!errors.password} />
      </Field>
      <Field label={t('confirmPassword')} htmlFor="rp-confirm" error={errors.confirmPassword}>
        <PasswordInput id="rp-confirm" name="confirmPassword" autoComplete="new-password" required invalid={!!errors.confirmPassword} />
      </Field>
      {topError ? <p role="alert" className="text-sm text-danger">{topError}</p> : null}
      <Button type="submit" size="lg" fullWidth loading={pending}>
        {t('setNewPassword')}
      </Button>
    </form>
  );
}
