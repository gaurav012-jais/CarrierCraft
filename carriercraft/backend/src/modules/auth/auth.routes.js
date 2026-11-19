import { Router } from 'express';
import { authController } from './auth.controller.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';

const router = Router();

router.post('/login', (req, res, next) => authController.login(req, res, next));
router.get('/me', requireAuth, (req, res, next) => authController.getMe(req, res, next));

export default router;
