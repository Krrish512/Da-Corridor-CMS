const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { requireRole } = require('../rbac');
const {
  getBackups,
  triggerBackup,
  downloadBackup,
  deleteBackup,
} = require('../controllers/backup.controller');

// All backup routes strictly restricted to SUPER_ADMIN
router.use(protect);
router.use(requireRole('SUPER_ADMIN'));

router.get('/', getBackups);
router.post('/', triggerBackup);
router.get('/:filename/download', downloadBackup);
router.delete('/:filename', deleteBackup);

module.exports = router;
