import { useState, useCallback, useRef } from 'react';
import TitleScreen from './components/TitleScreen';
import GameCanvas from './components/GameCanvas';
import EndScreen from './components/EndScreen';
import LeaderboardScreen from './components/LeaderboardScreen';
import HistoricalScreen from './components/HistoricalScreen';
import SettingsScreen from './components/SettingsScreen';
import type { GameResult } from './types/game';

type Screen = 'title' | 'game' | 'end' | 'leaderboard' | 'history' | 'settings';

export default function App() {
  const [screen, setScreen] = useState<Screen>('title');
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [volume, setVolume] = useState(0.7);
  const gameKey = useRef(0);

  const handleGameOver = useCallback((result: GameResult) => {
    setGameResult(result);
    setScreen('end');
  }, []);

  const handlePlay = () => {
    gameKey.current++;
    setGameResult(null);
    setScreen('game');
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-black relative">
      {screen === 'game' && (
        <GameCanvas key={gameKey.current} onGameOver={handleGameOver} />
      )}
      {screen === 'title' && (
        <TitleScreen
          onPlay={handlePlay}
          onHistory={() => setScreen('history')}
          onLeaderboard={() => setScreen('leaderboard')}
          onSettings={() => setScreen('settings')}
        />
      )}
      {screen === 'end' && gameResult && (
        <EndScreen
          result={gameResult}
          onPlayAgain={handlePlay}
          onMenu={() => setScreen('title')}
        />
      )}
      {screen === 'leaderboard' && (
        <LeaderboardScreen onBack={() => setScreen('title')} />
      )}
      {screen === 'history' && (
        <HistoricalScreen onBack={() => setScreen('title')} />
      )}
      {screen === 'settings' && (
        <SettingsScreen
          volume={volume}
          onVolumeChange={setVolume}
          onBack={() => setScreen('title')}
        />
      )}
    </div>
  );
}
