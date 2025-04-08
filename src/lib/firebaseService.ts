import { ref, set, get, push, update, remove, onValue, off, DataSnapshot } from 'firebase/database';
import { rtdb } from './firebase/firebase';
import { Team, Question, GameState, Answer } from '../types';

// Game state operations
export const gameService = {
  getGameState: async (): Promise<GameState> => {
    const snapshot = await get(ref(rtdb, 'games/current'));
    return snapshot.val() as GameState;
  },

  updateGameState: async (gameState: Partial<GameState>): Promise<void> => {
    await update(ref(rtdb, 'games/current'), gameState);
  },

  subscribeToGameState: (callback: (gameState: GameState) => void): (() => void) => {
    const gameStateRef = ref(rtdb, 'games/current');
    onValue(gameStateRef, (snapshot: DataSnapshot) => {
      callback(snapshot.val() as GameState);
    });
    return () => off(gameStateRef);
  }
};

// Team operations
export const teamService = {
  createTeam: async (team: Omit<Team, 'id'>): Promise<string> => {
    const teamsRef = ref(rtdb, 'teams');
    const newTeamRef = push(teamsRef);
    await set(newTeamRef, team);
    return newTeamRef.key!;
  },

  getTeam: async (teamId: string): Promise<Team | null> => {
    const snapshot = await get(ref(rtdb, `teams/${teamId}`));
    if (!snapshot.exists()) return null;
    return { id: teamId, ...snapshot.val() } as Team;
  },

  updateTeam: async (teamId: string, updates: Partial<Team>): Promise<void> => {
    await update(ref(rtdb, `teams/${teamId}`), updates);
  },

  deleteTeam: async (teamId: string): Promise<void> => {
    await remove(ref(rtdb, `teams/${teamId}`));
  },

  subscribeToTeams: (callback: (teams: Team[]) => void): (() => void) => {
    const teamsRef = ref(rtdb, 'teams');
    onValue(teamsRef, (snapshot: DataSnapshot) => {
      const teams: Team[] = [];
      snapshot.forEach((childSnapshot) => {
        teams.push({
          id: childSnapshot.key!,
          ...childSnapshot.val()
        });
      });
      callback(teams);
    });
    return () => off(teamsRef);
  }
};

// Question operations
export const questionService = {
  getQuestion: async (questionId: string): Promise<Question | null> => {
    const snapshot = await get(ref(rtdb, `questions/${questionId}`));
    if (!snapshot.exists()) return null;
    return { id: questionId, ...snapshot.val() } as Question;
  },

  submitAnswer: async (questionId: string, answer: Answer): Promise<void> => {
    const answersRef = ref(rtdb, `answers/${questionId}`);
    const newAnswerRef = push(answersRef);
    await set(newAnswerRef, answer);
  },

  getAnswers: async (questionId: string): Promise<Answer[]> => {
    const snapshot = await get(ref(rtdb, `answers/${questionId}`));
    if (!snapshot.exists()) return [];
    const answers: Answer[] = [];
    snapshot.forEach((childSnapshot) => {
      answers.push(childSnapshot.val());
    });
    return answers;
  },

  subscribeToQuestion: (questionId: string, callback: (question: Question | null) => void): (() => void) => {
    const questionRef = ref(rtdb, `questions/${questionId}`);
    onValue(questionRef, (snapshot: DataSnapshot) => {
      if (!snapshot.exists()) {
        callback(null);
        return;
      }
      callback({ id: questionId, ...snapshot.val() } as Question);
    });
    return () => off(questionRef);
  }
}; 