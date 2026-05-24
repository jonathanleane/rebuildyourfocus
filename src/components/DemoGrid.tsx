import { useEffect, useState } from 'react';
import { GRID_SIZE } from '../engine/constants';

const STIMULUS_MS = 600;
const GAP_MS = 1400;

/**
 * Subdued 3×3 grid that lights up one random cell every 2 seconds.
 * Decorative — telegraphs the game's visual identity on the menu screen.
 * Respects prefers-reduced-motion (stays static).
 */
export default function DemoGrid() {
  const [litIndex, setLitIndex] = useState<number | null>(null);

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    let timeout: ReturnType<typeof setTimeout>;
    let lastIndex = -1;
    const cycle = () => {
      // Pick a different index each time so it doesn't blink the same cell.
      let next: number;
      do {
        next = Math.floor(Math.random() * GRID_SIZE);
      } while (next === lastIndex);
      lastIndex = next;
      setLitIndex(next);
      timeout = setTimeout(() => {
        setLitIndex(null);
        timeout = setTimeout(cycle, GAP_MS);
      }, STIMULUS_MS);
    };
    timeout = setTimeout(cycle, 600);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div
      aria-hidden
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gridTemplateRows: 'repeat(3, 1fr)',
        gap: 6,
        width: '100%',
        maxWidth: 180,
        aspectRatio: '1 / 1',
        margin: '24px auto 0',
        opacity: 0.55,
      }}
    >
      {Array.from({ length: GRID_SIZE }, (_, i) => (
        <div
          key={i}
          style={{
            background: i === litIndex ? 'var(--accent)' : 'var(--surface-deep)',
            borderRadius: 8,
            transition: 'background 220ms ease',
          }}
        />
      ))}
    </div>
  );
}
