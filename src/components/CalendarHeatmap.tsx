import { localDateKey, localMidnight } from '../engine/dates';

interface Props {
  /** Map from local-date 'YYYY-MM-DD' to count of blocks. */
  counts: Record<string, number>;
  weeks?: number;
}

const DAY_LABELS = ['M', 'W', 'F'];

export default function CalendarHeatmap({ counts, weeks = 12 }: Props) {
  const today = localMidnight(new Date());

  // Start from the Monday `weeks - 1` weeks ago to align the grid.
  const start = new Date(today);
  const todayDow = (start.getDay() + 6) % 7; // 0 = Mon, 6 = Sun
  start.setDate(start.getDate() - todayDow - (weeks - 1) * 7);

  const cells: { date: string; count: number; future: boolean }[] = [];
  for (let w = 0; w < weeks; w++) {
    for (let d = 0; d < 7; d++) {
      const date = new Date(start);
      date.setDate(start.getDate() + w * 7 + d);
      const key = localDateKey(date.getTime());
      cells.push({
        date: key,
        count: counts[key] ?? 0,
        future: date.getTime() > today.getTime(),
      });
    }
  }

  const maxCount = Math.max(1, ...Object.values(counts));

  return (
    <div style={{ display: 'flex', gap: 4 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, fontSize: '0.55rem', color: 'var(--fg-dim)', paddingTop: 2, paddingBottom: 2, justifyContent: 'space-between' }}>
        {DAY_LABELS.map((l) => (
          <span key={l} style={{ height: 12, lineHeight: '12px' }}>{l}</span>
        ))}
      </div>
      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: `repeat(${weeks}, 1fr)`,
          gridTemplateRows: 'repeat(7, 1fr)',
          gridAutoFlow: 'column',
          gap: 2,
        }}
      >
        {cells.map((c) => {
          const intensity = c.future ? 0 : Math.min(1, c.count / maxCount);
          const bg = c.future
            ? 'transparent'
            : c.count === 0
            ? 'var(--surface)'
            : `color-mix(in srgb, var(--accent) ${intensity * 100}%, var(--surface))`;
          return (
            <div
              key={c.date}
              title={c.future ? '' : `${c.date} · ${c.count} block${c.count === 1 ? '' : 's'}`}
              style={{
                aspectRatio: '1 / 1',
                background: bg,
                borderRadius: 2,
                border: c.future ? '1px dashed var(--border)' : 'none',
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
