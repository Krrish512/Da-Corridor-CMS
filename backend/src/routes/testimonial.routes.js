const express = require('express');
const router = express.Router();
const { protect, optionalProtect } = require('../middleware/auth.middleware');
const {
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} = require('../controllers/testimonial.controller');

// Public
router.get('/', getTestimonials);

// Publicly accessible with optional authentication (defaults to inactive for guests)
router.post('/', optionalProtect, createTestimonial);

// Protected CRUD
router.put('/:id', protect, updateTestimonial);
router.delete('/:id', protect, deleteTestimonial);

module.exports = router;
