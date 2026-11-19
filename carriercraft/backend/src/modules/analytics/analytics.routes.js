import { Router } from 'express';
import { analyticsController } from './analytics.controller.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';

const router = Router();

router.use(requireAuth);
router.get('/dashboard', (req, res, next) => analyticsController.getDashboardKpis(req, res, next));
router.get('/visits', (req, res, next) => analyticsController.listVisits(req, res, next));
router.get('/visits/:visitId/waterfall', (req, res, next) => analyticsController.getWaterfall(req, res, next));

export default router;
