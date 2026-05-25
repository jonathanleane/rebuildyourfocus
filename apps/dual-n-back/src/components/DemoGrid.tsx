import { GRID_SIZE } from '../engine/constants';

export default function DemoGrid() {
  return (
    <div
      aria-hidden
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gridTemplateRows: 'repeat(3, 1fr)',
        gap: 10,
        // Cap at 200px square so iPhone SE (568px visible viewport) fits
        // header + grid + buttons + footer without scroll.
        width: 'min(50vw, 200px)',
        height: 'min(50vw, 200px)',
      }}
    >
      {Array.from({ length: GRID_SIZE }, (_, i) => (
        <div
          key={i}
          style={{
            background: 'var(--surface)',
            borderRadius: 12,
          }}
        />
      ))}
    </div>
  );
}
