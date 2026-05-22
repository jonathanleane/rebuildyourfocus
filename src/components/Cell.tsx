import { memo } from 'react';

interface Props {
  lit: boolean;
}

function CellInner({ lit }: Props) {
  return (
    <div
      role="presentation"
      style={{
        background: lit ? 'var(--accent)' : 'var(--surface)',
        borderRadius: 10,
        aspectRatio: '1 / 1',
        transition: 'background 80ms ease',
      }}
    />
  );
}

export default memo(CellInner);
