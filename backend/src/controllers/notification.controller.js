const NotificationService = require('../services/notification.service');

// GET /api/notifications
exports.getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const result = await NotificationService.getNotifications({
      userId: req.user?.id,
      userRole: req.user?.role,
      page,
      limit,
      unreadOnly: unreadOnly === 'true' || unreadOnly === true,
    });
    res.json(result);
  } catch (error) {
    console.error('[NOTIFICATION CONTROLLER]: Error fetching notifications:', error);
    res.status(500).json({ message: 'Failed to fetch notifications.' });
  }
};

// GET /api/notifications/unread-count
exports.getUnreadCount = async (req, res) => {
  try {
    const unreadCount = await NotificationService.getUnreadCount({
      userId: req.user?.id,
      userRole: req.user?.role,
    });
    res.json({ unreadCount });
  } catch (error) {
    console.error('[NOTIFICATION CONTROLLER]: Error fetching unread count:', error);
    res.status(500).json({ message: 'Failed to fetch unread notification count.' });
  }
};

// PATCH /api/notifications/:id/read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await NotificationService.markAsRead(id, {
      userId: req.user?.id,
      userRole: req.user?.role,
    });
    if (!updated) {
      return res.status(404).json({ message: 'Notification not found or access denied.' });
    }
    res.json({ message: 'Notification marked as read.', data: updated });
  } catch (error) {
    console.error('[NOTIFICATION CONTROLLER]: Error marking notification as read:', error);
    res.status(500).json({ message: 'Failed to mark notification as read.' });
  }
};

// PATCH /api/notifications/read-all
exports.markAllAsRead = async (req, res) => {
  try {
    await NotificationService.markAllAsRead({
      userId: req.user?.id,
      userRole: req.user?.role,
    });
    res.json({ message: 'All notifications marked as read.' });
  } catch (error) {
    console.error('[NOTIFICATION CONTROLLER]: Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Failed to mark all notifications as read.' });
  }
};

// DELETE /api/notifications/:id
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await NotificationService.deleteNotification(id, {
      userId: req.user?.id,
      userRole: req.user?.role,
    });
    if (!deleted) {
      return res.status(404).json({ message: 'Notification not found or access denied.' });
    }
    res.json({ message: 'Notification deleted successfully.' });
  } catch (error) {
    console.error('[NOTIFICATION CONTROLLER]: Error deleting notification:', error);
    res.status(500).json({ message: 'Failed to delete notification.' });
  }
};
