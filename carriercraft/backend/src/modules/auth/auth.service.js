import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../../database/connection.js';
import { config } from '../../config/env.js';

export class AuthService {
  /**
   * Validate email and password, return signed JWT
   */
  async login(email, password) {
    const res = await query('SELECT id, name, email, password_hash, role, is_active FROM users WHERE email = $1', [email]);
    const user = res.rows[0];

    if (!user || !user.is_active) {
      throw { status: 401, message: 'Invalid email or password.' };
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      throw { status: 401, message: 'Invalid email or password.' };
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  /**
   * Get user profile by ID
   */
  async getProfile(userId) {
    const res = await query('SELECT id, name, email, role, created_at FROM users WHERE id = $1', [userId]);
    const user = res.rows[0];
    if (!user) {
      throw { status: 404, message: 'User not found.' };
    }
    return user;
  }
}

export const authService = new AuthService();
