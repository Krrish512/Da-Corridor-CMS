const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { publicFormLimiter } = require('../middleware/rateLimiter');
const {
  getSubscribers,
  subscribe,
  deleteSubscriber,
  exportSubscribersCSV,
} = require('../controllers/newsletter.controller');

// Public Subscription — rate-limited to prevent spam
router.post('/subscribe', publicFormLimiter, subscribe);

// Protected Operations
router.get('/export', protect, exportSubscribersCSV);
router.get('/', protect, getSubscribers);
router.delete('/:id', protect, deleteSubscriber);

module.exports = router;
