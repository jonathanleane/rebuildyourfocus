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
        width: 'min(80vw, 300px)',
        height: 'min(80vw, 300px)',
      }}
    >
      {Array.from({ length: GRID_SIZE }, (_, i) => (
        <div
          key={i}
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 12,
          }}
        />
      ))}
    </div>
  );
}
