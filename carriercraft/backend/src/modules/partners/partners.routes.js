import { Router } from 'express';
import { partnersController } from './partners.controller.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';

const router = Router();

router.use(requireAuth);
router.get('/vendors', (req, res, next) => partnersController.listVendors(req, res, next));
router.post('/vendors', (req, res, next) => partnersController.createVendor(req, res, next));
router.post('/affiliates', (req, res, next) => partnersController.addAffiliate(req, res, next));
router.post('/assign-tracking', (req, res, next) => partnersController.assignTracking(req, res, next));
router.get('/generate-link', (req, res, next) => partnersController.generateLink(req, res, next));

export default router;
