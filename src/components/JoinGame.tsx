import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ref, get, set, push } from 'firebase/database';
import { rtdb } from '../lib/firebase/firebase';
import { GameSession, Player } from '../types';

export function JoinGame() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [gameExists, setGameExists] = useState(false);
  const [gameStatus, setGameStatus] = useState<string | null>(null);

  useEffect(() => {
    const checkGameExists = async () => {
      if (!gameId) return;
      
      try {
        const gameRef = ref(rtdb, `games/${gameId}`);
        const snapshot = await get(gameRef);
        
        if (snapshot.exists()) {
          setGameExists(true);
          const gameData = snapshot.val() as GameSession;
          setGameStatus(gameData.status);
        } else {
          setGameExists(false);
          setError('Game not found');
        }
      } catch (err) {
        console.error('Error checking game:', err);
        setError('Failed to check game status');
      }
    };
    
    checkGameExists();
  }, [gameId]);

  const handleJoinGame = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!gameId || !playerName.trim()) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      // Check if game is still waiting for players
      const gameRef = ref(rtdb, `games/${gameId}`);
      const snapshot = await get(gameRef);
      
      if (!snapshot.exists()) {
        setError('Game not found');
        return;
      }
      
      const gameData = snapshot.val() as GameSession;
      
      if (gameData.status !== 'waiting') {
        setError('Game has already started');
        return;
      }
      
      // Create a new player
      const playersRef = ref(rtdb, `games/${gameId}/players`);
      const newPlayerRef = push(playersRef);
      
      const player: Player = {
        id: newPlayerRef.key!,
        name: playerName,
        score: 0,
        isReady: false
      };
      
      // Add player to the game
      await set(newPlayerRef, player);
      
      // Navigate to the game lobby
      navigate(`/game/${gameId}/player/${newPlayerRef.key}`);
    } catch (err) {
      console.error('Error joining game:', err);
      setError('Failed to join game. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!gameExists) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Game Not Found</h1>
          <p className="text-gray-600 mb-6">The game you're trying to join doesn't exist or has been removed.</p>
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

  if (gameStatus !== 'waiting') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Game Already Started</h1>
          <p className="text-gray-600 mb-6">This game has already started. You cannot join at this time.</p>
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Join Game</h1>
        
        {error && (
          <p className="text-red-500 text-sm mb-4">{error}</p>
        )}
        
        <form onSubmit={handleJoinGame}>
          <div className="mb-4">
            <label htmlFor="playerName" className="block text-sm font-medium text-gray-700 mb-1">
              Your Name
            </label>
            <input
              type="text"
              id="playerName"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="Enter your name"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading || !playerName.trim()}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isLoading ? 'Joining...' : 'Join Game'}
          </button>
        </form>
      </div>
    </div>
  );
} 