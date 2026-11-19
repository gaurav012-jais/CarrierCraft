import { query } from '../../database/connection.js';
import { resolveMsisdnFromHeaders } from './helpers/he-resolver.js';
import { otpService } from '../otp/otp.service.js';
import { postbacksService } from '../postbacks/postbacks.service.js';

export class FlowService {
  /**
   * 1. Detect MSISDN & Ingest Incoming Traffic Visit
   */
  async detectMsisdn({ countryCode, operatorCode, campid, vid, clickId, headers, ip, userAgent }) {
    // 1. Resolve Campaign
    const campRes = await query(`
      SELECT c.*, o.detection_headers
      FROM campaigns c
      JOIN operators o ON c.operator_id = o.id
      WHERE c.tracking_id = $1 OR c.id::text = $1
    `, [campid]);

    const campaign = campRes.rows[0];
    if (!campaign || !campaign.is_active) {
      throw { status: 404, message: 'This campaign offer is not active or unavailable.' };
    }

    // 2. Resolve Vendor
    let vendorId = null;
    if (vid) {
      const vRes = await query('SELECT id FROM vendors WHERE code = $1', [vid.toUpperCase()]);
      vendorId = vRes.rows[0]?.id || null;
    }

    // 3. Detect Phone via Headers
    const detectionHeaders = Array.isArray(campaign.detection_headers) ? campaign.detection_headers : [];
    const detectedPhone = resolveMsisdnFromHeaders(headers, detectionHeaders);

    // 4. Create Visit record
    const visitId = `vst_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    await query(`
      INSERT INTO visits (id, campaign_id, vendor_id, tracking_campid, click_id, msisdn, user_ip, user_agent, he_resolved, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'VISIT')
    `, [visitId, campaign.id, vendorId, campaign.tracking_id, clickId || null, detectedPhone, ip, userAgent, Boolean(detectedPhone)]);

    // Log timeline event
    await query(`
      INSERT INTO visit_events (visit_id, event_type, metadata)
      VALUES ($1, 'VISIT_DETECTED', $2)
    `, [visitId, JSON.stringify({ detected: Boolean(detectedPhone), phone: detectedPhone })]);

    // Decide initial entry page based on mode and detection
    let entryPage = 'HOME';
    if (campaign.verification_mode === 'HEADER_INJECTION' && !detectedPhone) {
      entryPage = 'BLOCKED';
    } else if (campaign.verification_mode === 'OTP_ONLY') {
      entryPage = 'HOME'; // Home CTA goes directly to OTP
    }

    return {
      visitId,
      campaignId: campaign.id,
      trackingId: campaign.tracking_id,
      msisdn: detectedPhone,
      detected: Boolean(detectedPhone),
      verificationMode: campaign.verification_mode,
      entryPage,
    };
  }

  /**
   * 2. Serve Funnel Page HTML/CSS with Dynamic Placeholder Replacement
   */
  async getPage({ campid, pageType = 'HOME', msisdn = '' }) {
    const res = await query(`
      SELECT cp.page_type, t.html_content, t.css_content, c.price_text, c.name as service_name
      FROM campaign_pages cp
      JOIN campaigns c ON cp.campaign_id = c.id
      JOIN templates t ON cp.template_id = t.id
      WHERE (c.tracking_id = $1 OR c.id::text = $1) AND cp.page_type = $2
    `, [campid, pageType.toUpperCase()]);

    const page = res.rows[0];
    if (!page) {
      throw { status: 404, message: `Page "${pageType}" not found for this campaign.` };
    }

    // Dynamic Macro Replacement
    const html = page.html_content
      .replace(/{{msisdn}}/g, msisdn || '')
      .replace(/{{price}}/g, page.price_text || '')
      .replace(/{{serviceName}}/g, page.service_name || '');

    return {
      pageType: page.page_type,
      html,
      css: page.css_content,
    };
  }

  /**
   * 3. Handle User Action Transition (SUBSCRIBE, CONFIRM, etc.)
   */
  async handleTransition({ visitId, action, phone }) {
    const vRes = await query(`
      SELECT v.*, c.verification_mode, c.service_id, c.id as camp_id, v.vendor_id, v.click_id
      FROM visits v
      JOIN campaigns c ON v.campaign_id = c.id
      WHERE v.id = $1
    `, [visitId]);

    const visit = vRes.rows[0];
    if (!visit) {
      throw { status: 404, message: 'Invalid visit session.' };
    }

    const currentPhone = phone || visit.msisdn;

    if (action === 'SUBSCRIBE') {
      // If phone is verified via HE or previous OTP -> Direct Charge
      if (visit.he_resolved || visit.otp_verified_at) {
        const chargeResult = await otpService.chargeDirect({
          campaignId: visit.camp_id,
          msisdn: currentPhone,
          serviceId: visit.service_id,
        });

        if (chargeResult.success) {
          await query("UPDATE visits SET status = 'SUBSCRIBED', updated_at = NOW() WHERE id = $1", [visitId]);
          // Trigger asynchronous conversion postback
          postbacksService.triggerConversionPostback({
            visitId,
            vendorId: visit.vendor_id,
            clickId: visit.click_id,
            campaignId: visit.camp_id,
          }).catch(console.error);

          return { nextPage: 'THANKYOU', status: 'SUBSCRIBED' };
        } else if (chargeResult.lowBalance) {
          return { nextPage: 'LOW_BALANCE', status: 'LOW_BALANCE' };
        } else {
          return { nextPage: 'ERROR', status: 'FAILED' };
        }
      }

      // If phone is not verified -> Route to OTP
      return { nextPage: 'OTP', status: 'OTP_REQUIRED' };
    }

    return { nextPage: 'HOME', status: 'ACTIVE' };
  }
}

export const flowService = new FlowService();
