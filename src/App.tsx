import { useMemo, useState } from 'react';
import Layout from './components/Layout';
import MenuScreen from './screens/MenuScreen';
import PlayScreen from './screens/PlayScreen';
import ResultScreen from './screens/ResultScreen';
import SettingsScreen from './screens/SettingsScreen';
import StatsScreen from './screens/StatsScreen';
import { usePlayerState } from './state/usePlayerState';
import type { BlockResult } from './engine/types';

type Screen =
  | { name: 'menu' }
  | { name: 'play' }
  | { name: 'result'; result: BlockResult; blocksLeft: number; level: number }
  | { name: 'stats' }
  | { name: 'settings' };

export default function App() {
  const player = usePlayerState();
  const [screen, setScreen] = useState<Screen>({ name: 'menu' });
  const nav = useMemo(
    () => ({
      menu: () => setScreen({ name: 'menu' }),
      play: () => setScreen({ name: 'play' }),
      stats: () => setScreen({ name: 'stats' }),
      settings: () => setScreen({ name: 'settings' }),
      result: (result: BlockResult, blocksLeft: number, level: number) =>
        setScreen({ name: 'result', result, blocksLeft, level }),
    }),
    [],
  );

  return (
    <Layout>
      {screen.name === 'menu' && (
        <MenuScreen player={player} onStart={nav.play} onStats={nav.stats} onSettings={nav.settings} />
      )}
      {screen.name === 'play' && <PlayScreen player={player} onBlockDone={nav.result} onQuit={nav.menu} />}
      {screen.name === 'result' && (
        <ResultScreen result={screen.result} blocksLeft={screen.blocksLeft} level={screen.level} onContinue={nav.play} onDone={nav.menu} />
      )}
      {screen.name === 'stats' && <StatsScreen player={player} onBack={nav.menu} />}
      {screen.name === 'settings' && <SettingsScreen player={player} onBack={nav.menu} />}
    </Layout>
  );
}
