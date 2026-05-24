import Cell from './Cell';
import { GRID_SIZE } from '../engine/constants';

interface Props {
  litIndex: number | null;
}

export default function Grid({ litIndex }: Props) {
  return (
    <div
      role="grid"
      aria-label="N-back grid"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gridTemplateRows: 'repeat(3, 1fr)',
        gap: 8,
        width: '100%',
        maxWidth: 320,
        aspectRatio: '1 / 1',
        margin: '0 auto',
      }}
    >
      {Array.from({ length: GRID_SIZE }, (_, i) => (
        <Cell key={i} lit={i === litIndex} />
      ))}
    </div>
  );
}
