import LineChart from '../components/LineChart';
import MultiLineChart from '../components/MultiLineChart';
import CalendarHeatmap from '../components/CalendarHeatmap';
import type { UsePlayerState } from '../state/usePlayerState';
import type { SessionResult } from '../engine/types';

interface Props {
  player: UsePlayerState;
  onBack: () => void;
}

export default function StatsScreen({ player, onBack }: Props) {
  const { player: p, history } = player.state;

  const completed = history.filter((s) => s.completed);
  const recentSessions = completed.slice(0, 30).reverse();
  const recentLevels = recentSessions.map((s) => s.endingLevel);
  const totalBlocks = history.reduce((a, s) => a + s.blocks.length, 0);
  const avgLevel = completed.length === 0 ? 0 : completed.reduce((a, s) => a + s.endingLevel, 0) / completed.length;

  // Per-session average accuracy by modality, last 20 completed sessions.
  const accuracyWindow = completed.slice(0, 20).reverse();
  const positionAccs = accuracyWindow.map(avgAcc('positionAccuracy'));
  const letterAccs = accuracyWindow.map(avgAcc('letterAccuracy'));

  // Activity counts per day across ALL recorded blocks (completed + incomplete).
  const dayCounts: Record<string, number> = {};
  for (const session of history) {
    for (const block of session.blocks) {
      const day = new Date(block.finishedAt).toISOString().slice(0, 10);
      dayCounts[day] = (dayCounts[day] ?? 0) + 1;
    }
  }
  const activeDays = Object.keys(dayCounts).length;

  return (
    <>
      <button onClick={onBack} style={{ color: 'var(--fg-dim)', fontSize: '0.85rem', alignSelf: 'flex-start', marginBottom: 12 }}>‹ Back</button>
      <div style={{ fontSize: '1.2rem', fontWeight: 700, textAlign: 'center', marginBottom: 16 }}>Statistics</div>

      <Section title="Level over time" hint={`Last ${recentLevels.length} completed session${recentLevels.length === 1 ? '' : 's'}`}>
        <LineChart values={recentLevels} />
      </Section>

      <Section title="Accuracy by modality" hint="Per-session average · dashed lines = 75% / 90% thresholds">
        <MultiLineChart
          series={[
            { values: positionAccs, color: 'var(--accent)', label: 'Position' },
            { values: letterAccs, color: 'var(--accent-warm)', label: 'Sound' },
          ]}
          yMax={1}
        />
      </Section>

      <Section title="Activity" hint={`${activeDays} active day${activeDays === 1 ? '' : 's'} · last 12 weeks`}>
        <CalendarHeatmap counts={dayCounts} weeks={12} />
      </Section>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
        <Tile big={avgLevel.toFixed(1)} label="Avg level" />
        <Tile big={String(p.bestLevel)} label="Best level" />
        <Tile big={String(totalBlocks)} label="Total blocks" />
        <Tile big={String(p.currentStreak)} label="Streak" />
      </div>
    </>
  );
}

function avgAcc(field: 'positionAccuracy' | 'letterAccuracy') {
  return (s: SessionResult): number => {
    if (s.blocks.length === 0) return 0;
    return s.blocks.reduce((a, b) => a + b[field], 0) / s.blocks.length;
  };
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--surface)', borderRadius: 14, padding: 12, marginBottom: 12 }}>
      <div style={{ fontSize: '0.7rem', color: 'var(--fg-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>
        {title}
      </div>
      {hint && (
        <div style={{ fontSize: '0.65rem', color: 'var(--fg-dim)', marginBottom: 10 }}>{hint}</div>
      )}
      {children}
    </div>
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
