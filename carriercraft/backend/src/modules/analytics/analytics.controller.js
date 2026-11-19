import { analyticsService } from './analytics.service.js';
import { successResponse } from '../../utils/response.js';

export class AnalyticsController {
  async getDashboardKpis(req, res, next) {
    try {
      const data = await analyticsService.getDashboardKpis();
      return successResponse(res, data, 'Dashboard KPIs fetched.');
    } catch (err) {
      next(err);
    }
  }

  async listVisits(req, res, next) {
    try {
      const { limit, status, campid } = req.query;
      const data = await analyticsService.listVisits({
        limit: Number(limit || 50),
        status,
        campid,
      });
      return successResponse(res, data, 'Visits list retrieved.');
    } catch (err) {
      next(err);
    }
  }

  async getWaterfall(req, res, next) {
    try {
      const { visitId } = req.params;
      const data = await analyticsService.getVisitWaterfall(visitId);
      return successResponse(res, data, 'Session waterfall retrieved.');
    } catch (err) {
      next(err);
    }
  }
}

export const analyticsController = new AnalyticsController();
