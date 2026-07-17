const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  getContactDetails,
  updateContactDetails,
  getMessages,
  submitMessage,
  updateMessageStatus,
  deleteMessage,
  exportMessagesCSV,
} = require('../controllers/contact.controller');

// ==========================================
// OFFICE DETAILS
// ==========================================
router.get('/details', getContactDetails);
router.put('/details', protect, updateContactDetails);

// ==========================================
// CLIENT INQUIRIES / MESSAGES
// ==========================================
// Submit inquiry (Public)
router.post('/messages', submitMessage);

// Admin Manage Inquiries (Protected)
router.get('/messages/export', protect, exportMessagesCSV); // Defined before ID parameter
router.get('/messages', protect, getMessages);
router.put('/messages/:id', protect, updateMessageStatus);
router.delete('/messages/:id', protect, deleteMessage);

module.exports = router;
