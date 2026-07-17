const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  getTeamMembers,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
} = require('../controllers/team.controller');

// Public query
router.get('/', getTeamMembers);

// Protected CRUD
router.post('/', protect, createTeamMember);
router.put('/:id', protect, updateTeamMember);
router.delete('/:id', protect, deleteTeamMember);

module.exports = router;
