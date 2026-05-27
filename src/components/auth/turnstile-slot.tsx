'use client';

import { useTranslations } from 'next-intl';
import { TurnstileWidget } from '@/components/shared/turnstile-widget';
import { publicEnv } from '@/config/public-env';

interface TurnstileSlotProps {
  action: string;
  onToken: (token: string) => void;
  onExpire?: () => void;
  /** Bumping this value re-mounts the widget to issue a fresh, unused token. */
  resetKey?: number;
}

/**
 * Wraps the TurnstileWidget with a graceful fallback message when the site key
 * is not configured (development convenience). `resetKey` lets the parent force
 * a remount after a submission, since Turnstile tokens are single-use.
 */
export function TurnstileSlot({
  action,
  onToken,
  onExpire,
  resetKey = 0,
}: TurnstileSlotProps): React.JSX.Element {
  const t = useTranslations('auth');
  if (!publicEnv.turnstileSiteKey) {
    return <p className="text-xs text-text-tertiary">{t('turnstileDisabled')}</p>;
  }
  return (
    <TurnstileWidget
      key={resetKey}
      siteKey={publicEnv.turnstileSiteKey}
      action={action}
      onToken={onToken}
      onExpire={onExpire}
    />
  );
}
