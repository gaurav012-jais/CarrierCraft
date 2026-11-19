/**
 * Standard API Response Helpers
 * Keeps response JSON structure consistent across all endpoints.
 */

export function successResponse(res, data = null, message = 'Success', status = 200) {
  return res.status(status).json({
    success: true,
    message,
    data,
  });
}

export function errorResponse(res, message = 'An error occurred', status = 500, details = null) {
  return res.status(status).json({
    success: false,
    error: {
      message,
      details,
    },
  });
}
