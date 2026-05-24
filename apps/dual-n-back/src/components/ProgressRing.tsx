interface Props {
  value: number;
  max: number;
  label?: string;
}

export default function ProgressRing({ value, max, label }: Props) {
  const pct = Math.max(0, Math.min(1, max === 0 ? 0 : value / max));
  const deg = pct * 360;
  return (
    <div
      style={{
        width: 140,
        height: 140,
        borderRadius: '50%',
        margin: '0 auto',
        background: `conic-gradient(var(--accent) 0deg ${deg}deg, var(--surface-deep) ${deg}deg 360deg)`,
        display: 'grid',
        placeItems: 'center',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 10,
          borderRadius: '50%',
          background: 'var(--bg)',
        }}
      />
      <div style={{ position: 'relative', textAlign: 'center' }}>
        <div style={{ fontSize: '1.3rem', fontWeight: 700 }}>
          {value} / {max}
        </div>
        {label && (
          <div style={{ fontSize: '0.6rem', color: 'var(--fg-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>
            {label}
          </div>
        )}
      </div>
    </div>
  );
}
