'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';
import { sendBroadcastAction } from '@/app/actions/admin-email.actions';
import type { BroadcastAudience } from '@/dtos/broadcast.dto';

interface Counts {
  all: number;
  owners: number;
  admins: number;
}

const AUDIENCES: ReadonlyArray<{ key: BroadcastAudience; labelKey: string; countKey: keyof Counts }> = [
  { key: 'all', labelKey: 'audAll', countKey: 'all' },
  { key: 'owners', labelKey: 'audOwners', countKey: 'owners' },
  { key: 'admins', labelKey: 'audAdmins', countKey: 'admins' },
];

type Result = { sent: number; failed: number; total: number } | null;

export function BroadcastForm({ counts }: { counts: Counts }): React.JSX.Element {
  const t = useTranslations('admin.email');
  const [audience, setAudience] = useState<BroadcastAudience>('all');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<Result>(null);
  const [pending, start] = useTransition();

  const recipientCount = counts[AUDIENCES.find((a) => a.key === audience)!.countKey];
  const canSend = subject.trim().length >= 3 && body.trim().length >= 10 && recipientCount > 0;

  function submit(): void {
    setError('');
    setResult(null);
    start(async () => {
      const res = await sendBroadcastAction({ audience, subject, body });
      setConfirming(false);
      if (!res.ok) { setError(res.message); return; }
      setResult({ sent: res.sent, failed: res.failed, total: res.total });
      setSubject('');
      setBody('');
    });
  }

  return (
    <div className="max-w-2xl space-y-5 rounded-2xl border border-border-subtle bg-surface-base p-6 shadow-sm">
      <AudiencePicker
        audience={audience}
        counts={counts}
        onSelect={(a) => { setAudience(a); setResult(null); }}
        t={t}
      />

      <Field label={t('subjectLabel')}>
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          maxLength={150}
          placeholder={t('subjectPh')}
          className="w-full rounded-lg border border-border-default bg-surface-base px-3 py-2 text-sm"
        />
      </Field>

      <Field label={t('bodyLabel')}>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={5000}
          rows={9}
          placeholder={t('bodyPh')}
          className="w-full resize-y rounded-lg border border-border-default bg-surface-base px-3 py-2 text-sm leading-relaxed"
        />
      </Field>

      {error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
      {result && (
        <p className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
          {t('resultSent', { sent: result.sent, failed: result.failed, total: result.total })}
        </p>
      )}

      <div className="flex items-center justify-between gap-3 border-t border-border-subtle pt-4">
        <span className="text-sm text-text-secondary">{t('recipients', { n: recipientCount })}</span>
        <button
          type="button"
          disabled={!canSend || pending}
          onClick={() => setConfirming(true)}
          className="rounded-full bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-primary-dark disabled:opacity-50"
        >
          {t('sendBtn')}
        </button>
      </div>

      {confirming && (
        <ConfirmDialog
          message={t('confirmBody', { n: recipientCount })}
          confirmLabel={pending ? t('sending') : t('confirmSend')}
          cancelLabel={t('cancel')}
          pending={pending}
          onConfirm={submit}
          onCancel={() => setConfirming(false)}
        />
      )}
    </div>
  );
}

type T = ReturnType<typeof useTranslations<'admin.email'>>;

function AudiencePicker({ audience, counts, onSelect, t }: {
  audience: BroadcastAudience;
  counts: Counts;
  onSelect: (a: BroadcastAudience) => void;
  t: T;
}): React.JSX.Element {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-tertiary">{t('audienceLabel')}</p>
      <div className="flex flex-wrap gap-2">
        {AUDIENCES.map((a) => (
          <button
            key={a.key}
            type="button"
            onClick={() => onSelect(a.key)}
            className={cn(
              'rounded-full border px-4 py-2 text-sm font-medium transition',
              audience === a.key
                ? 'border-brand-primary bg-brand-primary-soft text-brand-primary-dark'
                : 'border-border-default text-text-secondary hover:bg-surface-raised',
            )}
          >
            {t(a.labelKey)} · {counts[a.countKey]}
          </button>
        ))}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }): React.JSX.Element {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-text-secondary">{label}</span>
      {children}
    </label>
  );
}

interface ConfirmProps {
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  pending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmDialog({ message, confirmLabel, cancelLabel, pending, onConfirm, onCancel }: ConfirmProps): React.JSX.Element {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-sm space-y-4 rounded-2xl bg-surface-base p-6 shadow-lg">
        <p className="text-sm text-text-primary">{message}</p>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onCancel} disabled={pending} className="rounded-full border border-border-default px-4 py-2 text-sm font-semibold text-text-secondary disabled:opacity-50">
            {cancelLabel}
          </button>
          <button type="button" onClick={onConfirm} disabled={pending} className="rounded-full bg-brand-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
