const prisma = require('../utils/db');

class NotificationService {
  /**
   * Helper to build recipient-scoped query filters.
   * Matches notifications that are:
   * 1. Explicitly addressed to userId (recipientId == userId)
   * 2. Addressed to user's role (recipientId == null AND recipientRole == userRole)
   * 3. Global notifications (recipientId == null AND recipientRole == null)
   */
  static buildRecipientWhere(userId, userRole) {
    const conditions = [];

    if (userId) {
      conditions.push({ recipientId: String(userId) });
    }

    if (userRole) {
      conditions.push({ recipientId: null, recipientRole: String(userRole) });
    }

    // Include untargeted global notifications if any
    conditions.push({ recipientId: null, recipientRole: null });

    return { OR: conditions };
  }

  /**
   * Create a new notification entry in the database.
   * Enforces centralized Self-Notification Prevention (Phase 14.2):
   * - If recipientId is provided AND recipientId === senderId, creation is skipped.
   * - If recipientId is null and recipientRole is specified, creation proceeds normally.
   * - If recipientId is different from senderId, creation proceeds normally.
   *
   * @param {Object} params
   * @param {string} [params.senderId] - User ID of creator/initiator
   * @param {string} [params.recipientId] - Target user ID (e.g. original submitter)
   * @param {string} [params.recipientRole] - Target role (e.g. SUPER_ADMIN)
   * @param {string} params.type - e.g. CONTACT_INQUIRY, BLOG_SUBMITTED, etc.
   * @param {string} params.title - Title header
   * @param {string} params.message - Body text
   * @param {string} params.entityType - Model name (ContactMessage, BlogPost, Project, Service, GalleryItem)
   * @param {string} [params.entityId] - Target item ID
   * @param {string} [params.priority] - Priority string (NORMAL, HIGH, etc.)
   */
  static async createNotification({
    senderId = null,
    recipientId = null,
    recipientRole = null,
    type,
    title,
    message,
    entityType,
    entityId = null,
    priority = 'NORMAL',
  }) {
    try {
      const cleanSenderId = senderId ? String(senderId) : null;
      const cleanRecipientId = recipientId ? String(recipientId) : null;
      const cleanRecipientRole = recipientRole ? String(recipientRole) : null;

      // RULE 1: Centralized Self-Notification Prevention
      // If a specific recipientId is provided and matches senderId, skip creation silently.
      if (cleanRecipientId && cleanSenderId && cleanRecipientId === cleanSenderId) {
        return null;
      }

      const notification = await prisma.notification.create({
        data: {
          senderId: cleanSenderId,
          recipientId: cleanRecipientId,
          recipientRole: cleanRecipientRole,
          type,
          title,
          message,
          entityType,
          entityId: entityId ? String(entityId) : null,
          priority,
          isRead: false,
        },
      });
      return notification;
    } catch (error) {
      console.error('[NOTIFICATION SERVICE] Error creating notification:', error);
      // Non-blocking fallback: do not interrupt primary user mutation
      return null;
    }
  }

  /**
   * Fetch paginated notifications scoped to authenticated user.
   */
  static async getNotifications({ userId, userRole, page = 1, limit = 20, unreadOnly = false }) {
    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (parsedPage - 1) * parsedLimit;

    const where = {
      deletedAt: null,
      ...this.buildRecipientWhere(userId, userRole),
      ...(unreadOnly ? { isRead: false } : {}),
    };

    const [data, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: parsedLimit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page: parsedPage,
        limit: parsedLimit,
        totalPages: Math.ceil(total / parsedLimit) || 1,
      },
    };
  }

  /**
   * Get current unread notification count scoped to user.
   */
  static async getUnreadCount({ userId, userRole }) {
    const unreadCount = await prisma.notification.count({
      where: {
        deletedAt: null,
        isRead: false,
        ...this.buildRecipientWhere(userId, userRole),
      },
    });
    return unreadCount;
  }

  /**
   * Mark a single notification as read (scoped to user).
   */
  static async markAsRead(id, { userId, userRole }) {
    const notification = await prisma.notification.findFirst({
      where: {
        id,
        deletedAt: null,
        ...this.buildRecipientWhere(userId, userRole),
      },
    });
    if (!notification) return null;

    return await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  /**
   * Mark all unread notifications as read (scoped to user).
   */
  static async markAllAsRead({ userId, userRole }) {
    const where = {
      deletedAt: null,
      isRead: false,
      ...this.buildRecipientWhere(userId, userRole),
    };

    return await prisma.notification.updateMany({
      where,
      data: { isRead: true },
    });
  }

  /**
   * Soft-delete a notification (scoped to user).
   */
  static async deleteNotification(id, { userId, userRole }) {
    const notification = await prisma.notification.findFirst({
      where: {
        id,
        deletedAt: null,
        ...this.buildRecipientWhere(userId, userRole),
      },
    });
    if (!notification) return null;

    return await prisma.notification.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}

module.exports = NotificationService;
