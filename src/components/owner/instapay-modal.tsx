'use client';

import { useRef, useState, useTransition } from 'react';
import { submitInstapayAction } from '@/app/actions/payment.actions';

const ADMIN_EMAIL = 'kirollos.fayez.h@gmail.com';
const EMAILJS_URL = 'https://api.emailjs.com/api/v1.0/email/send';

interface Props {
  target: { kind: 'plan'; key: string; name: string } | { kind: 'theme'; key: string; name: string };
  onClose: () => void;
  onSuccess: () => void;
}

type Step = 'upload' | 'sending' | 'done' | 'error';

export function InstapayModal({ target, onClose, onSuccess }: Props): React.JSX.Element {
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>('upload');
  const [errorMsg, setErrorMsg] = useState('');
  const [, startTransition] = useTransition();

  const instapayPhone = process.env.NEXT_PUBLIC_INSTAPAY_PHONE ?? '';

  function handleSubmit(e: React.FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) { setErrorMsg('Please attach your payment screenshot.'); return; }
    setStep('sending');
    setErrorMsg('');

    const reader = new FileReader();
    reader.onload = () => {
      startTransition(async () => {
        try {
          const base64 = (reader.result as string).split(',')[1] ?? '';
          const res = await submitInstapayAction(
            target.kind === 'plan'
              ? { planKey: target.key, method: 'instapay' }
              : { themeKey: target.key, method: 'instapay' },
          );
          if (!res.ok) throw new Error(res.message);

          const { paymentId, restaurantName, amountCents, currencyCode } = res.value;
          const amount = `${currencyCode} ${Math.round(amountCents / 100).toLocaleString()}`;

          const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID ?? '';
          const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID ?? '';
          const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY ?? '';

          if (serviceId && templateId && publicKey) {
            await fetch(EMAILJS_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                service_id: serviceId,
                template_id: templateId,
                user_id: publicKey,
                template_params: {
                  to_email: ADMIN_EMAIL,
                  restaurant_name: restaurantName,
                  plan_name: target.name,
                  item_name: target.name,
                  item_type: target.kind,
                  amount,
                  payment_id: paymentId,
                  screenshot_base64: base64,
                },
              }),
            });
          }

          setStep('done');
          setTimeout(onSuccess, 2000);
        } catch (err) {
          setErrorMsg(err instanceof Error ? err.message : 'Something went wrong.');
          setStep('error');
        }
      });
    };
    reader.readAsDataURL(file);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-2xl border border-border-subtle bg-surface-base p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-text-primary">Pay with InstaPay</h2>
            <p className="mt-0.5 text-sm text-text-secondary">
              {target.kind === 'plan' ? 'Plan' : 'Theme'}: <span className="font-semibold">{target.name}</span>
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-1 text-text-tertiary hover:text-text-primary" aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
          </button>
        </div>

        {step === 'done' ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#D1FAE5]">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M6 14l6 6 10-10" stroke="#047857" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <p className="font-semibold text-text-primary">Screenshot received!</p>
            <p className="text-sm text-text-secondary">We'll activate your {target.kind} within 24 hours after verifying your payment.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="rounded-xl bg-surface-sunken p-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">Send payment to</p>
              <p className="mt-1 font-display text-2xl font-bold tracking-wide text-text-primary">
                {instapayPhone || '01XXXXXXXXX'}
              </p>
              <p className="mt-1 text-xs text-text-tertiary">via InstaPay app</p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-text-primary">
                Upload payment screenshot <span className="text-danger">*</span>
              </label>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                required
                className="block w-full rounded-lg border border-dashed border-border-default bg-surface-raised px-3 py-2.5 text-sm text-text-secondary file:me-3 file:rounded-full file:border-0 file:bg-brand-primary-soft file:px-3 file:py-1 file:text-xs file:font-semibold file:text-brand-primary-dark"
              />
            </div>

            {(step === 'error' && errorMsg) ? (
              <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{errorMsg}</p>
            ) : null}

            <button
              type="submit"
              disabled={step === 'sending'}
              className="flex h-11 w-full items-center justify-center rounded-full bg-brand-primary text-sm font-semibold text-white transition hover:bg-brand-primary-dark disabled:opacity-60"
            >
              {step === 'sending' ? 'Sending…' : 'Submit payment proof'}
            </button>
            <p className="text-center text-xs text-text-tertiary">
              Admin will review and activate your {target.kind} within 24 hours.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
