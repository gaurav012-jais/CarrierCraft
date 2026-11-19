import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  host: '127.0.0.1',
  port: 5432,
  user: 'postgres',
  password: 'admin123',
  database: 'carriercraft'
});

async function main() {
  const camps = await pool.query("SELECT id, name, tracking_id, country_code, operator_code, verification_mode, is_active FROM campaigns");
  console.log('Campaigns:', camps.rows);
  await pool.end();
}

main().catch(err => { console.error(err); process.exit(1); });
