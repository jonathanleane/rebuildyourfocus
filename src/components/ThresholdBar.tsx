import { useEffect, useState } from 'react';
import { LEVEL_DOWN_THRESHOLD, LEVEL_UP_THRESHOLD } from '../engine/constants';

interface Props {
  value: number; // 0..1
  /** If true, animate from 0 to value on mount. Default false. */
  animate?: boolean;
  /** Animation duration in ms. Default 900. */
  duration?: number;
  /** Delay before starting animation. Default 0. */
  delay?: number;
}

export default function ThresholdBar({ value, animate = false, duration = 900, delay = 0 }: Props) {
  const target = Math.max(0, Math.min(1, value));
  const [displayed, setDisplayed] = useState(animate ? 0 : target);
  const color =
    target >= LEVEL_UP_THRESHOLD ? 'var(--success)' : target < LEVEL_DOWN_THRESHOLD ? 'var(--danger)' : 'var(--accent-warm)';

  useEffect(() => {
    if (!animate) {
      setDisplayed(target);
      return;
    }
    const t = setTimeout(() => setDisplayed(target), delay);
    return () => clearTimeout(t);
  }, [animate, target, delay]);

  return (
    <div style={{ height: 6, background: 'var(--surface-deep)', borderRadius: 3, position: 'relative', marginTop: 8 }}>
      <div
        style={{
          height: '100%',
          width: `${displayed * 100}%`,
          background: color,
          borderRadius: 3,
          transition: animate ? `width ${duration}ms cubic-bezier(0.16, 1, 0.3, 1)` : 'none',
        }}
      />
      <div style={{ position: 'absolute', top: -2, left: `${LEVEL_DOWN_THRESHOLD * 100}%`, width: 1, height: 10, background: 'var(--fg-dim)' }} />
      <div style={{ position: 'absolute', top: -2, left: `${LEVEL_UP_THRESHOLD * 100}%`, width: 1, height: 10, background: 'var(--fg-dim)' }} />
    </div>
  );
}
