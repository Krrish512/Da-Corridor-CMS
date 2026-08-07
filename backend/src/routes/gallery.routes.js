const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { upload, verifyFileMagicBytes, optimizeImage } = require('../middleware/upload.middleware');
const { uploadLimiter } = require('../middleware/rateLimiter');
const {
  getGalleryItems,
  addGalleryItem,
  deleteGalleryItem,
} = require('../controllers/gallery.controller');

// Public query
router.get('/', getGalleryItems);

// Protected upload and delete with upload rate limiter, magic byte inspection, and image optimization
router.post('/', protect, uploadLimiter, upload.single('file'), verifyFileMagicBytes, optimizeImage, addGalleryItem);
router.delete('/:id', protect, deleteGalleryItem);

module.exports = router;

