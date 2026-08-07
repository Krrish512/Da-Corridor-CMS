const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { requirePermission } = require('../rbac');
const { getSEOSettings, updateSEOSettings } = require('../controllers/seo.controller');

// Public query
router.get('/', getSEOSettings);

// Protected settings update (Super Admin & Admin)
router.put('/', protect, requirePermission('SEO_MANAGE'), updateSEOSettings);

module.exports = router;
