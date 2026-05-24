import type { AudioSource, VoiceId } from '../engine/types';
import type { AudioPlayer } from './AudioPlayer';
import { createMP3AudioPlayer } from './MP3AudioPlayer';
import { createSpeechAudioPlayer } from './SpeechAudioPlayer';

export type { AudioPlayer } from './AudioPlayer';
export { VOICES, DEFAULT_VOICE } from './voices';
export type { Voice } from './voices';

export async function createAudioPlayer(source: AudioSource, voice: VoiceId): Promise<AudioPlayer> {
  if (source === 'speech') return createSpeechAudioPlayer();
  if (source === 'mp3') {
    const p = createMP3AudioPlayer(voice);
    await p.preload();
    return p;
  }
  // 'auto': try mp3, fall back to speech on failure
  try {
    const p = createMP3AudioPlayer(voice);
    await p.preload();
    return p;
  } catch {
    return createSpeechAudioPlayer();
  }
}
