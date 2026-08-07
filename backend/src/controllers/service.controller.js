const prisma = require('../utils/db');
const { logActivity } = require('../utils/activityLogger');

const getServices = async (req, res) => {
  const { isPublic, publishingStatus } = req.query;

  try {
    const where = { deletedAt: null };

    if (isPublic === 'true' || isPublic === true) {
      where.publishingStatus = 'PUBLISHED';
      where.isActive = true;
      where.AND = [
        { OR: [{ scheduledPublishAt: null }, { scheduledPublishAt: { lte: new Date() } }] },
        { OR: [{ scheduledUnpublishAt: null }, { scheduledUnpublishAt: { gt: new Date() } }] },
      ];
    } else if (publishingStatus) {
      if (publishingStatus === 'SCHEDULED') {
        where.scheduledPublishAt = { gt: new Date() };
      } else {
        where.publishingStatus = publishingStatus;
      }
    }

    const services = await prisma.service.findMany({
      where,
      orderBy: { displayOrder: 'asc' }
    });
    res.json(services);
  } catch (error) {
    console.error('[GET SERVICES ERROR]:', error);
    res.status(500).json({ message: 'Failed to fetch services.' });
  }
};

const getServiceById = async (req, res) => {
  const { id } = req.params;
  const { isPublic } = req.query;

  try {
    const where = { id, deletedAt: null };

    if (isPublic === 'true' || isPublic === true) {
      where.publishingStatus = 'PUBLISHED';
      where.isActive = true;
      where.AND = [
        { OR: [{ scheduledPublishAt: null }, { scheduledPublishAt: { lte: new Date() } }] },
        { OR: [{ scheduledUnpublishAt: null }, { scheduledUnpublishAt: { gt: new Date() } }] },
      ];
    }

    const service = await prisma.service.findFirst({
      where
    });
    if (!service) {
      return res.status(404).json({ message: 'Service not found.' });
    }
    res.json(service);
  } catch (error) {
    console.error('[GET SERVICE BY ID ERROR]:', error);
    res.status(500).json({ message: 'Failed to fetch service detail.' });
  }
};

const createService = async (req, res) => {
  const {
    title,
    icon,
    shortDescription,
    fullDescription,
    image,
    displayOrder,
    isActive,
    publishingStatus,
    scheduledPublishAt,
    scheduledUnpublishAt,
  } = req.body;

  if (!title || !title.trim() || !shortDescription || !shortDescription.trim() || !fullDescription || !fullDescription.trim()) {
    return res.status(400).json({ message: 'Title, Short Description, and Full Description are required.' });
  }

  let finalStatus = publishingStatus || 'PUBLISHED';
  let submittedForApprovalAt = null;
  let approvedById = null;

  if (req.user?.role === 'CO_ADMIN') {
    if (finalStatus === 'PUBLISHED' || finalStatus === 'PENDING_APPROVAL') {
      finalStatus = 'PENDING_APPROVAL';
      submittedForApprovalAt = new Date();
    }
  } else if (finalStatus === 'PUBLISHED') {
    approvedById = req.user?.id || null;
  }

  try {
    const service = await prisma.service.create({
      data: {
        title: title.trim(),
        icon: icon ? icon.trim() : 'Building',
        shortDescription: shortDescription.trim(),
        fullDescription: fullDescription.trim(),
        image: image ? image.trim() : null,
        displayOrder: parseInt(displayOrder || '0', 10),
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        publishingStatus: finalStatus,
        scheduledPublishAt: scheduledPublishAt ? new Date(scheduledPublishAt) : null,
        scheduledUnpublishAt: scheduledUnpublishAt ? new Date(scheduledUnpublishAt) : null,
        submittedForApprovalAt,
        approvedById,
        createdById: req.user?.id || null,
      }
    });

    await logActivity(req, {
      action: finalStatus === 'PENDING_APPROVAL' ? 'SERVICE_SUBMITTED_APPROVAL' : 'CREATE_SERVICE',
      details: finalStatus === 'PENDING_APPROVAL'
        ? `Submitted service for approval: "${title}"`
        : `Created service: "${title}" (Status: ${finalStatus})`,
      newValue: service,
    });

    if (finalStatus === 'PENDING_APPROVAL') {
      const NotificationService = require('../services/notification.service');
      await NotificationService.createNotification({
        senderId: req.user?.id,
        recipientRole: 'SUPER_ADMIN',
        type: 'SERVICE_SUBMITTED',
        title: 'Service Awaiting Approval',
        message: `Service "${title.trim()}" submitted for approval.`,
        entityType: 'Service',
        entityId: service.id,
        priority: 'HIGH',
      });
    }

    res.status(201).json(service);
  } catch (error) {
    console.error('[CREATE SERVICE ERROR]:', error);
    res.status(500).json({ message: 'Failed to create service.' });
  }
};

const updateService = async (req, res) => {
  const { id } = req.params;
  const {
    title,
    icon,
    shortDescription,
    fullDescription,
    image,
    displayOrder,
    isActive,
    publishingStatus,
    scheduledPublishAt,
    scheduledUnpublishAt,
  } = req.body;

  if (!title || !title.trim() || !shortDescription || !shortDescription.trim() || !fullDescription || !fullDescription.trim()) {
    return res.status(400).json({ message: 'Title, Short Description, and Full Description are required.' });
  }

  try {
    const existing = await prisma.service.findFirst({
      where: { id, deletedAt: null }
    });

    if (!existing) {
      return res.status(404).json({ message: 'Service not found.' });
    }

    let finalStatus = publishingStatus !== undefined ? publishingStatus : existing.publishingStatus;
    let submittedForApprovalAt = existing.submittedForApprovalAt;
    let approvedById = existing.approvedById;

    if (req.user?.role === 'CO_ADMIN') {
      if (finalStatus === 'PUBLISHED') {
        finalStatus = 'PENDING_APPROVAL';
        submittedForApprovalAt = new Date();
      }
    } else if (finalStatus === 'PUBLISHED' && existing.publishingStatus === 'PENDING_APPROVAL') {
      approvedById = req.user?.id || null;
    }

    const service = await prisma.service.update({
      where: { id },
      data: {
        title: title.trim(),
        icon: icon ? icon.trim() : 'Building',
        shortDescription: shortDescription.trim(),
        fullDescription: fullDescription.trim(),
        image: image ? image.trim() : null,
        displayOrder: parseInt(displayOrder || '0', 10),
        isActive: isActive !== undefined ? Boolean(isActive) : existing.isActive,
        publishingStatus: finalStatus,
        scheduledPublishAt: scheduledPublishAt !== undefined ? (scheduledPublishAt ? new Date(scheduledPublishAt) : null) : existing.scheduledPublishAt,
        scheduledUnpublishAt: scheduledUnpublishAt !== undefined ? (scheduledUnpublishAt ? new Date(scheduledUnpublishAt) : null) : existing.scheduledUnpublishAt,
        submittedForApprovalAt,
        approvedById,
      }
    });

    const isApproval = existing.publishingStatus === 'PENDING_APPROVAL' && finalStatus === 'PUBLISHED';
    const isRejection = existing.publishingStatus === 'PENDING_APPROVAL' && (finalStatus === 'DRAFT' || finalStatus === 'ARCHIVED');
    const isNewSubmission = existing.publishingStatus !== 'PENDING_APPROVAL' && finalStatus === 'PENDING_APPROVAL';

    await logActivity(req, {
      action: isApproval ? 'SERVICE_APPROVED' : 'UPDATE_SERVICE',
      details: isApproval
        ? `Approved and published service: "${title}"`
        : `Updated service: "${title}" (Status: ${finalStatus})`,
      previousValue: existing,
      newValue: service,
    });

    const NotificationService = require('../services/notification.service');
    const targetRecipientId = existing.createdById || null;

    if (isApproval) {
      await NotificationService.createNotification({
        senderId: req.user?.id,
        recipientId: targetRecipientId,
        type: 'SERVICE_APPROVED',
        title: 'Service Approved',
        message: `Service "${title.trim()}" has been approved and published.`,
        entityType: 'Service',
        entityId: service.id,
      });
    } else if (isRejection) {
      await NotificationService.createNotification({
        senderId: req.user?.id,
        recipientId: targetRecipientId,
        type: 'SERVICE_REJECTED',
        title: 'Service Rejected',
        message: `Service "${title.trim()}" has been rejected.`,
        entityType: 'Service',
        entityId: service.id,
      });
    } else if (isNewSubmission) {
      await NotificationService.createNotification({
        senderId: req.user?.id,
        recipientRole: 'SUPER_ADMIN',
        type: 'SERVICE_SUBMITTED',
        title: 'Service Awaiting Approval',
        message: `Service "${title.trim()}" submitted for approval.`,
        entityType: 'Service',
        entityId: service.id,
        priority: 'HIGH',
      });
    }

    res.json(service);
  } catch (error) {
    console.error('[UPDATE SERVICE ERROR]:', error);
    res.status(500).json({ message: 'Failed to update service.' });
  }
};

const deleteService = async (req, res) => {
  const { id } = req.params;
  try {
    const existing = await prisma.service.findFirst({
      where: { id, deletedAt: null }
    });

    if (!existing) {
      return res.status(404).json({ message: 'Service not found.' });
    }

    await prisma.service.update({
      where: { id },
      data: { deletedAt: new Date(), publishingStatus: 'ARCHIVED' }
    });

    await logActivity(req, {
      action: 'DELETE_SERVICE',
      details: `Soft-deleted service: ${existing.title}`,
      previousValue: existing,
    });

    res.json({ message: 'Service deleted successfully.' });
  } catch (error) {
    console.error('[DELETE SERVICE ERROR]:', error);
    res.status(500).json({ message: 'Failed to delete service.' });
  }
};

module.exports = {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
};
