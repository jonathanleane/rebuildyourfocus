import { useEffect, useRef, useState } from 'react';
import BigButton from '../components/BigButton';
import Toggle from '../components/Toggle';
import Slider from '../components/Slider';
import type { UsePlayerState } from '../state/usePlayerState';
import {
  LETTERS,
  MAX_BLOCKS_PER_SESSION,
  MAX_LEVEL,
  MAX_SPEED,
  MIN_BLOCKS_PER_SESSION,
  MIN_LEVEL,
  MIN_SPEED,
} from '../engine/constants';
import { THEMES } from '../themes';
import { VOICES, createAudioPlayer, type AudioPlayer } from '../audio';
import type { AudioSource, Letter, ThemeId, VoiceId } from '../engine/types';

interface Props {
  player: UsePlayerState;
  onBack: () => void;
  onReplayTutorial: () => void;
  onShowScience: () => void;
}

export default function SettingsScreen({ player, onBack, onReplayTutorial, onShowScience }: Props) {
  const s = player.state.settings;
  const [confirmingReset, setConfirmingReset] = useState(false);

  return (
    <>
      <button onClick={onBack} style={{ color: 'var(--fg-dim)', fontSize: '0.85rem', alignSelf: 'flex-start', marginBottom: 12 }}>‹ Back</button>
      <div style={{ fontSize: '1.2rem', fontWeight: 700, textAlign: 'center', marginBottom: 16 }}>Settings</div>

      <Row label={`Speed · ${s.speedMultiplier.toFixed(1)}×`}>
        <Slider min={MIN_SPEED} max={MAX_SPEED} step={0.5} value={s.speedMultiplier} ariaLabel="Speed" onChange={(v) => player.updateSettings({ speedMultiplier: v })} />
      </Row>

      <Row label="Auto level progression" sub="Jaeggi rules: up at ≥90, down at <75">
        <Toggle label="Auto level" checked={s.autoLevelProgression} onChange={(v) => player.updateSettings({ autoLevelProgression: v })} />
      </Row>

      <Row label="Instant feedback" sub="Show red/green on each tap">
        <Toggle label="Instant feedback" checked={s.instantFeedback} onChange={(v) => player.updateSettings({ instantFeedback: v })} />
      </Row>

      <Row label={`N-back level · ${s.nBackLevel}`}>
        <Pills value={s.nBackLevel} min={MIN_LEVEL} max={MAX_LEVEL} onChange={(v) => player.updateSettings({ nBackLevel: v })} />
      </Row>

      <Row label={`Blocks per session · ${s.blocksPerSession}`}>
        <Slider min={MIN_BLOCKS_PER_SESSION} max={MAX_BLOCKS_PER_SESSION} value={s.blocksPerSession} ariaLabel="Blocks per session" onChange={(v) => player.updateSettings({ blocksPerSession: v })} />
      </Row>

      <Row label="Theme">
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {THEMES.map((t) => (
            <Pill key={t.id} active={t.id === s.theme} onClick={() => player.updateSettings({ theme: t.id as ThemeId })}>{t.label}</Pill>
          ))}
        </div>
      </Row>

      <Row label="Voice">
        <select
          value={s.voice}
          onChange={(e) => player.updateSettings({ voice: e.target.value as VoiceId })}
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 10px' }}
        >
          {VOICES.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name} · {v.accent} {v.gender}
            </option>
          ))}
        </select>
      </Row>

      <Row label="Preview voice" sub="Tap a letter to hear it">
        <VoicePreview voice={s.voice} audioSource={s.audioSource} />
      </Row>

      <Row label="Audio source">
        <select
          value={s.audioSource}
          onChange={(e) => player.updateSettings({ audioSource: e.target.value as AudioSource })}
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 10px' }}
        >
          <option value="auto">Auto</option>
          <option value="mp3">Pre-recorded</option>
          <option value="speech">Web Speech</option>
        </select>
      </Row>

      <div style={{ fontSize: '0.7rem', color: 'var(--fg-dim)', textAlign: 'center', marginTop: 8, lineHeight: 1.6 }}>
        Keyboard: <b>A</b> or <b>←</b> for Position · <b>L</b> or <b>→</b> for Sound · <b>Esc</b> to pause
      </div>

      <div style={{ marginTop: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <button
          onClick={onReplayTutorial}
          style={{
            color: 'var(--fg-dim)',
            fontSize: '0.8rem',
            textDecoration: 'underline',
            textDecorationStyle: 'dotted',
          }}
        >
          Replay tutorial
        </button>
        <button
          onClick={onShowScience}
          style={{
            color: 'var(--fg-dim)',
            fontSize: '0.8rem',
            textDecoration: 'underline',
            textDecorationStyle: 'dotted',
          }}
        >
          Does this work? (the science)
        </button>
      </div>

      <div style={{ marginTop: 'auto', paddingTop: 24 }}>
        {!confirmingReset ? (
          <button onClick={() => setConfirmingReset(true)} style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>Reset all progress</button>
        ) : (
          <div style={{ background: 'var(--surface)', padding: 12, borderRadius: 12 }}>
            <div style={{ fontSize: '0.85rem', marginBottom: 8 }}>Erase all sessions and reset settings?</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <BigButton onClick={() => setConfirmingReset(false)}>Cancel</BigButton>
              <BigButton primary onClick={() => { player.resetAll(); setConfirmingReset(false); }}>Reset</BigButton>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function Row({ label, sub, children }: { label: string; sub?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--surface)', borderRadius: 12, padding: 12, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
      <div>
        <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{label}</div>
        {sub && <div style={{ fontSize: '0.7rem', color: 'var(--fg-dim)', marginTop: 2 }}>{sub}</div>}
      </div>
      <div style={{ flexShrink: 0, maxWidth: '55%' }}>{children}</div>
    </div>
  );
}

function Pills({ value, min, max, onChange }: { value: number; min: number; max: number; onChange: (n: number) => void }) {
  return (
    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
      {Array.from({ length: max - min + 1 }, (_, i) => min + i).map((n) => (
        <Pill key={n} active={n === value} onClick={() => onChange(n)}>{n}</Pill>
      ))}
    </div>
  );
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? 'var(--accent)' : 'var(--surface-deep)',
        color: active ? 'var(--accent-fg)' : 'var(--fg)',
        borderRadius: 6,
        padding: '4px 8px',
        fontSize: '0.75rem',
        fontWeight: 600,
      }}
    >
      {children}
    </button>
  );
}

function VoicePreview({ voice, audioSource }: { voice: VoiceId; audioSource: AudioSource }) {
  const [audio, setAudio] = useState<AudioPlayer | null>(null);
  const [activeLetter, setActiveLetter] = useState<Letter | null>(null);
  const activeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    createAudioPlayer(audioSource, voice).then((p) => {
      if (!cancelled) setAudio(p);
    });
    return () => {
      cancelled = true;
      if (activeTimer.current) clearTimeout(activeTimer.current);
    };
  }, [voice, audioSource]);

  const play = (letter: Letter) => {
    audio?.playLetter(letter);
    setActiveLetter(letter);
    if (activeTimer.current) clearTimeout(activeTimer.current);
    activeTimer.current = setTimeout(() => setActiveLetter(null), 500);
  };

  return (
    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
      {LETTERS.map((letter) => {
        const active = letter === activeLetter;
        return (
          <button
            key={letter}
            onClick={() => play(letter)}
            aria-label={`Play letter ${letter}`}
            style={{
              background: active ? 'var(--accent)' : 'var(--surface-deep)',
              color: active ? 'var(--accent-fg)' : 'var(--fg)',
              borderRadius: 6,
              padding: '4px 8px',
              fontSize: '0.75rem',
              fontWeight: 600,
              minWidth: 28,
              transform: active ? 'scale(0.92)' : 'scale(1)',
              transition: 'transform 80ms ease, background 100ms ease',
            }}
          >
            {letter}
          </button>
        );
      })}
    </div>
  );
}
