'use client';

import { useState } from 'react';

const EMAILJS_URL = 'https://api.emailjs.com/api/v1.0/email/send';
const ADMIN_EMAIL = 'kirollos.fayez.h@gmail.com';

type Status = 'idle' | 'sending' | 'ok' | 'error';

export function InstapayTestCard(): React.JSX.Element {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');

  async function sendTest(): Promise<void> {
    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID ?? '';
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID ?? '';
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY ?? '';

    if (!serviceId || !templateId || !publicKey) {
      setError('EmailJS env vars are not set. Add NEXT_PUBLIC_EMAILJS_SERVICE_ID, NEXT_PUBLIC_EMAILJS_TEMPLATE_ID, and NEXT_PUBLIC_EMAILJS_PUBLIC_KEY to your .env.');
      setStatus('error');
      return;
    }

    setStatus('sending');
    setError('');

    try {
      const res = await fetch(EMAILJS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: serviceId,
          template_id: templateId,
          user_id: publicKey,
          template_params: {
            to_email: ADMIN_EMAIL,
            restaurant_name: 'Test Restaurant 🍕',
            plan_name: 'Studio',
            amount: 'EGP 299',
            payment_id: 'test-payment-id-00000000',
            screenshot_base64: TEST_IMAGE_B64,
          },
        }),
      });

      if (!res.ok) {
        const body = await res.text();
        throw new Error(`EmailJS responded ${res.status}: ${body}`);
      }

      setStatus('ok');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setStatus('error');
    }
  }

  return (
    <div className="rounded-2xl border border-border-subtle bg-surface-base p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-primary-soft text-brand-primary">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
            <rect x="2" y="4" width="16" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
            <path d="M2 7l8 5 8-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-text-primary">Test InstaPay notification</h3>
          <p className="mt-0.5 text-sm text-text-secondary">
            Sends a sample email to <span className="font-medium">{ADMIN_EMAIL}</span> to verify your EmailJS template is working correctly.
          </p>

          {status === 'ok' && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-[#D1FAE5] px-3 py-2 text-sm font-semibold text-[#047857]">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <circle cx="8" cy="8" r="7" fill="#10B981" />
                <path d="M5 8l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Test email sent — check your inbox!
            </div>
          )}

          {status === 'error' && error && (
            <div className="mt-3 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={sendTest}
            disabled={status === 'sending'}
            className="mt-4 inline-flex h-9 items-center gap-2 rounded-full border border-brand-primary px-5 text-sm font-semibold text-brand-primary transition hover:bg-brand-primary hover:text-white disabled:opacity-50"
          >
            {status === 'sending' ? (
              <>
                <svg className="animate-spin" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.6" strokeDasharray="8 6" />
                </svg>
                Sending…
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <path d="M1 1l12 6-12 6V8.5l8-1.5-8-1.5V1z" fill="currentColor" />
                </svg>
                Send test email
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// 1×1 orange pixel — enough to verify the base64 image renders in the template.
const TEST_IMAGE_B64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwADhQGAWjR9awAAAABJRU5ErkJggg==';
