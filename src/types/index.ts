export interface Team {
  id: string;
  name: string;
  tableNumber: number;
  score: number;
  members: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctOptionIndex: number;
  timeLimit: number;
  points: number;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  createdAt: Date;
  updatedAt: Date;
}

export interface GameState {
  session: GameSession | null;
  currentPlayer: Player | null;
  isLoading: boolean;
  error: string | null;
}

export interface Answer {
  id: string;
  questionId: string;
  teamId: string;
  selectedOption: number;
  isCorrect: boolean;
  points: number;
  timestamp: Date;
}

export interface GameSettings {
  totalRounds: number;
  questionsPerRound: number;
  timePerQuestion: number;
  pointsPerCorrectAnswer: number;
  bonusPoints: number;
  maxTeams: number;
}

export interface GameContextType {
  gameState: GameState;
  currentQuestion: Question | null;
  teams: Team[];
  joinGame: (teamName: string, tableNumber: number) => Promise<void>;
  submitAnswer: (answer: string) => Promise<void>;
  startGame: () => Promise<void>;
  nextQuestion: () => Promise<void>;
  checkAllPlayersAnswered: () => void;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  questions: Question[];
  isPublic: boolean;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface QuizResult {
  id: string;
  quizId: string;
  userId: string;
  score: number;
  totalQuestions: number;
  completedAt: Date;
  answers: {
    questionId: string;
    selectedAnswer: number;
    isCorrect: boolean;
  }[];
}

export interface GameSession {
  id: string;
  hostId: string;
  status: 'waiting' | 'playing' | 'finished';
  players: Record<string, Player>;
  questions: Question[][]; // Array of categories, each containing an array of questions
  categories?: string[]; // Added back categories array
  currentCategory: number;
  currentQuestionIndex: number;
  currentRound: number;
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  endedAt?: Date;
  isPaused?: boolean;
  showLeaderboard?: boolean;
  roundCompleted?: boolean;
  allPlayersAnswered?: boolean;
  showingCorrectAnswer?: boolean;
  timeRemaining?: number; // Added for syncing timer
  settings: {
    timeLimit: number; // Time limit per question in seconds
    maxPlayers: number;
  };
}

export interface Player {
  id: string;
  name: string;
  score: number;
  isReady: boolean;
  lastAnswer?: {
    questionId: string;
    selectedOptionIndex: number;
    timeSpent: number;
    isCorrect: boolean;
  };
}

export interface PlayerAnswer {
  questionId: string;
  selectedOption: number;
  isCorrect: boolean;
  timeSpent: number; // in milliseconds
  points: number;
} 