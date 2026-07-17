const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'arch_portfolio_cms_secret_key_2026_unbreakable_secret');

      // Add user from payload
      req.user = decoded;
      next();
    } catch (error) {
      console.error('[AUTH ERROR] Token verification failed:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

// Middleware to restrict access to Admins (or roles)
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Role (${req.user?.role || 'Guest'}) is not authorized to access this resource`
      });
    }
    next();
  };
};

const optionalProtect = (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'arch_portfolio_cms_secret_key_2026_unbreakable_secret');
      req.user = decoded;
    } catch (error) {
      console.warn('[AUTH OPTIONAL] Token verification failed:', error.message);
    }
  }
  next();
};

module.exports = {
  protect,
  authorize,
  optionalProtect,
};
