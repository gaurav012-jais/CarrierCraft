import { query } from '../../database/connection.js';
import { campaignPagesService } from './campaign-pages.service.js';
import { campaignVendorsService } from './campaign-vendors.service.js';

export class CampaignsService {
  /**
   * List all campaigns with operator & country details
   */
  async listCampaigns({ countryCode, operatorCode, status } = {}) {
    let sql = `
      SELECT c.*, o.name as operator_name, co.name as country_name, co.currency
      FROM campaigns c
      JOIN operators o ON c.operator_id = o.id
      JOIN countries co ON o.country_id = co.id
      WHERE 1=1
    `;
    const params = [];

    if (countryCode) {
      params.push(countryCode.toUpperCase());
      sql += ` AND c.country_code = $${params.length}`;
    }
    if (operatorCode) {
      params.push(operatorCode.toUpperCase());
      sql += ` AND c.operator_code = $${params.length}`;
    }
    if (status !== undefined) {
      params.push(status === 'true' || status === true);
      sql += ` AND c.is_active = $${params.length}`;
    }

    sql += ' ORDER BY c.id DESC';
    const res = await query(sql, params);
    return res.rows;
  }

  /**
   * Get single campaign details with its pages, api_config, and vendors
   */
  async getCampaignById(id) {
    const campRes = await query(`
      SELECT c.*, o.name as operator_name, co.name as country_name, co.dial_code, co.currency
      FROM campaigns c
      JOIN operators o ON c.operator_id = o.id
      JOIN countries co ON o.country_id = co.id
      WHERE c.id = $1
    `, [id]);

    const campaign = campRes.rows[0];
    if (!campaign) {
      throw { status: 404, message: 'Campaign not found.' };
    }

    // Fetch assigned 8 pages
    campaign.pages = await campaignPagesService.getPages(id);

    // Fetch api config
    const apiRes = await query('SELECT * FROM api_configs WHERE campaign_id = $1', [id]);
    campaign.apiConfig = apiRes.rows[0] || null;

    // Fetch assigned vendors
    campaign.vendors = await campaignVendorsService.getAssignedVendors(id);

    return campaign;
  }

  /**
   * Create a new campaign with auto-generated tracking_id & default pages
   */
  async createCampaign({ name, operatorId, verificationMode = 'BOTH', funnelLayout = 'classic', priceText = '3.5 AED/day', serviceId = '' }) {
    const opRes = await query(`
      SELECT o.code as operator_code, c.code as country_code
      FROM operators o
      JOIN countries c ON o.country_id = c.id
      WHERE o.id = $1
    `, [operatorId]);

    const op = opRes.rows[0];
    if (!op) throw { status: 400, message: 'Invalid operator ID.' };

    const insertRes = await query(`
      INSERT INTO campaigns (name, tracking_id, operator_id, country_code, operator_code, verification_mode, funnel_layout, service_id, price_text)
      VALUES ($1, 'TEMP', $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `, [name, operatorId, op.country_code, op.operator_code, verificationMode, funnelLayout, serviceId, priceText]);

    const campaignId = insertRes.rows[0].id;
    const trackingId = `${op.country_code}-${op.operator_code}-${campaignId}`;

    await query('UPDATE campaigns SET tracking_id = $1 WHERE id = $2', [trackingId, campaignId]);

    // Seed default 8 pages
    await campaignPagesService.getPages(campaignId);

    return this.getCampaignById(campaignId);
  }

  /**
   * Update full campaign settings
   */
  async updateCampaign(campaignId, updateData) {
    const {
      name, verificationMode, funnelLayout, priceText, serviceId,
      successRedirectUrl, cgRedirectUrl, postbackRegisterAt,
      dailyCap, cappingMetric, cappingAction, isActive
    } = updateData;

    const res = await query(`
      UPDATE campaigns SET
        name = COALESCE($1, name),
        verification_mode = COALESCE($2, verification_mode),
        funnel_layout = COALESCE($3, funnel_layout),
        price_text = COALESCE($4, price_text),
        service_id = COALESCE($5, service_id),
        success_redirect_url = COALESCE($6, success_redirect_url),
        cg_redirect_url = COALESCE($7, cg_redirect_url),
        postback_register_at = COALESCE($8, postback_register_at),
        daily_cap = COALESCE($9, daily_cap),
        capping_metric = COALESCE($10, capping_metric),
        capping_action = COALESCE($11, capping_action),
        is_active = COALESCE($12, is_active),
        updated_at = NOW()
      WHERE id = $13
      RETURNING *
    `, [
      name, verificationMode, funnelLayout, priceText, serviceId,
      successRedirectUrl, cgRedirectUrl, postbackRegisterAt,
      dailyCap, cappingMetric, cappingAction, isActive, campaignId
    ]);

    if (res.rowCount === 0) throw { status: 404, message: 'Campaign not found.' };
    return res.rows[0];
  }

  /**
   * Save or update Partner API Config
   */
  async saveApiConfig(campaignId, apiConfigData) {
    const {
      heProvider = 'header',
      checkSubUrl = '',
      sendOtpUrl = '',
      verifyOtpUrl = '',
      subscribeUrl = '',
      blocklistUrl = '',
      resolveMsisdnUrl = '',
      heConfigJson = {},
      otpConfigJson = {},
      headersJson = {}
    } = apiConfigData;

    const res = await query(`
      INSERT INTO api_configs (
        campaign_id, he_provider, check_sub_url, send_otp_url, verify_otp_url,
        subscribe_url, blocklist_url, resolve_msisdn_url,
        he_config_json, otp_config_json, headers_json, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
      ON CONFLICT (campaign_id) DO UPDATE SET
        he_provider = EXCLUDED.he_provider,
        check_sub_url = EXCLUDED.check_sub_url,
        send_otp_url = EXCLUDED.send_otp_url,
        verify_otp_url = EXCLUDED.verify_otp_url,
        subscribe_url = EXCLUDED.subscribe_url,
        blocklist_url = EXCLUDED.blocklist_url,
        resolve_msisdn_url = EXCLUDED.resolve_msisdn_url,
        he_config_json = EXCLUDED.he_config_json,
        otp_config_json = EXCLUDED.otp_config_json,
        headers_json = EXCLUDED.headers_json,
        updated_at = NOW()
      RETURNING *
    `, [
      campaignId, heProvider, checkSubUrl, sendOtpUrl, verifyOtpUrl,
      subscribeUrl, blocklistUrl, resolveMsisdnUrl,
      JSON.stringify(heConfigJson || {}),
      JSON.stringify(otpConfigJson || {}),
      JSON.stringify(headersJson || {})
    ]);
    return res.rows[0];
  }
}

export const campaignsService = new CampaignsService();
