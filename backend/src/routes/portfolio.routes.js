const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { requirePermission, requireRole } = require('../rbac');
const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  sortProjectImages,
  deleteProject,
  approveProject,
} = require('../controllers/portfolio.controller');

// Public endpoints
router.get('/', getProjects);
router.get('/:id', getProjectById);

// Protected endpoints (CMS admin operations)
router.post('/', protect, requirePermission('PORTFOLIO_CREATE'), createProject);
router.put('/:id', protect, requirePermission('PORTFOLIO_UPDATE'), updateProject);
router.put('/:id/sort-images', protect, requirePermission('PORTFOLIO_UPDATE'), sortProjectImages);
router.delete('/:id', protect, requirePermission('PORTFOLIO_DELETE'), deleteProject);

// Approval endpoint — SUPER_ADMIN only, updates only approval-related fields
router.patch('/:id/approve', protect, requireRole('SUPER_ADMIN'), approveProject);

module.exports = router;
