const logger = require('../utils/logger');
const { logActivity } = require('../utils/activityLogger');

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Centralized Express Error Handling Middleware.
 */
const errorHandler = (err, req, res, next) => {
  const statusCode = err.status || err.statusCode || 500;
  const requestId = req.id || 'N/A';
  const errorCode = err.code || (statusCode >= 500 ? 'INTERNAL_SERVER_ERROR' : 'BAD_REQUEST');
  const userEmail = req.user?.email || 'guest@dacorridor.com';

  // Log structured error
  logger.error(`[EXPRESS_ERROR]: ${err.message}`, err, {
    requestId,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userEmail,
  });

  // Activity Log integration for server errors (5xx)
  if (statusCode >= 500) {
    logActivity(req, {
      action: 'SYSTEM_ERROR_LOGGED',
      details: `Server Error 500 on ${req.method} ${req.originalUrl}: ${err.message}`,
      userEmail,
    }).catch(() => {});
  }

  res.status(statusCode).json({
    error: {
      id: requestId,
      message: isProduction && statusCode >= 500 ? 'An unexpected server error occurred. Please try again later.' : err.message,
      code: errorCode,
      timestamp: new Date().toISOString(),
      stack: isProduction ? undefined : err.stack,
    },
  });
};

module.exports = errorHandler;
