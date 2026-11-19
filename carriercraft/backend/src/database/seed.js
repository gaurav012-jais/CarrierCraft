import bcrypt from 'bcrypt';
import { query } from './connection.js';

export async function runSeed() {
  console.log('[SEED] Starting clean demo seed data insertion...');

  // 1. Admin User
  const passwordHash = await bcrypt.hash('admin123', 10);
  await query(`
    INSERT INTO users (name, email, password_hash, role)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (email) DO UPDATE SET password_hash = $3
  `, ['Super Admin', 'admin@carriercraft.com', passwordHash, 'superadmin']);
  console.log('✓ Admin user seeded (admin@carriercraft.com / admin123)');

  // 2. Country (UAE)
  const countryRes = await query(`
    INSERT INTO countries (name, code, dial_code, currency)
    VALUES ('United Arab Emirates', 'AE', '+971', 'AED')
    ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name
    RETURNING id
  `);
  const countryId = countryRes.rows[0].id;
  console.log('✓ Country seeded: UAE (AE)');

  // 3. Operator (Etisalat)
  const opRes = await query(`
    INSERT INTO operators (country_id, name, code, detection_headers)
    VALUES ($1, 'Etisalat', 'ETISALAT', '["x-msisdn", "x-network-info", "x-up-calling-line-id"]')
    ON CONFLICT (country_id, code) DO UPDATE SET name = EXCLUDED.name
    RETURNING id
  `, [countryId]);
  const operatorId = opRes.rows[0].id;
  console.log('✓ Operator seeded: Etisalat');

  // 4. Campaign (Gamerz Hub UAE)
  const campRes = await query(`
    INSERT INTO campaigns (name, tracking_id, operator_id, country_code, operator_code, verification_mode, service_id, price_text, daily_cap)
    VALUES ('Gamerz Hub UAE', 'AE-ETISALAT-101', $1, 'AE', 'ETISALAT', 'BOTH', 'GH_PREM_01', '3.5 AED/day', 1000)
    ON CONFLICT (tracking_id) DO UPDATE SET name = EXCLUDED.name
    RETURNING id
  `, [operatorId]);
  const campaignId = campRes.rows[0].id;
  console.log('✓ Campaign seeded: Gamerz Hub UAE (AE-ETISALAT-101)');

  // 5. Partner API Config
  await query(`
    INSERT INTO api_configs (campaign_id, check_sub_url, send_otp_url, verify_otp_url, subscribe_url, blocklist_url)
    VALUES (
      $1,
      'https://partner-gateway.example/api/checksub?msisdn={{msisdn}}&serviceId={{serviceId}}',
      'https://partner-gateway.example/api/otp/send?msisdn={{msisdn}}&serviceId={{serviceId}}',
      'https://partner-gateway.example/api/otp/verify?msisdn={{msisdn}}&otp={{otp}}',
      'https://partner-gateway.example/api/charge?msisdn={{msisdn}}&serviceId={{serviceId}}',
      'https://partner-gateway.example/api/dnd?msisdn={{msisdn}}'
    )
    ON CONFLICT (campaign_id) DO NOTHING
  `, [campaignId]);
  console.log('✓ Partner API config seeded');

  // 6. Vendor & Affiliate (Traffic Partners)
  const vendorRes = await query(`
    INSERT INTO vendors (name, code, postback_url)
    VALUES ('PropellerAds', 'ADM01', 'https://adnetwork.example/postback?clickid={click_id}&payout={payout}&campid={campid}')
    ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name
    RETURNING id
  `);
  const vendorId = vendorRes.rows[0].id;

  const affRes = await query(`
    INSERT INTO affiliates (vendor_id, name, affiliate_code)
    VALUES ($1, 'Affiliate Alpha', 'AFF_BE')
    ON CONFLICT (vendor_id, affiliate_code) DO NOTHING
    RETURNING id
  `, [vendorId]);
  const affiliateId = affRes.rows[0]?.id || null;

  await query(`
    INSERT INTO campaign_trackings (campaign_id, vendor_id, affiliate_id, payout_usd, daily_cap)
    VALUES ($1, $2, $3, 2.0000, 500)
    ON CONFLICT (campaign_id, vendor_id, affiliate_id) DO NOTHING
  `, [campaignId, vendorId, affiliateId]);
  console.log('✓ Vendor & Tracking seeded (PropellerAds / ADM01)');

  // 7. Funnel Page Templates (6 Core Pages)
  const pageTypes = [
    { type: 'HOME', title: 'Unlimited Gaming Vault', html: '<div class="funnel-container"><h1>UNLIMITED GAMING VAULT</h1><p>Instant access to 500+ premium mobile games.</p><p class="price-tag">{{price}}</p><button data-action="SUBSCRIBE" class="cta-btn">SUBSCRIBE NOW & PLAY</button></div>' },
    { type: 'OTP', title: 'Verify Mobile Number', html: '<div class="funnel-container"><h1>Enter Verification Code</h1><p>Sent to {{msisdn}}</p><input type="text" id="otp-input" maxlength="4" /><button data-action="VERIFY_OTP" class="cta-btn">CONFIRM & SUBSCRIBE</button></div>' },
    { type: 'CONFIRM', title: 'Confirm Subscription', html: '<div class="funnel-container"><h1>Confirm Payment</h1><p>Subscribe with mobile balance: {{price}}</p><button data-action="CONFIRM_PAY" class="cta-btn">YES, SUBSCRIBE</button></div>' },
    { type: 'THANKYOU', title: 'Subscription Active', html: '<div class="funnel-container"><h1>WELCOME TO GAMERZ HUB!</h1><p>Your subscription is active. Billed to your mobile balance.</p><a href="https://games.example.com" class="cta-btn">START PLAYING NOW</a></div>' },
    { type: 'BLOCKED', title: 'Service Unavailable', html: '<div class="funnel-container"><h1>Service Not Available</h1><p>This service is not available for your mobile operator.</p></div>' },
    { type: 'LOW_BALANCE', title: 'Insufficient Balance', html: '<div class="funnel-container"><h1>Insufficient Balance</h1><p>Please recharge your SIM balance and try again.</p><button data-action="RETRY" class="cta-btn">RETRY SUBSCRIPTION</button></div>' },
  ];

  for (const page of pageTypes) {
    const tmplRes = await query(`
      INSERT INTO templates (name, html_content, css_content)
      VALUES ($1, $2, '.funnel-container { text-align: center; color: #fff; padding: 24px; } .cta-btn { background: #10B981; color: #fff; padding: 14px 28px; border-radius: 12px; font-weight: bold; border: none; cursor: pointer; }')
      RETURNING id
    `, [`Default ${page.type} Template`, page.html]);
    const templateId = tmplRes.rows[0].id;

    await query(`
      INSERT INTO campaign_pages (campaign_id, page_type, template_id)
      VALUES ($1, $2, $3)
      ON CONFLICT (campaign_id, page_type) DO UPDATE SET template_id = EXCLUDED.template_id
    `, [campaignId, page.type, templateId]);
  }
  console.log('✓ All 6 Funnel Page Templates seeded & linked to Campaign');

  console.log('🎉 [SEED COMPLETED] Clean database setup is 100% ready!');
}
