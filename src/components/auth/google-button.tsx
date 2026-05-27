'use client';

import { useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { signInWithGoogleAction } from '@/app/actions/auth.actions';

/** "Continue with Google" button. Triggers the OAuth flow via server action. */
export function GoogleButton(): React.JSX.Element {
  const t = useTranslations('auth');
  const [pending, start] = useTransition();

  return (
    <Button
      type="button"
      variant="secondary"
      fullWidth
      size="lg"
      loading={pending}
      onClick={() => start(() => signInWithGoogleAction())}
    >
      <GoogleGlyph />
      <span>{t('continueWithGoogle')}</span>
    </Button>
  );
}

function GoogleGlyph(): React.JSX.Element {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="size-5">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.55-.21-2.27H12v4.51h6.45c-.28 1.45-1.11 2.68-2.37 3.5v2.9h3.84c2.25-2.08 3.57-5.13 3.57-8.64z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.84-2.9c-1.07.72-2.44 1.14-4.11 1.14-3.16 0-5.85-2.13-6.81-5h-3.96v3.14C3.18 21.4 7.27 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.19 14.33A7.21 7.21 0 0 1 4.8 12c0-.81.14-1.6.39-2.33V6.53H1.23A12 12 0 0 0 0 12c0 1.94.47 3.77 1.23 5.47l3.96-3.14z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.36.61 4.61 1.81l3.45-3.45C17.95 1.19 15.24 0 12 0 7.27 0 3.18 2.6 1.23 6.53l3.96 3.14c.96-2.87 3.65-4.92 6.81-4.92z"
      />
    </svg>
  );
}
