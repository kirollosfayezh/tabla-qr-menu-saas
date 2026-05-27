import { useTranslations } from 'next-intl';
import { PageHeader } from './page-header';

interface ComingSoonProps {
  title: string;
  stageLabel?: string;
}

/** Placeholder used by nav routes whose feature lands in a later stage. */
export function ComingSoon({ title, stageLabel }: ComingSoonProps): React.JSX.Element {
  const t = useTranslations('owner');
  return (
    <div className="space-y-6">
      <PageHeader title={title} />
      <section className="rounded-2xl border border-dashed border-border-default bg-surface-base p-10 text-center">
        <p className="font-display text-lg font-medium text-text-primary">{t('comingSoon')}</p>
        {stageLabel ? (
          <p className="mt-1 text-xs font-mono uppercase tracking-wider text-text-tertiary">
            {stageLabel}
          </p>
        ) : null}
      </section>
    </div>
  );
}
