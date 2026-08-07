const { hasPermission } = require('./permissionMatrix');
const prisma = require('../utils/db');

/**
 * Express middleware to restrict route access by required permission.
 */
const requirePermission = (permission) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Unauthorized: No active session' });
      }

      // Re-verify active status and role from DB to ensure instant role & deactivation propagation
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { id: true, name: true, email: true, role: true, isActive: true, deletedAt: true }
      });

      if (!user || user.deletedAt || user.isActive === false) {
        return res.status(403).json({ message: 'Account is deactivated or invalid', code: 'ACCOUNT_DEACTIVATED' });
      }

      // Attach fresh user details to request
      req.user = user;

      if (!hasPermission(user.role, permission)) {
        return res.status(403).json({
          message: `Access denied: Role (${user.role}) lacks '${permission}' permission`,
          code: 'PERMISSION_DENIED',
        });
      }

      next();
    } catch (error) {
      console.error('[RBAC MIDDLEWARE ERROR]:', error);
      res.status(500).json({ message: 'Server error during authorization check' });
    }
  };
};

/**
 * Express middleware to restrict route access by explicit roles.
 */
const requireRole = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Unauthorized: No active session' });
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { id: true, name: true, email: true, role: true, isActive: true, deletedAt: true }
      });

      if (!user || user.deletedAt || user.isActive === false) {
        return res.status(403).json({ message: 'Account is deactivated or invalid', code: 'ACCOUNT_DEACTIVATED' });
      }

      req.user = user;

      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({
          message: `Access denied: Role (${user.role}) is not permitted`,
          code: 'ROLE_DENIED',
        });
      }

      next();
    } catch (error) {
      console.error('[RBAC ROLE MIDDLEWARE ERROR]:', error);
      res.status(500).json({ message: 'Server error during role authorization check' });
    }
  };
};

module.exports = {
  requirePermission,
  requireRole,
};
