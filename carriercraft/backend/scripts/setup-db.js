import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import { config } from '../src/config/env.js';
import { runSeed } from '../src/database/seed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupDatabase() {
  console.log('🚀 [CARRIERCRAFT] Initializing Database Setup...');

  // Step 1: Connect to default postgres DB to ensure target database exists
  const rootClient = new pg.Client({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: 'postgres',
  });

  try {
    await rootClient.connect();
    console.log(`Connected to PostgreSQL server at ${config.db.host}:${config.db.port}`);

    const checkDb = await rootClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [config.db.database]
    );

    if (checkDb.rowCount === 0) {
      console.log(`Creating database "${config.db.database}"...`);
      await rootClient.query(`CREATE DATABASE "${config.db.database}"`);
      console.log(`✓ Database "${config.db.database}" created successfully.`);
    } else {
      console.log(`✓ Database "${config.db.database}" already exists.`);
    }
  } catch (err) {
    console.warn(`[Note] Could not create database directly via 'postgres' DB (${err.message}). Connecting directly to ${config.db.database}...`);
  } finally {
    await rootClient.end().catch(() => {});
  }

  // Step 2: Connect to the actual target database and apply schema.sql
  const targetPool = new pg.Pool({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
  });

  try {
    const schemaPath = path.resolve(__dirname, '../src/database/schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('Executing schema.sql DDL (creating 15 tables & indexes)...');
    await targetPool.query(schemaSql);
    console.log('✓ All 15 database tables and performance indexes created.');

    // Step 3: Run Seed
    await runSeed();
    console.log('🎉 Database setup and seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error executing database setup:', err);
    process.exit(1);
  } finally {
    await targetPool.end().catch(() => {});
  }
}

setupDatabase();
