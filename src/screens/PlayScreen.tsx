import { useCallback, useEffect, useMemo, useState } from 'react';
import Grid from '../components/Grid';
import BigButton from '../components/BigButton';
import { useGameEngine } from '../state/useGameEngine';
import { createAudioPlayer, type AudioPlayer } from '../audio';
import { narrate } from '../audio/narrations';
import type { UsePlayerState } from '../state/usePlayerState';
import type { BlockResult } from '../engine/types';
import { applyOutcome } from '../engine/scoring';

interface Props {
  player: UsePlayerState;
  blockNumber: number;
  onBlockComplete: (result: BlockResult, newLevel: number) => void;
  onQuit: () => void;
}

type Countdown = 'ready' | 'set' | 'go' | null;

export default function PlayScreen({ player, blockNumber, onBlockComplete, onQuit }: Props) {
  const settings = player.state.settings;
  const [audio, setAudio] = useState<AudioPlayer | null>(null);
  const [countdown, setCountdown] = useState<Countdown>('ready');

  useEffect(() => {
    let cancelled = false;
    createAudioPlayer(settings.audioSource, settings.voice).then((p) => {
      if (!cancelled) setAudio(p);
    });
    return () => {
      cancelled = true;
    };
  }, [settings.audioSource, settings.voice]);

  const engine = useGameEngine({
    audio,
    settings: { speedMultiplier: settings.speedMultiplier, nBackLevel: settings.nBackLevel },
  });

  useEffect(() => {
    if (engine.mode === 'blockDone' && engine.lastResult) {
      const result = engine.lastResult;
      const newLevel = settings.autoLevelProgression
        ? applyOutcome(settings.nBackLevel, result.outcome)
        : settings.nBackLevel;
      player.updateSettings({ nBackLevel: newLevel });
      onBlockComplete(result, newLevel);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engine.mode]);

  useEffect(() => {
    if (!audio) return;
    const handles = [
      narrate('ready', settings.voice),
    ];
    const timers = [
      setTimeout(() => {
        setCountdown('set');
        handles.push(narrate('set', settings.voice));
      }, 700),
      setTimeout(() => {
        setCountdown('go');
        handles.push(narrate('go', settings.voice));
      }, 1400),
      setTimeout(() => {
        setCountdown(null);
        engine.startBlock(settings.nBackLevel);
      }, 2100),
    ];
    return () => {
      timers.forEach(clearTimeout);
      handles.forEach((h) => h.cancel());
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audio]);

  // Buttons stay visually pressed (locked) once tapped for the current trial.
  // The reducer is idempotent, so multiple taps don't change anything; we just
  // also suppress the click handler to make the lock explicit.
  const posLocked = engine.currentResponse?.position === true;
  const sndLocked = engine.currentResponse?.letter === true;

  const tapPos = useCallback(() => {
    if (posLocked) return;
    engine.tapPosition();
  }, [engine.tapPosition, posLocked]);

  const tapSnd = useCallback(() => {
    if (sndLocked) return;
    engine.tapSound();
  }, [engine.tapSound, sndLocked]);

  const isPaused = engine.mode === 'paused';
  const togglePause = useCallback(() => {
    if (isPaused) engine.resume();
    else engine.pause();
  }, [engine.pause, engine.resume, isPaused]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        togglePause();
        return;
      }
      if (isPaused) return;
      if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') {
        e.preventDefault();
        tapPos();
      } else if (e.key === 'l' || e.key === 'L' || e.key === 'ArrowRight') {
        e.preventDefault();
        tapSnd();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [tapPos, tapSnd, togglePause, isPaused]);

  const litIndex = useMemo(
    () => (engine.showStimulus && engine.currentTrial ? engine.currentTrial.position : null),
    [engine.showStimulus, engine.currentTrial],
  );

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <button onClick={onQuit} aria-label="Quit session" style={{ color: 'var(--fg-dim)', fontSize: '0.85rem' }}>
          ‹ Quit
        </button>
        <div style={{ textAlign: 'center', lineHeight: 1 }}>
          <div style={{ fontSize: '2.2rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--fg)' }}>
            <span style={{ fontVariantNumeric: 'tabular-nums' }}>{settings.nBackLevel}</span>
            <span style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--fg-dim)', marginLeft: 4 }}>-back</span>
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--fg-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 4 }}>
            Block {blockNumber}/{settings.blocksPerSession} · Trial {engine.trialIndex >= 0 ? engine.trialIndex + 1 : 0}/{engine.totalTrials}
          </div>
        </div>
        <button
          onClick={togglePause}
          aria-label={isPaused ? 'Resume' : 'Pause'}
          title={isPaused ? 'Resume (Esc)' : 'Pause (Esc)'}
          style={{
            color: 'var(--fg-dim)',
            fontSize: '0.85rem',
            width: 48,
            textAlign: 'right',
          }}
        >
          {isPaused ? 'Resume' : 'Pause'}
        </button>
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
              fontSize: '3.5rem',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              color: countdown === 'go' ? 'var(--accent)' : 'var(--fg)',
              transition: 'color 120ms ease',
            }}
          >
            {countdown === 'ready' ? 'Ready' : countdown === 'set' ? 'Set' : 'Go!'}
          </div>
        )}
        {isPaused && (
          <div
            role="status"
            aria-live="polite"
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--bg)',
              gap: 16,
            }}
          >
            <div style={{ fontSize: '2.4rem', fontWeight: 700, letterSpacing: '-0.02em' }}>Paused</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--fg-dim)', textAlign: 'center', maxWidth: '28ch', lineHeight: 1.4 }}>
              The current trial will replay when you resume. Press <b>Esc</b> or the button above.
            </div>
            <button
              onClick={togglePause}
              style={{
                background: 'var(--accent)',
                color: 'var(--accent-fg)',
                borderRadius: 999,
                padding: '12px 24px',
                fontSize: '0.95rem',
                fontWeight: 600,
                marginTop: 8,
              }}
            >
              Resume
            </button>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
        <BigButton onClick={tapPos} pressed={posLocked} ariaLabel="Position match" hotkey="A">Position</BigButton>
        <BigButton primary onClick={tapSnd} pressed={sndLocked} ariaLabel="Sound match" hotkey="L">Sound</BigButton>
      </div>
    </>
  );
}
