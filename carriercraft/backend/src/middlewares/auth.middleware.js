import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { errorResponse } from '../utils/response.js';

/**
 * Authentication Guard Middleware
 * Verifies Bearer JWT token from Authorization header.
 */
export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse(res, 'Authentication required. No token provided.', 401);
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded; // { id, email, role }
    next();
  } catch (err) {
    return errorResponse(res, 'Invalid or expired token.', 401, err.message);
  }
}

/**
 * Super Admin Role Guard
 */
export function requireSuperAdmin(req, res, next) {
  if (req.user?.role !== 'superadmin') {
    return errorResponse(res, 'Access denied. Superadmin privileges required.', 403);
  }
  next();
}
