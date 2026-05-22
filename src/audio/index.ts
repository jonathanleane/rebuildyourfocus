import type { AudioSource } from '../engine/types';
import type { AudioPlayer } from './AudioPlayer';
import { createMP3AudioPlayer } from './MP3AudioPlayer';
import { createSpeechAudioPlayer } from './SpeechAudioPlayer';

export type { AudioPlayer } from './AudioPlayer';

export async function createAudioPlayer(source: AudioSource): Promise<AudioPlayer> {
  if (source === 'speech') return createSpeechAudioPlayer();
  if (source === 'mp3') {
    const p = createMP3AudioPlayer();
    await p.preload();
    return p;
  }
  // 'auto': try mp3, fall back to speech on failure
  try {
    const p = createMP3AudioPlayer();
    await p.preload();
    return p;
  } catch {
    return createSpeechAudioPlayer();
  }
}
