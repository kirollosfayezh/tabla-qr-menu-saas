interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
}

/** KPI card for the dashboard grid. */
export function StatCard({ label, value, hint }: StatCardProps): React.JSX.Element {
  return (
    <article className="rounded-2xl border border-border-subtle bg-surface-base p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">{label}</p>
      <p className="mt-3 font-display text-3xl font-semibold text-text-primary tabular-nums">
        {value}
      </p>
      {hint ? <p className="mt-2 text-xs text-text-tertiary">{hint}</p> : null}
    </article>
  );
}
