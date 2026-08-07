const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require('../controllers/notification.controller');

// All notification routes are protected (admins only)
router.use(protect);

router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

module.exports = router;
