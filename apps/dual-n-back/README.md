# Dual N-Back

A browser-based dual n-back working-memory trainer, faithful to the
[Jaeggi & Buschkuehl 2008](https://www.pnas.org/doi/10.1073/pnas.0801268105)
paradigm. Built with Vite + React + TypeScript. Runs entirely client-side —
no accounts, no tracking, no backend.

**Free, ad-free, open source under MIT.** Part of the
[Rebuild Your Focus](https://github.com/jonathanleane/rebuildyourfocus) suite.
Play it at <https://rebuildyourfocus.com>, or run it yourself — see below.

> **Why dual n-back?** It's one of the few cognitive training paradigms
> with peer-reviewed evidence for transfer to fluid intelligence. The
> protocol is unpleasant by design — that's the whole point. If you can
> hold the mental queue, it works.

## Features

- **Core gameplay** — 3×3 grid + 8 spoken letters, simultaneous position
  + sound matching.
- **Jaeggi-faithful protocol** — `N + 20` trials per block, 6 position
  matches and 6 letter matches, auto level-up at ≥90% / level-down at
  <75% on both modalities.
- **20-session challenge** with streak tracking.
- **5 themes** — Light Paper (default), Mono, Indigo Night, Forest, Amber.
- **Configurable** — speed 0.5×–5×, manual N-back level (1–14),
  blocks per session (5–20), instant feedback toggle, auto-progression
  toggle, audio source select.
- **Keyboard shortcuts** — `A` for Position, `L` for Sound.
- **Accessible** — `prefers-reduced-motion` respected; WCAG AA contrast
  across all themes.
- **Offline-first** — settings + session history persist in localStorage
  (capped at 200 sessions).

## Stack

- **Vite + React 18 + TypeScript** (strict mode)
- **Vitest** for unit tests
- **Web Audio API** for sample-accurate audio scheduling
- **ElevenLabs** (optional) for premium letter audio; falls back to
  `speechSynthesis`

## Quickstart

Run **just this game** as a standalone project (no monorepo):

```bash
npx degit jonathanleane/rebuildyourfocus/apps/dual-n-back my-n-back
cd my-n-back
npm install
npm run dev
```

Or clone the **whole suite** (monorepo with all games):

```bash
git clone https://github.com/jonathanleane/rebuildyourfocus.git
cd rebuildyourfocus
npm install
npm -w dual-n-back run dev
```

Either way, open <http://localhost:5173/>. The app uses your browser's
speech synthesis by default — works out of the box.

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server (port 5173) |
| `npm run build` | Production build to `dist/` |
| `npm test` | Run the test suite (Vitest) |
| `npm run test:watch` | Run tests in watch mode |
| `npm run typecheck` | Type-check without emitting |
| `npm run generate:audio` | Generate ElevenLabs letter mp3s (requires API key) |

### Premium audio (optional)

The default Web Speech voice varies by browser/OS. For consistent, higher
quality audio, generate static mp3 assets via ElevenLabs:

```bash
ELEVENLABS_API_KEY=sk-... npm run generate:audio
```

This writes 8 small mp3s (~50 KB total) to `public/audio/letters/`. The app
detects them automatically when `audioSource` is set to `auto` (default) or
`mp3`.

Override the voice with `ELEVENLABS_VOICE_ID=...`.

## Project structure

```
src/
  engine/         Pure TS: block generator, scoring, Jaeggi level rule
  audio/          AudioPlayer interface + Web Audio + speech fallback
  storage/        Persistence interface + localStorage adapter
  state/          useGameEngine (run loop) + usePlayerState (persisted state)
  themes/         5 themes as scoped CSS variable sets
  components/     Grid, BigButton, ProgressRing, ThresholdBar, etc.
  screens/        Menu, Play, Result, Stats, Settings
```

The engine, audio, and storage modules each sit behind a small interface so
that a future React Native build or a cloud-sync backend can be slotted in
without touching the UI.

## The science

The dual n-back paradigm presents two simultaneous streams (visual position
and spoken letter). For each trial, the player decides — separately for each
modality — whether the current stimulus matches the one presented N trials
back.

Original studies suggested transfer to fluid intelligence; later
meta-analyses found the effect smaller and more variable than first
reported, but the task remains a useful working-memory exercise. See
[Au et al. 2014 meta-analysis](https://gwern.net/doc/dual-n-back/2014-au.pdf)
for a measured overview.

This implementation follows the Jaeggi 2008 protocol exactly (6+6 match
counts, ~30% target density, 90/75 level threshold, 500ms stimulus +
2500ms response). It does **not** include "lure" trials (N±1 near-matches)
— those are a Brain Workshop addition, not part of the validated paradigm.

## Contributing

PRs welcome — please open an issue first for non-trivial changes. Keep the
engine pure (no React) and don't break the storage / audio interfaces.

## License

[MIT](./LICENSE) © 2026 Jonathan Leane

## Acknowledgements

- Visual design inspired by the [N-Back Challenge](https://play.google.com/store/apps/details?id=com.rivuspurus.nbackchallenge) app by Rivuspurus.
- Reference paradigm: Jaeggi, Buschkuehl, Jonides & Perrig (2008).
  *Improving fluid intelligence with training on working memory.* PNAS.
- [Brain Workshop](https://brainworkshop.sourceforge.net/) — the canonical open-source dual n-back implementation.
