const { Client } = require('d:/dddd/backend/node_modules/pg');

async function checkTrackings() {
  const client = new Client({
    host: '127.0.0.1',
    port: 5433,
    user: 'templatecraft',
    password: 'templatecraft_password',
    database: 'templatecraft'
  });
  await client.connect();

  const cols = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'campaign_trackings'");
  console.log('campaign_trackings columns:', cols.rows.map(r => r.column_name));

  const rows = await client.query("SELECT * FROM campaign_trackings LIMIT 5");
  console.log('campaign_trackings rows:', rows.rows);

  await client.end();
}

checkTrackings().catch(console.error);
