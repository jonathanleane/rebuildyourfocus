import type { VoiceId } from '../engine/types';

export type { VoiceId };

export interface Voice {
  id: VoiceId;
  name: string;
  accent: 'US' | 'UK' | 'AU';
  gender: 'F' | 'M';
  elevenLabsId: string;
}

export const VOICES: readonly Voice[] = [
  { id: 'alice', name: 'Alice', accent: 'UK', gender: 'F', elevenLabsId: 'Xb7hH8MSUJpSbSDYk0k2' },
  { id: 'sarah', name: 'Sarah', accent: 'US', gender: 'F', elevenLabsId: 'EXAVITQu4vr4xnSDxMaL' },
  { id: 'liam', name: 'Liam', accent: 'US', gender: 'M', elevenLabsId: 'TX3LPaxmHKxFdv7VOQHJ' },
  { id: 'daniel', name: 'Daniel', accent: 'UK', gender: 'M', elevenLabsId: 'onwK4e9ZLuTAKqWW03F9' },
];

export const DEFAULT_VOICE: VoiceId = 'alice';
