import { flowService } from './flow.service.js';
import { successResponse, errorResponse } from '../../utils/response.js';

export class FlowController {
  async detectMsisdn(req, res, next) {
    try {
      const { country, operator, campid, vid, click_id } = req.query;
      if (!campid) {
        return errorResponse(res, 'Campaign parameter (campid) is required.', 400);
      }

      const result = await flowService.detectMsisdn({
        countryCode: country,
        operatorCode: operator,
        campid,
        vid,
        clickId: click_id,
        headers: req.headers,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'] || '',
      });

      return successResponse(res, result, 'Traffic session initialized.');
    } catch (err) {
      next(err);
    }
  }

  async getPage(req, res, next) {
    try {
      const { campid, pageType, msisdn } = req.query;
      if (!campid) {
        return errorResponse(res, 'Campaign parameter (campid) is required.', 400);
      }

      const page = await flowService.getPage({
        campid,
        pageType: pageType || 'HOME',
        msisdn,
      });

      return successResponse(res, page, 'Page fetched successfully.');
    } catch (err) {
      next(err);
    }
  }

  async transition(req, res, next) {
    try {
      const { visitId, action, phone } = req.body;
      if (!visitId || !action) {
        return errorResponse(res, 'visitId and action are required.', 400);
      }

      const result = await flowService.handleTransition({ visitId, action, phone });
      return successResponse(res, result, 'Transition processed.');
    } catch (err) {
      next(err);
    }
  }
}

export const flowController = new FlowController();
