const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { requirePermission } = require('../rbac');
const {
  getUsers,
  createUser,
  updateUser,
  toggleUserStatus,
  resetUserPassword,
  deleteUser,
} = require('../controllers/user.controller');

// All endpoints protected by authentication & USERS_MANAGE permission
router.use(protect);

router.get('/', requirePermission('USERS_MANAGE'), getUsers);
router.post('/', requirePermission('USERS_MANAGE'), createUser);
router.put('/:id', requirePermission('USERS_MANAGE'), updateUser);
router.patch('/:id/status', requirePermission('USERS_MANAGE'), toggleUserStatus);
router.post('/:id/reset-password', requirePermission('USERS_MANAGE'), resetUserPassword);
router.delete('/:id', requirePermission('USERS_DELETE'), deleteUser);

module.exports = router;
