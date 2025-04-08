import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ref, onValue, set, update } from 'firebase/database';
import { rtdb } from '../lib/firebase/firebase';
import { GameSession, Player, Question } from '../types';
import { GameQRCode } from './QRCode';

export function AdminDashboard() {
  const { gameId } = useParams<{ gameId: string }>();
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<number>(30);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  useEffect(() => {
    if (!gameId) return;
    
    // Subscribe to game session changes
    const gameRef = ref(rtdb, `games/${gameId}`);
    const unsubscribeGame = onValue(gameRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setGameSession(data);
        setTimeRemaining(data.timeRemaining || 30);
        setIsPaused(data.isPaused || false);
      }
    });

    // Subscribe to players changes
    const playersRef = ref(rtdb, `games/${gameId}/players`);
    const unsubscribePlayers = onValue(playersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const playersArray = Object.entries(data).map(([id, playerData]: [string, any]) => ({
          id,
          ...playerData
        }));
        setPlayers(playersArray);
      } else {
        setPlayers([]);
      }
    });

    return () => {
      unsubscribeGame();
      unsubscribePlayers();
    };
  }, [gameId]);

  const startGame = async () => {
    if (!gameSession || !gameId) return;

    const gameRef = ref(rtdb, `games/${gameId}`);
    await update(gameRef, {
      status: 'playing',
      startedAt: new Date().toISOString(),
      isPaused: false,
      timeRemaining: 30
    });
  };

  const pauseGame = async () => {
    if (!gameSession || !gameId) return;

    const gameRef = ref(rtdb, `games/${gameId}`);
    await update(gameRef, {
      isPaused: !isPaused
    });
  };

  const nextQuestion = async () => {
    if (!gameSession || !gameId) return;

    const gameRef = ref(rtdb, `games/${gameId}`);
    await update(gameRef, {
      currentQuestionIndex: gameSession.currentQuestionIndex + 1,
      timeRemaining: 30,
      isPaused: false
    });
  };

  const endGame = async () => {
    if (!gameSession || !gameId) return;

    const gameRef = ref(rtdb, `games/${gameId}`);
    await update(gameRef, {
      status: 'finished',
      endedAt: new Date().toISOString()
    });
  };

  const setTimer = async (seconds: number) => {
    if (!gameSession || !gameId) return;

    const gameRef = ref(rtdb, `games/${gameId}`);
    await update(gameRef, {
      timeRemaining: seconds
    });
  };

  if (!gameSession) {
    return <div className="p-6 flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Game Controls</h2>
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={startGame}
                  disabled={gameSession.status === 'playing'}
                  className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
                >
                  Start Game
                </button>
                <button
                  onClick={pauseGame}
                  disabled={gameSession.status !== 'playing'}
                  className="px-4 py-2 bg-yellow-500 text-white rounded disabled:opacity-50"
                >
                  {isPaused ? 'Resume' : 'Pause'}
                </button>
                <button
                  onClick={nextQuestion}
                  disabled={gameSession.status !== 'playing'}
                  className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
                >
                  Next Question
                </button>
                <button
                  onClick={endGame}
                  className="px-4 py-2 bg-red-500 text-white rounded"
                >
                  End Game
                </button>
              </div>
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium">Timer (seconds):</label>
                <input
                  type="number"
                  value={timeRemaining}
                  onChange={(e) => setTimer(Number(e.target.value))}
                  className="w-20 px-2 py-1 border rounded"
                  min="0"
                  max="300"
                />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Join Game</h2>
            {gameId && <GameQRCode gameId={gameId} />}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Players ({players.length})</h2>
        {players.length === 0 ? (
          <p className="text-gray-600">No players have joined yet. Share the QR code to invite players.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {players.map((player) => (
              <div
                key={player.id}
                className="p-4 border rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{player.name}</span>
                  <span className="text-sm text-gray-500">Score: {player.score}</span>
                </div>
                <div className="mt-2">
                  <span className={`text-sm ${player.isReady ? 'text-green-500' : 'text-yellow-500'}`}>
                    {player.isReady ? 'Ready' : 'Not Ready'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 