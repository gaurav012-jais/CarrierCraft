import { query } from '../../database/connection.js';

export class PartnersService {
  /**
   * List all vendors with affiliates
   */
  async listVendors() {
    const vendorsRes = await query('SELECT * FROM vendors ORDER BY id ASC');
    const affiliatesRes = await query('SELECT * FROM affiliates ORDER BY id ASC');

    return vendorsRes.rows.map((vendor) => ({
      ...vendor,
      affiliates: affiliatesRes.rows.filter((aff) => aff.vendor_id === vendor.id),
    }));
  }

  /**
   * Create a new vendor (Ad Network)
   */
  async createVendor({ name, code, postbackUrl }) {
    const res = await query(
      'INSERT INTO vendors (name, code, postback_url) VALUES ($1, $2, $3) RETURNING *',
      [name, code.toUpperCase(), postbackUrl]
    );
    return res.rows[0];
  }

  /**
   * Add affiliate to vendor
   */
  async addAffiliate({ vendorId, name, affiliateCode }) {
    const res = await query(
      'INSERT INTO affiliates (vendor_id, name, affiliate_code) VALUES ($1, $2, $3) RETURNING *',
      [vendorId, name, affiliateCode.toUpperCase()]
    );
    return res.rows[0];
  }

  /**
   * Assign vendor to campaign with custom payout and daily caps
   */
  async assignCampaignTracking({ campaignId, vendorId, affiliateId = null, payoutUsd = 2.0, dailyCap = 0 }) {
    const res = await query(`
      INSERT INTO campaign_trackings (campaign_id, vendor_id, affiliate_id, payout_usd, daily_cap)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (campaign_id, vendor_id, affiliate_id) DO UPDATE SET
        payout_usd = EXCLUDED.payout_usd,
        daily_cap = EXCLUDED.daily_cap,
        is_active = true
      RETURNING *
    `, [campaignId, vendorId, affiliateId, payoutUsd, dailyCap]);
    return res.rows[0];
  }

  /**
   * Generate clean attribution tracking link
   */
  generateTrackingLink({ baseUrl, countryCode, operatorCode, trackingCampid, vendorCode }) {
    const origin = baseUrl || 'http://localhost:4000';
    return `${origin}/subscription?country=${countryCode}&operator=${operatorCode}&campid=${trackingCampid}&vid=${vendorCode}&click_id={CLICK_ID}`;
  }
}

export const partnersService = new PartnersService();
