import { campaignsService } from './campaigns.service.js';
import { campaignPagesService } from './campaign-pages.service.js';
import { campaignVendorsService } from './campaign-vendors.service.js';
import { successResponse, errorResponse } from '../../utils/response.js';

export class CampaignsController {
  async listCampaigns(req, res, next) {
    try {
      const data = await campaignsService.listCampaigns(req.query);
      return successResponse(res, data, 'Campaigns fetched successfully.');
    } catch (err) { next(err); }
  }

  async getCampaign(req, res, next) {
    try {
      const campaign = await campaignsService.getCampaignById(req.params.id);
      return successResponse(res, campaign, 'Campaign details fetched.');
    } catch (err) { next(err); }
  }

  async createCampaign(req, res, next) {
    try {
      const { name, operatorId, verificationMode, funnelLayout, priceText, serviceId } = req.body;
      if (!name || !operatorId) return errorResponse(res, 'Name and operatorId are required.', 400);
      const campaign = await campaignsService.createCampaign({ name, operatorId, verificationMode, funnelLayout, priceText, serviceId });
      return successResponse(res, campaign, 'Campaign created successfully.', 201);
    } catch (err) { next(err); }
  }

  async updateCampaign(req, res, next) {
    try {
      const updated = await campaignsService.updateCampaign(req.params.id, req.body);
      return successResponse(res, updated, 'Campaign updated successfully.');
    } catch (err) { next(err); }
  }

  async saveApiConfig(req, res, next) {
    try {
      const config = await campaignsService.saveApiConfig(req.params.id, req.body);
      return successResponse(res, config, 'Partner API config saved.');
    } catch (err) { next(err); }
  }

  // --- Campaign Pages (GrapesJS) ---
  async getPages(req, res, next) {
    try {
      const pages = await campaignPagesService.getPages(req.params.id);
      return successResponse(res, pages, 'Campaign pages fetched.');
    } catch (err) { next(err); }
  }

  async getPage(req, res, next) {
    try {
      const page = await campaignPagesService.getPageByType(req.params.id, req.params.pageType);
      return successResponse(res, page, 'Campaign page content fetched.');
    } catch (err) { next(err); }
  }

  async savePage(req, res, next) {
    try {
      const saved = await campaignPagesService.savePage(req.params.id, req.params.pageType, req.body);
      return successResponse(res, saved, 'Campaign page saved successfully.');
    } catch (err) { next(err); }
  }

  // --- Assigned Vendors & Tracking ---
  async getVendors(req, res, next) {
    try {
      const vendors = await campaignVendorsService.getAssignedVendors(req.params.id);
      return successResponse(res, vendors, 'Assigned vendors fetched.');
    } catch (err) { next(err); }
  }

  async assignVendor(req, res, next) {
    try {
      const assigned = await campaignVendorsService.assignVendor(req.params.id, req.body);
      return successResponse(res, assigned, 'Vendor assigned to campaign.');
    } catch (err) { next(err); }
  }

  async removeVendor(req, res, next) {
    try {
      const result = await campaignVendorsService.removeVendor(req.params.id, req.params.trackingId);
      return successResponse(res, result, 'Vendor unassigned.');
    } catch (err) { next(err); }
  }
}

export const campaignsController = new CampaignsController();
