import { describe, it, expect } from 'vitest';
import { generateBlock } from './blockGenerator';
import { MATCHES_PER_BLOCK, BLOCK_EXTRA_TRIALS } from './constants';

describe('generateBlock', () => {
  it('produces N + 20 trials', () => {
    for (const n of [1, 2, 3, 5]) {
      const block = generateBlock(n, 1);
      expect(block.length).toBe(n + BLOCK_EXTRA_TRIALS);
    }
  });

  it('has exactly 6 position matches', () => {
    const block = generateBlock(2, 1);
    const count = block.filter((t) => t.positionMatch).length;
    expect(count).toBe(MATCHES_PER_BLOCK);
  });

  it('has exactly 6 letter matches', () => {
    const block = generateBlock(2, 1);
    const count = block.filter((t) => t.letterMatch).length;
    expect(count).toBe(MATCHES_PER_BLOCK);
  });

  it('never places matches in the first N trials', () => {
    const n = 3;
    const block = generateBlock(n, 1);
    for (let i = 0; i < n; i++) {
      expect(block[i].positionMatch).toBe(false);
      expect(block[i].letterMatch).toBe(false);
    }
  });

  it('match flags are consistent with stimulus history', () => {
    const n = 2;
    const block = generateBlock(n, 1);
    for (let i = n; i < block.length; i++) {
      const expectedPos = block[i].position === block[i - n].position;
      const expectedLet = block[i].letter === block[i - n].letter;
      expect(block[i].positionMatch).toBe(expectedPos);
      expect(block[i].letterMatch).toBe(expectedLet);
    }
  });

  it('is deterministic with the same seed', () => {
    const a = generateBlock(2, 42);
    const b = generateBlock(2, 42);
    expect(a).toEqual(b);
  });
});
