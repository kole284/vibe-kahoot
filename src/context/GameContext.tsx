import { createContext, useContext, useEffect, useState } from 'react';
import { ref, onValue, set, push, get, update } from 'firebase/database';
import { rtdb } from '../lib/firebase/firebase';
import { GameContextType, Team, Question, GameState, Answer, GameSession, Player } from '../types';
import { useSearchParams } from 'react-router-dom';

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [searchParams] = useSearchParams();
  const gameId = searchParams.get('gameId');
  const playerId = searchParams.get('playerId');

  const [gameState, setGameState] = useState<GameState>({
    session: null,
    currentPlayer: null,
    isLoading: true,
    error: null
  });
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);

  // Load game session data when gameId is available
  useEffect(() => {
    if (!gameId) return;

    console.log('Loading game with ID:', gameId);
    
    // Subscribe to game session changes
    const gameRef = ref(rtdb, `games/${gameId}`);
    const unsubscribeGame = onValue(gameRef, (snapshot) => {
      if (snapshot.exists()) {
        const gameData = snapshot.val() as GameSession;
        console.log('Game data loaded:', gameData);
        
        // Update game state
        setGameState(prevState => ({
          ...prevState,
          session: {
            ...gameData,
            id: gameId,
            createdAt: gameData.createdAt ? new Date(gameData.createdAt) : new Date(),
            updatedAt: gameData.updatedAt ? new Date(gameData.updatedAt) : new Date()
          },
          isLoading: false
        }));

        // Load current question from the game's questions array
        if (gameData.questions && gameData.questions.length > 0 && gameData.currentQuestionIndex >= 0) {
          const currentQ = gameData.questions[gameData.currentQuestionIndex];
          if (currentQ) {
            console.log('Current question:', currentQ);
            setCurrentQuestion(currentQ);
          } else {
            console.log('No question found at index', gameData.currentQuestionIndex);
            setCurrentQuestion(null);
          }
        } else {
          console.log('No questions available in game data');
          setCurrentQuestion(null);
        }
      } else {
        console.log('Game not found with ID:', gameId);
        setGameState(prevState => ({
          ...prevState,
          error: 'Game not found',
          isLoading: false
        }));
      }
    });

    return () => {
      unsubscribeGame();
    };
  }, [gameId]);

  // Load player data when gameId and playerId are available
  useEffect(() => {
    if (!gameId || !playerId) return;

    console.log('Loading player with ID:', playerId);
    
    // Subscribe to player changes
    const playerRef = ref(rtdb, `games/${gameId}/players/${playerId}`);
    const unsubscribePlayer = onValue(playerRef, (snapshot) => {
      if (snapshot.exists()) {
        const playerData = snapshot.val() as Player;
        console.log('Player data loaded:', playerData);
        
        // Update player in game state
        setGameState(prevState => ({
          ...prevState,
          currentPlayer: {
            ...playerData,
            id: playerId
          }
        }));
      } else {
        console.log('Player not found with ID:', playerId);
        setGameState(prevState => ({
          ...prevState,
          error: 'Player not found'
        }));
      }
    });

    return () => {
      unsubscribePlayer();
    };
  }, [gameId, playerId]);

  // Join Game function for players to join a game
  const joinGame = async (teamName: string, tableNumber: number): Promise<void> => {
    if (!gameId) throw new Error('Game ID is required');
    
    const teamsRef = ref(rtdb, `games/${gameId}/teams`);
    const newTeamRef = push(teamsRef);
    const newTeamData = {
      name: teamName,
      tableNumber,
      score: 0,
      members: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await set(newTeamRef, newTeamData);
  };

  // Submit answer for a question
  const submitAnswer = async (answer: string): Promise<void> => {
    if (!gameId || !playerId || !currentQuestion) {
      console.error('Missing required data for submitting answer');
      return;
    }
    
    try {
      console.log(`Submitting answer ${answer} for player ${playerId}`);
      
      // Get current question from game session
      const gameRef = ref(rtdb, `games/${gameId}`);
      const gameSnapshot = await get(gameRef);
      
      if (!gameSnapshot.exists()) {
        console.error('Game not found');
        return;
      }
      
      const gameData = gameSnapshot.val() as GameSession;
      const currentIndex = gameData.currentQuestionIndex;
      const currentQ = gameData.questions[currentIndex];
      
      if (!currentQ) {
        console.error('Current question not found');
        return;
      }
      
      // Calculate if answer is correct (convert A, B, C, D to 0, 1, 2, 3)
      const answerIndex = answer.charCodeAt(0) - 'A'.charCodeAt(0);
      const isCorrect = answerIndex === currentQ.correctOptionIndex;
      const points = isCorrect ? currentQ.points : 0;
      
      // Update player's score and answer
      const playerRef = ref(rtdb, `games/${gameId}/players/${playerId}`);
      const playerData = gameState.currentPlayer;
      
      if (playerData) {
        const newScore = (playerData.score || 0) + points;
        await update(playerRef, {
          score: newScore,
          lastAnswer: {
            questionId: currentQ.id,
            selectedOptionIndex: answerIndex,
            timeSpent: 0, // Could calculate based on when question was shown
            isCorrect: isCorrect
          }
        });
        
        console.log(`Answer submitted successfully. Correct: ${isCorrect}, Points: ${points}`);
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };

  // Start game function
  const startGame = async (): Promise<void> => {
    if (!gameId) throw new Error('Game ID is required');
    
    const gameRef = ref(rtdb, `games/${gameId}`);
    await update(gameRef, {
      status: 'playing',
      startedAt: new Date().toISOString(),
      isPaused: false,
      timeRemaining: 30,
      currentQuestionIndex: 0
    });
  };

  // Move to next question
  const nextQuestion = async (): Promise<void> => {
    if (!gameId || !gameState.session) throw new Error('Game session is required');
    
    const currentIndex = gameState.session.currentQuestionIndex;
    const gameRef = ref(rtdb, `games/${gameId}`);
    
    await update(gameRef, {
      currentQuestionIndex: currentIndex + 1,
      timeRemaining: 30,
      updatedAt: new Date().toISOString()
    });
  };

  const value: GameContextType = {
    gameState,
    currentQuestion,
    teams,
    joinGame,
    submitAnswer,
    startGame,
    nextQuestion
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}; 