import { db } from '../../lib/firebase/firebase';
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore';
import { Question } from '../../types';

const QUESTIONS_COLLECTION = 'questions';

export async function createQuestion(question: Omit<Question, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, QUESTIONS_COLLECTION), {
    ...question,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return docRef.id;
}

export async function getQuestion(questionId: string): Promise<Question | null> {
  const docRef = doc(db, QUESTIONS_COLLECTION, questionId);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    return null;
  }

  return {
    id: docSnap.id,
    ...docSnap.data(),
  } as Question;
}

export async function getQuestionsByCategory(category: string): Promise<Question[]> {
  const q = query(
    collection(db, QUESTIONS_COLLECTION),
    where('category', '==', category),
    orderBy('difficulty', 'asc')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Question[];
}

export async function getQuestionsByDifficulty(difficulty: Question['difficulty']): Promise<Question[]> {
  const q = query(
    collection(db, QUESTIONS_COLLECTION),
    where('difficulty', '==', difficulty),
    orderBy('category', 'asc')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Question[];
}

export async function updateQuestion(questionId: string, updates: Partial<Question>): Promise<void> {
  const docRef = doc(db, QUESTIONS_COLLECTION, questionId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: new Date(),
  });
}

export async function deleteQuestion(questionId: string): Promise<void> {
  const docRef = doc(db, QUESTIONS_COLLECTION, questionId);
  await deleteDoc(docRef);
}

export async function getAllQuestions(): Promise<Question[]> {
  const querySnapshot = await getDocs(collection(db, QUESTIONS_COLLECTION));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Question[];
} 