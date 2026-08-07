const helmet = require('helmet');

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Enterprise security headers middleware configured via Helmet.
 */
const configureSecurityHeaders = () => {
  const helmetMiddleware = helmet({
    // Content Security Policy tuned for modern web app, Google Fonts, and media preview
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        imgSrc: ["'self'", "data:", "blob:", "https:", "http:"],
        mediaSrc: ["'self'", "data:", "blob:", "https:", "http:"],
        connectSrc: ["'self'", "http://localhost:*", "http://127.0.0.1:*", "https:"],
        frameAncestors: ["'self'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: isProduction ? [] : null,
      },
    },
    // Prevent MIME-type sniffing
    noSniff: true,
    // Referrer policy
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    // Prevent clickjacking
    frameguard: { action: 'sameorigin' },
    // Cross Origin Resource Policy for serving media files
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    // HTTP Strict Transport Security (Production Only)
    hsts: isProduction
      ? { maxAge: 31536000, includeSubDomains: true, preload: true }
      : false,
  });

  return (req, res, next) => {
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    helmetMiddleware(req, res, next);
  };
};

module.exports = {
  configureSecurityHeaders,
};
