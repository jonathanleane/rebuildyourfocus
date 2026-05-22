import type { PersistedState } from '../engine/types';

export interface Storage {
  load(): PersistedState | null;
  save(state: PersistedState): void;
  clear(): void;
}
