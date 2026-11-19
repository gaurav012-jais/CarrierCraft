const { Client } = require('d:/dddd/backend/node_modules/pg');

async function testPort(port, user, password, db) {
  const client = new Client({
    host: '127.0.0.1',
    port: port,
    user: user,
    password: password,
    database: db
  });
  try {
    await client.connect();
    console.log(`Successfully connected to port ${port} db ${db}!`);
    const tables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
    console.log(`Tables on port ${port}:`, tables.rows.map(r => r.table_name));
    if (tables.rows.some(r => r.table_name === 'users')) {
      const users = await client.query("SELECT id, email, role FROM users LIMIT 5");
      console.log('Users:', users.rows);
    }
    if (tables.rows.some(r => r.table_name === 'campaigns')) {
      const camps = await client.query("SELECT id, name, tracking_id, verification_mode, country_id, operator_id FROM campaigns LIMIT 5");
      console.log('Campaigns:', camps.rows);
    }
    await client.end();
  } catch (e) {
    console.log(`Failed port ${port} ${db}:`, e.message);
  }
}

async function main() {
  await testPort(5433, 'templatecraft', 'templatecraft_password', 'templatecraft');
  await testPort(5432, 'templatecraft', 'templatecraft_password', 'templatecraft');
  await testPort(5432, 'postgres', 'admin123', 'templatecraft');
}

main();
