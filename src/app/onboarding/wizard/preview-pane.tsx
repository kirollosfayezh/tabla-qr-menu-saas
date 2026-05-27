'use client';

import { useTranslations } from 'next-intl';
import type { RestaurantDraft } from './types';

interface Props {
  draft: RestaurantDraft;
  rootDomain: string;
}

/** Mini mock of the diner page that updates live as the owner edits the draft. */
export function PreviewPane({ draft, rootDomain }: Props): React.JSX.Element {
  const t = useTranslations('onboarding');
  const isAr = draft.defaultLocale === 'ar';
  const displayName = (isAr ? draft.nameAr : draft.name) || draft.name || 'Your restaurant';
  const displayDesc = (isAr ? draft.descriptionAr : draft.description) || draft.description || '';
  const url = draft.slug ? `${draft.slug}.${rootDomain}` : `you.${rootDomain}`;

  return (
    <aside className="sticky top-6 space-y-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
          {t('previewTitle')}
        </p>
        <p className="text-xs text-text-tertiary">{t('previewHint')}</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border-subtle shadow-sm">
        <div
          className="flex h-44 items-center justify-center px-6 text-center"
          style={{ backgroundColor: draft.accentColor }}
        >
          <div className="space-y-2">
            <h3
              className="font-display text-xl font-semibold"
              style={{ color: draft.secondaryColor }}
              dir={isAr ? 'rtl' : 'ltr'}
            >
              {displayName}
            </h3>
            {displayDesc ? (
              <p
                className="text-xs"
                style={{ color: draft.secondaryColor, opacity: 0.85 }}
                dir={isAr ? 'rtl' : 'ltr'}
              >
                {displayDesc}
              </p>
            ) : null}
          </div>
        </div>
        <div className="space-y-2 bg-surface-base p-4">
          <div
            className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium text-white"
            style={{ backgroundColor: draft.primaryColor }}
          >
            {draft.currencyCode || 'EGP'}
          </div>
          <p className="truncate text-xs text-text-secondary">{url}</p>
        </div>
      </div>
    </aside>
  );
}
