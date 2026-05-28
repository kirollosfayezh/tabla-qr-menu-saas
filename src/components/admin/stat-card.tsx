interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
}

export function StatCard({ label, value, hint }: StatCardProps): React.JSX.Element {
  return (
    <div className="rounded-2xl border border-border-subtle bg-surface-base p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">{label}</p>
      <p className="mt-2 font-display text-2xl font-bold text-text-primary">{value}</p>
      {hint ? <p className="mt-1 text-xs text-text-tertiary">{hint}</p> : null}
    </div>
  );
}
