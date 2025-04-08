// JavaScript wrapper za pokretanje TypeScript skripte
import { execSync } from 'child_process';

try {
  console.log('Starting database seeding...');
  execSync('npx ts-node --esm src/lib/firebase/seed-data.ts', { stdio: 'inherit' });
  console.log('Seeding completed successfully!');
} catch (error) {
  console.error('Error during seeding:', error);
  process.exit(1);
} 