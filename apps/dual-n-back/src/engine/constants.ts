export const GRID_SIZE = 9;
export const LETTERS = ['C', 'H', 'K', 'L', 'Q', 'R', 'S', 'T'] as const;

export const STIMULUS_MS = 500;
export const BASE_RESPONSE_WINDOW_MS = 2500;

export const LEVEL_UP_THRESHOLD = 0.9;
export const LEVEL_DOWN_THRESHOLD = 0.75;
export const MIN_LEVEL = 1;
export const MAX_LEVEL = 14;

export const MATCHES_PER_BLOCK = 6;
export const BLOCK_EXTRA_TRIALS = 20;

export const MIN_BLOCKS_PER_SESSION = 5;
export const MAX_BLOCKS_PER_SESSION = 20;
export const DEFAULT_BLOCKS_PER_SESSION = 10;

export const MIN_SPEED = 0.5;
export const MAX_SPEED = 5.0;
export const DEFAULT_SPEED = 1.0;

export const STORAGE_KEY = 'nback.state.v1';
export const HISTORY_CAP = 200;
export const CHALLENGE_TARGET = 20;
