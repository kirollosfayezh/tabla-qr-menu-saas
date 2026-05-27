'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';

interface PasswordRequirementsProps {
  password: string;
  confirm: string;
}

/** Live checklist of password rules. Rule passes turn green with a check. */
export function PasswordRequirements({
  password,
  confirm,
}: PasswordRequirementsProps): React.JSX.Element {
  const t = useTranslations('auth');
  const rules: Array<{ label: string; ok: boolean }> = [
    { label: t('rule8chars'), ok: password.length >= 8 },
    { label: t('ruleLetter'), ok: /[A-Za-z]/.test(password) },
    { label: t('ruleNumber'), ok: /[0-9]/.test(password) },
    { label: t('ruleMatch'), ok: password.length > 0 && password === confirm },
  ];

  return (
    <ul aria-live="polite" className="space-y-1">
      {rules.map((r) => (
        <li
          key={r.label}
          className={cn(
            'flex items-center gap-2 text-xs',
            r.ok ? 'text-success' : 'text-text-tertiary',
          )}
        >
          <span aria-hidden className="inline-flex h-4 w-4 items-center justify-center">
            {r.ok ? <Check /> : <Dot />}
          </span>
          {r.label}
        </li>
      ))}
    </ul>
  );
}

function Check(): React.JSX.Element {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M5 12l4 4L19 7" />
    </svg>
  );
}

function Dot(): React.JSX.Element {
  return <span className="block h-1.5 w-1.5 rounded-full bg-current" />;
}
