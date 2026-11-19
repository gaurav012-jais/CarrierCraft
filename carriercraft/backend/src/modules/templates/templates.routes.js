import { Router } from 'express';
import { templatesController } from './templates.controller.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';

const router = Router();

router.use(requireAuth);
router.get('/', (req, res, next) => templatesController.listTemplates(req, res, next));
router.get('/:id', (req, res, next) => templatesController.getTemplate(req, res, next));
router.put('/:id', (req, res, next) => templatesController.saveTemplate(req, res, next));

export default router;
