import { usersService } from './users.service.js';
import { successResponse, errorResponse } from '../../utils/response.js';

export class UsersController {
  async listUsers(req, res, next) {
    try {
      const users = await usersService.listUsers();
      return successResponse(res, users, 'Users retrieved successfully.');
    } catch (err) {
      next(err);
    }
  }

  async createUser(req, res, next) {
    try {
      const { name, email, password, role } = req.body;
      if (!name || !email || !password) {
        return errorResponse(res, 'Name, email, and password are required.', 400);
      }
      const user = await usersService.createUser({ name, email, password, role });
      return successResponse(res, user, 'User created successfully.', 201);
    } catch (err) {
      next(err);
    }
  }

  async toggleActive(req, res, next) {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      const user = await usersService.toggleActive(id, Boolean(isActive));
      return successResponse(res, user, 'User status updated.');
    } catch (err) {
      next(err);
    }
  }
}

export const usersController = new UsersController();
