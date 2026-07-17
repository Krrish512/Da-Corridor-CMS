const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  getPartners,
  createPartner,
  updatePartner,
  deletePartner,
} = require('../controllers/partner.controller');

// Public
router.get('/', getPartners);

// Protected
router.post('/', protect, createPartner);
router.put('/:id', protect, updatePartner);
router.delete('/:id', protect, deletePartner);

module.exports = router;
