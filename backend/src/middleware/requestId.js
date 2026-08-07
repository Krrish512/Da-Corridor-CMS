const crypto = require('crypto');

/**
 * Middleware to generate or forward correlation/request IDs.
 */
const requestIdMiddleware = (req, res, next) => {
  const existingId = req.headers['x-request-id'];
  const requestId = existingId || crypto.randomUUID();

  req.id = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
};

module.exports = requestIdMiddleware;
