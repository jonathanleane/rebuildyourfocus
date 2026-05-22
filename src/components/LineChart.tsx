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
  const pts = values.map((v, i) => {
    const x = (i / Math.max(1, values.length - 1)) * w;
    const y = h - (v / max) * h;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '100%', height }}>
      <polyline points={pts.join(' ')} fill="none" stroke="var(--accent)" strokeWidth={1.5} />
    </svg>
  );
}
