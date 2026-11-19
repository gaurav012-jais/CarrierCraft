import { query } from '../../database/connection.js';

export const PAGE_TYPES = ['HOME', 'OTP', 'CONFIRM', 'THANKYOU', 'INPROGRESS', 'LOW_BALANCE', 'BLOCKED', 'ERROR'];

export class CampaignPagesService {
  /**
   * List all 8 pages for a campaign
   */
  async getPages(campaignId) {
    const res = await query(`
      SELECT id, campaign_id, page_type, is_active, updated_at,
             LENGTH(COALESCE(html_content, '')) as html_length
      FROM campaign_pages
      WHERE campaign_id = $1
      ORDER BY id ASC
    `, [campaignId]);

    // If pages don't exist yet, seed them
    if (res.rows.length === 0) {
      for (const pt of PAGE_TYPES) {
        await query(`
          INSERT INTO campaign_pages (campaign_id, page_type, is_active, html_content, css_content, project_data)
          VALUES ($1, $2, true, '', '', '{}')
          ON CONFLICT (campaign_id, page_type) DO NOTHING
        `, [campaignId, pt]);
      }
      return this.getPages(campaignId);
    }

    return res.rows;
  }

  /**
   * Get single page content for GrapesJS Editor
   */
  async getPageByType(campaignId, pageType) {
    const ptUpper = String(pageType).toUpperCase();
    const res = await query(`
      SELECT cp.*, c.name as campaign_name, c.country_code, c.operator_code, c.verification_mode
      FROM campaign_pages cp
      JOIN campaigns c ON cp.campaign_id = c.id
      WHERE cp.campaign_id = $1 AND UPPER(cp.page_type) = $2
    `, [campaignId, ptUpper]);

    let page = res.rows[0];
    if (!page) {
      // Auto-create blank page record if missing
      const insert = await query(`
        INSERT INTO campaign_pages (campaign_id, page_type, is_active, html_content, css_content, project_data)
        VALUES ($1, $2, true, '', '', '{}')
        RETURNING *
      `, [campaignId, ptUpper]);
      page = insert.rows[0];
    }
    return page;
  }

  /**
   * Save GrapesJS Editor content for a campaign page
   */
  async savePage(campaignId, pageType, { htmlContent, cssContent, projectData }) {
    const ptUpper = String(pageType).toUpperCase();
    const projectJson = typeof projectData === 'object' ? JSON.stringify(projectData) : projectData || '{}';

    const res = await query(`
      INSERT INTO campaign_pages (campaign_id, page_type, html_content, css_content, project_data, is_active, updated_at)
      VALUES ($1, $2, $3, $4, $5, true, NOW())
      ON CONFLICT (campaign_id, page_type) DO UPDATE SET
        html_content = EXCLUDED.html_content,
        css_content = EXCLUDED.css_content,
        project_data = EXCLUDED.project_data,
        updated_at = NOW()
      RETURNING *
    `, [campaignId, ptUpper, htmlContent || '', cssContent || '', projectJson]);

    return res.rows[0];
  }
}

export const campaignPagesService = new CampaignPagesService();
