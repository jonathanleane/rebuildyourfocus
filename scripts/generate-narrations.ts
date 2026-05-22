/**
 * Generate tutorial narration audio via ElevenLabs.
 *
 *   ELEVENLABS_API_KEY=... npm run generate:narrations
 *
 * Optional ELEVENLABS_VOICE_FILTER=alice to generate only one voice.
 * Writes public/audio/tutorial/{voiceId}/{narrationId}.mp3.
 */
import { writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { VOICES } from '../src/audio/voices';
import { NARRATIONS } from '../src/audio/narrations';

const ELEVEN_API = 'https://api.elevenlabs.io/v1/text-to-speech';
const API_KEY = process.env.ELEVENLABS_API_KEY;
const FILTER = process.env.ELEVENLABS_VOICE_FILTER;
const OUT_BASE = resolve(process.cwd(), 'public/audio/tutorial');

async function generate(elevenLabsId: string, text: string): Promise<Buffer> {
  if (!API_KEY) throw new Error('ELEVENLABS_API_KEY not set');
  const res = await fetch(`${ELEVEN_API}/${elevenLabsId}?output_format=mp3_44100_64`, {
    method: 'POST',
    headers: {
      'xi-api-key': API_KEY,
      'content-type': 'application/json',
      accept: 'audio/mpeg',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_turbo_v2_5',
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
    }),
  });
  if (!res.ok) {
    throw new Error(`ElevenLabs failed: ${res.status} ${await res.text()}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  const targets = FILTER ? VOICES.filter((v) => v.id === FILTER) : VOICES;
  if (targets.length === 0) throw new Error(`No voice matched filter "${FILTER}"`);

  for (const v of targets) {
    console.log(`\n${v.name} (${v.accent}, ${v.gender})`);
    const dir = resolve(OUT_BASE, v.id);
    await mkdir(dir, { recursive: true });
    let total = 0;
    for (const [id, text] of Object.entries(NARRATIONS)) {
      process.stdout.write(`  ${id}... `);
      const mp3 = await generate(v.elevenLabsId, text);
      await writeFile(resolve(dir, `${id}.mp3`), mp3);
      total += mp3.length;
      console.log(`${mp3.length}B`);
    }
    console.log(`  ${v.id}: ${Object.keys(NARRATIONS).length} files, ${(total / 1024).toFixed(1)} KB`);
  }
  console.log(`\nDone. Output: ${OUT_BASE}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
