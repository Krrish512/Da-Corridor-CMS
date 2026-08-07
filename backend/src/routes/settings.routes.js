const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { requirePermission } = require('../rbac');
const { getSystemSettings, updateSystemSettings } = require('../controllers/settings.controller');

// Public settings query
router.get('/', getSystemSettings);

// Protected settings update
router.put('/', protect, requirePermission('SETTINGS_MANAGE'), updateSystemSettings);

module.exports = router;
