import { query } from '../../database/connection.js';

export class AnalyticsService {
  /**
   * Executive Dashboard Real-Time KPIs
   */
  async getDashboardKpis() {
    // 1. Total Visits
    const visitsRes = await query('SELECT COUNT(*) as total_visits FROM visits');
    const totalVisits = parseInt(visitsRes.rows[0]?.total_visits || '0', 10);

    // 2. HE Hits
    const heRes = await query('SELECT COUNT(*) as he_hits FROM visits WHERE he_resolved = true');
    const heHits = parseInt(heRes.rows[0]?.he_hits || '0', 10);
    const heRate = totalVisits > 0 ? ((heHits / totalVisits) * 100).toFixed(1) : '0.0';

    // 3. Conversions (Subscribers)
    const subRes = await query("SELECT COUNT(*) as conversions FROM visits WHERE status = 'SUBSCRIBED'");
    const conversions = parseInt(subRes.rows[0]?.conversions || '0', 10);
    const cr = totalVisits > 0 ? ((conversions / totalVisits) * 100).toFixed(2) : '0.00';

    // 4. Gross Revenue Estimation (approx $2.50 per sub)
    const grossRevenue = (conversions * 2.5).toFixed(2);

    // 5. Recent Conversions Feed
    const feedRes = await query(`
      SELECT v.id, v.created_at, v.msisdn, v.status, c.name as campaign_name, c.country_code, c.operator_code, vn.name as vendor_name
      FROM visits v
      JOIN campaigns c ON v.campaign_id = c.id
      LEFT JOIN vendors vn ON v.vendor_id = vn.id
      WHERE v.status = 'SUBSCRIBED'
      ORDER BY v.updated_at DESC
      LIMIT 10
    `);

    return {
      kpis: {
        totalVisits,
        heHits,
        heRate: `${heRate}%`,
        conversions,
        conversionRate: `${cr}%`,
        grossRevenue: `$${grossRevenue}`,
      },
      recentConversions: feedRes.rows.map((row) => ({
        ...row,
        msisdn: row.msisdn ? row.msisdn.replace(/(\d{4})\d+(\d{2})/, '$1****$2') : 'N/A',
      })),
    };
  }

  /**
   * Searchable Traffic Visits List
   */
  async listVisits({ limit = 50, status, campid }) {
    let sql = `
      SELECT v.id, v.created_at, v.tracking_campid, v.click_id, v.msisdn, v.user_ip, v.he_resolved, v.status,
             c.name as campaign_name, vn.name as vendor_name
      FROM visits v
      JOIN campaigns c ON v.campaign_id = c.id
      LEFT JOIN vendors vn ON v.vendor_id = vn.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      params.push(status);
      sql += ` AND v.status = $${params.length}`;
    }
    if (campid) {
      params.push(campid);
      sql += ` AND (c.tracking_id = $${params.length} OR c.id::text = $${params.length})`;
    }

    params.push(limit);
    sql += ` ORDER BY v.created_at DESC LIMIT $${params.length}`;

    const res = await query(sql, params);
    return res.rows;
  }

  /**
   * Session Waterfall Inspector (Granular Timeline)
   */
  async getVisitWaterfall(visitId) {
    const vRes = await query(`
      SELECT v.*, c.name as campaign_name, vn.name as vendor_name
      FROM visits v
      JOIN campaigns c ON v.campaign_id = c.id
      LEFT JOIN vendors vn ON v.vendor_id = vn.id
      WHERE v.id = $1
    `, [visitId]);

    const visit = vRes.rows[0];
    if (!visit) throw { status: 404, message: 'Visit not found.' };

    const eventsRes = await query(`
      SELECT event_type, page_type, metadata, created_at 
      FROM visit_events 
      WHERE visit_id = $1 
      ORDER BY id ASC
    `, [visitId]);

    const apiLogsRes = await query(`
      SELECT call_type, endpoint_url, http_status, latency_ms, is_success, created_at 
      FROM api_call_logs 
      WHERE visit_id = $1 
      ORDER BY id ASC
    `, [visitId]);

    const postbacksRes = await query(`
      SELECT request_url, http_status, is_success, created_at 
      FROM conversion_postbacks 
      WHERE visit_id = $1 
      ORDER BY id ASC
    `, [visitId]);

    return {
      visit,
      events: eventsRes.rows,
      telecomCalls: apiLogsRes.rows,
      postbacks: postbacksRes.rows,
    };
  }
}

export const analyticsService = new AnalyticsService();
