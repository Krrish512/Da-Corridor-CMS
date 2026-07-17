const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  sortProjectImages,
  deleteProject,
} = require('../controllers/portfolio.controller');

// Public endpoints
router.get('/', getProjects);
router.get('/:id', getProjectById);

// Protected endpoints (CMS admin operations)
router.post('/', protect, createProject);
router.put('/:id', protect, updateProject);
router.put('/:id/sort-images', protect, sortProjectImages);
router.delete('/:id', protect, deleteProject);

module.exports = router;
