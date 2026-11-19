import { Router } from 'express';
import { usersController } from './users.controller.js';
import { requireAuth, requireSuperAdmin } from '../../middlewares/auth.middleware.js';

const router = Router();

router.use(requireAuth);
router.get('/', (req, res, next) => usersController.listUsers(req, res, next));
router.post('/', requireSuperAdmin, (req, res, next) => usersController.createUser(req, res, next));
router.patch('/:id/toggle', requireSuperAdmin, (req, res, next) => usersController.toggleActive(req, res, next));

export default router;
