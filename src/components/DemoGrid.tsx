import { useEffect, useState } from 'react';
import { GRID_SIZE } from '../engine/constants';

const ON_MS = 700;
const OFF_MS = 4000;

/**
 * Decorative 3×3 grid on the menu. Lights one random cell very gently
 * every few seconds — slow enough to read as "ambient" rather than
 * "a game is running". Respects prefers-reduced-motion (stays static).
 */
export default function DemoGrid() {
  const [litIndex, setLitIndex] = useState<number | null>(null);

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    let timeout: ReturnType<typeof setTimeout>;
    let last = -1;
    const cycle = () => {
      let next: number;
      do {
        next = Math.floor(Math.random() * GRID_SIZE);
      } while (next === last);
      last = next;
      setLitIndex(next);
      timeout = setTimeout(() => {
        setLitIndex(null);
        timeout = setTimeout(cycle, OFF_MS);
      }, ON_MS);
    };
    // Wait 2.5s before first pulse so the page settles before anything moves.
    timeout = setTimeout(cycle, 2500);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div
      aria-hidden
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gridTemplateRows: 'repeat(3, 1fr)',
        gap: 10,
        width: '100%',
        maxWidth: 300,
        aspectRatio: '1 / 1',
      }}
    >
      {Array.from({ length: GRID_SIZE }, (_, i) => (
        <div
          key={i}
          style={{
            background: i === litIndex ? 'var(--accent)' : 'var(--surface)',
            borderRadius: 12,
            transition: 'background 600ms ease',
            opacity: i === litIndex ? 0.6 : 1,
          }}
        />
      ))}
    </div>
  );
}
