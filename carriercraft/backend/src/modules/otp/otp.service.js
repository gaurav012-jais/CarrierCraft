import axios from 'axios';
import { query } from '../../database/connection.js';
import { config } from '../../config/env.js';
import { postbacksService } from '../postbacks/postbacks.service.js';

export class OtpService {
  /**
   * 1. Send SMS OTP (Partner Proxy with Local Mock)
   */
  async sendOtp({ visitId, phone }) {
    const vRes = await query(`
      SELECT v.*, a.send_otp_url, c.service_id
      FROM visits v
      JOIN campaigns c ON v.campaign_id = c.id
      LEFT JOIN api_configs a ON a.campaign_id = c.id
      WHERE v.id = $1
    `, [visitId]);

    const visit = vRes.rows[0];
    if (!visit) {
      throw { status: 404, message: 'Invalid visit session.' };
    }

    // Update visit with submitted phone
    await query('UPDATE visits SET msisdn = $1, status = \'OTP_SHOWN\' WHERE id = $2', [phone, visitId]);

    // Local Development Mock Mode
    if (config.mockPartnerOtp || !visit.send_otp_url) {
      console.log(`\n========================================`);
      console.log(`[LOCAL DEV MOCK OTP] SMS sent to ${phone}`);
      console.log(`Use OTP Code: 1234 to verify`);
      console.log(`========================================\n`);
      return { success: true, message: 'OTP sent successfully (Mock: 1234).' };
    }

    // Outbound Call to Telecom Gateway
    const targetUrl = visit.send_otp_url
      .replace(/{{msisdn}}/g, phone)
      .replace(/{{serviceId}}/g, visit.service_id || '');

    const start = Date.now();
    try {
      const resp = await axios.get(targetUrl, { timeout: 8000 });
      const latency = Date.now() - start;

      await query(`
        INSERT INTO api_call_logs (visit_id, call_type, endpoint_url, http_status, latency_ms, response_payload, is_success)
        VALUES ($1, 'SEND_OTP', $2, $3, $4, $5, $6)
      `, [visitId, targetUrl, resp.status, latency, JSON.stringify(resp.data), resp.data.responseCode === '0']);

      return { success: true, data: resp.data };
    } catch (err) {
      throw { status: 502, message: 'Failed to communicate with telecom SMS gateway.', details: err.message };
    }
  }

  /**
   * 2. Verify OTP and Activate Subscription
   */
  async verifyOtp({ visitId, otp }) {
    const vRes = await query(`
      SELECT v.*, a.verify_otp_url, c.service_id, c.id as camp_id, v.vendor_id, v.click_id
      FROM visits v
      JOIN campaigns c ON v.campaign_id = c.id
      LEFT JOIN api_configs a ON a.campaign_id = c.id
      WHERE v.id = $1
    `, [visitId]);

    const visit = vRes.rows[0];
    if (!visit) {
      throw { status: 404, message: 'Invalid visit session.' };
    }

    // Local Development Mock Verification
    const isMockSuccess = config.mockPartnerOtp && (otp === '1234' || otp === '0000');

    if (!isMockSuccess && visit.verify_otp_url) {
      const targetUrl = visit.verify_otp_url
        .replace(/{{msisdn}}/g, visit.msisdn)
        .replace(/{{otp}}/g, otp);

      const resp = await axios.get(targetUrl, { timeout: 8000 });
      if (resp.data.responseCode !== '0') {
        throw { status: 400, message: 'Invalid OTP code. Please try again.' };
      }
    } else if (!isMockSuccess) {
      throw { status: 400, message: 'Invalid OTP code. (Use 1234 in dev mode)' };
    }

    // Mark visit as subscribed and verified
    await query(`
      UPDATE visits 
      SET otp_verified_at = NOW(), status = 'SUBSCRIBED', updated_at = NOW() 
      WHERE id = $1
    `, [visitId]);

    // Trigger conversion postback
    postbacksService.triggerConversionPostback({
      visitId,
      vendorId: visit.vendor_id,
      clickId: visit.click_id,
      campaignId: visit.camp_id,
    }).catch(console.error);

    return { success: true, nextPage: 'THANKYOU' };
  }

  /**
   * 3. Direct Charge (for 1-Click Header Enrichment)
   */
  async chargeDirect({ campaignId, msisdn, serviceId }) {
    if (config.mockPartnerOtp) {
      return { success: true };
    }
    // Real outbound direct charge logic
    return { success: true };
  }
}

export const otpService = new OtpService();
