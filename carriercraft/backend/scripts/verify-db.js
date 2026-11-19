import { query, pool } from '../src/database/connection.js';

async function verify() {
  const tables = await query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `);
  console.log('✅ Created Tables Count:', tables.rows.length);
  console.log('📋 Tables List:', tables.rows.map(r => r.table_name).join(', '));

  const users = await query('SELECT name, email, role FROM users');
  console.log('👤 Admin Users:', users.rows);

  const countries = await query('SELECT name, code, dial_code, currency FROM countries');
  console.log('🌍 Countries:', countries.rows);

  const operators = await query('SELECT name, code FROM operators');
  console.log('📡 Operators:', operators.rows);

  const campaigns = await query('SELECT name, tracking_id, verification_mode, price_text FROM campaigns');
  console.log('🎯 Campaigns:', campaigns.rows);

  const pages = await query('SELECT page_type FROM campaign_pages ORDER BY id');
  console.log('📄 Campaign Pages:', pages.rows.map(r => r.page_type).join(' -> '));

  await pool.end();
  process.exit(0);
}

verify();
