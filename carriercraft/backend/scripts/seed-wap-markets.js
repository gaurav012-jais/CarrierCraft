import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  host: '127.0.0.1',
  port: 5432,
  user: 'postgres',
  password: 'admin123',
  database: 'carriercraft'
});

async function main() {
  console.log('Seeding markets and campaigns matching WAP Manager...');

  // Helper to upsert country
  async function ensureCountry(name, code, dialCode, currency) {
    let res = await pool.query('SELECT * FROM countries WHERE UPPER(code) = $1', [code.toUpperCase()]);
    if (res.rows.length === 0) {
      res = await pool.query(
        'INSERT INTO countries (name, code, dial_code, currency) VALUES ($1, $2, $3, $4) RETURNING *',
        [name, code.toUpperCase(), dialCode, currency.toUpperCase()]
      );
    }
    return res.rows[0];
  }

  // Helper to upsert operator
  async function ensureOperator(countryId, name, code, detectionHeaders = ['x-msisdn', 'x-network-info']) {
    let res = await pool.query(
      'SELECT * FROM operators WHERE country_id = $1 AND UPPER(code) = $2',
      [countryId, code.toUpperCase()]
    );
    if (res.rows.length === 0) {
      res = await pool.query(
        'INSERT INTO operators (country_id, name, code, detection_headers) VALUES ($1, $2, $3, $4) RETURNING *',
        [countryId, name, code.toUpperCase(), JSON.stringify(detectionHeaders)]
      );
    }
    return res.rows[0];
  }

  // Helper to ensure campaign
  async function ensureCampaign(operator, country, name, trackingId, verificationMode = 'OTP_ONLY', funnelLayout = 'classic', isActive = true) {
    let res = await pool.query('SELECT * FROM campaigns WHERE tracking_id = $1', [trackingId]);
    if (res.rows.length === 0) {
      res = await pool.query(
        `INSERT INTO campaigns (
          operator_id, country_code, operator_code, name, tracking_id, 
          verification_mode, funnel_layout, price_text, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [operator.id, country.code, operator.code, name, trackingId, verificationMode, funnelLayout, '30 INR/day', isActive]
      );
      const camp = res.rows[0];

      // Seed 8 standard pages for this campaign
      const pageTypes = ['HOME', 'OTP', 'CONFIRM', 'THANKYOU', 'INPROGRESS', 'LOW_BALANCE', 'BLOCKED', 'ERROR'];
      for (const pt of pageTypes) {
        await pool.query(
          `INSERT INTO campaign_pages (campaign_id, page_type, html_content, css_content, project_data)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (campaign_id, page_type) DO NOTHING`,
          [
            camp.id,
            pt,
            `<div class="funnel-container text-center p-6"><h1 class="text-2xl font-bold mb-4">${name} - ${pt}</h1><p class="text-sm text-gray-600 mb-6">Telecom Direct Carrier Billing Experience</p><button class="subscribe-btn bg-blue-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg">Continue</button></div>`,
            `.funnel-container { max-width: 480px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #ffffff; min-height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; } .subscribe-btn { transition: transform 0.1s ease; } .subscribe-btn:active { transform: scale(0.98); }`,
            JSON.stringify({ pages: [{ id: pt }] })
          ]
        );
      }
      return camp;
    }
    return res.rows[0];
  }

  // 1. India
  const inCountry = await ensureCountry('India', 'IN', '+91', 'INR');
  const xzyOp = await ensureOperator(inCountry.id, 'xzy', 'XZ12');
  const airtelOp = await ensureOperator(inCountry.id, 'Airtel', 'AIRTEL');
  const mockOp = await ensureOperator(inCountry.id, 'MockOp', 'MOCKOP');

  // Campaigns under IN / XZ12
  const docterCamp = await ensureCampaign(xzyOp, inCountry, 'docter', 'IN-XZ12-33', 'OTP_ONLY', 'classic', true);
  const asdCamp = await ensureCampaign(xzyOp, inCountry, 'asd', 'IN-XZ12-40', 'OTP_ONLY', 'classic', false);
  // Campaign under IN / AIRTEL
  await ensureCampaign(airtelOp, inCountry, 'Airtel 5G Stream', 'IN-AIRTEL-1', 'BOTH', 'classic', true);

  // 2. South Sudan
  const ssCountry = await ensureCountry('South Sudan', 'SS', '+211', 'SSP');
  const ssZain = await ensureOperator(ssCountry.id, 'Zain', 'ZAIN');
  await ensureCampaign(ssZain, ssCountry, 'Zain Music Pass', 'SS-ZAIN-1', 'BOTH', 'classic', true);

  // 3. Israel
  const ilCountry = await ensureCountry('Israel', 'IL', '+972', 'ILS');
  const ilUniverse = await ensureOperator(ilCountry.id, 'Universe Telecom', 'WM');
  await ensureCampaign(ilUniverse, ilCountry, 'Universe DCB Funnel', 'IL-WM-1', 'UNIVERSE_DCB', 'classic', true);

  // 4. Burkina Faso
  const bfCountry = await ensureCountry('BurkinaFaso', 'BF', '+226', 'XOF');
  await ensureOperator(bfCountry.id, 'Orange', 'OR');
  await ensureOperator(bfCountry.id, 'Orange', 'OBF');

  // 5. Saudi Arabia
  const saCountry = await ensureCountry('Saudi Arabia', 'SA', '+966', 'SAR');
  const saZain = await ensureOperator(saCountry.id, 'ZAIN', '201');
  const saStc = await ensureOperator(saCountry.id, 'STC', 'STC');
  await ensureCampaign(saStc, saCountry, 'STC Play 1', 'SA-STC-1', 'BOTH', 'classic', true);
  await ensureCampaign(saStc, saCountry, 'STC Play 2', 'SA-STC-2', 'BOTH', 'classic', true);
  await ensureCampaign(saStc, saCountry, 'STC Play 3', 'SA-STC-3', 'BOTH', 'classic', true);

  console.log('Seeding complete! All markets and sample campaigns created successfully.');
  await pool.end();
}

main().catch(err => { console.error(err); process.exit(1); });
