import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, push, set, get } from 'firebase/database';
import { rtdb, auth } from '../lib/firebase/firebase';
import { signInAnonymously } from 'firebase/auth';
import { GameSession, Question } from '../types';
import { GameQRCode } from './QRCode';
import { seedData } from '../lib/firebase/seed-data';

export function CreateGame() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [gameId, setGameId] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [isCreated, setIsCreated] = useState(false);

  const createGame = async () => {
    setIsLoading(true);
    setError('');
    setDebugInfo('Starting game creation...');
    
    try {
      // Try to authenticate anonymously
      try {
        setDebugInfo('Authenticating anonymously...');
        await signInAnonymously(auth);
        setDebugInfo('Authentication successful');
      } catch (authError) {
        console.error('Authentication error:', authError);
        setDebugInfo(`Authentication failed: ${(authError as Error).message}`);
        // Continue despite auth error - we'll use fallback dummy questions
      }
      
      // Load questions for the quiz
      let questions: Question[][] = [];
      let categories: string[] = [];
      
      try {
        // Try to seed data or load from database
        setDebugInfo('Attempting to seed data...');
        const seedDataId = await seedData();
        if (seedDataId) {
          setDebugInfo(`Seed data created successfully with game ID: ${seedDataId}`);
          setGameId(seedDataId);
          setIsCreated(true);
          return;
        }
      } catch (seedError) {
        console.error('Error with seed data:', seedError);
        setDebugInfo(`Error with seed data: ${(seedError as Error).message}`);
        // Continue with fallback options
      }

      // If seed data failed, create a simple game manually
      setDebugInfo('Creating new game session with basic structure...');
      const gamesRef = ref(rtdb, 'games');
      const newGameRef = push(gamesRef);
      
      const gameSession: Omit<GameSession, 'id'> = {
        hostId: 'current-user-id',
        status: 'waiting',
        players: [],
        currentQuestionIndex: 0,
        currentCategory: 0,
        currentRound: 0,
        questions: [[
          {
            id: 'q1',
            text: 'Koji je glavni grad Srbije?',
            options: ['Niš', 'Beograd', 'Novi Sad', 'Kragujevac'],
            correctOptionIndex: 1,
            timeLimit: 30,
            points: 100,
            category: 'Opšte znanje',
            difficulty: 'easy',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ]],
        categories: ['Opšte znanje'],
        showLeaderboard: false,
        isPaused: false,
        timeRemaining: 30,
        showingCorrectAnswer: false,
        allPlayersAnswered: false,
        roundCompleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Save the game session to the database
      setDebugInfo('Saving game session to database...');
      await set(newGameRef, {
        ...gameSession,
        id: newGameRef.key
      });
      
      // Set the game ID to display the QR code
      setDebugInfo('Game created successfully with ID: ' + newGameRef.key);
      setGameId(newGameRef.key!);
      setIsCreated(true);
    } catch (err) {
      console.error('Error creating game:', err);
      setError('Failed to create game. Please try again.');
      setDebugInfo(`Error creating game: ${(err as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const goToAdminDashboard = () => {
    if (gameId) {
      navigate(`/admin/${gameId}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Create New Game</h1>
        
        {error && (
          <p className="text-red-500 text-sm mb-4">{error}</p>
        )}

        {!gameId ? (
          <>
            <button
              onClick={createGame}
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create Game'}
            </button>
            
            {debugInfo && (
              <div className="mt-4 p-3 bg-gray-100 rounded text-xs text-gray-600 overflow-auto max-h-40">
                <pre>{debugInfo}</pre>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Game Created!</h2>
              <p className="text-gray-600 mb-4">Share this QR code with players to join your game</p>
            </div>
            
            <GameQRCode gameId={gameId} size={200} />
            
            <div className="flex flex-col gap-3 w-full">
              <button
                onClick={goToAdminDashboard}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Go to Admin Dashboard
              </button>
              
              <button
                onClick={() => navigate('/')}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Back to Home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 