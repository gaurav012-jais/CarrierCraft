import bcrypt from 'bcrypt';
import { query } from '../../database/connection.js';

export class UsersService {
  async listUsers() {
    const res = await query('SELECT id, name, email, role, is_active, created_at FROM users ORDER BY id ASC');
    return res.rows;
  }

  async createUser({ name, email, password, role = 'manager' }) {
    const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rowCount > 0) {
      throw { status: 400, message: 'User with this email already exists.' };
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const res = await query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, created_at',
      [name, email, passwordHash, role]
    );
    return res.rows[0];
  }

  async toggleActive(id, isActive) {
    const res = await query('UPDATE users SET is_active = $1, updated_at = NOW() WHERE id = $2 RETURNING id, is_active', [isActive, id]);
    if (res.rowCount === 0) {
      throw { status: 404, message: 'User not found.' };
    }
    return res.rows[0];
  }
}

export const usersService = new UsersService();
