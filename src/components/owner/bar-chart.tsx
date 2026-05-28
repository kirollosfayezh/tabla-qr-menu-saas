interface BarChartProps {
  /** Bars left → right. */
  data: ReadonlyArray<{ label: string; value: number }>;
  /** Which bar to highlight (index, 0-based). Defaults to the last bar. */
  highlight?: number;
  height?: number;
}

/**
 * Bar chart matching `qrcode menu/owner.jsx` design: brand-primary highlight bar with a
 * value badge above it, brand-primary-soft for the rest, day-of-week labels under each.
 * Pure CSS — no chart library dependency.
 */
export function BarChart({ data, highlight, height = 200 }: BarChartProps): React.JSX.Element {
  const max = Math.max(1, ...data.map((d) => d.value));
  const highlightIdx = highlight ?? data.length - 1;
  return (
    <div className="flex items-end gap-2 py-2" style={{ height }}>
      {data.map((d, i) => {
        const heightPct = (d.value / max) * 100;
        const isHighlighted = i === highlightIdx;
        return (
          <div key={`${d.label}-${i}`} className="flex flex-1 flex-col items-center gap-1">
            <div className="flex w-full items-end" style={{ height: height - 30 }}>
              <div
                className="relative w-full rounded-md transition-[height] duration-300"
                style={{
                  height: `${heightPct}%`,
                  backgroundColor: isHighlighted ? 'var(--brand-primary)' : 'var(--brand-primary-soft)',
                  minHeight: '2px',
                }}
              >
                {isHighlighted ? (
                  <div
                    className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap rounded-[4px] px-1.5 py-0.5 font-mono text-[11px] font-bold text-white"
                    style={{ top: -22, backgroundColor: 'var(--text-primary)' }}
                  >
                    {d.value}
                  </div>
                ) : null}
              </div>
            </div>
            <span className="text-[11px] font-medium text-text-tertiary">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}
