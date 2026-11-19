import { partnersService } from './partners.service.js';
import { successResponse, errorResponse } from '../../utils/response.js';

export class PartnersController {
  async listVendors(req, res, next) {
    try {
      const data = await partnersService.listVendors();
      return successResponse(res, data, 'Vendors listed.');
    } catch (err) {
      next(err);
    }
  }

  async createVendor(req, res, next) {
    try {
      const { name, code, postbackUrl } = req.body;
      if (!name || !code) {
        return errorResponse(res, 'Name and code are required.', 400);
      }
      const vendor = await partnersService.createVendor({ name, code, postbackUrl });
      return successResponse(res, vendor, 'Vendor created.', 201);
    } catch (err) {
      next(err);
    }
  }

  async addAffiliate(req, res, next) {
    try {
      const { vendorId, name, affiliateCode } = req.body;
      if (!vendorId || !name || !affiliateCode) {
        return errorResponse(res, 'vendorId, name, and affiliateCode are required.', 400);
      }
      const aff = await partnersService.addAffiliate({ vendorId, name, affiliateCode });
      return successResponse(res, aff, 'Affiliate created.', 201);
    } catch (err) {
      next(err);
    }
  }

  async assignTracking(req, res, next) {
    try {
      const { campaignId, vendorId, affiliateId, payoutUsd, dailyCap } = req.body;
      const tracking = await partnersService.assignCampaignTracking({ campaignId, vendorId, affiliateId, payoutUsd, dailyCap });
      return successResponse(res, tracking, 'Campaign tracking assigned.');
    } catch (err) {
      next(err);
    }
  }

  async generateLink(req, res, next) {
    try {
      const link = partnersService.generateTrackingLink(req.query);
      return successResponse(res, { trackingUrl: link }, 'Tracking link generated.');
    } catch (err) {
      next(err);
    }
  }
}

export const partnersController = new PartnersController();
