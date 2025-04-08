import { Question } from '../../types';
import { ref, set, push } from 'firebase/database';
import { rtdb, auth } from './firebase';
import { signInAnonymously } from 'firebase/auth';

const randomQuestions: Omit<Question, 'id'>[] = [
  {
    text: "What is the capital of France?",
    category: "Geography",
    difficulty: "easy",
    options: ["London", "Berlin", "Paris", "Madrid"],
    correctAnswer: 2,
    explanation: "Paris is the capital city of France.",
    timeLimit: 30,
    points: 100,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    text: "Which planet is known as the Red Planet?",
    category: "Science",
    difficulty: "easy",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    correctAnswer: 1,
    explanation: "Mars is called the Red Planet due to its reddish appearance.",
    timeLimit: 30,
    points: 100,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    text: "What is the largest mammal in the world?",
    category: "Science",
    difficulty: "medium",
    options: ["African Elephant", "Blue Whale", "Giraffe", "Hippopotamus"],
    correctAnswer: 1,
    explanation: "The Blue Whale is the largest mammal, reaching lengths of up to 100 feet.",
    timeLimit: 30,
    points: 200,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    text: "Who painted the Mona Lisa?",
    category: "Art",
    difficulty: "medium",
    options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Michelangelo"],
    correctAnswer: 2,
    explanation: "Leonardo da Vinci painted the Mona Lisa between 1503 and 1519.",
    timeLimit: 30,
    points: 200,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    text: "What is the chemical symbol for gold?",
    category: "Science",
    difficulty: "easy",
    options: ["Ag", "Fe", "Au", "Cu"],
    correctAnswer: 2,
    explanation: "Au is the chemical symbol for gold, from the Latin word 'aurum'.",
    timeLimit: 30,
    points: 100,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    text: "Which country has the largest population?",
    category: "Geography",
    difficulty: "medium",
    options: ["India", "China", "United States", "Indonesia"],
    correctAnswer: 0,
    explanation: "India has the largest population, surpassing China in 2023.",
    timeLimit: 30,
    points: 200,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    text: "What is the speed of light?",
    category: "Science",
    difficulty: "hard",
    options: ["299,792 km/s", "300,000 km/s", "310,000 km/s", "290,000 km/s"],
    correctAnswer: 0,
    explanation: "The speed of light in a vacuum is approximately 299,792 kilometers per second.",
    timeLimit: 30,
    points: 300,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    text: "Who wrote 'Romeo and Juliet'?",
    category: "Literature",
    difficulty: "easy",
    options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"],
    correctAnswer: 1,
    explanation: "William Shakespeare wrote the famous play 'Romeo and Juliet'.",
    timeLimit: 30,
    points: 100,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    text: "What is the largest organ in the human body?",
    category: "Science",
    difficulty: "medium",
    options: ["Heart", "Brain", "Liver", "Skin"],
    correctAnswer: 3,
    explanation: "The skin is the largest organ in the human body, covering about 20 square feet in adults.",
    timeLimit: 30,
    points: 200,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    text: "Which element has the chemical symbol 'O'?",
    category: "Science",
    difficulty: "easy",
    options: ["Gold", "Silver", "Oxygen", "Iron"],
    correctAnswer: 2,
    explanation: "O is the chemical symbol for Oxygen.",
    timeLimit: 30,
    points: 100,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export async function seedQuestions() {
  try {
    // Sign in anonymously first
    await signInAnonymously(auth);
    
    const questionsRef = ref(rtdb, 'questions');
    
    for (const question of randomQuestions) {
      const newQuestionRef = push(questionsRef);
      await set(newQuestionRef, question);
    }
    
    console.log('Questions seeded successfully!');
  } catch (error) {
    console.error('Error seeding questions:', error);
    throw error;
  }
} 