const { Client } = require('d:/dddd/backend/node_modules/pg');

async function checkRealDb() {
  const client = new Client({
    host: '127.0.0.1',
    port: 5433,
    user: 'templatecraft',
    password: 'templatecraft_password',
    database: 'templatecraft'
  });
  await client.connect();
  
  const countries = await client.query("SELECT * FROM countries LIMIT 10");
  console.log('Countries:', countries.rows);

  const operators = await client.query("SELECT * FROM operators LIMIT 10");
  console.log('Operators:', operators.rows);

  const campaigns = await client.query("SELECT * FROM campaigns LIMIT 10");
  console.log('Campaigns count:', campaigns.rows.length);
  for (const c of campaigns.rows) {
    console.log(`Campaign [${c.id}] ${c.name} - TrackingID: ${c.tracking_id}, Mode: ${c.verification_mode}, FunnelLayout: ${c.funnel_layout}, Status: ${c.status}`);
  }

  const apiConfigs = await client.query("SELECT id, campaign_id, he_provider, he_config_json, subscription_api, subscribe_api FROM api_configs LIMIT 5");
  console.log('Api Configs:', apiConfigs.rows);

  const pages = await client.query("SELECT id, campaign_id, page_type, is_active FROM campaign_pages LIMIT 15");
  console.log('Campaign Pages:', pages.rows);

  await client.end();
}

checkRealDb().catch(console.error);
