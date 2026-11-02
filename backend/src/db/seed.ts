import { initDatabase, seedDatabase, db } from './index.js';

async function main() {
  console.log('Seeding LankaLocate database...');
  await initDatabase();
  await seedDatabase();
  console.log('Seeding completed successfully.');
  await db.close();
  process.exit(0);
}

main().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
