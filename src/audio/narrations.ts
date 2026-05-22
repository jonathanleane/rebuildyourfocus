export const NARRATIONS = {
  'concept-1': 'Each trial, a square lights up and a letter plays.',
  'concept-2': 'Watch the position. Listen to the letter.',
  'concept-3': 'The position is the same as two trials back. That is a match. You would tap Position.',
  'concept-4': 'Nothing matches here. You would tap nothing.',
  'concept-5': 'The letter is the same as two trials back. That is a match. You would tap Sound.',
  'practice-intro': "Now let's try one-back. Tap when the current trial matches the previous one.",
} as const;

export type NarrationId = keyof typeof NARRATIONS;

export function narrate(id: NarrationId, voice: string): HTMLAudioElement | null {
  if (typeof window === 'undefined' || typeof Audio === 'undefined') return null;
  const audio = new Audio(`/audio/tutorial/${voice}/${id}.mp3`);
  audio.volume = 1;
  const tryPlay = audio.play();
  if (tryPlay && typeof tryPlay.catch === 'function') {
    tryPlay.catch(() => {
      // Fall back to Web Speech if MP3 missing or blocked
      if ('speechSynthesis' in window) {
        const u = new SpeechSynthesisUtterance(NARRATIONS[id]);
        u.rate = 1.0;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(u);
      }
    });
  }
  return audio;
}
