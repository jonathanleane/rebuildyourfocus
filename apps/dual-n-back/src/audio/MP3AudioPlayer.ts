import { LETTERS } from '../engine/constants';
import type { Letter, VoiceId } from '../engine/types';
import type { AudioPlayer } from './AudioPlayer';

export function createMP3AudioPlayer(voice: VoiceId): AudioPlayer {
  let ctx: AudioContext | null = null;
  const buffers = new Map<Letter, AudioBuffer>();

  async function ensureContext(): Promise<AudioContext> {
    if (!ctx) ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (ctx.state === 'suspended') await ctx.resume();
    return ctx;
  }

  async function loadOne(letter: Letter): Promise<AudioBuffer> {
    const url = `/audio/letters/${voice}/${letter}.mp3`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`fetch ${url}: ${res.status}`);
    const arr = await res.arrayBuffer();
    const c = await ensureContext();
    return await c.decodeAudioData(arr);
  }

  return {
    async preload(): Promise<void> {
      await ensureContext();
      await Promise.all(
        LETTERS.map(async (l) => {
          buffers.set(l, await loadOne(l));
        }),
      );
    },

    async playLetter(letter: Letter): Promise<void> {
      const c = await ensureContext();
      const buf = buffers.get(letter);
      if (!buf) return;
      const src = c.createBufferSource();
      src.buffer = buf;
      src.connect(c.destination);
      src.start(c.currentTime);
    },

    playLetterAt(letter: Letter, atSec: number): void {
      if (!ctx) return;
      const buf = buffers.get(letter);
      if (!buf) return;
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(ctx.destination);
      src.start(atSec);
    },
  };
}
