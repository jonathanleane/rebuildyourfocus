interface Props {
  onPlayDualNBack: () => void;
}

const REPO = 'https://github.com/jonathanleane/rebuildyourfocus';

export default function LandingScreen({ onPlayDualNBack }: Props) {
  return (
    <>
      <header style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginTop: 16, marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            Rebuild Your Focus
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--fg-dim)', marginTop: 4 }}>
            Free brain training. No ads. No accounts. Open source.
          </div>
        </div>
        <a
          href={REPO}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View on GitHub"
          style={{
            color: 'var(--fg-dim)',
            display: 'inline-flex',
            padding: 6,
            marginTop: 2,
          }}
        >
          <GitHubIcon />
        </a>
      </header>

      <section style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
        <GameCard
          name="Dual N-Back"
          tagline="Working-memory trainer faithful to the Jaeggi 2008 paradigm."
          sourceHref={`${REPO}/tree/main/apps/dual-n-back`}
          onPlay={onPlayDualNBack}
        />
        <ComingSoonCard />
      </section>

      <footer style={{ marginTop: 24, fontSize: '0.75rem', color: 'var(--fg-dim)', lineHeight: 1.5, textAlign: 'center' }}>
        Built by{' '}
        <a href="https://github.com/jonathanleane" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>
          @jonathanleane
        </a>
        . MIT licensed. PRs welcome on{' '}
        <a href={REPO} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>
          GitHub
        </a>
        .
      </footer>
    </>
  );
}

function GameCard({
  name,
  tagline,
  sourceHref,
  onPlay,
}: {
  name: string;
  tagline: string;
  sourceHref: string;
  onPlay: () => void;
}) {
  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        padding: 18,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <div>
        <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 4 }}>{name}</div>
        <div style={{ fontSize: '0.85rem', color: 'var(--fg-dim)', lineHeight: 1.4 }}>{tagline}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={onPlay}
          style={{
            flex: 1,
            background: 'var(--accent)',
            color: 'var(--accent-fg)',
            border: '1px solid var(--border)',
            borderRadius: 999,
            padding: '12px 0',
            fontSize: '0.95rem',
            fontWeight: 600,
          }}
        >
          Play
        </button>
        <a
          href={sourceHref}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: 'var(--fg-dim)',
            fontSize: '0.78rem',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '12px 4px',
          }}
          aria-label={`View ${name} source on GitHub`}
        >
          <GitHubIcon size={14} /> Source
        </a>
      </div>
    </div>
  );
}

function ComingSoonCard() {
  return (
    <div
      style={{
        border: '1px dashed var(--border)',
        borderRadius: 16,
        padding: 18,
        textAlign: 'center',
        color: 'var(--fg-dim)',
        fontSize: '0.85rem',
      }}
    >
      More games coming. Have a suggestion?{' '}
      <a
        href={`${REPO}/issues/new`}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: 'var(--accent)' }}
      >
        Open an issue
      </a>
      .
    </div>
  );
}

function GitHubIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.87-1.54-3.87-1.54-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.51-1.47.11-3.06 0 0 .97-.31 3.18 1.18.92-.26 1.91-.39 2.89-.39.98 0 1.97.13 2.89.39 2.21-1.49 3.18-1.18 3.18-1.18.62 1.59.23 2.77.11 3.06.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.4-5.25 5.68.41.35.78 1.05.78 2.12 0 1.53-.01 2.76-.01 3.13 0 .31.21.67.8.55C20.21 21.38 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z" />
    </svg>
  );
}
