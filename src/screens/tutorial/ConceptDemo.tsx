import { useEffect, useRef, useState } from 'react';
import Grid from '../../components/Grid';
import BigButton from '../../components/BigButton';
import { createAudioPlayer, type AudioPlayer } from '../../audio';
import type { Letter, Position, VoiceId } from '../../engine/types';

interface DemoTrial {
  position: Position;
  letter: Letter;
  caption: string;
  highlight?: 'position' | 'letter';
}

// 2-back demo: 5 trials, scripted to show the mechanic clearly.
const SEQUENCE: DemoTrial[] = [
  { position: 0, letter: 'C', caption: 'Each trial: one square lights up AND a letter plays.' },
  { position: 4, letter: 'H', caption: 'Watch the position. Listen to the letter.' },
  { position: 0, letter: 'K', caption: 'Same position as 2 back → tap Position.', highlight: 'position' },
  { position: 8, letter: 'Q', caption: 'No match. Tap nothing.' },
  { position: 2, letter: 'K', caption: 'Same letter as 2 back → tap Sound.', highlight: 'letter' },
];

const STIMULUS_MS = 800;
const RESPONSE_MS = 1700;
const TRIAL_MS = STIMULUS_MS + RESPONSE_MS;

interface Props {
  voice: VoiceId;
  onDone: () => void;
}

export default function ConceptDemo({ voice, onDone }: Props) {
  const [index, setIndex] = useState(-1);
  const [showing, setShowing] = useState(false);
  const [finished, setFinished] = useState(false);
  const audioRef = useRef<AudioPlayer | null>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    let cancelled = false;
    createAudioPlayer('auto', voice).then((p) => {
      if (!cancelled) audioRef.current = p;
    });
    return () => {
      cancelled = true;
    };
  }, [voice]);

  const play = () => {
    clearTimers();
    setFinished(false);
    setIndex(-1);
    setShowing(false);
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 0; i < SEQUENCE.length; i++) {
      const start = i * TRIAL_MS + 300;
      timers.push(
        setTimeout(() => {
          setIndex(i);
          setShowing(true);
          audioRef.current?.playLetter(SEQUENCE[i].letter);
        }, start),
      );
      timers.push(
        setTimeout(() => setShowing(false), start + STIMULUS_MS),
      );
    }
    timers.push(
      setTimeout(() => setFinished(true), SEQUENCE.length * TRIAL_MS + 300),
    );
    timersRef.current = timers;
  };

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  useEffect(() => {
    play();
    return clearTimers;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const current = index >= 0 ? SEQUENCE[index] : null;
  const litIndex = current && showing ? current.position : null;

  return (
    <>
      <div style={{ fontSize: '1.2rem', fontWeight: 700, textAlign: 'center', marginBottom: 8 }}>How it works</div>
      <div style={{ fontSize: '0.8rem', color: 'var(--fg-dim)', textAlign: 'center', marginBottom: 16 }}>
        We'll use 2-back as the example.
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Grid litIndex={litIndex} />

        <div style={{ marginTop: 16, minHeight: '4.5rem', textAlign: 'center' }}>
          {current && (
            <div style={{ fontSize: '0.95rem', lineHeight: 1.4, color: 'var(--fg)' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--fg-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', marginRight: 6 }}>
                Trial {index + 1}
              </span>
              "{current.letter}" · {current.caption}
            </div>
          )}
          {current?.highlight === 'position' && (
            <div style={{ marginTop: 8, fontSize: '0.8rem', color: 'var(--success)', fontWeight: 600 }}>
              ✓ Position match
            </div>
          )}
          {current?.highlight === 'letter' && (
            <div style={{ marginTop: 8, fontSize: '0.8rem', color: 'var(--success)', fontWeight: 600 }}>
              ✓ Sound match
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
        <BigButton onClick={play} disabled={!finished}>Replay</BigButton>
        <BigButton primary onClick={onDone} disabled={!finished}>Try it →</BigButton>
      </div>
    </>
  );
}
