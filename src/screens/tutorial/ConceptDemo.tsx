import { useEffect, useRef, useState } from 'react';
import Grid from '../../components/Grid';
import BigButton from '../../components/BigButton';
import { createAudioPlayer, type AudioPlayer } from '../../audio';
import { narrate, type NarrationHandle, type NarrationId } from '../../audio/narrations';
import type { Letter, Position, VoiceId } from '../../engine/types';

interface DemoTrial {
  position: Position;
  letter: Letter;
  caption: string;
  narrationId: NarrationId;
  highlight?: 'position' | 'letter';
}

// 2-back demo: 5 trials, scripted to show the mechanic clearly.
const SEQUENCE: DemoTrial[] = [
  { position: 0, letter: 'C', caption: 'A square lights up. A letter plays.', narrationId: 'concept-1' },
  { position: 4, letter: 'H', caption: 'Watch the position. Listen to the letter.', narrationId: 'concept-2' },
  { position: 0, letter: 'K', caption: 'Same position as 2 back — Position match.', narrationId: 'concept-3', highlight: 'position' },
  { position: 8, letter: 'Q', caption: 'No match. Tap nothing.', narrationId: 'concept-4' },
  { position: 2, letter: 'K', caption: 'Same letter as 2 back — Sound match.', narrationId: 'concept-5', highlight: 'letter' },
];

// Per-trial flow (chained, not fixed):
//   1. Show caption + start narration
//   2. Wait for narration to finish, then 400ms beat
//   3. Light the cell + play the letter (1100ms)
//   4. 700ms gap before next trial
const POST_NARRATION_GAP_MS = 400;
const STIMULUS_MS = 1100;
const TRIAL_GAP_MS = 700;

interface Props {
  voice: VoiceId;
  onDone: () => void;
}

export default function ConceptDemo({ voice, onDone }: Props) {
  const [index, setIndex] = useState(-1);
  const [showing, setShowing] = useState(false);
  const [finished, setFinished] = useState(false);
  const audioRef = useRef<AudioPlayer | null>(null);
  const narrationRef = useRef<NarrationHandle | null>(null);
  const cancelledRef = useRef(false);
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

  const sleep = (ms: number) =>
    new Promise<void>((resolve) => {
      const t = setTimeout(resolve, ms);
      timersRef.current.push(t);
    });

  const stop = () => {
    cancelledRef.current = true;
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    if (narrationRef.current) {
      narrationRef.current.cancel();
      narrationRef.current = null;
    }
  };

  const play = async () => {
    stop();
    cancelledRef.current = false;
    setFinished(false);
    setIndex(-1);
    setShowing(false);

    // Brief beat before first trial so users see the layout
    await sleep(300);

    for (let i = 0; i < SEQUENCE.length; i++) {
      if (cancelledRef.current) return;
      const trial = SEQUENCE[i];
      setIndex(i);
      setShowing(false);

      // 1. Narrate
      narrationRef.current = narrate(trial.narrationId, voice);
      await narrationRef.current.done;
      if (cancelledRef.current) return;
      narrationRef.current = null;

      // 2. Post-narration beat
      await sleep(POST_NARRATION_GAP_MS);
      if (cancelledRef.current) return;

      // 3. Stimulus on + letter
      setShowing(true);
      audioRef.current?.playLetter(trial.letter);
      await sleep(STIMULUS_MS);
      if (cancelledRef.current) return;

      setShowing(false);

      // 4. Gap before next trial (skip after last)
      if (i < SEQUENCE.length - 1) {
        await sleep(TRIAL_GAP_MS);
      }
    }

    if (!cancelledRef.current) setFinished(true);
  };

  useEffect(() => {
    play();
    return stop;
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

        <div style={{ marginTop: 20, minHeight: '5rem', textAlign: 'center' }}>
          {current && (
            <>
              <div style={{ fontSize: '0.7rem', color: 'var(--fg-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                Trial {index + 1} of {SEQUENCE.length}
              </div>
              <div style={{ fontSize: '1rem', lineHeight: 1.4, color: 'var(--fg)', maxWidth: '32ch', margin: '0 auto' }}>
                {current.caption}
              </div>
              {current.highlight === 'position' && (
                <div style={{ marginTop: 8, fontSize: '0.8rem', color: 'var(--success)', fontWeight: 600 }}>
                  ✓ Position match
                </div>
              )}
              {current.highlight === 'letter' && (
                <div style={{ marginTop: 8, fontSize: '0.8rem', color: 'var(--success)', fontWeight: 600 }}>
                  ✓ Sound match
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
        <BigButton onClick={play} disabled={!finished}>Replay</BigButton>
        <BigButton primary onClick={() => { stop(); onDone(); }} disabled={!finished}>Try it →</BigButton>
      </div>
    </>
  );
}
