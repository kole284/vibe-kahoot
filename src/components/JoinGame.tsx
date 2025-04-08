import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ref, get, set, push, onValue, off } from 'firebase/database';
import { rtdb, auth } from '../lib/firebase/firebase';
import { signInAnonymously } from 'firebase/auth';
import { GameSession, Player } from '../types';

export function JoinGame() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [gameExists, setGameExists] = useState(false);
  const [gameStatus, setGameStatus] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    if (!gameId) {
      setError('No game ID provided');
      return;
    }

    setDebugInfo(`Checking game with ID: ${gameId}`);
    const gameRef = ref(rtdb, `games/${gameId}`);

    const unsubscribe = onValue(gameRef, (snapshot) => {
      try {
        if (snapshot.exists()) {
          const gameData = snapshot.val() as GameSession;
          setGameExists(true);
          setGameStatus(gameData.status);
          setDebugInfo(`Game found! Status: ${gameData.status}`);
          
          // Check if game is in a valid state
          if (gameData.status === 'finished') {
            setError('This game has already ended');
          } else if (gameData.status === 'playing') {
            setError('This game is already in progress');
          }
        } else {
          setGameExists(false);
          setError('Game not found');
          setDebugInfo(`Game not found with ID: ${gameId}`);
        }
      } catch (err) {
        console.error('Error processing game data:', err);
        setError('Error loading game data');
        setDebugInfo(`Error processing game data: ${(err as Error).message}`);
      }
    }, (error) => {
      console.error('Error checking game:', error);
      setError('Failed to check game status');
      setDebugInfo(`Error checking game: ${error.message}`);
    });

    return () => {
      off(gameRef);
    };
  }, [gameId]);

  const handleJoinGame = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!gameId || !playerName.trim()) {
      setError('Please enter your name');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setDebugInfo('Starting to join game...');
    
    try {
      // Authenticate anonymously first
      try {
        setDebugInfo('Authenticating anonymously...');
        await signInAnonymously(auth);
        setDebugInfo('Authentication successful');
      } catch (authError) {
        console.error('Authentication error:', authError);
        setDebugInfo(`Authentication failed: ${(authError as Error).message}`);
        setError('Failed to authenticate. Please try again.');
        return;
      }
      
      // Now try to join the game
      const gameRef = ref(rtdb, `games/${gameId}`);
      const snapshot = await get(gameRef);
      
      if (!snapshot.exists()) {
        setError('Game not found');
        return;
      }
      
      const gameData = snapshot.val() as GameSession;
      
      if (gameData.status !== 'waiting') {
        setError('Game is no longer accepting players');
        return;
      }

      // Check if player name is already taken
      const playersRef = ref(rtdb, `games/${gameId}/players`);
      const playersSnapshot = await get(playersRef);
      const existingPlayers = playersSnapshot.val() as Record<string, Player> || {};
      
      // Check if any existing player has the same name
      const isNameTaken = Object.values(existingPlayers).some((player) => 
        player.name.toLowerCase() === playerName.toLowerCase()
      );
      
      if (isNameTaken) {
        setError('This name is already taken. Please choose another name.');
        return;
      }
      
      // Create a new player
      const newPlayerRef = push(playersRef);
      
      const player: Player = {
        id: newPlayerRef.key!,
        name: playerName.trim(),
        score: 0,
        isReady: false
      };
      
      // Add player to the game
      setDebugInfo(`Adding player to game: ${player.name}`);
      await set(newPlayerRef, player);
      setDebugInfo(`Successfully joined game as ${player.name}`);
      
      // Navigate to the game lobby
      navigate(`/game/${gameId}/player/${newPlayerRef.key}`);
    } catch (err) {
      console.error('Error joining game:', err);
      setError('Failed to join game. Please try again.');
      setDebugInfo(`Error joining game: ${(err as Error).message}`);
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
          {debugInfo && (
            <div className="mt-4 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-24">
              <pre>{debugInfo}</pre>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (gameStatus && gameStatus !== 'waiting') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Cannot Join Game</h1>
          <p className="text-gray-600 mb-6">
            {gameStatus === 'finished' 
              ? 'This game has already ended.' 
              : 'This game is already in progress.'}
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Back to Home
          </button>
          {debugInfo && (
            <div className="mt-4 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-24">
              <pre>{debugInfo}</pre>
            </div>
          )}
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
        
        {debugInfo && (
          <div className="mb-4 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-24">
            <pre>{debugInfo}</pre>
          </div>
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
              maxLength={20}
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