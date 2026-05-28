interface TopItemRow {
  name: string;
  count: number;
}

/**
 * Top-items widget matching `qrcode menu/owner.jsx`: per-item row with a thin
 * progress bar showing share-of-top, and the count right-aligned.
 */
export function TopItemsList({ items }: { items: ReadonlyArray<TopItemRow> }): React.JSX.Element {
  if (items.length === 0) {
    return <p className="rounded-lg bg-surface-sunken p-4 text-center text-xs text-text-tertiary">No views yet.</p>;
  }
  const max = Math.max(1, ...items.map((it) => it.count));
  return (
    <ul className="flex flex-col gap-2.5">
      {items.map((it) => {
        const pct = (it.count / max) * 100;
        return (
          <li key={it.name} className="flex items-center gap-2.5">
            <div className="h-9 w-9 shrink-0 rounded-lg bg-brand-primary-soft" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-text-primary">{it.name}</p>
              <div className="mt-1 h-1 rounded-full bg-surface-sunken">
                <div className="h-full rounded-full bg-brand-primary" style={{ width: `${pct}%` }} />
              </div>
            </div>
            <span className="font-mono text-sm font-bold text-text-primary">{it.count}</span>
          </li>
        );
      })}
    </ul>
  );
}
