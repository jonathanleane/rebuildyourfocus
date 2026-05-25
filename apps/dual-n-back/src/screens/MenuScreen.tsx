import BigButton from '../components/BigButton';
import type { UsePlayerState } from '../state/usePlayerState';
import { CHALLENGE_TARGET } from '../engine/constants';

interface Props {
  player: UsePlayerState;
  onStart: () => void;
  onStats: () => void;
  onSettings: () => void;
  onHome: () => void;
}

export default function MenuScreen({ player, onStart, onStats, onSettings, onHome }: Props) {
  const { player: p, settings: s } = player.state;
  return (
    <>
      <button
        onClick={onHome}
        style={{ color: 'var(--fg-dim)', fontSize: '0.85rem', alignSelf: 'flex-start', marginBottom: 4 }}
      >
        ‹ All games
      </button>
      <header style={{ marginTop: 4 }}>
        <div style={{ fontSize: '1.8rem', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1 }}>N-Back</div>
        <div style={{ fontSize: '0.85rem', color: 'var(--fg-dim)', marginBottom: 16 }}>Challenge</div>
        <div
          style={{
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap',
            fontSize: '0.72rem',
            fontWeight: 600,
            color: 'var(--fg-dim)',
          }}
        >
          <Badge>🔥 {p.currentStreak}d streak</Badge>
          <Badge>{p.totalSessionsCompleted}/{CHALLENGE_TARGET} sessions</Badge>
          <Badge accent>{s.nBackLevel}-back · {s.blocksPerSession} blocks</Badge>
        </div>
      </header>

      <div style={{ flex: 1 }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <BigButton primary onClick={onStart}>Start Session</BigButton>
        <div style={{ display: 'flex', gap: 12 }}>
          <BigButton onClick={onStats}>Stats</BigButton>
          <BigButton onClick={onSettings}>Settings</BigButton>
        </div>
      </div>

      <div style={{ marginTop: 16, textAlign: 'center', fontSize: '0.72rem', color: 'var(--fg-dim)' }}>
        Free &amp; open source ·{' '}
        <a
          href="https://github.com/jonathanleane/rebuildyourfocus/tree/main/apps/dual-n-back"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--accent)' }}
        >
          source on GitHub
        </a>
      </div>
    </>
  );
}

function Badge({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <span
      style={{
        background: accent ? 'var(--fg)' : 'var(--surface)',
        color: accent ? 'var(--bg)' : 'var(--fg)',
        border: '1px solid var(--border)',
        borderRadius: 999,
        padding: '5px 10px',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  );
}
