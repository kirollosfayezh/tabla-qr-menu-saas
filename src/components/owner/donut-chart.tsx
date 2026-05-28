interface Slice {
  label: string;
  value: number;
  color: string;
}

interface Props {
  slices: ReadonlyArray<Slice>;
  size?: number;
  centerLabel?: string;
  centerValue?: string;
}

/** SVG donut chart with legend rows. */
export function DonutChart({ slices, size = 140, centerLabel, centerValue }: Props): React.JSX.Element {
  const total = slices.reduce((s, x) => s + x.value, 0) || 1;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex items-center gap-6">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg viewBox="0 0 100 100" className="-rotate-90" style={{ width: size, height: size }}>
          <circle cx="50" cy="50" r={radius} fill="none" stroke="var(--surface-sunken)" strokeWidth="14" />
          {slices.map((slice, i) => {
            const dash = (slice.value / total) * circumference;
            const seg = (
              <circle
                key={i}
                cx="50" cy="50" r={radius}
                fill="none"
                stroke={slice.color}
                strokeWidth="14"
                strokeDasharray={`${dash} ${circumference}`}
                strokeDashoffset={-offset}
              />
            );
            offset += dash;
            return seg;
          })}
        </svg>
        {centerValue && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-xl font-extrabold text-text-primary">{centerValue}</span>
            {centerLabel && <span className="text-[10px] text-text-tertiary">{centerLabel}</span>}
          </div>
        )}
      </div>
      <div className="flex-1 flex flex-col gap-2.5">
        {slices.map((slice) => {
          const pct = Math.round((slice.value / total) * 100);
          return (
            <div key={slice.label}>
              <div className="flex items-baseline justify-between text-xs">
                <span className="flex items-center gap-2 font-semibold text-text-primary">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: slice.color }} />
                  {slice.label}
                </span>
                <span className="font-mono font-bold">{pct}%</span>
              </div>
              <div className="mt-1 h-1 rounded-full bg-surface-sunken">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: slice.color }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
