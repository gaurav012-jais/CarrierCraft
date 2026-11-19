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

  const trackings = await client.query(`
    SELECT ct.id, ct.campaign_id, ct.tracking_id, ct.vendor_id, ct.payout, ct.active,
           c.name as campaign_name, c.country, c.operator, c.verification_mode, c.funnel_layout
    FROM campaign_trackings ct
    JOIN campaigns c ON ct.campaign_id = c.id
    ORDER BY ct.id DESC LIMIT 15
  `);
  
  console.log('Campaign Trackings:');
  for (const t of trackings.rows) {
    console.log(`Tracking [${t.tracking_id}] -> Campaign ${t.campaign_id} (${t.campaign_name}) | ${t.country} - ${t.operator} | Mode: ${t.verification_mode} | Layout: ${t.funnel_layout}`);
  }

  await client.end();
}

checkTrackings().catch(console.error);
