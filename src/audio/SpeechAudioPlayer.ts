import type { Letter } from '../engine/types';
import type { AudioPlayer } from './AudioPlayer';

export function createSpeechAudioPlayer(): AudioPlayer {
  return {
    async preload() {
      // No-op; speech synth is always available where supported.
    },
    async playLetter(letter: Letter) {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
      // Lowercase so voices don't announce "Capital S" etc.
      const utter = new SpeechSynthesisUtterance(letter.toLowerCase());
      utter.rate = 1.1;
      utter.volume = 1;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);
    },
  };
}
