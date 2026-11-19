import { query } from '../../database/connection.js';

export class CampaignVendorsService {
  /**
   * List assigned vendors for a campaign with generated tracking URLs
   */
  async getAssignedVendors(campaignId) {
    const res = await query(`
      SELECT ct.*, v.name as vendor_name, v.code as vendor_code, v.postback_url,
             c.tracking_id, c.country_code, c.operator_code, o.name as operator_name
      FROM campaign_trackings ct
      JOIN vendors v ON ct.vendor_id = v.id
      JOIN campaigns c ON ct.campaign_id = c.id
      JOIN operators o ON c.operator_id = o.id
      WHERE ct.campaign_id = $1
      ORDER BY ct.id DESC
    `, [campaignId]);

    // Attach dual tracking link
    return res.rows.map(row => {
      const trackingUrl = `/subscription?country=${row.country_code}&operator=${encodeURIComponent(row.operator_name)}&tracking_campid=${row.tracking_id}&campid={vendor_camp}&click_id={click_id}&vid=${row.vendor_code}`;
      return {
        ...row,
        trackingUrl,
      };
    });
  }

  /**
   * Assign or update a vendor on a campaign
   */
  async assignVendor(campaignId, { vendorId, affiliateId = null, payoutUsd = 1.5, dailyCap = 0 }) {
    const camp = await query('SELECT tracking_id FROM campaigns WHERE id = $1', [campaignId]);
    if (camp.rows.length === 0) throw { status: 404, message: 'Campaign not found.' };

    const trackingId = camp.rows[0].tracking_id;

    const res = await query(`
      INSERT INTO campaign_trackings (campaign_id, vendor_id, affiliate_id, payout_usd, daily_cap, tracking_id, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, true)
      ON CONFLICT (campaign_id, vendor_id, affiliate_id) DO UPDATE SET
        payout_usd = EXCLUDED.payout_usd,
        daily_cap = EXCLUDED.daily_cap,
        tracking_id = EXCLUDED.tracking_id,
        is_active = true,
        updated_at = NOW()
      RETURNING *
    `, [campaignId, vendorId, affiliateId, payoutUsd, dailyCap, trackingId]);

    return res.rows[0];
  }

  /**
   * Remove vendor from campaign
   */
  async removeVendor(campaignId, trackingId) {
    await query('DELETE FROM campaign_trackings WHERE campaign_id = $1 AND id = $2', [campaignId, trackingId]);
    return { success: true, message: 'Vendor unassigned successfully.' };
  }
}

export const campaignVendorsService = new CampaignVendorsService();
