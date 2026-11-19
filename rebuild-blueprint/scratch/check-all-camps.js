const { Client } = require('d:/dddd/backend/node_modules/pg');

async function checkAllCampaigns() {
  const client = new Client({
    host: '127.0.0.1',
    port: 5433,
    user: 'templatecraft',
    password: 'templatecraft_password',
    database: 'templatecraft'
  });
  await client.connect();

  const res = await client.query(`
    SELECT id, name, country, operator, verification_mode, funnel_layout, active,
           success_redirect_url, cg_redirect_url, postback_register_at
    FROM campaigns
    ORDER BY id ASC
  `);

  console.log(`Found ${res.rows.length} campaigns:`);
  for (const c of res.rows) {
    console.log(`[ID ${c.id}] ${c.name} | ${c.country} / ${c.operator} | Mode: ${c.verification_mode} | Layout: ${c.funnel_layout} | Active: ${c.active} | Success: ${c.success_redirect_url ? 'YES' : 'NO'} | CG: ${c.cg_redirect_url ? 'YES' : 'NO'}`);
  }

  await client.end();
}

checkAllCampaigns().catch(console.error);
