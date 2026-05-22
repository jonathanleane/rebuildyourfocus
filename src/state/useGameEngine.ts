import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import {
  BASE_RESPONSE_WINDOW_MS,
  STIMULUS_MS,
} from '../engine/constants';
import type {
  BlockResult,
  Settings,
  Trial,
  UserResponse,
} from '../engine/types';
import { generateBlock } from '../engine/blockGenerator';
import { applyOutcome, computeOutcome, scoreBlock } from '../engine/scoring';
import type { AudioPlayer } from '../audio/AudioPlayer';

type Mode = 'idle' | 'stimulus' | 'response' | 'blockDone';

interface EngineState {
  mode: Mode;
  n: number;
  trials: Trial[];
  responses: UserResponse[];
  trialIndex: number;
  lastResult: BlockResult | null;
}

type Action =
  | { type: 'start'; n: number; trials: Trial[] }
  | { type: 'advanceTrial' }
  | { type: 'enterResponse' }
  | { type: 'tapPosition' }
  | { type: 'tapSound' }
  | { type: 'finishBlock'; result: BlockResult }
  | { type: 'reset' };

const initial: EngineState = {
  mode: 'idle',
  n: 0,
  trials: [],
  responses: [],
  trialIndex: -1,
  lastResult: null,
};

function reducer(s: EngineState, a: Action): EngineState {
  switch (a.type) {
    case 'start':
      return {
        mode: 'stimulus',
        n: a.n,
        trials: a.trials,
        responses: a.trials.map(() => ({ position: false, letter: false })),
        trialIndex: 0,
        lastResult: null,
      };
    case 'enterResponse':
      return { ...s, mode: 'response' };
    case 'advanceTrial': {
      const next = s.trialIndex + 1;
      if (next >= s.trials.length) return s;
      return { ...s, mode: 'stimulus', trialIndex: next };
    }
    case 'tapPosition': {
      if (s.mode !== 'response' && s.mode !== 'stimulus') return s;
      const responses = s.responses.slice();
      responses[s.trialIndex] = { ...responses[s.trialIndex], position: true };
      return { ...s, responses };
    }
    case 'tapSound': {
      if (s.mode !== 'response' && s.mode !== 'stimulus') return s;
      const responses = s.responses.slice();
      responses[s.trialIndex] = { ...responses[s.trialIndex], letter: true };
      return { ...s, responses };
    }
    case 'finishBlock':
      return { ...s, mode: 'blockDone', lastResult: a.result };
    case 'reset':
      return initial;
  }
}

export interface UseGameEngine {
  mode: Mode;
  trialIndex: number;
  totalTrials: number;
  currentTrial: Trial | null;
  showStimulus: boolean;
  lastResult: BlockResult | null;
  startBlock: (n: number, seed?: number) => void;
  tapPosition: () => void;
  tapSound: () => void;
  reset: () => void;
}

export interface GameEngineOptions {
  audio: AudioPlayer | null;
  settings: Pick<Settings, 'speedMultiplier' | 'nBackLevel'>;
}

export function useGameEngine(opts: GameEngineOptions): UseGameEngine {
  const [state, dispatch] = useReducer(reducer, initial);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const audio = opts.audio;
  const speed = Math.max(1, Math.min(5, opts.settings.speedMultiplier));
  const responseMs = BASE_RESPONSE_WINDOW_MS / speed;
  // Stable reference to current responses so the finish effect can read the latest.
  const responsesRef = useRef(state.responses);
  responsesRef.current = state.responses;

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  // Schedule audio + visual + transitions whenever a new trial begins.
  useEffect(() => {
    if (state.mode !== 'stimulus' || state.trialIndex < 0) return;
    const trial = state.trials[state.trialIndex];
    if (!trial) return;

    audio?.playLetter(trial.letter);

    const enterResponse = setTimeout(() => dispatch({ type: 'enterResponse' }), STIMULUS_MS);

    const isLast = state.trialIndex === state.trials.length - 1;
    const advance = setTimeout(() => {
      if (isLast) {
        const responses = responsesRef.current;
        const { positionAccuracy, letterAccuracy } = scoreBlock(state.n, state.trials, responses);
        const outcome = computeOutcome(positionAccuracy, letterAccuracy, opts.settings.nBackLevel);
        const now = Date.now();
        const result: BlockResult = {
          n: state.n,
          startedAt: now - state.trials.length * (STIMULUS_MS + responseMs),
          finishedAt: now,
          trials: state.trials,
          responses,
          positionAccuracy,
          letterAccuracy,
          outcome,
        };
        dispatch({ type: 'finishBlock', result });
      } else {
        dispatch({ type: 'advanceTrial' });
      }
    }, STIMULUS_MS + responseMs);

    timers.current.push(enterResponse, advance);
    return clearTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.trialIndex]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const startBlock = useCallback(
    (n: number, seed: number = Date.now()) => {
      clearTimers();
      const trials = generateBlock(n, seed);
      dispatch({ type: 'start', n, trials });
    },
    [clearTimers],
  );

  const tapPosition = useCallback(() => dispatch({ type: 'tapPosition' }), []);
  const tapSound = useCallback(() => dispatch({ type: 'tapSound' }), []);
  const reset = useCallback(() => {
    clearTimers();
    dispatch({ type: 'reset' });
  }, [clearTimers]);

  return useMemo(
    () => ({
      mode: state.mode,
      trialIndex: state.trialIndex,
      totalTrials: state.trials.length,
      currentTrial:
        state.trialIndex >= 0 ? state.trials[state.trialIndex] ?? null : null,
      showStimulus: state.mode === 'stimulus',
      lastResult: state.lastResult,
      startBlock,
      tapPosition,
      tapSound,
      reset,
    }),
    [state, startBlock, tapPosition, tapSound, reset],
  );
}

// Helper export consumers may want
export { applyOutcome };
