import { authService } from './auth.service.js';
import { successResponse, errorResponse } from '../../utils/response.js';

export class AuthController {
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return errorResponse(res, 'Email and password are required.', 400);
      }
      const data = await authService.login(email.trim(), password);
      return successResponse(res, data, 'Login successful.');
    } catch (err) {
      next(err);
    }
  }

  async getMe(req, res, next) {
    try {
      const user = await authService.getProfile(req.user.id);
      return successResponse(res, user, 'Profile fetched successfully.');
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();
