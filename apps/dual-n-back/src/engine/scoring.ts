import {
  LEVEL_DOWN_THRESHOLD,
  LEVEL_UP_THRESHOLD,
  MAX_LEVEL,
  MIN_LEVEL,
} from './constants';
import type { BlockOutcome, Trial, UserResponse } from './types';

export interface BlockScore {
  positionAccuracy: number;
  letterAccuracy: number;
}

export function scoreBlock(
  n: number,
  trials: Trial[],
  responses: UserResponse[],
): BlockScore {
  let posCorrect = 0;
  let letCorrect = 0;
  let scored = 0;

  for (let i = n; i < trials.length; i++) {
    const trial = trials[i];
    const resp = responses[i] ?? { position: false, letter: false };
    if (trial.positionMatch === resp.position) posCorrect++;
    if (trial.letterMatch === resp.letter) letCorrect++;
    scored++;
  }

  return {
    positionAccuracy: scored === 0 ? 0 : posCorrect / scored,
    letterAccuracy: scored === 0 ? 0 : letCorrect / scored,
  };
}

export function computeOutcome(
  positionAccuracy: number,
  letterAccuracy: number,
  currentLevel: number,
): BlockOutcome {
  const bothHigh =
    positionAccuracy >= LEVEL_UP_THRESHOLD && letterAccuracy >= LEVEL_UP_THRESHOLD;
  const eitherLow =
    positionAccuracy < LEVEL_DOWN_THRESHOLD || letterAccuracy < LEVEL_DOWN_THRESHOLD;

  if (bothHigh && currentLevel < MAX_LEVEL) return 'level-up';
  if (eitherLow && currentLevel > MIN_LEVEL) return 'level-down';
  return 'hold';
}

export function applyOutcome(currentLevel: number, outcome: BlockOutcome): number {
  if (outcome === 'level-up') return Math.min(MAX_LEVEL, currentLevel + 1);
  if (outcome === 'level-down') return Math.max(MIN_LEVEL, currentLevel - 1);
  return currentLevel;
}
