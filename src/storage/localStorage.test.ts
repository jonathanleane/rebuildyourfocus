import { describe, it, expect, beforeEach } from 'vitest';
import { createLocalStorageAdapter } from './localStorage';
import { STORAGE_KEY } from '../engine/constants';
import type { PersistedState } from '../engine/types';

const sample: PersistedState = {
  schemaVersion: 1,
  settings: {
    nBackLevel: 2,
    blocksPerSession: 10,
    speedMultiplier: 1,
    instantFeedback: true,
    autoLevelProgression: true,
    audioSource: 'auto',
    voice: 'alice',
    theme: 'mono',
  },
  player: {
    totalSessionsCompleted: 0,
    lastSessionDate: null,
    currentStreak: 0,
    longestStreak: 0,
    bestLevel: 1,
  },
  history: [],
};

describe('localStorage adapter', () => {
  beforeEach(() => localStorage.clear());

  it('returns null when nothing is stored', () => {
    const s = createLocalStorageAdapter();
    expect(s.load()).toBeNull();
  });

  it('roundtrips a state', () => {
    const s = createLocalStorageAdapter();
    s.save(sample);
    expect(s.load()).toEqual(sample);
  });

  it('returns null on corrupt JSON', () => {
    localStorage.setItem(STORAGE_KEY, 'not-json');
    const s = createLocalStorageAdapter();
    expect(s.load()).toBeNull();
  });

  it('returns null on wrong schemaVersion', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ schemaVersion: 99 }));
    const s = createLocalStorageAdapter();
    expect(s.load()).toBeNull();
  });

  it('clears state', () => {
    const s = createLocalStorageAdapter();
    s.save(sample);
    s.clear();
    expect(s.load()).toBeNull();
  });
});
