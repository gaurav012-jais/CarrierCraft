import { Router } from 'express';
import { postbacksController } from './postbacks.controller.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';

const router = Router();

router.use(requireAuth);
router.get('/', (req, res, next) => postbacksController.listPostbacks(req, res, next));
router.post('/:id/retry', (req, res, next) => postbacksController.retry(req, res, next));

export default router;
