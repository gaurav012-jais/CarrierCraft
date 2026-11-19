const { Client } = require('d:/dddd/backend/node_modules/pg');

async function check(dbName) {
  const client = new Client({
    host: '127.0.0.1',
    port: 5432,
    user: 'postgres',
    password: 'admin123',
    database: dbName
  });
  try {
    await client.connect();
    const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
    console.log(`Database [${dbName}] tables:`, res.rows.map(r => r.table_name));
    if (res.rows.some(r => r.table_name === 'users')) {
      const users = await client.query("SELECT id, email, role FROM users LIMIT 5");
      console.log(`  Users in [${dbName}]:`, users.rows);
    }
    if (res.rows.some(r => r.table_name === 'campaigns')) {
      const camps = await client.query("SELECT id, name, tracking_id, verification_mode FROM campaigns LIMIT 5");
      console.log(`  Campaigns in [${dbName}]:`, camps.rows);
    }
    await client.end();
  } catch (e) {
    console.error(`Error in [${dbName}]:`, e.message);
  }
}

async function main() {
  await check('tickhigh');
  await check('vervodb');
  await check('carriercraft');
}

main();
