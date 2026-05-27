import {
  DEFAULT_BLOCKS_PER_SESSION,
  DEFAULT_SPEED,
} from '../engine/constants';
import type { PersistedState } from '../engine/types';

export function createDefaultState(): PersistedState {
  return {
    schemaVersion: 1,
    settings: {
      nBackLevel: 2,
      blocksPerSession: DEFAULT_BLOCKS_PER_SESSION,
      speedMultiplier: DEFAULT_SPEED,
      instantFeedback: false,
      autoLevelProgression: true,
      audioSource: 'auto',
      voice: 'alice',
      theme: 'light',
    },
    player: {
      totalSessionsCompleted: 0,
      lastSessionDate: null,
      currentStreak: 0,
      longestStreak: 0,
      bestLevel: 1,
      hasSeenTutorial: false,
    },
    history: [],
  };
}
