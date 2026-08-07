const jwt = require('jsonwebtoken');
const prisma = require('../utils/db');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Verify user directly in the database (Single Source of Truth)
      const user = await prisma.user.findFirst({
        where: {
          id: decoded.id,
          isActive: true,
          deletedAt: null,
        },
      });

      if (!user) {
        return res.status(401).json({ message: 'Not authorized, user account deactivated or deleted' });
      }

      // Attach dynamic database claims
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
      };
      return next();
    } catch (error) {
      console.error('[AUTH ERROR] Token verification failed:', error.message);
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired, please log in again', code: 'TOKEN_EXPIRED' });
      }
      return res.status(401).json({ message: 'Not authorized, token invalid or failed' });
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

const optionalProtect = async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const user = await prisma.user.findFirst({
        where: {
          id: decoded.id,
          isActive: true,
          deletedAt: null,
        },
      });

      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
          role: user.role,
        };
      }
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
