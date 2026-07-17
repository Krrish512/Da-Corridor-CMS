const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  getBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
} = require('../controllers/blog.controller');

// Public endpoints
router.get('/', getBlogs);
router.get('/:id', getBlogById);

// Protected endpoints
router.post('/', protect, createBlog);
router.put('/:id', protect, updateBlog);
router.delete('/:id', protect, deleteBlog);

module.exports = router;
