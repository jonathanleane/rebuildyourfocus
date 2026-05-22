import ProgressRing from '../components/ProgressRing';
import BigButton from '../components/BigButton';
import type { UsePlayerState } from '../state/usePlayerState';
import { CHALLENGE_TARGET } from '../engine/constants';

interface Props {
  player: UsePlayerState;
  onStart: () => void;
  onStats: () => void;
  onSettings: () => void;
}

export default function MenuScreen({ player, onStart, onStats, onSettings }: Props) {
  const { player: p } = player.state;
  return (
    <>
      <div style={{ fontSize: '1.8rem', fontWeight: 700, letterSpacing: '-0.02em', marginTop: 16 }}>N-Back</div>
      <div style={{ fontSize: '0.85rem', color: 'var(--fg-dim)', marginBottom: 20 }}>Challenge</div>

      <div
        style={{
          alignSelf: 'flex-start',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 999,
          padding: '6px 12px',
          fontSize: '0.75rem',
          fontWeight: 600,
          marginBottom: 16,
        }}
      >
        🔥 {p.currentStreak} day streak
      </div>

      <ProgressRing value={p.totalSessionsCompleted} max={CHALLENGE_TARGET} label="Sessions" />

      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <BigButton primary onClick={onStart}>Start Session</BigButton>
        <div style={{ display: 'flex', gap: 12 }}>
          <BigButton onClick={onStats}>Stats</BigButton>
          <BigButton onClick={onSettings}>Settings</BigButton>
        </div>
      </div>
    </>
  );
}
