const express = require('express');
const router = express.Router();
const { login, forgotPassword, resetPassword, changePassword, getMe } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

// Public auth endpoints
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected auth endpoints
router.get('/me', protect, getMe);
router.put('/change-password', protect, changePassword);

module.exports = router;
