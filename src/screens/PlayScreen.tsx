import { useEffect, useMemo, useState } from 'react';
import Grid from '../components/Grid';
import BigButton from '../components/BigButton';
import { useGameEngine } from '../state/useGameEngine';
import { createAudioPlayer, type AudioPlayer } from '../audio';
import type { UsePlayerState } from '../state/usePlayerState';
import type { BlockResult, SessionResult } from '../engine/types';
import { applyOutcome } from '../engine/scoring';

interface Props {
  player: UsePlayerState;
  onBlockDone: (result: BlockResult, blocksLeft: number, newLevel: number) => void;
  onQuit: () => void;
}

export default function PlayScreen({ player, onBlockDone, onQuit }: Props) {
  const settings = player.state.settings;
  const [audio, setAudio] = useState<AudioPlayer | null>(null);
  const [sessionBlocks, setSessionBlocks] = useState<BlockResult[]>([]);
  const [sessionStart] = useState<number>(() => Date.now());
  const [currentLevel, setCurrentLevel] = useState<number>(settings.nBackLevel);

  useEffect(() => {
    let cancelled = false;
    createAudioPlayer(settings.audioSource).then((p) => {
      if (!cancelled) setAudio(p);
    });
    return () => {
      cancelled = true;
    };
  }, [settings.audioSource]);

  const engine = useGameEngine({ audio, settings: { speedMultiplier: settings.speedMultiplier, nBackLevel: currentLevel } });

  useEffect(() => {
    if (engine.mode === 'blockDone' && engine.lastResult) {
      const result = engine.lastResult;
      const newLevel = settings.autoLevelProgression ? applyOutcome(currentLevel, result.outcome) : currentLevel;
      const nextBlocks = [...sessionBlocks, result];
      setSessionBlocks(nextBlocks);
      setCurrentLevel(newLevel);
      player.updateSettings({ nBackLevel: newLevel });

      const blocksLeft = settings.blocksPerSession - nextBlocks.length;
      if (blocksLeft <= 0) {
        const session: SessionResult = {
          id: cryptoId(),
          startedAt: sessionStart,
          finishedAt: Date.now(),
          blocks: nextBlocks,
          startingLevel: settings.nBackLevel,
          endingLevel: newLevel,
          completed: true,
        };
        player.recordSession(session);
      }
      onBlockDone(result, Math.max(0, blocksLeft), newLevel);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engine.mode]);

  const startNextBlock = () => engine.startBlock(currentLevel);

  useEffect(() => {
    if (audio) startNextBlock();
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

  const blockNumber = sessionBlocks.length + 1;
  const litIndex = useMemo(
    () => (engine.showStimulus && engine.currentTrial ? engine.currentTrial.position : null),
    [engine.showStimulus, engine.currentTrial],
  );

  const handleQuit = () => {
    if (sessionBlocks.length > 0) {
      const session: SessionResult = {
        id: cryptoId(),
        startedAt: sessionStart,
        finishedAt: Date.now(),
        blocks: sessionBlocks,
        startingLevel: settings.nBackLevel,
        endingLevel: currentLevel,
        completed: false,
      };
      player.recordSession(session);
    }
    onQuit();
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <button onClick={handleQuit} aria-label="Quit session" style={{ color: 'var(--fg-dim)', fontSize: '0.85rem' }}>
          ‹ Quit
        </button>
        <div style={{ display: 'flex', gap: 12, fontSize: '0.7rem', color: 'var(--fg-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          <span>Block {blockNumber}/{settings.blocksPerSession}</span>
          <span>Level {currentLevel}</span>
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

function cryptoId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
