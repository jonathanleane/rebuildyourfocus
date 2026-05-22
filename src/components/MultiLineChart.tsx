interface Series {
  values: number[];
  color: string;
  label: string;
}

interface Props {
  series: Series[];
  yMax?: number;
  height?: number;
}

export default function MultiLineChart({ series, yMax = 1, height = 90 }: Props) {
  const maxLen = Math.max(0, ...series.map((s) => s.values.length));
  if (maxLen === 0) {
    return (
      <div style={{ color: 'var(--fg-dim)', fontSize: '0.8rem', textAlign: 'center', padding: '1rem 0' }}>
        No data yet.
      </div>
    );
  }
  const w = 200;
  const h = height;

  const toPoints = (values: number[]) =>
    values
      .map((v, i) => {
        const x = (i / Math.max(1, values.length - 1)) * w;
        const y = h - (Math.min(yMax, Math.max(0, v)) / yMax) * h;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');

  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '100%', height }}>
        {/* threshold guide lines at 75% and 90% */}
        <line x1="0" x2={w} y1={h - h * 0.75} y2={h - h * 0.75} stroke="var(--surface-deep)" strokeWidth="0.5" strokeDasharray="3 3" />
        <line x1="0" x2={w} y1={h - h * 0.9} y2={h - h * 0.9} stroke="var(--surface-deep)" strokeWidth="0.5" strokeDasharray="3 3" />
        {series.map((s) => (
          <polyline key={s.label} points={toPoints(s.values)} fill="none" stroke={s.color} strokeWidth="1.5" />
        ))}
      </svg>
      <div style={{ display: 'flex', gap: 14, marginTop: 6, fontSize: '0.65rem', color: 'var(--fg-dim)', justifyContent: 'center' }}>
        {series.map((s) => (
          <span key={s.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 10, height: 2, background: s.color, borderRadius: 1 }} />
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}
