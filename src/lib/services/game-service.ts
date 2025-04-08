import { db } from '../../lib/firebase/firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy,
  Timestamp,
  runTransaction
} from 'firebase/firestore';
import { GameState, Team, Question, Answer } from '../../types';

const GAMES_COLLECTION = 'games';
const TEAMS_COLLECTION = 'teams';
const QUESTIONS_COLLECTION = 'questions';
const ANSWERS_COLLECTION = 'answers';

export async function createGame(gameId: string, initialState: Partial<GameState>) {
  const gameRef = doc(db, GAMES_COLLECTION, gameId);
  await setDoc(gameRef, {
    ...initialState,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
}

export async function getGameState(gameId: string): Promise<GameState | null> {
  const gameRef = doc(db, GAMES_COLLECTION, gameId);
  const gameDoc = await getDoc(gameRef);
  return gameDoc.exists() ? gameDoc.data() as GameState : null;
}

export async function updateGameState(gameId: string, updates: Partial<GameState>) {
  const gameRef = doc(db, GAMES_COLLECTION, gameId);
  await updateDoc(gameRef, {
    ...updates,
    updatedAt: Timestamp.now(),
  });
}

export async function createTeam(gameId: string, team: Omit<Team, 'id'>) {
  const teamRef = doc(collection(db, `${GAMES_COLLECTION}/${gameId}/${TEAMS_COLLECTION}`));
  await setDoc(teamRef, {
    ...team,
    createdAt: Timestamp.now(),
  });
  return teamRef.id;
}

export async function getTeams(gameId: string): Promise<Team[]> {
  const teamsQuery = query(
    collection(db, `${GAMES_COLLECTION}/${gameId}/${TEAMS_COLLECTION}`),
    orderBy('tableNumber')
  );
  const teamsSnapshot = await getDocs(teamsQuery);
  return teamsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Team));
}

export async function submitAnswer(gameId: string, answer: Omit<Answer, 'id'>) {
  const answerRef = doc(collection(db, `${GAMES_COLLECTION}/${gameId}/${ANSWERS_COLLECTION}`));
  await setDoc(answerRef, {
    ...answer,
    timestamp: Timestamp.now(),
  });
  return answerRef.id;
}

export async function getAnswers(gameId: string, questionId: string): Promise<Answer[]> {
  const answersQuery = query(
    collection(db, `${GAMES_COLLECTION}/${gameId}/${ANSWERS_COLLECTION}`),
    where('questionId', '==', questionId),
    orderBy('timestamp')
  );
  const answersSnapshot = await getDocs(answersQuery);
  return answersSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Answer));
}

export async function updateTeamScore(gameId: string, teamId: string, score: number) {
  await runTransaction(db, async (transaction) => {
    const teamRef = doc(db, `${GAMES_COLLECTION}/${gameId}/${TEAMS_COLLECTION}/${teamId}`);
    const teamDoc = await transaction.get(teamRef);
    
    if (!teamDoc.exists()) {
      throw new Error('Team not found');
    }

    transaction.update(teamRef, {
      score: score,
      updatedAt: Timestamp.now(),
    });
  });
} 