import { postbacksService } from './postbacks.service.js';
import { successResponse } from '../../utils/response.js';

export class PostbacksController {
  async listPostbacks(req, res, next) {
    try {
      const data = await postbacksService.listPostbacks(Number(req.query.limit || 50));
      return successResponse(res, data, 'Postbacks listed.');
    } catch (err) {
      next(err);
    }
  }

  async retry(req, res, next) {
    try {
      const { id } = req.params;
      const data = await postbacksService.retryPostback(id);
      return successResponse(res, data, 'Postback retried.');
    } catch (err) {
      next(err);
    }
  }
}

export const postbacksController = new PostbacksController();
