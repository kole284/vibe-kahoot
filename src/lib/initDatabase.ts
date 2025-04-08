import { ref, set, get } from 'firebase/database';
import { rtdb } from './firebase/firebase';

// Sample questions for initialization
const sampleQuestions = [
  {
    id: '1',
    text: 'What is the capital of France?',
    options: ['London', 'Berlin', 'Paris', 'Madrid'],
    correctAnswer: 'C'
  },
  {
    id: '2',
    text: 'Which planet is known as the Red Planet?',
    options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
    correctAnswer: 'B'
  },
  {
    id: '3',
    text: 'What is the largest mammal in the world?',
    options: ['African Elephant', 'Blue Whale', 'Giraffe', 'Hippopotamus'],
    correctAnswer: 'B'
  },
  {
    id: '4',
    text: 'Who painted the Mona Lisa?',
    options: ['Vincent van Gogh', 'Pablo Picasso', 'Leonardo da Vinci', 'Michelangelo'],
    correctAnswer: 'C'
  },
  {
    id: '5',
    text: 'What is the chemical symbol for gold?',
    options: ['Ag', 'Fe', 'Au', 'Cu'],
    correctAnswer: 'C'
  }
];

/**
 * Initialize the database with the required structure
 */
export async function initializeDatabase() {
  try {
    // Check if database is already initialized
    const gamesRef = ref(rtdb, 'games/current');
    const gamesSnapshot = await get(gamesRef);
    
    if (gamesSnapshot.exists()) {
      console.log('Database already initialized');
      return;
    }

    // Initialize game state
    await set(ref(rtdb, 'games/current'), {
      status: 'waiting',
      currentQuestion: 1,
      phase: 'question'
    });

    // Initialize questions
    for (const question of sampleQuestions) {
      await set(ref(rtdb, `questions/${question.id}`), {
        text: question.text,
        options: question.options,
        correctAnswer: question.correctAnswer
      });
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

/**
 * Reset the database to its initial state
 */
export async function resetDatabase() {
  try {
    // Reset game state
    await set(ref(rtdb, 'games/current'), {
      status: 'waiting',
      currentQuestion: 1,
      phase: 'question'
    });

    // Clear teams
    await set(ref(rtdb, 'teams'), {});

    // Clear answers
    await set(ref(rtdb, 'answers'), {});

    console.log('Database reset successfully');
  } catch (error) {
    console.error('Error resetting database:', error);
  }
} 