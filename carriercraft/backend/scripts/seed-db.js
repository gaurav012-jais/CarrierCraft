import { runSeed } from '../src/database/seed.js';
import { pool } from '../src/database/connection.js';

async function main() {
  try {
    await runSeed();
    console.log('Seed executed successfully.');
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
