import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ref, onValue, get, update } from 'firebase/database';
import { rtdb } from '../lib/firebase/firebase';
import { GameSession, Player } from '../types';

export function GameLobby() {
  const { gameId, playerId } = useParams<{ gameId: string; playerId: string }>();
  const navigate = useNavigate();
  const [game, setGame] = useState<GameSession | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!gameId || !playerId) return;

    // Subscribe to game updates
    const gameRef = ref(rtdb, `games/${gameId}`);
    const unsubscribeGame = onValue(gameRef, (snapshot) => {
      if (snapshot.exists()) {
        const gameData = snapshot.val() as GameSession;
        setGame(gameData);
        
        // If game has started, navigate to the game
        if (gameData.status === 'playing') {
          navigate(`/play?gameId=${gameId}&playerId=${playerId}`);
        }
      } else {
        setError('Game not found');
      }
    });

    // Get player data
    const fetchPlayer = async () => {
      try {
        const playerRef = ref(rtdb, `games/${gameId}/players/${playerId}`);
        const snapshot = await get(playerRef);
        
        if (snapshot.exists()) {
          const playerData = snapshot.val() as Player;
          setPlayer(playerData);
          setIsReady(playerData.isReady);
        } else {
          setError('Player not found');
        }
      } catch (err) {
        console.error('Error fetching player:', err);
        setError('Failed to fetch player data');
      }
    };
    
    fetchPlayer();

    return () => {
      unsubscribeGame();
    };
  }, [gameId, playerId, navigate]);

  const toggleReady = async () => {
    if (!gameId || !playerId) return;
    
    try {
      const playerRef = ref(rtdb, `games/${gameId}/players/${playerId}`);
      await update(playerRef, { isReady: !isReady });
      setIsReady(!isReady);
    } catch (err) {
      console.error('Error updating ready status:', err);
      setError('Failed to update ready status');
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!game || !player) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
          <p className="text-gray-600">Please wait while we load the game lobby.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Game Lobby</h1>
        
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Welcome, {player.name}!</h2>
          <p className="text-gray-600">
            Waiting for the host to start the game. There are currently {game.players?.length || 0} players in the lobby.
          </p>
        </div>
        
        <div className="mb-6">
          <button
            onClick={toggleReady}
            className={`w-full py-3 rounded-lg font-medium ${
              isReady 
                ? 'bg-green-500 hover:bg-green-600 text-white' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
            }`}
          >
            {isReady ? 'Ready!' : 'I\'m Ready'}
          </button>
        </div>
        
        <div className="text-center text-sm text-gray-500">
          <p>The game will start automatically when the host begins.</p>
        </div>
      </div>
    </div>
  );
} 