const rateLimit = require('express-rate-limit');

// Helper to construct custom 429 handler
const createLimitHandler = (message, errorCode = 'TOO_MANY_REQUESTS') => {
  return (req, res /*, next, options */) => {
    res.status(429).json({
      error: {
        message: message || 'Too many requests, please try again later.',
        code: errorCode,
        timestamp: new Date().toISOString(),
      },
    });
  };
};

// 1. Strict Limiter for Authentication & Sensitive User Actions (Login, Password Reset)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_LOGIN_MAX || '10', 10),
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false },
  handler: createLimitHandler(
    'Too many authentication attempts. Please wait 15 minutes before trying again.',
    'AUTH_RATE_LIMIT_EXCEEDED'
  ),
});

// 2. Upload Limiter (Media Library / Upload Endpoints)
const uploadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: parseInt(process.env.RATE_LIMIT_UPLOAD_MAX || '15', 10),
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false },
  handler: createLimitHandler(
    'Upload frequency limit exceeded. Please wait a minute before uploading more files.',
    'UPLOAD_RATE_LIMIT_EXCEEDED'
  ),
});

// 3. Public Form Submissions (Contact Form & Newsletter)
const publicFormLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: parseInt(process.env.RATE_LIMIT_FORM_MAX || '5', 10),
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false },
  handler: createLimitHandler(
    'Too many form submissions from your IP. Please try again in 10 minutes.',
    'FORM_RATE_LIMIT_EXCEEDED'
  ),
});

// 4. General API Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: parseInt(process.env.RATE_LIMIT_API_MAX || '120', 10),
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false },
  handler: createLimitHandler(
    'API request limit exceeded. Please slow down your requests.',
    'API_RATE_LIMIT_EXCEEDED'
  ),
});

module.exports = {
  authLimiter,
  uploadLimiter,
  publicFormLimiter,
  apiLimiter,
};
