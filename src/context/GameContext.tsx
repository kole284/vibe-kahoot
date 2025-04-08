import { createContext, useContext, useEffect, useState } from 'react';
import { ref, onValue, set, push, get } from 'firebase/database';
import { rtdb } from '../lib/firebase/firebase';
import { GameContextType, Team, Question, GameState, Answer } from '../types';

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [gameState, setGameState] = useState<GameState>({
    id: 'current', // Assuming a single game session for simplicity
    status: 'waiting',
    currentQuestionIndex: 0, // Use currentQuestionIndex
    currentRound: 1, // Add default values based on GameState type
    totalRounds: 3, // Add default values based on GameState type
    questionsPerRound: 5, // Add default values based on GameState type
    timePerQuestion: 30, // Add default values based on GameState type
    createdAt: new Date(), // Add default values based on GameState type
    updatedAt: new Date(), // Add default values based on GameState type
  });
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    // Subscribe to game state changes
    const gameStateRef = ref(rtdb, 'games/current');
    const unsubscribeGameState = onValue(gameStateRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Ensure dates are converted if stored as strings/timestamps
        setGameState({ 
          ...data,
          createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
          updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date()
        });
      }
    });

    // Subscribe to teams changes
    const teamsRef = ref(rtdb, 'teams');
    const unsubscribeTeams = onValue(teamsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const teamsArray = Object.entries(data).map(([id, teamData]: [string, any]) => ({
          id,
          ...teamData,
          // Ensure dates are converted if stored as strings/timestamps
          createdAt: teamData.createdAt ? new Date(teamData.createdAt) : new Date(),
          updatedAt: teamData.updatedAt ? new Date(teamData.updatedAt) : new Date()
        } as Team)); // Cast to Team
        setTeams(teamsArray);
      }
    });

    return () => {
      unsubscribeGameState();
      unsubscribeTeams();
    };
  }, []);

  useEffect(() => {
    if (gameState.currentQuestionIndex >= 0) { // Check currentQuestionIndex
      // Fetch current question based on index (assuming questions are stored in an array or object)
      // This logic might need adjustment based on your actual question data structure
      const questionRef = ref(rtdb, `questions/${gameState.currentQuestionIndex}`); // Adjust path if needed
      const unsubscribeQuestion = onValue(questionRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setCurrentQuestion({ 
            id: snapshot.key!, 
            ...data, 
            // Ensure dates are converted if stored as strings/timestamps
            createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
            updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date()
          } as Question); // Cast to Question
        } else {
          setCurrentQuestion(null); // Question not found
        }
      });

      return () => {
        unsubscribeQuestion();
      };
    }
  }, [gameState.currentQuestionIndex]);

  // Use joinGame to match GameContextType
  const joinGame = async (teamName: string, tableNumber: number): Promise<void> => {
    const teamsRef = ref(rtdb, 'teams');
    const newTeamRef = push(teamsRef);
    const newTeamData = {
      name: teamName,
      tableNumber,
      score: 0,
      members: [], // Add default empty members array
      createdAt: new Date().toISOString(), // Store dates as ISO strings
      updatedAt: new Date().toISOString() // Store dates as ISO strings
    };
    await set(newTeamRef, newTeamData);
    // No return value needed as per GameContextType
  };

  // Update submitAnswer signature to match GameContextType
  const submitAnswer = async (answer: string): Promise<void> => {
    // This function needs context: which team is answering? which question?
    // The current signature in GameContextType seems insufficient.
    // Assuming we need teamId and questionId:
    // const submitAnswer = async (teamId: string, questionId: string, answerIndex: number): Promise<void> => {
    console.warn("submitAnswer needs implementation based on actual requirements (teamId, questionId?)");
    // Example placeholder logic (needs refinement):
    // const answerRef = ref(rtdb, `teams/${currentTeamId}/answers/${currentQuestion?.id}`);
    // await set(answerRef, {
    //   answer: answer, // Assuming answer is the selectedOption index or value
    //   timestamp: new Date().toISOString()
    // });
  };

  // Update startGame signature to match GameContextType
  const startGame = async (): Promise<void> => {
    const gameStateRef = ref(rtdb, 'games/current');
    await set(gameStateRef, {
      ...gameState,
      status: 'playing', // Use 'playing' based on GameState type
      currentQuestionIndex: 0, // Start from the first question
      updatedAt: new Date().toISOString() // Update timestamp
    });
  };

  // Update nextQuestion signature to match GameContextType
  const nextQuestion = async (): Promise<void> => {
    // Logic to determine the next question index
    // Needs to consider rounds, questions per round etc.
    const nextIndex = gameState.currentQuestionIndex + 1; // Simple increment for now
    // Add logic here to check if the game/round ends

    const gameStateRef = ref(rtdb, 'games/current');
    await set(gameStateRef, {
      ...gameState,
      currentQuestionIndex: nextIndex,
      updatedAt: new Date().toISOString() // Update timestamp
    });
  };

  // --- Removed showLeaderboard and endGame as they are not in GameContextType --- 
  // const showLeaderboard = () => { ... };
  // const endGame = () => { ... };

  const value: GameContextType = {
    gameState,
    currentQuestion,
    teams,
    joinGame, // Use joinGame
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