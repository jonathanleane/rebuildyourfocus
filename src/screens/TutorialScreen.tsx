import { useState } from 'react';
import BigButton from '../components/BigButton';
import type { UsePlayerState } from '../state/usePlayerState';
import ConceptDemo from './tutorial/ConceptDemo';
import GuidedPlay from './tutorial/GuidedPlay';

type Step = 'welcome' | 'concept' | 'practice' | 'done';

interface Props {
  player: UsePlayerState;
  onFinish: () => void;
  onSkip: () => void;
}

export default function TutorialScreen({ player, onFinish, onSkip }: Props) {
  const [step, setStep] = useState<Step>('welcome');
  const [practiceScore, setPracticeScore] = useState<{ pos: number; let: number } | null>(null);

  if (step === 'welcome') {
    return (
      <>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingBottom: 24 }}>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: 16 }}>Welcome.</div>
          <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--fg-dim)' }}>
            Dual n-back trains working memory. It's based on a peer-reviewed paradigm
            (<a
              href="https://www.pnas.org/doi/10.1073/pnas.0801268105"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--accent)' }}
            >
              Jaeggi 2008
            </a>).
          </p>
          <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--fg-dim)', marginTop: 12 }}>
            Sessions are about 10 minutes. The task is deliberately uncomfortable —
            that's how you know it's working. You'll feel lost at first. Stick with it.
          </p>
          <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--fg-dim)', marginTop: 12 }}>
            This walkthrough takes ~2 minutes.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <BigButton onClick={onSkip}>Skip — I know the rules</BigButton>
          <BigButton primary onClick={() => setStep('concept')}>Show me</BigButton>
        </div>
      </>
    );
  }

  if (step === 'concept') {
    return <ConceptDemo voice={player.state.settings.voice} onDone={() => setStep('practice')} />;
  }

  if (step === 'practice') {
    return (
      <GuidedPlay
        voice={player.state.settings.voice}
        onDone={(pos, let_) => {
          setPracticeScore({ pos, let: let_ });
          setStep('done');
        }}
        onQuit={() => setStep('done')}
      />
    );
  }

  // done
  const avg = practiceScore ? (practiceScore.pos + practiceScore.let) / 2 : null;
  return (
    <>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingBottom: 24 }}>
        <div style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: 16 }}>You've got it.</div>
        {avg !== null && (
          <div style={{ fontSize: '0.85rem', color: 'var(--fg-dim)', marginBottom: 16 }}>
            Practice score: Position {Math.round(practiceScore!.pos * 100)}% · Sound{' '}
            {Math.round(practiceScore!.let * 100)}%
          </div>
        )}
        <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--fg-dim)' }}>
          The real game starts at <b style={{ color: 'var(--fg)' }}>2-back</b> — you'll compare each trial to
          <i> two </i>back instead of one. That's the jump where everyone feels overwhelmed
          for the first session or two.
        </p>
        <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--fg-dim)', marginTop: 12 }}>
          Expect 40–60% accuracy your first session. That's normal. It passes.
        </p>
      </div>
      <BigButton primary onClick={onFinish}>Start training</BigButton>
    </>
  );
}
