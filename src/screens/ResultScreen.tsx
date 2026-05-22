import BigButton from '../components/BigButton';
import ThresholdBar from '../components/ThresholdBar';
import type { BlockResult } from '../engine/types';

interface Props {
  result: BlockResult;
  blocksLeft: number;
  level: number;
  onContinue: () => void;
  onDone: () => void;
}

export default function ResultScreen({ result, blocksLeft, level, onContinue, onDone }: Props) {
  const headline =
    result.outcome === 'level-up' ? 'Amazing!' : result.outcome === 'level-down' ? 'Push harder.' : 'Nice.';
  const sessionDone = blocksLeft <= 0;

  return (
    <>
      <div style={{ fontSize: '1.8rem', fontWeight: 700, textAlign: 'center', margin: '24px 0 4px' }}>{headline}</div>
      <div style={{ color: 'var(--fg-dim)', fontSize: '0.85rem', textAlign: 'center', marginBottom: 24 }}>
        {sessionDone ? 'Session complete' : `${blocksLeft} block${blocksLeft === 1 ? '' : 's'} left`}
      </div>

      <ScoreCard label="Position" value={result.positionAccuracy} />
      <ScoreCard label="Sound" value={result.letterAccuracy} />

      <div
        style={{
          background: 'var(--accent)',
          color: 'var(--accent-fg)',
          borderRadius: 14,
          padding: 16,
          textAlign: 'center',
          marginTop: 24,
        }}
      >
        <div style={{ fontWeight: 700 }}>
          {result.outcome === 'level-up' && `Level raised to ${level}`}
          {result.outcome === 'level-down' && `Level dropped to ${level}`}
          {result.outcome === 'hold' && `Same level (${level})`}
        </div>
      </div>

      <div style={{ marginTop: 'auto', display: 'flex', gap: 12, paddingTop: 24 }}>
        {!sessionDone && <BigButton primary onClick={onContinue}>Continue</BigButton>}
        <BigButton onClick={onDone}>{sessionDone ? 'Done' : 'End session'}</BigButton>
      </div>
    </>
  );
}

function ScoreCard({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ background: 'var(--surface)', borderRadius: 14, padding: 14, marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>{Math.round(value * 100)}%</div>
          <div style={{ fontSize: '0.65rem', color: 'var(--fg-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
        </div>
        <div style={{ fontSize: '0.6rem', color: 'var(--fg-dim)' }}>75%&nbsp;&nbsp;90%</div>
      </div>
      <ThresholdBar value={value} />
    </div>
  );
}
