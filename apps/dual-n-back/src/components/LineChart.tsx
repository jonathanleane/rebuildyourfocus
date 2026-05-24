interface Props {
  values: number[];
  height?: number;
}

export default function LineChart({ values, height = 80 }: Props) {
  if (values.length === 0) {
    return (
      <div style={{ color: 'var(--fg-dim)', fontSize: '0.8rem', textAlign: 'center', padding: '1rem 0' }}>
        No data yet.
      </div>
    );
  }
  const max = Math.max(...values, 1);
  const w = 200;
  const h = height;
  const points = values.map((v, i) => ({
    x: values.length === 1 ? w / 2 : (i / (values.length - 1)) * w,
    y: h - (v / max) * h,
  }));
  const polyPoints = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '100%', height }}>
      {values.length > 1 && (
        <polyline points={polyPoints} fill="none" stroke="var(--accent)" strokeWidth={1.5} />
      )}
      {/* Dot at every point so a single value still shows */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={values.length === 1 ? 3 : 1.5} fill="var(--accent)" />
      ))}
    </svg>
  );
}
