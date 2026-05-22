/**
 * Generate dual n-back letter audio via ElevenLabs.
 *
 *   ELEVENLABS_API_KEY=... npm run generate:audio
 *
 * Optional: ELEVENLABS_VOICE_ID overrides the default voice.
 * Writes public/audio/letters/{C,H,K,L,Q,R,S,T}.mp3 (~5-10KB each).
 */
import { writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { LETTERS } from '../src/engine/constants';

const ELEVEN_API = 'https://api.elevenlabs.io/v1/text-to-speech';
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID ?? '21m00Tcm4TlvDq8ikWAM';
const API_KEY = process.env.ELEVENLABS_API_KEY;
const OUT_DIR = resolve(process.cwd(), 'public/audio/letters');

async function generateOne(letter: string): Promise<Buffer> {
  if (!API_KEY) throw new Error('ELEVENLABS_API_KEY not set');
  const res = await fetch(`${ELEVEN_API}/${VOICE_ID}?output_format=mp3_44100_64`, {
    method: 'POST',
    headers: {
      'xi-api-key': API_KEY,
      'content-type': 'application/json',
      accept: 'audio/mpeg',
    },
    body: JSON.stringify({
      text: letter,
      model_id: 'eleven_turbo_v2_5',
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
    }),
  });
  if (!res.ok) {
    throw new Error(`ElevenLabs ${letter} failed: ${res.status} ${await res.text()}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  for (const letter of LETTERS) {
    process.stdout.write(`Generating ${letter}... `);
    const mp3 = await generateOne(letter);
    await writeFile(resolve(OUT_DIR, `${letter}.mp3`), mp3);
    console.log(`OK (${mp3.length} bytes)`);
  }
  console.log(`Done. Wrote ${LETTERS.length} files to ${OUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
