const { Client } = require('d:/dddd/backend/node_modules/pg');

async function checkCampaigns() {
  const client = new Client({
    host: '127.0.0.1',
    port: 5433,
    user: 'templatecraft',
    password: 'templatecraft_password',
    database: 'templatecraft'
  });
  await client.connect();

  const campaigns = await client.query(`
    SELECT c.id, c.name, c.tracking_id, c.verification_mode, c.funnel_layout, c.status,
           c.country, c.operator, c.service_id, c.success_redirect_url, c.cg_redirect_url
    FROM campaigns c
    ORDER BY c.id DESC
  `);
  
  console.log('Total campaigns:', campaigns.rows.length);
  for (const c of campaigns.rows) {
    console.log(`[ID ${c.id}] ${c.name} | Tracking: ${c.tracking_id} | Mode: ${c.verification_mode} | Layout: ${c.funnel_layout} | Country: ${c.country} | Op: ${c.operator} | Status: ${c.status} | SuccessUrl: ${c.success_redirect_url || 'none'} | CG: ${c.cg_redirect_url || 'none'}`);
  }

  await client.end();
}

checkCampaigns().catch(console.error);
