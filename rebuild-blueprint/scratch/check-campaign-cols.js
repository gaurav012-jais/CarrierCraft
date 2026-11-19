const { Client } = require('d:/dddd/backend/node_modules/pg');

async function checkCols() {
  const client = new Client({
    host: '127.0.0.1',
    port: 5433,
    user: 'templatecraft',
    password: 'templatecraft_password',
    database: 'templatecraft'
  });
  await client.connect();

  const cols = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'campaigns'");
  console.log('Campaign columns:', cols.rows.map(r => r.column_name));

  const sample = await client.query("SELECT * FROM campaigns LIMIT 3");
  console.log('Sample campaign:', sample.rows);

  await client.end();
}

checkCols().catch(console.error);
