const express = require('express');
const router = express.Router();
const {
  getHealthStatus,
  getReadinessProbe,
  getLivenessProbe,
} = require('../controllers/health.controller');

router.get('/', getHealthStatus);
router.get('/health', getHealthStatus);
router.get('/ready', getReadinessProbe);
router.get('/live', getLivenessProbe);

module.exports = router;
