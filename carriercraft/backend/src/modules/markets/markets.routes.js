import { Router } from 'express';
import { marketsController } from './markets.controller.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';

const router = Router();

router.use(requireAuth);
router.get('/', (req, res, next) => marketsController.getMarkets(req, res, next));
router.post('/', (req, res, next) => marketsController.createMarket(req, res, next));
router.get('/:countryCode/:operatorCode', (req, res, next) => marketsController.getMarketDetails(req, res, next));
router.put('/:countryCode/:operatorCode', (req, res, next) => marketsController.updateMarket(req, res, next));
router.post('/:countryCode/:operatorCode/campaigns', (req, res, next) => marketsController.createMarketCampaign(req, res, next));

router.post('/countries', (req, res, next) => marketsController.addCountry(req, res, next));
router.post('/operators', (req, res, next) => marketsController.addOperator(req, res, next));
router.put('/operators/:id/toggle', (req, res, next) => marketsController.toggleOperator(req, res, next));

export default router;
