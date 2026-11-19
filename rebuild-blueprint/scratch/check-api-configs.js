const { Client } = require('d:/dddd/backend/node_modules/pg');

async function checkConfigs() {
  const client = new Client({
    host: '127.0.0.1',
    port: 5433,
    user: 'templatecraft',
    password: 'templatecraft_password',
    database: 'templatecraft'
  });
  await client.connect();

  const res = await client.query(`
    SELECT ac.id, ac.campaign_id, ac.he_provider, ac.he_config_json,
           ac.subscription_api, ac.blocklist_api, ac.subscribe_api, ac.otp_config_json,
           c.name as campaign_name, c.verification_mode, c.country, c.operator
    FROM api_configs ac
    JOIN campaigns c ON ac.campaign_id = c.id
    WHERE c.id IN (12, 16, 17, 20, 21, 23)
  `);

  for (const row of res.rows) {
    console.log(`\n========================================`);
    console.log(`Campaign [${row.campaign_id}] ${row.campaign_name} (${row.country} - ${row.operator})`);
    console.log(`Mode: ${row.verification_mode} | HE Provider: ${row.he_provider}`);
    console.log(`Subscription API (Checksub): ${row.subscription_api}`);
    console.log(`Blocklist API: ${row.blocklist_api}`);
    console.log(`Subscribe API: ${row.subscribe_api}`);
    console.log(`HE Config:`, row.he_config_json);
    console.log(`OTP Config:`, row.otp_config_json);
  }

  await client.end();
}

checkConfigs().catch(console.error);
