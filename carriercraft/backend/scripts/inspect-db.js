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
  const c = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'countries'");
  const o = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'operators'");
  const cmp = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'campaigns'");
  console.log('countries:', c.rows.map(x => x.column_name));
  console.log('operators:', o.rows.map(x => x.column_name));
  console.log('campaigns:', cmp.rows.map(x => x.column_name));
  await pool.end();
}

main().catch(err => { console.error(err); process.exit(1); });
