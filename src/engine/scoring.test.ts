import { describe, it, expect } from 'vitest';
import { scoreBlock, computeOutcome } from './scoring';
import type { Trial, UserResponse } from './types';

const T = (positionMatch: boolean, letterMatch: boolean): Trial => ({
  position: 0,
  letter: 'C',
  positionMatch,
  letterMatch,
});
const R = (position: boolean, letter: boolean): UserResponse => ({ position, letter });

describe('scoreBlock', () => {
  it('counts only trials after position n', () => {
    const n = 2;
    const trials = [T(false, false), T(false, false), T(true, true), T(true, true)];
    const responses = [R(false, false), R(false, false), R(true, true), R(true, true)];
    const r = scoreBlock(n, trials, responses);
    expect(r.positionAccuracy).toBe(1);
    expect(r.letterAccuracy).toBe(1);
  });

  it('penalizes misses', () => {
    const n = 0;
    const trials = [T(true, false), T(true, false)];
    const responses = [R(false, false), R(false, false)];
    const r = scoreBlock(n, trials, responses);
    expect(r.positionAccuracy).toBe(0);
  });

  it('penalizes false alarms', () => {
    const n = 0;
    const trials = [T(false, false), T(false, false)];
    const responses = [R(true, false), R(true, false)];
    const r = scoreBlock(n, trials, responses);
    expect(r.positionAccuracy).toBe(0);
  });

  it('rewards correct rejections', () => {
    const n = 0;
    const trials = [T(false, false), T(false, false)];
    const responses = [R(false, false), R(false, false)];
    const r = scoreBlock(n, trials, responses);
    expect(r.positionAccuracy).toBe(1);
  });
});

describe('computeOutcome', () => {
  it('levels up when both >= 0.9', () => {
    expect(computeOutcome(0.9, 0.9, 2)).toBe('level-up');
    expect(computeOutcome(1, 0.95, 2)).toBe('level-up');
  });

  it('levels down when either < 0.75', () => {
    expect(computeOutcome(0.74, 1, 3)).toBe('level-down');
    expect(computeOutcome(1, 0.74, 3)).toBe('level-down');
  });

  it('holds otherwise', () => {
    expect(computeOutcome(0.8, 0.8, 2)).toBe('hold');
    expect(computeOutcome(0.89, 0.95, 2)).toBe('hold');
    expect(computeOutcome(0.75, 1, 2)).toBe('hold');
  });

  it('respects level floor (1)', () => {
    expect(computeOutcome(0.1, 0.1, 1)).toBe('hold');
  });

  it('respects level ceiling (14)', () => {
    expect(computeOutcome(1, 1, 14)).toBe('hold');
  });
});
