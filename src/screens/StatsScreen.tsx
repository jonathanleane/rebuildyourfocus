import LineChart from '../components/LineChart';
import type { UsePlayerState } from '../state/usePlayerState';

interface Props {
  player: UsePlayerState;
  onBack: () => void;
}

export default function StatsScreen({ player, onBack }: Props) {
  const { player: p, history } = player.state;

  const completed = history.filter((s) => s.completed);
  const recentLevels = completed.slice(0, 30).reverse().map((s) => s.endingLevel);
  const totalBlocks = history.reduce((a, s) => a + s.blocks.length, 0);
  const avgLevel = completed.length === 0 ? 0 : completed.reduce((a, s) => a + s.endingLevel, 0) / completed.length;

  return (
    <>
      <button onClick={onBack} style={{ color: 'var(--fg-dim)', fontSize: '0.85rem', alignSelf: 'flex-start', marginBottom: 12 }}>‹ Back</button>
      <div style={{ fontSize: '1.2rem', fontWeight: 700, textAlign: 'center', marginBottom: 16 }}>Statistics</div>

      <div style={{ background: 'var(--surface)', borderRadius: 14, padding: 12, marginBottom: 12 }}>
        <div style={{ fontSize: '0.7rem', color: 'var(--fg-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
          Recent sessions
        </div>
        <LineChart values={recentLevels} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <Tile big={avgLevel.toFixed(1)} label="Avg level" />
        <Tile big={String(p.bestLevel)} label="Best level" />
        <Tile big={String(totalBlocks)} label="Total blocks" />
        <Tile big={String(p.currentStreak)} label="Streak" />
      </div>
    </>
  );
}

function Tile({ big, label }: { big: string; label: string }) {
  return (
    <div style={{ background: 'var(--surface)', borderRadius: 14, padding: 12 }}>
      <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{big}</div>
      <div style={{ fontSize: '0.65rem', color: 'var(--fg-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
    </div>
  );
}
