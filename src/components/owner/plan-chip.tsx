import { cn } from '@/lib/cn';

interface Props {
  planKey: string;
  label: string;
}

/** Small pill badge showing the current plan — used in topbar and sidebar. */
export function PlanChip({ planKey, label }: Props): React.JSX.Element {
  const cls =
    planKey === 'free_trial' ? 'bg-warning/15 text-warning border border-warning/25' :
    planKey === 'studio'     ? 'bg-brand-primary-soft text-brand-primary-dark border border-brand-primary/20' :
    planKey === 'group'      ? 'bg-success/10 text-success border border-success/25' :
    planKey === 'suspended'  ? 'bg-danger/10 text-danger border border-danger/20' :
    'bg-surface-raised text-text-secondary border border-border-subtle';

  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold', cls)}>
      {label}
    </span>
  );
}
