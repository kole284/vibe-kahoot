import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, push, set, get } from 'firebase/database';
import { rtdb, auth } from '../lib/firebase/firebase';
import { signInAnonymously } from 'firebase/auth';
import { GameSession, Question } from '../types';
import { GameQRCode } from './QRCode';

export function CreateGame() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [gameId, setGameId] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');

  const createGame = async () => {
    setIsLoading(true);
    setError('');
    setDebugInfo('Starting game creation...');

    try {
      // Ensure we're authenticated before accessing the database
      try {
        setDebugInfo('Authenticating anonymously...');
        await signInAnonymously(auth);
        setDebugInfo('Authentication successful');
      } catch (authError) {
        console.error('Authentication error:', authError);
        setDebugInfo('Authentication failed, proceeding with sample questions...');
        // Continue with sample questions if authentication fails
      }
      
      // Get random questions from Realtime Database
      try {
        setDebugInfo('Fetching questions from Realtime Database...');
        const questionsRef = ref(rtdb, 'questions');
        const questionsSnapshot = await get(questionsRef);
        
        let questions: Question[] = [];
        
        if (questionsSnapshot.exists()) {
          questionsSnapshot.forEach((childSnapshot) => {
            questions.push({
              id: childSnapshot.key!,
              ...childSnapshot.val()
            });
          });
        }

        // If we don't have questions or authentication failed, create sample ones
        if (questions.length === 0) {
          setDebugInfo('No questions found. Creating sample questions...');
          // We'll use placeholder questions
          const sampleQuestions: Question[] = [
            {
              id: 'sample1',
              text: 'What is 2+2?',
              options: ['3', '4', '5', '6'],
              correctOptionIndex: 1,
              timeLimit: 30,
              points: 100,
              category: 'Math',
              difficulty: 'easy',
              createdAt: new Date(),
              updatedAt: new Date()
            },
            {
              id: 'sample2',
              text: 'What is the capital of France?',
              options: ['London', 'Berlin', 'Paris', 'Madrid'],
              correctOptionIndex: 2,
              timeLimit: 30,
              points: 100,
              category: 'Geography',
              difficulty: 'easy',
              createdAt: new Date(),
              updatedAt: new Date()
            }
          ];

          // Create a new game session
          setDebugInfo('Creating new game session with sample questions...');
          const gamesRef = ref(rtdb, 'games');
          const newGameRef = push(gamesRef);
          
          const gameSession: Omit<GameSession, 'id'> = {
            hostId: 'current-user-id',
            status: 'waiting',
            players: [],
            currentQuestionIndex: 0,
            questions: sampleQuestions,
            isPaused: false,
            timeRemaining: 30,
            createdAt: new Date(),
            updatedAt: new Date()
          };

          // Save the game session to the database
          setDebugInfo('Saving game session to database...');
          await set(newGameRef, gameSession);
          
          // Set the game ID to display the QR code
          setDebugInfo('Game created successfully with ID: ' + newGameRef.key);
          setGameId(newGameRef.key);
          return;
        }

        // If we have questions, use them
        setDebugInfo(`Found ${questions.length} questions.`);
        
        // Shuffle questions and take first 10
        const shuffledQuestions = [...questions]
          .sort(() => Math.random() - 0.5)
          .slice(0, Math.min(questions.length, 10));
        
        setDebugInfo(`Selected ${shuffledQuestions.length} questions for the game.`);

        // Create a new game session
        setDebugInfo('Creating new game session...');
        const gamesRef = ref(rtdb, 'games');
        const newGameRef = push(gamesRef);
        const gameId = newGameRef.key!;
        
        setDebugInfo(`Generated game ID: ${gameId}. Creating at path: games/${gameId}`);
        
        const gameSession: Omit<GameSession, 'id'> = {
          hostId: 'current-user-id', // Replace with actual user ID when auth is implemented
          status: 'waiting',
          players: [],
          currentQuestionIndex: 0,
          questions: shuffledQuestions,
          isPaused: false,
          timeRemaining: 30,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        // Save the game session to the database
        setDebugInfo(`Saving game session to database at path: games/${gameId}`);
        await set(newGameRef, gameSession);
        
        // Also log the URL that will be generated for the QR code
        const baseUrl = window.location.origin;
        const joinUrl = `${baseUrl}/join/${gameId}`;
        setDebugInfo(`Game created successfully! Join URL: ${joinUrl}`);
        
        // Set the game ID to display the QR code
        setGameId(gameId);
      } catch (err) {
        const error = err as Error;
        setDebugInfo(`Error fetching questions: ${error.message}`);
        throw new Error(`Error fetching questions: ${error.message}`);
      }
    } catch (err) {
      const error = err as Error;
      console.error('Error creating game:', err);
      setError(`Failed to create game: ${error.message}`);
      setDebugInfo(`Error creating game: ${error.message}`);
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