const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  getFAQs,
  createFAQ,
  updateFAQ,
  deleteFAQ,
} = require('../controllers/faq.controller');

// Public
router.get('/', getFAQs);

// Protected
router.post('/', protect, createFAQ);
router.put('/:id', protect, updateFAQ);
router.delete('/:id', protect, deleteFAQ);

module.exports = router;
