import { errorResponse } from '../utils/response.js';

/**
 * Global Error Handler Middleware
 */
export function globalErrorHandler(err, req, res, next) {
  console.error('[Unhandled Error]', err.stack || err);
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  return errorResponse(res, message, status, err.details || null);
}
