import axios from 'axios';
import { query } from '../../database/connection.js';

export class PostbacksService {
  /**
   * Fire S2S Postback to Vendor upon successful subscription
   */
  async triggerConversionPostback({ visitId, vendorId, clickId, campaignId }) {
    if (!vendorId || !clickId) return;

    // Fetch vendor postback template and tracking payout
    const vRes = await query('SELECT postback_url FROM vendors WHERE id = $1', [vendorId]);
    const tRes = await query('SELECT payout_usd FROM campaign_trackings WHERE campaign_id = $1 AND vendor_id = $2', [campaignId, vendorId]);
    const cRes = await query('SELECT tracking_id FROM campaigns WHERE id = $1', [campaignId]);

    const postbackUrl = vRes.rows[0]?.postback_url;
    if (!postbackUrl) return;

    const payout = tRes.rows[0]?.payout_usd || '2.0000';
    const campid = cRes.rows[0]?.tracking_id || '';

    // Replace macros
    const targetUrl = postbackUrl
      .replace(/{click_id}/g, clickId)
      .replace(/{payout}/g, payout)
      .replace(/{campid}/g, campid);

    try {
      const resp = await axios.get(targetUrl, { timeout: 8000 });
      await query(`
        INSERT INTO conversion_postbacks (visit_id, vendor_id, click_id, request_url, http_status, response_body, is_success)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [visitId, vendorId, clickId, targetUrl, resp.status, JSON.stringify(resp.data), true]);
      console.log(`[POSTBACK DELIVERED] Click: ${clickId} | Status: ${resp.status}`);
    } catch (err) {
      console.error(`[POSTBACK FAILED] Click: ${clickId} | Error: ${err.message}`);
      await query(`
        INSERT INTO conversion_postbacks (visit_id, vendor_id, click_id, request_url, http_status, response_body, is_success)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [visitId, vendorId, clickId, targetUrl, err.response?.status || 500, err.message, false]);
    }
  }

  async listPostbacks(limit = 50) {
    const res = await query(`
      SELECT cp.*, v.name as vendor_name 
      FROM conversion_postbacks cp
      LEFT JOIN vendors v ON cp.vendor_id = v.id
      ORDER BY cp.id DESC
      LIMIT $1
    `, [limit]);
    return res.rows;
  }

  async retryPostback(id) {
    const res = await query('SELECT * FROM conversion_postbacks WHERE id = $1', [id]);
    const pb = res.rows[0];
    if (!pb) throw { status: 404, message: 'Postback log not found.' };

    try {
      const resp = await axios.get(pb.request_url, { timeout: 8000 });
      await query(`
        UPDATE conversion_postbacks 
        SET http_status = $1, response_body = $2, is_success = true, attempts = attempts + 1 
        WHERE id = $3
      `, [resp.status, JSON.stringify(resp.data), id]);
      return { success: true, status: resp.status };
    } catch (err) {
      await query('UPDATE conversion_postbacks SET attempts = attempts + 1 WHERE id = $1', [id]);
      throw { status: 502, message: 'Retry failed: ' + err.message };
    }
  }
}

export const postbacksService = new PostbacksService();
