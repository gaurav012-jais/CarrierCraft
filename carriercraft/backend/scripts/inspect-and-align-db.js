import { pool, query } from '../src/database/connection.js';
import bcrypt from 'bcrypt';

async function alignDb() {
  console.log('🔄 Checking and aligning Carriercraft database schema...');

  // 1. Ensure columns on campaigns
  await query(`
    ALTER TABLE campaigns 
    ADD COLUMN IF NOT EXISTS funnel_layout VARCHAR(30) DEFAULT 'classic',
    ADD COLUMN IF NOT EXISTS success_redirect_url TEXT,
    ADD COLUMN IF NOT EXISTS cg_redirect_url TEXT,
    ADD COLUMN IF NOT EXISTS postback_register_at VARCHAR(20) DEFAULT 'confirm',
    ADD COLUMN IF NOT EXISTS capping_metric VARCHAR(30) DEFAULT 'conversions',
    ADD COLUMN IF NOT EXISTS capping_action VARCHAR(30) DEFAULT 'stop',
    ADD COLUMN IF NOT EXISTS fallback_campaign_id INT,
    ADD COLUMN IF NOT EXISTS description TEXT;
  `);
  console.log('✅ Campaigns table aligned.');

  // 2. Ensure columns on campaign_pages
  await query(`
    ALTER TABLE campaign_pages 
    ADD COLUMN IF NOT EXISTS html_content TEXT DEFAULT '',
    ADD COLUMN IF NOT EXISTS css_content TEXT DEFAULT '',
    ADD COLUMN IF NOT EXISTS project_data JSONB DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
  `);
  console.log('✅ Campaign_pages table aligned.');

  // 3. Ensure columns on api_configs
  await query(`
    ALTER TABLE api_configs 
    ADD COLUMN IF NOT EXISTS he_provider VARCHAR(50) DEFAULT 'header',
    ADD COLUMN IF NOT EXISTS he_config_json JSONB DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS otp_config_json JSONB DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS headers_json JSONB DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS subscription_api TEXT,
    ADD COLUMN IF NOT EXISTS blocklist_api TEXT,
    ADD COLUMN IF NOT EXISTS subscribe_api TEXT;
  `);
  console.log('✅ Api_configs table aligned.');

  // 4. Ensure columns on campaign_trackings
  await query(`
    ALTER TABLE campaign_trackings
    ADD COLUMN IF NOT EXISTS tracking_id VARCHAR(50);
  `);
  console.log('✅ Campaign_trackings table aligned.');

  // 5. Seed user abhivishwkarmaa52@gmail.com with password 123456
  const userCheck = await query('SELECT id, email FROM users WHERE email = $1', ['abhivishwkarmaa52@gmail.com']);
  const passHash = await bcrypt.hash('123456', 10);
  
  if (userCheck.rows.length === 0) {
    await query(`
      INSERT INTO users (name, email, password_hash, role, is_active)
      VALUES ($1, $2, $3, $4, $5)
    `, ['Abhi Vishwakarma', 'abhivishwkarmaa52@gmail.com', passHash, 'superadmin', true]);
    console.log('✅ User abhivishwkarmaa52@gmail.com created with role superadmin.');
  } else {
    await query(`
      UPDATE users SET password_hash = $1, is_active = true WHERE email = $2
    `, [passHash, 'abhivishwkarmaa52@gmail.com']);
    console.log('✅ User abhivishwkarmaa52@gmail.com password updated to 123456.');
  }

  // 6. Ensure default 8 pages exist for each campaign
  const camps = await query('SELECT id, country_code, operator_code FROM campaigns');
  const PAGE_TYPES = ['HOME', 'OTP', 'CONFIRM', 'THANKYOU', 'INPROGRESS', 'LOW_BALANCE', 'BLOCKED', 'ERROR'];

  for (const camp of camps.rows) {
    for (const pt of PAGE_TYPES) {
      await query(`
        INSERT INTO campaign_pages (campaign_id, page_type, is_active, html_content, css_content, project_data)
        VALUES ($1, $2, true, '', '', '{}')
        ON CONFLICT (campaign_id, page_type) DO NOTHING;
      `, [camp.id, pt]);
    }
  }
  console.log('✅ Default 8 funnel pages seeded for all campaigns.');

  await pool.end();
  console.log('🎉 Database alignment complete!');
}

alignDb().catch(err => {
  console.error('❌ Error aligning DB:', err);
  process.exit(1);
});
