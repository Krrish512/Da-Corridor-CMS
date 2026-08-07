const express = require('express');
const router = express.Router();
const {
  login,
  forgotPassword,
  resetPassword,
  changePassword,
  updateProfile,
  getMyActivity,
  getMe
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

// Public auth endpoints
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected auth endpoints
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.get('/my-activity', protect, getMyActivity);

module.exports = router;
