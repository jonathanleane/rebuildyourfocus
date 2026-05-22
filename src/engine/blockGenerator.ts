import {
  BLOCK_EXTRA_TRIALS,
  GRID_SIZE,
  LETTERS,
  MATCHES_PER_BLOCK,
} from './constants';
import type { Letter, Position, Trial } from './types';
import { createRng, pickInt, shuffleInPlace, type Rng } from './rng';

export interface BlockGenOptions {
  /** Total trials. Defaults to N + BLOCK_EXTRA_TRIALS. */
  length?: number;
  /** Matches per modality. Defaults to MATCHES_PER_BLOCK (6). */
  matchesPerModality?: number;
}

export function generateBlock(n: number, seed: number, options: BlockGenOptions = {}): Trial[] {
  const total = options.length ?? n + BLOCK_EXTRA_TRIALS;
  const matchCount = options.matchesPerModality ?? MATCHES_PER_BLOCK;
  const rng = createRng(seed);
  const candidateIndices = Array.from(
    { length: total - n },
    (_, i) => i + n,
  );
  const positionMatchIndices = pickMatchIndices(rng, candidateIndices, matchCount);
  const letterMatchIndices = pickMatchIndices(rng, candidateIndices, matchCount);

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

function pickMatchIndices(rng: Rng, candidates: number[], count: number): Set<number> {
  const pool = [...candidates];
  shuffleInPlace(rng, pool);
  return new Set(pool.slice(0, Math.min(count, pool.length)));
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
