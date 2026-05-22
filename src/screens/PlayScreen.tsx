import { useEffect, useMemo, useState } from 'react';
import Grid from '../components/Grid';
import BigButton from '../components/BigButton';
import { useGameEngine } from '../state/useGameEngine';
import { createAudioPlayer, type AudioPlayer } from '../audio';
import type { UsePlayerState } from '../state/usePlayerState';
import type { BlockResult } from '../engine/types';
import { applyOutcome } from '../engine/scoring';

interface Props {
  player: UsePlayerState;
  blockNumber: number;
  onBlockComplete: (result: BlockResult, newLevel: number) => void;
  onQuit: () => void;
}

export default function PlayScreen({ player, blockNumber, onBlockComplete, onQuit }: Props) {
  const settings = player.state.settings;
  const [audio, setAudio] = useState<AudioPlayer | null>(null);

  useEffect(() => {
    let cancelled = false;
    createAudioPlayer(settings.audioSource).then((p) => {
      if (!cancelled) setAudio(p);
    });
    return () => {
      cancelled = true;
    };
  }, [settings.audioSource]);

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
    if (audio) engine.startBlock(settings.nBackLevel);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audio]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        engine.tapPosition();
      } else if (e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        engine.tapSound();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [engine.tapPosition, engine.tapSound]);

  const litIndex = useMemo(
    () => (engine.showStimulus && engine.currentTrial ? engine.currentTrial.position : null),
    [engine.showStimulus, engine.currentTrial],
  );

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <button onClick={onQuit} aria-label="Quit session" style={{ color: 'var(--fg-dim)', fontSize: '0.85rem' }}>
          ‹ Quit
        </button>
        <div style={{ display: 'flex', gap: 12, fontSize: '0.7rem', color: 'var(--fg-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          <span>Block {blockNumber}/{settings.blocksPerSession}</span>
          <span>Level {settings.nBackLevel}</span>
          <span>
            {engine.trialIndex >= 0 ? engine.trialIndex + 1 : 0}/{engine.totalTrials}
          </span>
        </div>
        <div style={{ width: 32 }} />
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Grid litIndex={litIndex} />
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
        <BigButton onClick={engine.tapPosition} ariaLabel="Position match">Position</BigButton>
        <BigButton primary onClick={engine.tapSound} ariaLabel="Sound match">Sound</BigButton>
      </div>
    </>
  );
}
