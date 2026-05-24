import BigButton from '../components/BigButton';

interface Props {
  onFinish: () => void;
}

export default function TutorialScreen({ onFinish }: Props) {
  return (
    <>
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          paddingBottom: 24,
        }}
      >
        <div style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: 8, letterSpacing: '-0.02em' }}>
          How dual n-back works
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--fg-dim)', marginBottom: 24 }}>
          Based on the{' '}
          <a
            href="https://www.pnas.org/doi/10.1073/pnas.0801268105"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--accent)' }}
          >
            Jaeggi 2008 paradigm
          </a>.
        </div>

        <ul style={{ paddingLeft: 20, marginBottom: 20, fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--fg)' }}>
          <li>Each trial: one of nine squares lights up and a letter plays.</li>
          <li style={{ marginTop: 6 }}>
            Tap <b>Position</b> when the lit square matches the one from{' '}
            <b>N&nbsp;trials ago</b>.
          </li>
          <li style={{ marginTop: 6 }}>
            Tap <b>Sound</b> when the letter matches the one from <b>N&nbsp;trials ago</b>.
          </li>
          <li style={{ marginTop: 6 }}>Either, both, or neither can match. Tap nothing if neither matches.</li>
        </ul>

        <div
          role="note"
          style={{
            padding: '12px 14px',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            fontSize: '0.85rem',
            color: 'var(--fg)',
            lineHeight: 1.5,
            marginBottom: 16,
          }}
        >
          <b>Your first session will feel impossible.</b> ~50% accuracy is normal. The
          paradigm is unpleasant by design — that's how you know it's working. Stick with it.
        </div>

        <div style={{ fontSize: '0.75rem', color: 'var(--fg-dim)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span aria-hidden>🔊</span>
          <span>Sound is required. Check your volume.</span>
        </div>
      </div>

      <div style={{ display: 'flex' }}>
        <BigButton primary onClick={onFinish}>Got it, let's play</BigButton>
      </div>
    </>
  );
}
