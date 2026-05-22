import type { LETTERS } from './constants';

export type Position = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type Letter = typeof LETTERS[number];

export interface Stimulus {
  position: Position;
  letter: Letter;
}

export interface Trial extends Stimulus {
  positionMatch: boolean;
  letterMatch: boolean;
}

export interface UserResponse {
  position: boolean;
  letter: boolean;
}

export type BlockOutcome = 'level-up' | 'level-down' | 'hold';

export interface BlockResult {
  n: number;
  startedAt: number;
  finishedAt: number;
  trials: Trial[];
  responses: UserResponse[];
  positionAccuracy: number;
  letterAccuracy: number;
  outcome: BlockOutcome;
}

export interface SessionResult {
  id: string;
  startedAt: number;
  finishedAt: number;
  blocks: BlockResult[];
  startingLevel: number;
  endingLevel: number;
  completed: boolean;
}

export type ThemeId = 'mono' | 'indigo' | 'forest' | 'amber' | 'light';
export type AudioSource = 'auto' | 'mp3' | 'speech';

export interface Settings {
  nBackLevel: number;
  blocksPerSession: number;
  speedMultiplier: number;
  instantFeedback: boolean;
  autoLevelProgression: boolean;
  audioSource: AudioSource;
  theme: ThemeId;
}

export interface Player {
  totalSessionsCompleted: number;
  lastSessionDate: string | null;
  currentStreak: number;
  longestStreak: number;
  bestLevel: number;
}

export interface PersistedState {
  schemaVersion: 1;
  settings: Settings;
  player: Player;
  history: SessionResult[];
}
