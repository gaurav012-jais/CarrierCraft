import { Router } from 'express';
import { campaignsController } from './campaigns.controller.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';

const router = Router();

router.use(requireAuth);

// Campaigns CRUD
router.get('/', (req, res, next) => campaignsController.listCampaigns(req, res, next));
router.get('/:id', (req, res, next) => campaignsController.getCampaign(req, res, next));
router.post('/', (req, res, next) => campaignsController.createCampaign(req, res, next));
router.put('/:id', (req, res, next) => campaignsController.updateCampaign(req, res, next));

// API & HE Settings
router.put('/:id/api-config', (req, res, next) => campaignsController.saveApiConfig(req, res, next));

// Campaign Pages (GrapesJS Editor)
router.get('/:id/pages', (req, res, next) => campaignsController.getPages(req, res, next));
router.get('/:id/pages/:pageType', (req, res, next) => campaignsController.getPage(req, res, next));
router.put('/:id/pages/:pageType', (req, res, next) => campaignsController.savePage(req, res, next));

// Assigned Vendors & Payouts
router.get('/:id/vendors', (req, res, next) => campaignsController.getVendors(req, res, next));
router.post('/:id/vendors', (req, res, next) => campaignsController.assignVendor(req, res, next));
router.delete('/:id/vendors/:trackingId', (req, res, next) => campaignsController.removeVendor(req, res, next));

export default router;
