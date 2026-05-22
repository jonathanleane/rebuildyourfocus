import { useCallback, useState } from 'react';
import Layout from './components/Layout';
import MenuScreen from './screens/MenuScreen';
import PlayScreen from './screens/PlayScreen';
import ResultScreen from './screens/ResultScreen';
import SettingsScreen from './screens/SettingsScreen';
import StatsScreen from './screens/StatsScreen';
import TutorialScreen from './screens/TutorialScreen';
import { usePlayerState } from './state/usePlayerState';
import type { BlockResult, SessionResult } from './engine/types';

type Screen =
  | { name: 'menu' }
  | { name: 'play' }
  | { name: 'result'; result: BlockResult; blocksLeft: number; level: number }
  | { name: 'stats' }
  | { name: 'settings' }
  | { name: 'tutorial' };

interface Session {
  blocks: BlockResult[];
  startedAt: number;
  startingLevel: number;
}

export default function App() {
  const player = usePlayerState();
  const [screen, setScreen] = useState<Screen>(() =>
    !player.state.player.hasSeenTutorial && player.state.history.length === 0
      ? { name: 'tutorial' }
      : { name: 'menu' },
  );
  const [session, setSession] = useState<Session | null>(null);

  const startSession = useCallback(() => {
    setSession({
      blocks: [],
      startedAt: Date.now(),
      startingLevel: player.state.settings.nBackLevel,
    });
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
          setScreen({ name: 'result', result, blocksLeft: 0, level: newLevel });
          return null;
        }

        setScreen({ name: 'result', result, blocksLeft, level: newLevel });
        return { ...prev, blocks };
      });
    },
    [player],
  );

  const endSession = useCallback(() => {
    if (session && session.blocks.length > 0) {
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
    }
    setSession(null);
    setScreen({ name: 'menu' });
  }, [session, player]);

  const continueSession = useCallback(() => setScreen({ name: 'play' }), []);
  const showStats = useCallback(() => setScreen({ name: 'stats' }), []);
  const showSettings = useCallback(() => setScreen({ name: 'settings' }), []);
  const showTutorial = useCallback(() => {
    player.setTutorialSeen(false);
    setScreen({ name: 'tutorial' });
  }, [player]);
  const showMenu = useCallback(() => {
    setSession(null);
    setScreen({ name: 'menu' });
  }, []);

  const finishTutorial = useCallback(() => {
    player.setTutorialSeen(true);
    setScreen({ name: 'menu' });
  }, [player]);

  return (
    <Layout>
      {screen.name === 'tutorial' && (
        <TutorialScreen player={player} onFinish={finishTutorial} onSkip={finishTutorial} />
      )}
      {screen.name === 'menu' && (
        <MenuScreen player={player} onStart={startSession} onStats={showStats} onSettings={showSettings} />
      )}
      {screen.name === 'play' && session && (
        <PlayScreen
          player={player}
          blockNumber={session.blocks.length + 1}
          onBlockComplete={recordBlock}
          onQuit={endSession}
        />
      )}
      {screen.name === 'result' && (
        <ResultScreen
          result={screen.result}
          blocksLeft={screen.blocksLeft}
          level={screen.level}
          onContinue={continueSession}
          onDone={endSession}
        />
      )}
      {screen.name === 'stats' && <StatsScreen player={player} onBack={showMenu} />}
      {screen.name === 'settings' && (
        <SettingsScreen player={player} onBack={showMenu} onReplayTutorial={showTutorial} />
      )}
    </Layout>
  );
}

function createId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
