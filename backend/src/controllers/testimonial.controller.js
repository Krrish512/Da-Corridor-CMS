const prisma = require('../utils/db');
const { logActivity } = require('../utils/activityLogger');

const getTestimonials = async (req, res) => {
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

    const testimonials = await prisma.testimonial.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
    res.json(testimonials);
  } catch (error) {
    console.error('[GET TESTIMONIALS ERROR]:', error);
    res.status(500).json({ message: 'Failed to fetch testimonials' });
  }
};

const createTestimonial = async (req, res) => {
  const {
    clientName,
    company,
    designation,
    profileImage,
    rating,
    review,
    isActive,
    publishingStatus,
    scheduledPublishAt,
    scheduledUnpublishAt,
  } = req.body;

  if (!clientName || !clientName.trim() || !review || !review.trim()) {
    return res.status(400).json({ message: 'Client Name and Review are required fields.' });
  }

  const parsedRating = parseInt(rating || '5', 10);
  if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
    return res.status(400).json({ message: 'Rating must be a number between 1 and 5.' });
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
    const activeStatus = req.user ? (isActive !== undefined ? Boolean(isActive) : true) : false;

    const testimonial = await prisma.testimonial.create({
      data: {
        clientName: clientName.trim(),
        company: company ? company.trim() : '',
        designation: designation ? designation.trim() : '',
        profileImage: profileImage ? profileImage.trim() : null,
        rating: parsedRating,
        review: review.trim(),
        isActive: activeStatus,
        publishingStatus: finalStatus,
        scheduledPublishAt: scheduledPublishAt ? new Date(scheduledPublishAt) : null,
        scheduledUnpublishAt: scheduledUnpublishAt ? new Date(scheduledUnpublishAt) : null,
        submittedForApprovalAt,
        approvedById,
      }
    });

    await logActivity(req, {
      action: finalStatus === 'PENDING_APPROVAL' ? 'TESTIMONIAL_SUBMITTED_APPROVAL' : 'CREATE_TESTIMONIAL',
      details: finalStatus === 'PENDING_APPROVAL'
        ? `Submitted testimonial from ${clientName} for approval`
        : `Created testimonial from ${clientName} (Status: ${finalStatus})`,
      newValue: testimonial,
    });

    res.status(201).json(testimonial);
  } catch (error) {
    console.error('[CREATE TESTIMONIAL ERROR]:', error);
    res.status(500).json({ message: 'Failed to create testimonial' });
  }
};

const updateTestimonial = async (req, res) => {
  const { id } = req.params;
  const {
    clientName,
    company,
    designation,
    profileImage,
    rating,
    review,
    isActive,
    publishingStatus,
    scheduledPublishAt,
    scheduledUnpublishAt,
  } = req.body;

  if (!clientName || !clientName.trim() || !review || !review.trim()) {
    return res.status(400).json({ message: 'Client Name and Review are required fields.' });
  }

  const parsedRating = parseInt(rating || '5', 10);
  if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
    return res.status(400).json({ message: 'Rating must be a number between 1 and 5.' });
  }

  try {
    const existing = await prisma.testimonial.findFirst({
      where: { id, deletedAt: null }
    });

    if (!existing) {
      return res.status(404).json({ message: 'Testimonial not found.' });
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

    const testimonial = await prisma.testimonial.update({
      where: { id },
      data: {
        clientName: clientName.trim(),
        company: company ? company.trim() : '',
        designation: designation ? designation.trim() : '',
        profileImage: profileImage ? profileImage.trim() : null,
        rating: parsedRating,
        review: review.trim(),
        isActive: isActive !== undefined ? Boolean(isActive) : existing.isActive,
        publishingStatus: finalStatus,
        scheduledPublishAt: scheduledPublishAt !== undefined ? (scheduledPublishAt ? new Date(scheduledPublishAt) : null) : existing.scheduledPublishAt,
        scheduledUnpublishAt: scheduledUnpublishAt !== undefined ? (scheduledUnpublishAt ? new Date(scheduledUnpublishAt) : null) : existing.scheduledUnpublishAt,
        submittedForApprovalAt,
        approvedById,
      }
    });

    const isApproval = existing.publishingStatus === 'PENDING_APPROVAL' && finalStatus === 'PUBLISHED';
    await logActivity(req, {
      action: isApproval ? 'TESTIMONIAL_APPROVED' : 'UPDATE_TESTIMONIAL',
      details: isApproval
        ? `Approved and published testimonial from ${clientName}`
        : `Updated testimonial from ${clientName} (Status: ${finalStatus})`,
      previousValue: existing,
      newValue: testimonial,
    });

    res.json(testimonial);
  } catch (error) {
    console.error('[UPDATE TESTIMONIAL ERROR]:', error);
    res.status(500).json({ message: 'Failed to update testimonial' });
  }
};

const deleteTestimonial = async (req, res) => {
  const { id } = req.params;

  try {
    const existing = await prisma.testimonial.findFirst({
      where: { id, deletedAt: null }
    });

    if (!existing) {
      return res.status(404).json({ message: 'Testimonial not found.' });
    }

    await prisma.testimonial.update({
      where: { id },
      data: { deletedAt: new Date(), publishingStatus: 'ARCHIVED' }
    });

    await logActivity(req, {
      action: 'DELETE_TESTIMONIAL',
      details: `Soft-deleted testimonial from ${existing.clientName}`,
      previousValue: existing,
    });

    res.json({ message: 'Testimonial soft-deleted successfully' });
  } catch (error) {
    console.error('[DELETE TESTIMONIAL ERROR]:', error);
    res.status(500).json({ message: 'Failed to delete testimonial' });
  }
};

module.exports = {
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
};
