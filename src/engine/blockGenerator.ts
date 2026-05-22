import {
  BLOCK_EXTRA_TRIALS,
  GRID_SIZE,
  LETTERS,
  MATCHES_PER_BLOCK,
} from './constants';
import type { Letter, Position, Trial } from './types';
import { createRng, pickInt, shuffleInPlace, type Rng } from './rng';

export function generateBlock(n: number, seed: number): Trial[] {
  const rng = createRng(seed);
  const total = n + BLOCK_EXTRA_TRIALS;
  const candidateIndices = Array.from(
    { length: total - n },
    (_, i) => i + n,
  );
  const positionMatchIndices = pickMatchIndices(rng, candidateIndices);
  const letterMatchIndices = pickMatchIndices(rng, candidateIndices);

  const trials: Trial[] = [];
  for (let i = 0; i < total; i++) {
    const wantPosMatch = positionMatchIndices.has(i);
    const wantLetMatch = letterMatchIndices.has(i);

    const position: Position = wantPosMatch
      ? trials[i - n].position
      : pickNonMatchingPosition(rng, i >= n ? trials[i - n].position : null);

    const letter: Letter = wantLetMatch
      ? trials[i - n].letter
      : pickNonMatchingLetter(rng, i >= n ? trials[i - n].letter : null);

    trials.push({
      position,
      letter,
      positionMatch: wantPosMatch,
      letterMatch: wantLetMatch,
    });
  }
  return trials;
}

function pickMatchIndices(rng: Rng, candidates: number[]): Set<number> {
  const pool = [...candidates];
  shuffleInPlace(rng, pool);
  return new Set(pool.slice(0, MATCHES_PER_BLOCK));
}

function pickNonMatchingPosition(rng: Rng, exclude: Position | null): Position {
  while (true) {
    const p = pickInt(rng, GRID_SIZE) as Position;
    if (p !== exclude) return p;
  }
}

function pickNonMatchingLetter(rng: Rng, exclude: Letter | null): Letter {
  while (true) {
    const l = LETTERS[pickInt(rng, LETTERS.length)];
    if (l !== exclude) return l;
  }
}
