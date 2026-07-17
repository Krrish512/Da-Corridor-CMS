const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { getSEOSettings, updateSEOSettings } = require('../controllers/seo.controller');

// Public query
router.get('/', getSEOSettings);

// Protected settings update
router.put('/', protect, updateSEOSettings);

module.exports = router;
