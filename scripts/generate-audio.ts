/**
 * Generate dual n-back letter audio via ElevenLabs.
 *
 *   ELEVENLABS_API_KEY=... npm run generate:audio
 *
 * Generates all voices from src/audio/voices.ts into
 * public/audio/letters/{voiceId}/{letter}.mp3.
 *
 * To generate only one voice, set ELEVENLABS_VOICE_FILTER=alice
 * (matches the slug `id` in voices.ts).
 *
 * To use an ad-hoc voice not in voices.ts, set
 * ELEVENLABS_VOICE_ID=<eleven-id> ELEVENLABS_VOICE_SLUG=<folder-name>.
 */
import { writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { LETTERS } from '../src/engine/constants';
import { VOICES } from '../src/audio/voices';

const ELEVEN_API = 'https://api.elevenlabs.io/v1/text-to-speech';
const API_KEY = process.env.ELEVENLABS_API_KEY;
const FILTER = process.env.ELEVENLABS_VOICE_FILTER;
const AD_HOC_VOICE_ID = process.env.ELEVENLABS_VOICE_ID;
const AD_HOC_SLUG = process.env.ELEVENLABS_VOICE_SLUG;
const OUT_BASE = resolve(process.cwd(), 'public/audio/letters');

async function generateOne(voiceId: string, letter: string): Promise<Buffer> {
  if (!API_KEY) throw new Error('ELEVENLABS_API_KEY not set');
  const res = await fetch(`${ELEVEN_API}/${voiceId}?output_format=mp3_44100_64`, {
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

async function generateVoice(slug: string, elevenLabsId: string) {
  const dir = resolve(OUT_BASE, slug);
  await mkdir(dir, { recursive: true });
  let total = 0;
  for (const letter of LETTERS) {
    process.stdout.write(`  ${slug}/${letter}... `);
    const mp3 = await generateOne(elevenLabsId, letter);
    await writeFile(resolve(dir, `${letter}.mp3`), mp3);
    total += mp3.length;
    console.log(`${mp3.length}B`);
  }
  console.log(`  ${slug}: ${LETTERS.length} files, ${(total / 1024).toFixed(1)} KB total`);
}

async function main() {
  if (AD_HOC_VOICE_ID && AD_HOC_SLUG) {
    console.log(`Generating ad-hoc voice "${AD_HOC_SLUG}" (${AD_HOC_VOICE_ID})`);
    await generateVoice(AD_HOC_SLUG, AD_HOC_VOICE_ID);
    return;
  }
  const targets = FILTER ? VOICES.filter((v) => v.id === FILTER) : VOICES;
  if (targets.length === 0) {
    throw new Error(`No voices matched filter "${FILTER}"`);
  }
  console.log(`Generating ${targets.length} voice(s)...`);
  for (const v of targets) {
    console.log(`\n${v.name} (${v.accent}, ${v.gender}) — ${v.elevenLabsId}`);
    await generateVoice(v.id, v.elevenLabsId);
  }
  console.log(`\nDone. Output: ${OUT_BASE}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
