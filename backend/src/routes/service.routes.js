const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
} = require('../controllers/service.controller');

// Public
router.get('/', getServices);
router.get('/:id', getServiceById);

// Protected CRUD
router.post('/', protect, createService);
router.put('/:id', protect, updateService);
router.delete('/:id', protect, deleteService);

module.exports = router;
