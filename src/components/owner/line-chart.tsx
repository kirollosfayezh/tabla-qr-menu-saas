interface Props {
  data: ReadonlyArray<{ label: string; value: number }>;
  height?: number;
  color?: string;
  fillColor?: string;
}

/** SVG line chart with area fill. Pure CSS — no chart library. */
export function LineChart({ data, height = 220, color = 'var(--brand-primary)', fillColor = 'var(--brand-primary-soft)' }: Props): React.JSX.Element {
  const max = Math.max(1, ...data.map((d) => d.value));
  const w = 800;
  const h = height - 30;
  const stepX = data.length > 1 ? w / (data.length - 1) : w;

  const points = data.map((d, i) => ({
    x: i * stepX,
    y: h - (d.value / max) * (h - 10) - 5,
  }));

  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ');
  const area = `${line} L ${w},${h} L 0,${h} Z`;

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${w} ${height}`} className="w-full" preserveAspectRatio="none" style={{ height }}>
        {[0, 1, 2, 3].map((g) => (
          <line key={g} x1="0" y1={g * (h / 3) + 5} x2={w} y2={g * (h / 3) + 5} stroke="var(--border-subtle)" strokeDasharray="2 4" />
        ))}
        <path d={area} fill={fillColor} opacity="0.4" />
        <path d={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="white" stroke={color} strokeWidth="2" />
        ))}
      </svg>
      <div className="mt-2 flex justify-between text-[10px] font-mono text-text-tertiary">
        {data.filter((_, i) => i % Math.ceil(data.length / 8) === 0 || i === data.length - 1).map((d, i) => (
          <span key={i}>{d.label}</span>
        ))}
      </div>
    </div>
  );
}
