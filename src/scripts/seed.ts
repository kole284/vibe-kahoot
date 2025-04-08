import { seedQuestions } from '../lib/firebase/seed-data';

async function main() {
  console.log('Starting database seeding...');
  
  try {
    // Seed questions
    await seedQuestions();
    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
}

main(); 