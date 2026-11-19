import { query } from '../../database/connection.js';

export class MarketsService {
  /**
   * Get flat list of markets (country + operator + campaign count)
   * Matches WAP Manager /markets table
   */
  async getMarkets() {
    const res = await query(`
      SELECT 
        c.id as country_id,
        c.name as country_name,
        c.code as country_code,
        o.id as operator_id,
        o.name as operator_name,
        o.code as operator_code,
        COUNT(cmp.id) as campaign_count
      FROM operators o
      JOIN countries c ON o.country_id = c.id
      LEFT JOIN campaigns cmp ON cmp.operator_id = o.id
      GROUP BY c.id, c.name, c.code, o.id, o.name, o.code
      ORDER BY c.name ASC, o.name ASC
    `);

    return res.rows.map((row) => ({
      countryId: row.country_id,
      countryName: row.country_name,
      countryCode: row.country_code,
      operatorId: row.operator_id,
      operatorName: row.operator_name,
      operatorCode: row.operator_code,
      campaignCount: Number(row.campaign_count) || 0,
    }));
  }

  /**
   * Get details of a specific market (Country + Operator) along with its campaigns
   */
  async getMarketDetails(countryCode, operatorCode) {
    const cc = countryCode.toUpperCase();
    const oc = operatorCode.toUpperCase();

    const opRes = await query(`
      SELECT o.*, c.name as country_name, c.dial_code, c.currency, c.code as country_code
      FROM operators o
      JOIN countries c ON o.country_id = c.id
      WHERE UPPER(c.code) = $1 AND UPPER(o.code) = $2
    `, [cc, oc]);

    const operator = opRes.rows[0];
    if (!operator) throw { status: 404, message: 'Market operator not found.' };

    const campsRes = await query(`
      SELECT id, name, tracking_id, verification_mode, funnel_layout, price_text, is_active, created_at
      FROM campaigns
      WHERE operator_id = $1
      ORDER BY id DESC
    `, [operator.id]);

    const campaigns = campsRes.rows.map((c) => ({
      ...c,
      active: Boolean(c.is_active),
      trackingId: c.tracking_id,
      requiredComplete: true,
    }));

    return {
      countryId: operator.country_id,
      countryName: operator.country_name,
      countryCode: operator.country_code,
      operatorId: operator.id,
      operatorName: operator.name,
      operatorCode: operator.code,
      dialCode: operator.dial_code,
      currency: operator.currency,
      campaigns,
    };
  }

  /**
   * Create a market (country + operator in one action)
   */
  async createMarket({ countryName, countryCode, operatorName, operatorCode }) {
    const cc = (countryCode || '').trim().toUpperCase();
    const oc = (operatorCode || '').trim().toUpperCase();
    const cName = (countryName || '').trim();
    const oName = (operatorName || '').trim();

    if (!cc || !oc || !cName || !oName) {
      throw { status: 400, message: 'countryName, countryCode, operatorName, operatorCode are required' };
    }

    let countryRes = await query('SELECT * FROM countries WHERE UPPER(code) = $1', [cc]);
    let country = countryRes.rows[0];
    if (!country) {
      const insC = await query(
        'INSERT INTO countries (name, code, dial_code, currency) VALUES ($1, $2, $3, $4) RETURNING *',
        [cName, cc, '+1', 'USD']
      );
      country = insC.rows[0];
    }

    let opRes = await query(
      'SELECT * FROM operators WHERE country_id = $1 AND UPPER(code) = $2',
      [country.id, oc]
    );
    if (opRes.rows.length > 0) {
      throw { status: 409, message: `Market already exists for ${cc} / ${oc}` };
    }

    const insOp = await query(
      'INSERT INTO operators (country_id, name, code, detection_headers) VALUES ($1, $2, $3, $4) RETURNING *',
      [country.id, oName, oc, JSON.stringify(['x-msisdn', 'x-network-info'])]
    );
    const operator = insOp.rows[0];

    return {
      countryId: country.id,
      countryName: country.name,
      countryCode: country.code,
      operatorId: operator.id,
      operatorName: operator.name,
      operatorCode: operator.code,
      campaignCount: 0,
    };
  }

  /**
   * Update a market
   */
  async updateMarket(countryCode, operatorCode, dto) {
    const cc = countryCode.toUpperCase();
    const oc = operatorCode.toUpperCase();

    const opRes = await query(`
      SELECT o.id, o.country_id FROM operators o
      JOIN countries c ON o.country_id = c.id
      WHERE UPPER(c.code) = $1 AND UPPER(o.code) = $2
    `, [cc, oc]);

    if (opRes.rows.length === 0) throw { status: 404, message: 'Market not found' };
    const { id: opId, country_id: cId } = opRes.rows[0];

    if (dto.countryName) {
      await query('UPDATE countries SET name = $1 WHERE id = $2', [dto.countryName.trim(), cId]);
    }
    if (dto.operatorName) {
      await query('UPDATE operators SET name = $1 WHERE id = $2', [dto.operatorName.trim(), opId]);
    }

    return this.getMarketDetails(dto.countryCode || cc, dto.operatorCode || oc);
  }

  /**
   * Add a new campaign under a market
   */
  async createMarketCampaign(countryCode, operatorCode, { name }) {
    const market = await this.getMarketDetails(countryCode, operatorCode);
    const campName = (name || '').trim() || `${market.countryName} ${market.operatorName}`;

    // Get sequence count for tracking id
    const countRes = await query('SELECT COUNT(*) FROM campaigns WHERE operator_id = $1', [market.operatorId]);
    const nextSeq = Number(countRes.rows[0].count) + 1;
    const trackingId = `${market.countryCode}-${market.operatorCode}-${nextSeq}`;

    const res = await query(
      `INSERT INTO campaigns (
        operator_id, country_code, operator_code, name, tracking_id,
        verification_mode, funnel_layout, price_text, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [market.operatorId, market.countryCode, market.operatorCode, campName, trackingId, 'BOTH', 'classic', '3.5 AED/day', true]
    );
    const campaign = res.rows[0];

    // Seed 8 pages
    const pageTypes = ['HOME', 'OTP', 'CONFIRM', 'THANKYOU', 'INPROGRESS', 'LOW_BALANCE', 'BLOCKED', 'ERROR'];
    for (const pt of pageTypes) {
      await query(
        `INSERT INTO campaign_pages (campaign_id, page_type, html_content, css_content, project_data)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (campaign_id, page_type) DO NOTHING`,
        [
          campaign.id,
          pt,
          `<div class="funnel-container text-center p-6"><h1 class="text-2xl font-bold mb-4">${campName} - ${pt}</h1><p class="text-sm text-gray-600 mb-6">Telecom Direct Carrier Billing Experience</p><button class="subscribe-btn bg-blue-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg">Continue</button></div>`,
          `.funnel-container { max-width: 480px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #ffffff; min-height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; } .subscribe-btn { transition: transform 0.1s ease; } .subscribe-btn:active { transform: scale(0.98); }`,
          JSON.stringify({ pages: [{ id: pt }] })
        ]
      );
    }

    return {
      ...campaign,
      active: Boolean(campaign.is_active),
      trackingId: campaign.tracking_id,
      requiredComplete: true,
    };
  }

  async addCountry({ name, code, dialCode, currency }) {
    const res = await query(
      'INSERT INTO countries (name, code, dial_code, currency) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, code.toUpperCase(), dialCode, currency.toUpperCase()]
    );
    return res.rows[0];
  }

  async addOperator({ countryId, name, code, detectionHeaders }) {
    const headersJson = JSON.stringify(detectionHeaders || ['x-msisdn', 'x-network-info']);
    const res = await query(
      'INSERT INTO operators (country_id, name, code, detection_headers) VALUES ($1, $2, $3, $4) RETURNING *',
      [countryId, name, code.toUpperCase(), headersJson]
    );
    return res.rows[0];
  }

  async toggleOperator(operatorId, isActive) {
    const res = await query('UPDATE operators SET is_active = $1 WHERE id = $2 RETURNING *', [isActive, operatorId]);
    if (res.rowCount === 0) throw { status: 404, message: 'Operator not found.' };
    return res.rows[0];
  }
}

export const marketsService = new MarketsService();
