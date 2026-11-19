import { templatesService } from './templates.service.js';
import { successResponse } from '../../utils/response.js';

export class TemplatesController {
  async listTemplates(req, res, next) {
    try {
      const data = await templatesService.listTemplates();
      return successResponse(res, data, 'Templates listed.');
    } catch (err) {
      next(err);
    }
  }

  async getTemplate(req, res, next) {
    try {
      const { id } = req.params;
      const data = await templatesService.getTemplate(id);
      return successResponse(res, data, 'Template loaded.');
    } catch (err) {
      next(err);
    }
  }

  async saveTemplate(req, res, next) {
    try {
      const { id } = req.params;
      const data = await templatesService.saveTemplate(id, req.body);
      return successResponse(res, data, 'Template saved successfully.');
    } catch (err) {
      next(err);
    }
  }
}

export const templatesController = new TemplatesController();
