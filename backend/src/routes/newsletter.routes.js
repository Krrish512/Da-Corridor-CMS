const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  getSubscribers,
  subscribe,
  deleteSubscriber,
  exportSubscribersCSV,
} = require('../controllers/newsletter.controller');

// Public Subscription
router.post('/subscribe', subscribe);

// Protected Operations
router.get('/export', protect, exportSubscribersCSV);
router.get('/', protect, getSubscribers);
router.delete('/:id', protect, deleteSubscriber);

module.exports = router;
