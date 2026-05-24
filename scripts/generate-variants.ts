/**
 * Generate multiple variants of a single letter via ElevenLabs, so we can
 * A/B different prompt styles in the browser.
 *
 *   ELEVENLABS_API_KEY=... npm run generate:variants
 *
 * Writes public/audio/variants/<voiceSlug>/<letter>/<variantId>.mp3 plus
 * a manifest.json describing each variant's prompt.
 *
 * Edit the TARGETS array below to control what's generated.
 */
import { writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const ELEVEN_API = 'https://api.elevenlabs.io/v1/text-to-speech';
const API_KEY = process.env.ELEVENLABS_API_KEY;

// Alice — UK female ("Clear, Engaging Educator")
const VOICE_SLUG = 'alice';
const VOICE_ID = 'Xb7hH8MSUJpSbSDYk0k2';

// Letters we want to A/B
const TARGETS: { letter: string; variants: { id: string; text: string }[] }[] = [
  {
    letter: 'C',
    variants: [
      { id: '01-bare', text: 'C' },
      { id: '02-bare-period', text: 'C.' },
      { id: '03-bare-lowercase', text: 'c' },
      { id: '04-See', text: 'See.' },
      { id: '05-Sea', text: 'Sea.' },
      { id: '06-the-letter-C', text: 'The letter C.' },
      { id: '07-See-long', text: 'See ...' },
    ],
  },
  {
    letter: 'H',
    variants: [
      { id: '01-bare', text: 'H' },
      { id: '02-bare-period', text: 'H.' },
      { id: '03-bare-lowercase', text: 'h' },
      { id: '04-Aitch', text: 'Aitch.' },
      { id: '05-Haitch', text: 'Haitch.' },
      { id: '06-the-letter-H', text: 'The letter H.' },
      { id: '07-Aitch-long', text: 'Aitch ...' },
    ],
  },
  // K/L/Q/R/S/T: just the current canonical prompt as a reference take.
  // The user said these sound fine; we keep them in the variants page so
  // they can confirm the picked C/H variants blend with the rest tonally.
  { letter: 'K', variants: [{ id: 'current', text: 'Kay.' }] },
  { letter: 'L', variants: [{ id: 'current', text: 'Ell.' }] },
  { letter: 'Q', variants: [{ id: 'current', text: 'Cue.' }] },
  { letter: 'R', variants: [{ id: 'current', text: 'Are.' }] },
  { letter: 'S', variants: [{ id: 'current', text: 'Ess.' }] },
  { letter: 'T', variants: [{ id: 'current', text: 'Tee.' }] },
];

async function generate(text: string): Promise<Buffer> {
  if (!API_KEY) throw new Error('ELEVENLABS_API_KEY not set');
  const res = await fetch(`${ELEVEN_API}/${VOICE_ID}?output_format=mp3_44100_64`, {
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
  if (!res.ok) throw new Error(`ElevenLabs failed: ${res.status} ${await res.text()}`);
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  const baseOut = resolve(process.cwd(), 'public/audio/variants', VOICE_SLUG);
  for (const target of TARGETS) {
    const dir = resolve(baseOut, target.letter);
    await mkdir(dir, { recursive: true });
    console.log(`\n${VOICE_SLUG} / ${target.letter}`);
    for (const v of target.variants) {
      process.stdout.write(`  ${v.id} ("${v.text}")... `);
      const mp3 = await generate(v.text);
      await writeFile(resolve(dir, `${v.id}.mp3`), mp3);
      console.log(`${mp3.length}B`);
    }
    const manifest = target.variants.map((v) => ({ id: v.id, text: v.text, file: `${v.id}.mp3` }));
    await writeFile(resolve(dir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  }

  // Write a top-level manifest so the test page can enumerate everything.
  const topManifest = {
    voice: { slug: VOICE_SLUG, elevenLabsId: VOICE_ID },
    letters: TARGETS.map((t) => ({
      letter: t.letter,
      variants: t.variants.map((v) => ({
        id: v.id,
        text: v.text,
        url: `/audio/variants/${VOICE_SLUG}/${t.letter}/${v.id}.mp3`,
      })),
    })),
  };
  await writeFile(resolve(baseOut, 'manifest.json'), JSON.stringify(topManifest, null, 2));
  console.log(`\nDone. Open http://localhost:5173/variants.html`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
