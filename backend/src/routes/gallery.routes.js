const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');
const {
  getGalleryItems,
  addGalleryItem,
  deleteGalleryItem,
} = require('../controllers/gallery.controller');

// Public query
router.get('/', getGalleryItems);

// Protected upload and delete
// Binds multer single file upload targeting key 'file'
router.post('/', protect, upload.single('file'), addGalleryItem);
router.delete('/:id', protect, deleteGalleryItem);

module.exports = router;
