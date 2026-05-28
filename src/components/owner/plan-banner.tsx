import Link from 'next/link';
import { isUpgradeable } from '@/config/plans';
import { PlanChip } from './plan-chip';

interface Props {
  planKey: string;
  planLabel: string;
  limitsLabel: string;
  upgradeHint: string;
  upgradeBtn: string;
}

/**
 * Bottom-of-sidebar plan banner.
 * free_trial: shows limits + upgrade CTA.
 * studio / group / custom: shows plan chip only.
 */
export function PlanBanner({ planKey, planLabel, limitsLabel, upgradeHint, upgradeBtn }: Props): React.JSX.Element {
  const showUpgrade = isUpgradeable(planKey);
  return (
    <div className="mt-auto px-3 pb-4 pt-2">
      {showUpgrade ? (
        <div className="rounded-xl bg-brand-primary-soft p-3">
          <div className="mb-0.5 flex items-center gap-2">
            <PlanChip planKey={planKey} label={planLabel} />
          </div>
          <p className="mt-1.5 text-[11px] font-semibold text-brand-primary-dark">{limitsLabel}</p>
          <p className="mt-0.5 text-[11px] text-brand-primary-dark/70">{upgradeHint}</p>
          <Link
            href="/dashboard/billing"
            className="mt-2.5 flex h-8 w-full items-center justify-center rounded-lg bg-brand-primary text-xs font-bold text-white transition hover:bg-brand-primary-dark"
          >
            {upgradeBtn}
          </Link>
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-xl border border-border-subtle px-3 py-2.5">
          <PlanChip planKey={planKey} label={planLabel} />
          <span className="text-xs text-text-tertiary">{planLabel}</span>
        </div>
      )}
    </div>
  );
}
