import { db, rtdb } from '../firebase/firebase';
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit, startAfter, DocumentSnapshot, Timestamp, increment as firestoreIncrement, serverTimestamp } from 'firebase/firestore';
import type { Quiz, Question, GameSession, Player, User } from '../../types';
import { ref, set, get, update, push } from 'firebase/database';

// Collection references
const usersCollection = collection(db, 'users');
const quizzesCollection = collection(db, 'quizzes');
const gameSessionsCollection = collection(db, 'gameSessions');

// User services
export async function getUser(userId: string): Promise<User | null> {
  const userDoc = await getDoc(doc(usersCollection, userId));
  return userDoc.exists() ? userDoc.data() as User : null;
}

// Quiz services
export async function getQuiz(quizId: string): Promise<Quiz | null> {
  const quizDoc = await getDoc(doc(quizzesCollection, quizId));
  return quizDoc.exists() ? quizDoc.data() as Quiz : null;
}

export async function getPublicQuizzes(limitCount: number = 10, lastDoc?: DocumentSnapshot): Promise<{ quizzes: Quiz[], lastDoc: DocumentSnapshot | null }> {
  let q = query(
    quizzesCollection,
    where('isPublic', '==', true),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );

  if (lastDoc) {
    q = query(q, startAfter(lastDoc));
  }

  const snapshot = await getDocs(q);
  const quizzes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Quiz));
  const lastVisible = snapshot.docs[snapshot.docs.length - 1] || null;

  return { quizzes, lastDoc: lastVisible };
}

export async function createQuiz(quiz: Omit<Quiz, 'id'>): Promise<string> {
  const docRef = await addDoc(quizzesCollection, {
    ...quiz,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  return docRef.id;
}

// Game session services
export async function createGameSession(hostId: string, questions: Question[]): Promise<string> {
  const gameRef = ref(rtdb, 'games');
  const newGameRef = push(gameRef);
  
  const gameSession: GameSession = {
    id: newGameRef.key!,
    hostId,
    status: 'waiting',
    players: [],
    currentQuestionIndex: 0,
    questions,
    isPaused: false,
    timeRemaining: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await set(newGameRef, gameSession);
  return newGameRef.key!;
}

export async function getGameSession(sessionId: string): Promise<GameSession | null> {
  const gameRef = ref(rtdb, `games/${sessionId}`);
  const snapshot = await get(gameRef);
  return snapshot.val();
}

export async function updateGameSession(sessionId: string, updates: Partial<GameSession>): Promise<void> {
  const gameRef = ref(rtdb, `games/${sessionId}`);
  await update(gameRef, {
    ...updates,
    updatedAt: new Date(),
  });
}

export async function addPlayerToSession(sessionId: string, player: Player): Promise<void> {
  const sessionRef = doc(db, 'gameSessions', sessionId);
  const playerRef = ref(rtdb, `sessions/${sessionId}/players/${player.id}`);

  // Update Firestore
  await updateDoc(sessionRef, {
    players: firestoreIncrement(1),
    lastUpdated: serverTimestamp()
  });

  // Update Realtime Database
  await set(playerRef, {
    ...player,
    joinedAt: serverTimestamp()
  });
}

export async function updatePlayerAnswer(
  sessionId: string,
  playerId: string,
  questionId: string,
  selectedOptionIndex: number,
  timeSpent: number,
  isCorrect: boolean
): Promise<void> {
  const gameRef = ref(rtdb, `games/${sessionId}`);
  const snapshot = await get(gameRef);
  const game = snapshot.val() as GameSession;
  
  if (!game) throw new Error('Game session not found');
  
  const updatedPlayers = game.players.map(player => {
    if (player.id === playerId) {
      return {
        ...player,
        score: player.score + (isCorrect ? 100 : 0),
        lastAnswer: {
          questionId,
          selectedOptionIndex,
          timeSpent,
          isCorrect,
        },
      };
    }
    return player;
  });

  await update(gameRef, {
    players: updatedPlayers,
    updatedAt: new Date(),
  });
}

export async function startGame(sessionId: string): Promise<void> {
  const gameRef = ref(rtdb, `games/${sessionId}`);
  await update(gameRef, {
    status: 'playing',
    currentQuestionIndex: 0,
    timeRemaining: 30, // Default time for first question
    updatedAt: new Date(),
  });
}

export async function endGame(sessionId: string): Promise<void> {
  const gameRef = ref(rtdb, `games/${sessionId}`);
  await update(gameRef, {
    status: 'finished',
    updatedAt: new Date(),
  });
}

export async function submitAnswer(sessionId: string, playerId: string, answer: {
  questionId: string;
  selectedOption: number;
  isCorrect: boolean;
  points: number;
}) {
  const sessionRef = doc(gameSessionsCollection, sessionId);
  const sessionDoc = await getDoc(sessionRef);
  
  if (!sessionDoc.exists()) {
    throw new Error('Session not found');
  }

  const sessionData = sessionDoc.data();
  const players = sessionData.players || [];
  const playerIndex = players.findIndex((p: Player) => p.id === playerId);
  
  if (playerIndex === -1) {
    throw new Error('Player not found in session');
  }

  const player = players[playerIndex];
  const updatedPlayer = {
    ...player,
    answers: [...player.answers, { ...answer, timestamp: new Date() }],
    score: player.score + answer.points
  };

  players[playerIndex] = updatedPlayer;

  await updateDoc(sessionRef, {
    players,
    updatedAt: new Date()
  });
} 