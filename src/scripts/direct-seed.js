// Direct JavaScript seed script
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, push } from 'firebase/database';
import { getAuth, signInAnonymously } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBS5gnw4eO8jqAaCW5cNeVTjhUFMXQC140",
  authDomain: "kahoot-clone-b8034.firebaseapp.com",
  databaseURL: "https://kahoot-clone-b8034-default-rtdb.firebaseio.com",
  projectId: "kahoot-clone-b8034",
  storageBucket: "kahoot-clone-b8034.firebasestorage.app",
  messagingSenderId: "486709016032",
  appId: "1:486709016032:web:699b6739bab04f22782785",
  measurementId: "G-JQVLMKD96K"
};

// Questions to seed
const questions = [
  {
    text: "What is the capital of France?",
    category: "Geography",
    difficulty: "easy",
    options: ["London", "Berlin", "Paris", "Madrid"],
    correctOptionIndex: 2,
    timeLimit: 30,
    points: 100,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    text: "Which planet is known as the Red Planet?",
    category: "Science",
    difficulty: "easy",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    correctOptionIndex: 1,
    timeLimit: 30,
    points: 100,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    text: "What is the largest mammal in the world?",
    category: "Science",
    difficulty: "medium",
    options: ["African Elephant", "Blue Whale", "Giraffe", "Hippopotamus"],
    correctOptionIndex: 1,
    timeLimit: 30,
    points: 200,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    text: "Who painted the Mona Lisa?",
    category: "Art",
    difficulty: "medium",
    options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Michelangelo"],
    correctOptionIndex: 2,
    timeLimit: 30,
    points: 200,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    text: "What is the chemical symbol for gold?",
    category: "Science",
    difficulty: "easy",
    options: ["Ag", "Fe", "Au", "Cu"],
    correctOptionIndex: 2,
    timeLimit: 30,
    points: 100,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    text: "Which country has the largest population?",
    category: "Geography",
    difficulty: "medium",
    options: ["India", "China", "United States", "Indonesia"],
    correctOptionIndex: 0,
    timeLimit: 30,
    points: 200,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    text: "What is the speed of light?",
    category: "Science",
    difficulty: "hard",
    options: ["299,792 km/s", "300,000 km/s", "310,000 km/s", "290,000 km/s"],
    correctOptionIndex: 0,
    timeLimit: 30,
    points: 300,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    text: "Who wrote 'Romeo and Juliet'?",
    category: "Literature",
    difficulty: "easy",
    options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"],
    correctOptionIndex: 1,
    timeLimit: 30,
    points: 100,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    text: "What is the largest organ in the human body?",
    category: "Science",
    difficulty: "medium",
    options: ["Heart", "Brain", "Liver", "Skin"],
    correctOptionIndex: 3,
    timeLimit: 30,
    points: 200,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    text: "Which element has the chemical symbol 'O'?",
    category: "Science",
    difficulty: "easy",
    options: ["Gold", "Silver", "Oxygen", "Iron"],
    correctOptionIndex: 2,
    timeLimit: 30,
    points: 100,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

async function seedQuestions() {
  console.log('Starting database seeding...');
  
  try {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getDatabase(app);
    const auth = getAuth(app);
    
    // Sign in anonymously first
    console.log('Authenticating anonymously...');
    await signInAnonymously(auth);
    console.log('Authenticated successfully!');
    
    const questionsRef = ref(db, 'questions');
    
    // First, clear existing questions
    console.log('Clearing existing questions...');
    await set(questionsRef, null);
    
    // Then, add new questions with correct structure
    console.log('Adding new questions...');
    for (const question of questions) {
      const newQuestionRef = push(questionsRef);
      await set(newQuestionRef, question);
    }
    
    console.log('Questions seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding questions:', error);
    process.exit(1);
  }
}

// Run the seed function
seedQuestions(); 