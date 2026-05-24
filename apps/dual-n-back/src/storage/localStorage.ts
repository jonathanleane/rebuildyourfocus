import { STORAGE_KEY } from '../engine/constants';
import type { PersistedState } from '../engine/types';
import type { AppStorage } from './Storage';

export function createLocalStorageAdapter(): AppStorage {
  return {
    load(): PersistedState | null {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as Partial<PersistedState>;
        if (parsed?.schemaVersion !== 1) return null;
        return parsed as PersistedState;
      } catch {
        return null;
      }
    },
    save(state: PersistedState): void {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {
        // Quota or unavailable; ignore. State stays in memory.
      }
    },
    clear(): void {
      window.localStorage.removeItem(STORAGE_KEY);
    },
  };
}
