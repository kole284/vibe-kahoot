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
        if (gameData.questions && gameData.currentCategory >= 0 && gameData.currentQuestionIndex >= 0) {
          // Get questions for current category
          const categoryQuestions = gameData.questions[gameData.currentCategory];
          
          if (categoryQuestions && categoryQuestions.length > gameData.currentQuestionIndex) {
            const currentQ = categoryQuestions[gameData.currentQuestionIndex];
            console.log('Current question:', currentQ);
            setCurrentQuestion(currentQ);
          } else {
            console.log('No question found at index', gameData.currentQuestionIndex, 'in category', gameData.currentCategory);
            setCurrentQuestion(null);
          }
        } else {
          console.log('No questions available in game data or invalid indices');
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

  // Load current question when game session changes
  useEffect(() => {
    if (!gameState.session) {
      setCurrentQuestion(null);
      return;
    }

    const { currentQuestionIndex, currentCategory } = gameState.session;
    
    // Make sure questions for the current category exist
    if (!gameState.session.questions?.[currentCategory]) {
      setCurrentQuestion(null);
      return;
    }
    
    // Get current question from the correct category
    const question = gameState.session.questions[currentCategory][currentQuestionIndex];
    
    // Only set the question if it exists
    if (question) {
      setCurrentQuestion(question);
    } else {
      setCurrentQuestion(null);
    }
  }, [gameState.session]);

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

  // Submit answer function
  const submitAnswer = async (answer: string): Promise<void> => {
    if (!gameId || !playerId || !currentQuestion || !gameState.session) {
      throw new Error('Missing required data for submitting answer');
    }
    
    try {
      // Convert answer to index (A=0, B=1, etc)
      const answerIndex = answer.charCodeAt(0) - 65;
      
      // Check if answer is correct
      const isCorrect = answerIndex === currentQuestion.correctOptionIndex;
      
      // Calculate points based on correctness
      const points = isCorrect ? currentQuestion.points : 0;
      
      // Update player's answer in the database
      const playerRef = ref(rtdb, `games/${gameId}/players/${playerId}`);
      const playerData = await get(playerRef);
      
      if (!playerData.exists()) {
        throw new Error('Player not found');
      }
      
      // Update player's score and store their answer
      await update(playerRef, {
        score: (playerData.val().score || 0) + points,
        lastAnswer: {
          questionId: currentQuestion.id,
          selectedOptionIndex: answerIndex,
          timeSpent: 30 - (gameState.session.timeRemaining || 0), // Calculate time spent
          isCorrect: isCorrect
        }
      });
      
      return;
    } catch (error) {
      console.error('Error submitting answer:', error);
      throw error;
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
    const currentCategory = gameState.session.currentCategory || 0;
    const currentRound = gameState.session.currentRound || 0;
    const gameRef = ref(rtdb, `games/${gameId}`);
    
    // Reset showing correct answer flag
    await update(gameRef, {
      showingCorrectAnswer: false,
      allPlayersAnswered: false
    });
    
    // Check if we've completed all questions in this round
    if (currentIndex >= 7) { // 0-based index, so 7 means 8 questions
      // Show leaderboard between rounds
      await update(gameRef, {
        showLeaderboard: true,
        roundCompleted: true,
        currentRound: currentRound + 1,
        updatedAt: new Date().toISOString()
      });
      return;
    }
    
    // If we're showing the leaderboard and ready for next category
    if (gameState.session.showLeaderboard) {
      // Move to next category or end game if all categories are completed
      if (currentCategory >= 5) { // 0-based index, so 5 means 6 categories
        // End game after all categories
        await update(gameRef, {
          status: 'finished',
          showLeaderboard: false,
          endedAt: new Date().toISOString()
        });
        return;
      } else {
        // Move to next category
        await update(gameRef, {
          currentCategory: currentCategory + 1,
          currentQuestionIndex: 0,
          showLeaderboard: false,
          timeRemaining: 30,
          updatedAt: new Date().toISOString()
        });
        return;
      }
    }
    
    // Otherwise, just move to next question in current round
    await update(gameRef, {
      currentQuestionIndex: currentIndex + 1,
      timeRemaining: 30,
      updatedAt: new Date().toISOString()
    });
  };

  // Check if all players have answered the current question
  const checkAllPlayersAnswered = async (): Promise<void> => {
    if (!gameId || !gameState.session) return;

    try {
      const players = gameState.session.players;
      if (!players) return;
      
      const currentQuestionId = gameState.session.questions?.[gameState.session.currentCategory]?.[gameState.session.currentQuestionIndex]?.id;
      if (!currentQuestionId) return;

      const playersArray = Object.values(players) as Player[];
      if (playersArray.length === 0) {
        return;
      }

      const allAnswered = playersArray.every(player => 
        player.lastAnswer && player.lastAnswer.questionId === currentQuestionId
      );

      // If all players have answered and it's not already reflected in the session state
      if (allAnswered && !gameState.session.allPlayersAnswered) {
        console.log("All players have answered. Updating Firebase state.");
        const gameRef = ref(rtdb, `games/${gameId}`);
        await update(gameRef, {
          allPlayersAnswered: true,
        });
        console.log("Firebase state updated: allPlayersAnswered=true");
      }
    } catch (error) {
      console.error("Error checking player answers:", error);
    }
  };

  const value: GameContextType = {
    gameState,
    currentQuestion,
    teams,
    joinGame,
    submitAnswer,
    startGame,
    nextQuestion,
    checkAllPlayersAnswered
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