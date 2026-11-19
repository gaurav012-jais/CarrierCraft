import { Router } from 'express';
import { flowController } from './flow.controller.js';

const router = Router();

// Public Runtime Endpoints (No Auth Needed)
router.get('/detect-msisdn', (req, res, next) => flowController.detectMsisdn(req, res, next));
router.get('/page', (req, res, next) => flowController.getPage(req, res, next));
router.post('/transition', (req, res, next) => flowController.transition(req, res, next));

export default router;
