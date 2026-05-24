export const NARRATIONS = {
  'concept-1': 'Each trial, a square lights up and a letter plays.',
  'concept-2': 'Watch the position. Listen to the letter.',
  'concept-3': 'The position is the same as two trials back. That is a match. You would tap Position.',
  'concept-4': 'Nothing matches here. You would tap nothing.',
  'concept-5': 'The letter is the same as two trials back. That is a match. You would tap Sound.',
  'practice-intro': "Now let's try one-back. Tap when the current trial matches the previous one.",
  ready: 'Ready.',
  set: 'Set.',
  go: 'Go!',
} as const;

export type NarrationId = keyof typeof NARRATIONS;

export interface NarrationHandle {
  /** Resolves when narration finishes (or fails / is cancelled). Never rejects. */
  done: Promise<void>;
  cancel(): void;
}

/**
 * Play a tutorial narration in the chosen voice. Tries the pre-rendered mp3
 * first, falls back to Web Speech if the mp3 is missing or can't play.
 *
 * Returns a handle so the caller can chain on completion or cancel.
 */
export function narrate(id: NarrationId, voice: string): NarrationHandle {
  if (typeof window === 'undefined') {
    return { done: Promise.resolve(), cancel: () => {} };
  }

  let cancelFn = () => {};

  const done = new Promise<void>((resolve) => {
    let resolved = false;
    const finish = () => {
      if (resolved) return;
      resolved = true;
      resolve();
    };

    const useSpeechFallback = () => {
      if (resolved) return;
      if (!('speechSynthesis' in window)) {
        finish();
        return;
      }
      const u = new SpeechSynthesisUtterance(NARRATIONS[id]);
      u.rate = 1.0;
      u.onend = finish;
      u.onerror = finish;
      cancelFn = () => {
        window.speechSynthesis.cancel();
        finish();
      };
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    };

    const audio = new Audio(`/audio/tutorial/${voice}/${id}.mp3`);
    audio.volume = 1;
    audio.onended = finish;
    audio.onerror = useSpeechFallback;
    cancelFn = () => {
      audio.pause();
      finish();
    };

    const playPromise = audio.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(useSpeechFallback);
    }
  });

  return {
    done,
    cancel() {
      cancelFn();
    },
  };
}
