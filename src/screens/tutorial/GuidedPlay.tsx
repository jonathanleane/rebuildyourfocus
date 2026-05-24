import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Grid from '../../components/Grid';
import BigButton from '../../components/BigButton';
import { useGameEngine } from '../../state/useGameEngine';
import { createAudioPlayer, type AudioPlayer } from '../../audio';
import { narrate, type NarrationHandle } from '../../audio/narrations';
import type { VoiceId } from '../../engine/types';

interface Props {
  voice: VoiceId;
  onDone: (positionAcc: number, letterAcc: number) => void;
  onQuit: () => void;
}

const TUTORIAL_N = 1;
const TUTORIAL_LENGTH = 11; // 1 setup + 10 scored trials
const TUTORIAL_MATCHES = 3;

export default function GuidedPlay({ voice, onDone, onQuit }: Props) {
  const [audio, setAudio] = useState<AudioPlayer | null>(null);
  const [posPressed, setPosPressed] = useState(false);
  const [sndPressed, setSndPressed] = useState(false);
  const [countdown, setCountdown] = useState<'ready' | 'set' | 'go' | null>(null);
  const pressTimers = useRef<{ pos: ReturnType<typeof setTimeout> | null; snd: ReturnType<typeof setTimeout> | null }>({ pos: null, snd: null });

  useEffect(() => {
    let cancelled = false;
    createAudioPlayer('auto', voice).then((p) => {
      if (!cancelled) setAudio(p);
    });
    return () => {
      cancelled = true;
    };
  }, [voice]);

  const engine = useGameEngine({
    audio,
    settings: { speedMultiplier: 0.7, nBackLevel: TUTORIAL_N }, // a touch slower than default
  });

  useEffect(() => {
    if (engine.mode === 'blockDone' && engine.lastResult) {
      const r = engine.lastResult;
      onDone(r.positionAccuracy, r.letterAccuracy);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engine.mode]);

  useEffect(() => {
    if (!audio) return;
    let cancelled = false;
    const handles: NarrationHandle[] = [];
    const intro = narrate('practice-intro', voice);
    handles.push(intro);
    const timers: ReturnType<typeof setTimeout>[] = [];

    setCountdown('ready');
    intro.done.then(() => {
      if (cancelled) return;
      // After narration finishes, run Ready/Set/Go (audio + visual) and start the block.
      handles.push(narrate('ready', voice));
      timers.push(
        setTimeout(() => {
          if (cancelled) return;
          setCountdown('set');
          handles.push(narrate('set', voice));
        }, 700),
      );
      timers.push(
        setTimeout(() => {
          if (cancelled) return;
          setCountdown('go');
          handles.push(narrate('go', voice));
        }, 1400),
      );
      // 'Go!' shown at 1400ms; first letter at 2900ms — 1.5s breathing room.
      timers.push(
        setTimeout(() => {
          if (cancelled) return;
          setCountdown(null);
          engine.startBlock(TUTORIAL_N, undefined, {
            length: TUTORIAL_LENGTH,
            matchesPerModality: TUTORIAL_MATCHES,
          });
        }, 2900),
      );
    });

    return () => {
      cancelled = true;
      handles.forEach((h) => h.cancel());
      timers.forEach(clearTimeout);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audio]);

  const flashPos = useCallback(() => {
    engine.tapPosition();
    setPosPressed(true);
    if (pressTimers.current.pos) clearTimeout(pressTimers.current.pos);
    pressTimers.current.pos = setTimeout(() => setPosPressed(false), 220);
  }, [engine.tapPosition]);

  const flashSnd = useCallback(() => {
    engine.tapSound();
    setSndPressed(true);
    if (pressTimers.current.snd) clearTimeout(pressTimers.current.snd);
    pressTimers.current.snd = setTimeout(() => setSndPressed(false), 220);
  }, [engine.tapSound]);

  useEffect(() => () => {
    if (pressTimers.current.pos) clearTimeout(pressTimers.current.pos);
    if (pressTimers.current.snd) clearTimeout(pressTimers.current.snd);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') {
        e.preventDefault();
        flashPos();
      } else if (e.key === 'l' || e.key === 'L' || e.key === 'ArrowRight') {
        e.preventDefault();
        flashSnd();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [flashPos, flashSnd]);

  const litIndex = useMemo(
    () => (engine.showStimulus && engine.currentTrial ? engine.currentTrial.position : null),
    [engine.showStimulus, engine.currentTrial],
  );

  // Previous trial for the hint panel (1-back, so just trialIndex - 1)
  const prevTrial =
    engine.trialIndex > 0 ? engine.trials[engine.trialIndex - 1] ?? null : null;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <button onClick={onQuit} aria-label="Skip practice" style={{ color: 'var(--fg-dim)', fontSize: '0.85rem' }}>
          ‹ Skip
        </button>
        <div style={{ display: 'flex', gap: 12, fontSize: '0.7rem', color: 'var(--fg-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          <span>Practice</span>
          <span>1-back</span>
          <span>
            {engine.trialIndex >= 0 ? engine.trialIndex + 1 : 0}/{engine.totalTrials || TUTORIAL_LENGTH}
          </span>
        </div>
        <div style={{ width: 32 }} />
      </div>

      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          padding: '8px 12px',
          marginBottom: 12,
          fontSize: '0.8rem',
          color: 'var(--fg)',
          minHeight: '2.4rem',
          textAlign: 'center',
        }}
      >
        {prevTrial ? (
          <>
            <span style={{ color: 'var(--fg-dim)' }}>Previous trial:</span>{' '}
            <PositionDot index={prevTrial.position} /> · letter <b>{prevTrial.letter}</b>
            <div style={{ fontSize: '0.7rem', color: 'var(--fg-dim)', marginTop: 2 }}>
              Tap if this trial matches it.
            </div>
          </>
        ) : (
          <span style={{ color: 'var(--fg-dim)' }}>The first trial has nothing to compare to. Just watch.</span>
        )}
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
        <Grid litIndex={litIndex} />
        {countdown && (
          <div
            aria-live="polite"
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--bg)',
              fontSize: '3rem',
              fontWeight: 700,
              color: countdown === 'go' ? 'var(--accent)' : 'var(--fg)',
            }}
          >
            {countdown === 'ready' ? 'Ready' : countdown === 'set' ? 'Set' : 'Go'}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
        <BigButton onClick={flashPos} pressed={posPressed} ariaLabel="Position match" hotkey="A">Position</BigButton>
        <BigButton primary onClick={flashSnd} pressed={sndPressed} ariaLabel="Sound match" hotkey="L">Sound</BigButton>
      </div>
    </>
  );
}

function PositionDot({ index }: { index: number }) {
  const row = Math.floor(index / 3);
  const col = index % 3;
  return (
    <span
      aria-label={`grid cell row ${row + 1} column ${col + 1}`}
      style={{
        display: 'inline-grid',
        gridTemplateColumns: 'repeat(3, 6px)',
        gridTemplateRows: 'repeat(3, 6px)',
        gap: 2,
        verticalAlign: 'middle',
        marginLeft: 4,
        marginRight: 4,
      }}
    >
      {Array.from({ length: 9 }).map((_, i) => (
        <span
          key={i}
          style={{
            background: i === index ? 'var(--accent)' : 'var(--surface-deep)',
            borderRadius: 1,
          }}
        />
      ))}
    </span>
  );
}
