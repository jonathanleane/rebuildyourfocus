# Dual N-Back Game — Design Spec

**Date:** 2026-05-22
**Status:** Design approved, ready for planning

## Goal

Build a polished web-based dual n-back trainer that delivers the validated Jaeggi paradigm with a clean, focused experience. Local-only (no backend) for v1, designed so a future mobile app and a future cloud-sync backend can be added without rearchitecting.

Inspired by the reference app "N-Back Challenge" (Rivuspurus) — dark/minimal aesthetic, large touch targets, clear feedback loop.

## Non-goals (v1)

- No backend, accounts, or cloud sync.
- No social features (friends, leaderboards, sharing).
- No notifications or scheduling.
- No streak punishment / coffee penalties.
- No mobile-native build (deferred to a future project).

## Stack

- Vite + React + TypeScript (strict).
- No global state library; local component state + a single `useGameEngine` hook.
- No router; `Screen` discriminated union in `App.tsx`.
- Audio via Web Audio API + pre-rendered ElevenLabs mp3 assets, with `window.speechSynthesis` fallback.
- Testing: Vitest + React Testing Library on engine and hooks only.

## Architecture

### Folder layout

```
src/
  engine/             # Pure TS, zero React. Unit-testable.
    types.ts
    blockGenerator.ts
    scoring.ts
    constants.ts
  audio/
    AudioPlayer.ts        # interface
    MP3AudioPlayer.ts
    SpeechAudioPlayer.ts
    index.ts              # selects player per Settings + capability
  storage/
    Storage.ts            # interface
    localStorage.ts
  state/
    useGameEngine.ts
    usePlayerState.ts
  themes/
    index.ts              # ThemeId union type + list of themes
    themes.css            # all 5 theme CSS variable sets, scoped by [data-theme="..."]
  screens/
    MenuScreen.tsx
    PlayScreen.tsx
    ResultScreen.tsx
    StatsScreen.tsx
    SettingsScreen.tsx
  components/
    Grid.tsx
    Cell.tsx
    BigButton.tsx
    ProgressRing.tsx
    LineChart.tsx
    ThresholdBar.tsx
    Toggle.tsx
    Slider.tsx
  App.tsx
  main.tsx
  index.css
public/
  audio/letters/{C,H,K,L,Q,R,S,T}.mp3
scripts/
  generate-audio.ts       # one-time ElevenLabs asset generation
```

### Design discipline

- Engine has zero React imports. Portable to a future React Native app verbatim.
- `AudioPlayer` and `Storage` are interfaces; swapping for native impls later is a one-file change.
- Themes are CSS variable sets; no JS theming logic beyond a `<html data-theme="...">` attribute.

## Game engine

### Stimuli

- **Visual:** position on a 3×3 grid, **all 9 positions** (including center).
- **Audio:** 8 letters — `C, H, K, L, Q, R, S, T`.

### One trial

| Phase | Duration | What happens |
|---|---|---|
| Stimulus | 500 ms | Cell lights white, letter plays simultaneously |
| Response window | 2500 ms | Cell off; user may tap "Position", "Sound", both, or neither |
| Total | 3000 ms | |

`speedMultiplier` (1.0–5.0) scales the response window only — stimulus stays 500 ms so it's always perceptible. So at speed=2.0, response window = 1250 ms; at speed=5.0, response window = 500 ms.

### One block

- `N + 20` trials. At N=2 → 22 trials → ~66 s at speed 1×.
- Per Jaeggi: exactly **6 position matches** and **6 letter matches** per block, placed at random positions ≥ N+1 (the first N trials cannot be matches because there's no trial N-back).
- Position matches and letter matches are independent — some trials may be both, neither, or one.

### Scoring

Per trial, for each modality independently, classify the user's decision:
- **Hit:** user tapped + actual match → correct
- **Miss:** user didn't tap + actual match → incorrect
- **False alarm:** user tapped + no match → incorrect
- **Correct rejection:** user didn't tap + no match → correct

Decidable trials in a block = `N + 20 − N = 20` (the first N trials are not scored — there's no trial N back yet).

Block accuracy per modality = `(hits + correct_rejections) / 20`. Matches Brain Workshop and the Jaeggi protocol — percentage of correct decisions. Both missed targets and false alarms reduce the score.

### Response handling

Within a trial's response window, the user can tap Position and/or Sound in any order, any time. Each modality is recorded as "tapped" once if tapped at least once during the window — additional taps are ignored, not penalized. The cell off / blank state is the response window; it ends with the next stimulus.

### Level progression rule

After a block completes:
- If `positionAccuracy ≥ 0.90 AND letterAccuracy ≥ 0.90` → level + 1
- Else if `positionAccuracy < 0.75 OR letterAccuracy < 0.75` → level − 1 (floor 1, ceiling 14)
- Else → level unchanged

Only applies if `settings.autoLevelProgression === true`. Otherwise level is user-controlled.

### Session

- A session = `settings.blocksPerSession` blocks (default 10, range 5–20).
- Sessions can be quit early. On quit: any **already-completed** blocks are saved as part of a `SessionResult` with `completed: false`. The block in progress (if any) is discarded. `totalSessionsCompleted` is **not** incremented for incomplete sessions.
- A session counts toward the "20-session challenge" only when `completed: true`.
- The "20-session challenge" tracks `totalSessionsCompleted` toward 20. It does not reset.

## Data model

### Engine types

```ts
type Position = 0|1|2|3|4|5|6|7|8;     // 3x3 grid, row-major
type Letter = 'C'|'H'|'K'|'L'|'Q'|'R'|'S'|'T';

interface Stimulus { position: Position; letter: Letter }
interface Trial extends Stimulus {
  positionMatch: boolean;
  letterMatch: boolean;
}
interface UserResponse { position: boolean; letter: boolean }

interface BlockResult {
  n: number;
  startedAt: number;
  finishedAt: number;
  trials: Trial[];
  responses: UserResponse[];
  positionAccuracy: number;   // 0..1
  letterAccuracy: number;
  outcome: 'level-up' | 'level-down' | 'hold';
}

interface SessionResult {
  id: string;                  // ulid
  startedAt: number;
  finishedAt: number;
  blocks: BlockResult[];
  startingLevel: number;
  endingLevel: number;
  completed: boolean;
}
```

### Persisted state

Single JSON blob in `localStorage` key `nback.state.v1`, versioned.

```ts
type ThemeId = 'mono' | 'indigo' | 'forest' | 'amber' | 'light';

interface PersistedState {
  schemaVersion: 1;
  settings: {
    nBackLevel: number;             // current, default 2, 1..14
    blocksPerSession: number;       // default 10, 5..20
    speedMultiplier: number;        // default 1.0, 1.0..5.0
    instantFeedback: boolean;       // default true
    autoLevelProgression: boolean;  // default true
    audioSource: 'auto' | 'mp3' | 'speech';  // default 'auto'
    theme: ThemeId;                 // default 'mono'
  };
  player: {
    totalSessionsCompleted: number;
    lastSessionDate: string | null; // YYYY-MM-DD
    currentStreak: number;          // info only, no gating
    longestStreak: number;
    bestLevel: number;
  };
  history: SessionResult[];         // capped at last 200 sessions
}
```

### Storage discipline

- One read at app boot → in-memory store.
- Writes debounced 500 ms; one write per debounce window.
- Storage migrations keyed on `schemaVersion`. v1 ships, future versions add an `if (state.schemaVersion === 1) migrateTo2(state)` step.
- All dates stored as epoch ms or ISO `YYYY-MM-DD` — never `Date` objects in persisted data.

## Audio

### Asset pipeline (one-time, dev-time)

- `scripts/generate-audio.ts` calls ElevenLabs API with an API key from `.env` (`ELEVENLABS_API_KEY`, never committed).
- Generates 8 short clips: `C.mp3` … `T.mp3` in `public/audio/letters/`.
- Target: clear voice, ~400 ms each, mono 64 kbps mp3, ~5–10 KB per file (~50 KB total).
- Re-runnable; voice can be tweaked without touching app code.

### Runtime

- `MP3AudioPlayer` preloads all 8 mp3s into a `BufferSource` pool at app boot using `AudioContext.decodeAudioData`.
- `SpeechAudioPlayer` uses `window.speechSynthesis` as fallback.
- `Settings.audioSource: 'auto'` (try mp3, fall back on fetch/decode error) | `'mp3'` (mp3 only) | `'speech'` (speech only).
- Selector module returns the right player per settings + capability detection.

### Timing

- Trial scheduling uses `AudioContext.currentTime` and `BufferSource.start(t)` for sample-accurate audio onset.
- Visual stimulus flipped on `requestAnimationFrame` aligned to the same `t`.
- iOS Safari: first play happens inside the "Start Session" tap handler so the audio context is unlocked.

## Screens

Five screens, switched by `Screen` union in `App.tsx`. No router.

```
Menu ──Start──▶ Play ──block done──▶ Result
  │              │                    │
  │            Quit                  Continue / Done
  ├─Stats──▶ Stats
  └─Settings──▶ Settings
```

### 1. Menu

- Wordmark "N-Back / Challenge"
- Streak chip (info only)
- Challenge progress ring: `totalSessionsCompleted / 20`
- CTA "Start Session"
- Icon row: Stats, Settings

### 2. Play

- Header: `Block X/Y · Level N · Trial T/total`, with progress bar
- 3×3 grid, one cell white during stimulus phase
- Two large pill buttons: Position (left), Sound (right)
- Instant feedback (if enabled): brief green/red flash inside button on tap
- Quit button → confirmation modal → back to Menu (block discarded)

### 3. Result

- Outcome headline: "Amazing!" (level up), "Nice." (hold), "Push harder" (level down)
- Two score cards: Position % and Sound % with threshold bars showing 75 / 90 markers
- Level change message: "Level raised to N" / "Level dropped to N" / "Same level"
- Continue (next block) or Done (end session, save result)

### 4. Stats

- Tabs: Session (current session blocks) | All-time
- Line chart of level over recent sessions (hand-rolled SVG, no chart lib)
- Tiles: Avg level, Best level, Total blocks, Streak

### 5. Settings

- Speed slider (1×–5×)
- Auto level progression toggle
- Instant feedback toggle
- N-back level pills (1–14)
- Blocks per session (5–20)
- Theme picker (5 themes)
- Audio source select (auto / mp3 / speech)
- Reset progress (confirmation required)

## Accessibility

- Keyboard: `A` = Position, `L` = Sound. Shown in Settings.
- ARIA labels on grid cells, buttons, toggles.
- All themes meet WCAG AA contrast for text.
- Lit cell uses brightness change (white on dark / dark on light), colorblind-safe.
- `prefers-reduced-motion` disables flash animations.

## Testing

- **Vitest unit tests** on `engine/`:
  - `blockGenerator` — correct trial count, exact 6/6 match counts, no matches in first N, deterministic with seeded RNG.
  - `scoring` — per-trial hit/miss/false-alarm classification, block accuracy per modality, level rule edge cases (both at 90 → up, one at 89.9 → hold, one at 74.9 → down).
- **Vitest + React Testing Library** on `useGameEngine` with fake timers: full block simulation, state transitions.
- No e2e. UI components untested at v1.
- Coverage target: ~80% on `engine/` and `state/`.

## Performance

- `useReducer` for engine state to keep React tree stable during high-frequency trial transitions.
- Memoize `Cell` so only the lit cell re-renders per stimulus.
- Audio preloaded at boot; no network during a session.

## Future-proofing

- **Mobile native:** engine + types port verbatim. UI rewrites against React Native; AudioPlayer and Storage get native impls.
- **Cloud sync:** `Storage` interface gets a remote impl that reads/writes to a backend; existing local impl becomes the offline cache.
- **Accounts:** added as a layer above Storage with no engine changes.
- **More features (themes, languages, audio voices):** all additive via settings.
