import { useCallback, useState } from 'react';
import Layout from './components/Layout';
import LandingScreen from './screens/LandingScreen';
import MenuScreen from './screens/MenuScreen';
import PlayScreen from './screens/PlayScreen';
import ResultScreen from './screens/ResultScreen';
import SessionCompleteScreen from './screens/SessionCompleteScreen';
import SettingsScreen from './screens/SettingsScreen';
import StatsScreen from './screens/StatsScreen';
import ScienceScreen from './screens/ScienceScreen';
import TutorialScreen from './screens/TutorialScreen';
import { usePlayerState } from './state/usePlayerState';
import type { BlockResult, SessionResult } from './engine/types';

type Screen =
  | { name: 'landing' }
  | { name: 'menu' }
  | { name: 'play' }
  | { name: 'result'; result: BlockResult; blocksLeft: number; level: number }
  | { name: 'sessionComplete'; session: SessionResult }
  | { name: 'stats' }
  | { name: 'settings' }
  | { name: 'science' }
  | { name: 'tutorial' };

interface Session {
  blocks: BlockResult[];
  startedAt: number;
  startingLevel: number;
}

export default function App() {
  const player = usePlayerState();
  const [screen, setScreen] = useState<Screen>(() => ({ name: 'landing' }));
  const [session, setSession] = useState<Session | null>(null);
  // When a session finishes (naturally or early), we stash its SessionResult here
  // so the SessionComplete screen has access to it after the per-block Result.
  const [pendingSummary, setPendingSummary] = useState<SessionResult | null>(null);

  const startSession = useCallback(() => {
    setSession({
      blocks: [],
      startedAt: Date.now(),
      startingLevel: player.state.settings.nBackLevel,
    });
    setPendingSummary(null);
    setScreen({ name: 'play' });
  }, [player.state.settings.nBackLevel]);

  const recordBlock = useCallback(
    (result: BlockResult, newLevel: number) => {
      setSession((prev) => {
        if (!prev) return null;
        const blocks = [...prev.blocks, result];
        const blocksLeft = player.state.settings.blocksPerSession - blocks.length;

        if (blocksLeft <= 0) {
          const finished: SessionResult = {
            id: createId(),
            startedAt: prev.startedAt,
            finishedAt: Date.now(),
            blocks,
            startingLevel: prev.startingLevel,
            endingLevel: newLevel,
            completed: true,
          };
          player.recordSession(finished);
          setPendingSummary(finished);
          setScreen({ name: 'result', result, blocksLeft: 0, level: newLevel });
          return null;
        }

        setScreen({ name: 'result', result, blocksLeft, level: newLevel });
        return { ...prev, blocks };
      });
    },
    [player],
  );

  // From ResultScreen's "End session", PlayScreen's "Quit", or the natural end-of-session flow.
  // Shows SessionComplete if any blocks were played; otherwise jumps to menu.
  const finishOrSummarize = useCallback(() => {
    if (pendingSummary) {
      // Session completed naturally; pendingSummary already exists.
      setScreen({ name: 'sessionComplete', session: pendingSummary });
      setSession(null);
      return;
    }
    if (session && session.blocks.length > 0) {
      // Mid-session end — record as incomplete and show summary.
      const partial: SessionResult = {
        id: createId(),
        startedAt: session.startedAt,
        finishedAt: Date.now(),
        blocks: session.blocks,
        startingLevel: session.startingLevel,
        endingLevel: player.state.settings.nBackLevel,
        completed: false,
      };
      player.recordSession(partial);
      setPendingSummary(partial);
      setSession(null);
      setScreen({ name: 'sessionComplete', session: partial });
      return;
    }
    setSession(null);
    setScreen({ name: 'menu' });
  }, [pendingSummary, session, player]);

  const dismissSummary = useCallback(() => {
    setPendingSummary(null);
    setScreen({ name: 'menu' });
  }, []);

  const continueSession = useCallback(() => setScreen({ name: 'play' }), []);
  const showStats = useCallback(() => setScreen({ name: 'stats' }), []);
  const showSettings = useCallback(() => setScreen({ name: 'settings' }), []);
  const showScience = useCallback(() => setScreen({ name: 'science' }), []);
  const showTutorial = useCallback(() => {
    player.setTutorialSeen(false);
    setScreen({ name: 'tutorial' });
  }, [player]);

  const finishTutorial = useCallback(() => {
    player.setTutorialSeen(true);
    setScreen({ name: 'menu' });
  }, [player]);

  const backToMenu = useCallback(() => {
    setSession(null);
    setPendingSummary(null);
    setScreen({ name: 'menu' });
  }, []);

  const backToLanding = useCallback(() => {
    setSession(null);
    setPendingSummary(null);
    setScreen({ name: 'landing' });
  }, []);

  const enterDualNBack = useCallback(() => {
    const firstTime = !player.state.player.hasSeenTutorial && player.state.history.length === 0;
    setScreen(firstTime ? { name: 'tutorial' } : { name: 'menu' });
  }, [player.state.player.hasSeenTutorial, player.state.history.length]);

  return (
    <Layout>
      {screen.name === 'landing' && (
        <LandingScreen onPlayDualNBack={enterDualNBack} />
      )}
      {screen.name === 'tutorial' && (
        <TutorialScreen onFinish={finishTutorial} />
      )}
      {screen.name === 'menu' && (
        <MenuScreen player={player} onStart={startSession} onStats={showStats} onSettings={showSettings} onHome={backToLanding} />
      )}
      {screen.name === 'play' && session && (
        <PlayScreen
          player={player}
          blockNumber={session.blocks.length + 1}
          onBlockComplete={recordBlock}
          onQuit={finishOrSummarize}
        />
      )}
      {screen.name === 'result' && (
        <ResultScreen
          result={screen.result}
          blocksLeft={screen.blocksLeft}
          level={screen.level}
          onContinue={continueSession}
          onDone={finishOrSummarize}
        />
      )}
      {screen.name === 'sessionComplete' && (
        <SessionCompleteScreen session={screen.session} onDone={dismissSummary} />
      )}
      {screen.name === 'stats' && <StatsScreen player={player} onBack={backToMenu} />}
      {screen.name === 'science' && <ScienceScreen onBack={backToMenu} />}
      {screen.name === 'settings' && (
        <SettingsScreen
          player={player}
          onBack={backToMenu}
          onReplayTutorial={showTutorial}
          onShowScience={showScience}
        />
      )}
    </Layout>
  );
}

function createId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
