import pg from 'pg';
import { config } from '../config/env.js';

const { Pool } = pg;

// Clean PostgreSQL Connection Pool
export const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  max: 20, // max 20 connections in pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('error', (err) => {
  console.error('[DB] Unexpected error on idle client', err);
  process.exit(-1);
});

/**
 * Standard Query Helper
 * @param {string} text - SQL Query
 * @param {Array} params - Query Parameters
 */
export async function query(text, params) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  if (config.nodeEnv === 'development' && duration > 100) {
    console.log(`[DB Slow Query] ${duration}ms: ${text.slice(0, 80)}...`);
  }
  return res;
}

/**
 * Test Connection Function
 */
export async function testConnection() {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT NOW() as current_time');
    return res.rows[0].current_time;
  } finally {
    client.release();
  }
}
