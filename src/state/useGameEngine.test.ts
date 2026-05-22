import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameEngine } from './useGameEngine';
import type { AudioPlayer } from '../audio/AudioPlayer';
import { BASE_RESPONSE_WINDOW_MS, STIMULUS_MS } from '../engine/constants';

const noopAudio: AudioPlayer = {
  preload: async () => {},
  playLetter: async () => {},
};

const opts = {
  audio: noopAudio,
  settings: { speedMultiplier: 1, nBackLevel: 2 },
};

describe('useGameEngine', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('starts idle', () => {
    const { result } = renderHook(() => useGameEngine(opts));
    expect(result.current.mode).toBe('idle');
    expect(result.current.totalTrials).toBe(0);
  });

  it('startBlock enters stimulus mode with trials generated', () => {
    const { result } = renderHook(() => useGameEngine(opts));
    act(() => result.current.startBlock(2, 1));
    expect(result.current.mode).toBe('stimulus');
    expect(result.current.totalTrials).toBe(22); // 2 + 20
    expect(result.current.trialIndex).toBe(0);
  });

  it('transitions from stimulus to response after STIMULUS_MS', () => {
    const { result } = renderHook(() => useGameEngine(opts));
    act(() => result.current.startBlock(2, 1));
    act(() => { vi.advanceTimersByTime(STIMULUS_MS); });
    expect(result.current.mode).toBe('response');
  });

  it('advances to next trial after full trial duration', () => {
    const { result } = renderHook(() => useGameEngine(opts));
    act(() => result.current.startBlock(2, 1));
    act(() => { vi.advanceTimersByTime(STIMULUS_MS + BASE_RESPONSE_WINDOW_MS); });
    expect(result.current.trialIndex).toBe(1);
    expect(result.current.mode).toBe('stimulus');
  });

  it('emits a BlockResult after the last trial', () => {
    const { result } = renderHook(() => useGameEngine(opts));
    act(() => result.current.startBlock(2, 1));
    const trialMs = STIMULUS_MS + BASE_RESPONSE_WINDOW_MS;
    for (let i = 0; i < 22; i++) {
      act(() => { vi.advanceTimersByTime(trialMs); });
    }
    expect(result.current.mode).toBe('blockDone');
    expect(result.current.lastResult).not.toBeNull();
    expect(result.current.lastResult!.trials.length).toBe(22);
    expect(result.current.lastResult!.outcome).toMatch(/level-up|level-down|hold/);
  });

  it('records position/sound taps into responses', () => {
    const { result } = renderHook(() => useGameEngine(opts));
    act(() => result.current.startBlock(2, 1));
    act(() => result.current.tapPosition());
    act(() => result.current.tapSound());
    const trialMs = STIMULUS_MS + BASE_RESPONSE_WINDOW_MS;
    for (let i = 0; i < 22; i++) {
      act(() => { vi.advanceTimersByTime(trialMs); });
    }
    expect(result.current.lastResult!.responses[0]).toEqual({ position: true, letter: true });
  });
});
