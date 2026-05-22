import { LEVEL_DOWN_THRESHOLD, LEVEL_UP_THRESHOLD } from '../engine/constants';

interface Props {
  value: number; // 0..1
}

export default function ThresholdBar({ value }: Props) {
  const pct = Math.max(0, Math.min(1, value));
  const color =
    pct >= LEVEL_UP_THRESHOLD ? 'var(--success)' : pct < LEVEL_DOWN_THRESHOLD ? 'var(--danger)' : 'var(--accent-warm)';
  return (
    <div style={{ height: 6, background: 'var(--surface-deep)', borderRadius: 3, position: 'relative', marginTop: 8 }}>
      <div style={{ height: '100%', width: `${pct * 100}%`, background: color, borderRadius: 3 }} />
      <div style={{ position: 'absolute', top: -2, left: `${LEVEL_DOWN_THRESHOLD * 100}%`, width: 1, height: 10, background: 'var(--fg-dim)' }} />
      <div style={{ position: 'absolute', top: -2, left: `${LEVEL_UP_THRESHOLD * 100}%`, width: 1, height: 10, background: 'var(--fg-dim)' }} />
    </div>
  );
}
