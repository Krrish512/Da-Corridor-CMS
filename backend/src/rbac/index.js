const { ROLES } = require('./roles');
const { PERMISSIONS } = require('./permissions');
const { PERMISSION_MATRIX, hasPermission } = require('./permissionMatrix');
const { requirePermission, requireRole } = require('./middleware');

module.exports = {
  ROLES,
  PERMISSIONS,
  PERMISSION_MATRIX,
  hasPermission,
  requirePermission,
  requireRole,
};
