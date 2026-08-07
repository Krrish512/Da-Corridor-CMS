const prisma = require('../utils/db');
const { logActivity } = require('../utils/activityLogger');

// Get all blogs with pagination, search, category, and lifecycle status filter
const getBlogs = async (req, res) => {
  try {
    const {
      search = '',
      category = '',
      publishingStatus = '',
      page = 1,
      limit = 10,
      isPublic
    } = req.query;

    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const skip = (parsedPage - 1) * parsedLimit;

    const where = { deletedAt: null };

    if (isPublic === 'true' || isPublic === true) {
      where.publishingStatus = 'PUBLISHED';
      where.publishDate = { lte: new Date() };
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

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { tags: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = category;
    }

    const [blogs, totalCount] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        orderBy: { publishDate: 'desc' },
        skip,
        take: parsedLimit,
      }),
      prisma.blogPost.count({ where }),
    ]);

    res.json({
      data: blogs,
      meta: {
        total: totalCount,
        page: parsedPage,
        limit: parsedLimit,
        totalPages: Math.ceil(totalCount / parsedLimit),
      }
    });
  } catch (error) {
    console.error('[GET BLOGS ERROR]:', error);
    res.status(500).json({ message: 'Failed to retrieve blog posts' });
  }
};

// Get single blog post by slug or ID
const getBlogById = async (req, res) => {
  const { id } = req.params;
  const { isPublic } = req.query;
  try {
    const where = {
      OR: [{ id: id }, { slug: id }],
      deletedAt: null
    };

    if (isPublic === 'true' || isPublic === true) {
      where.publishingStatus = 'PUBLISHED';
      where.publishDate = { lte: new Date() };
      where.AND = [
        { OR: [{ scheduledPublishAt: null }, { scheduledPublishAt: { lte: new Date() } }] },
        { OR: [{ scheduledUnpublishAt: null }, { scheduledUnpublishAt: { gt: new Date() } }] },
      ];
    }

    const blog = await prisma.blogPost.findFirst({
      where
    });

    if (!blog) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    res.json(blog);
  } catch (error) {
    console.error('[GET BLOG BY ID ERROR]:', error);
    res.status(500).json({ message: 'Failed to retrieve blog post details' });
  }
};

// Create a blog post
const createBlog = async (req, res) => {
  const {
    title,
    slug,
    category,
    tags,
    featuredImage,
    richText,
    seoTitle,
    seoDescription,
    publishDate,
    publishingStatus,
    scheduledPublishAt,
    scheduledUnpublishAt,
  } = req.body;

  if (!title || !title.trim() || !category || !category.trim() || !featuredImage || !featuredImage.trim() || !richText || !richText.trim()) {
    return res.status(400).json({ message: 'Title, Category, Featured Image URL, and Article content are required fields.' });
  }

  let parsedDate = new Date();
  if (publishDate) {
    parsedDate = new Date(publishDate);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ message: 'Invalid publish date format.' });
    }
  }

  // Determine initial status based on user role & requested status
  let finalStatus = publishingStatus || 'PUBLISHED';
  let submittedForApprovalAt = null;
  let approvedById = null;

  // CO_ADMIN approval workflow rule
  if (req.user?.role === 'CO_ADMIN') {
    if (finalStatus === 'PUBLISHED' || finalStatus === 'PENDING_APPROVAL') {
      finalStatus = 'PENDING_APPROVAL';
      submittedForApprovalAt = new Date();
    }
  } else if (finalStatus === 'PUBLISHED') {
    approvedById = req.user?.id || null;
  }

  try {
    let finalSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const slugExists = await prisma.blogPost.findFirst({
      where: { slug: finalSlug, deletedAt: null }
    });

    if (slugExists) {
      finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
    }

    const blog = await prisma.blogPost.create({
      data: {
        title: title.trim(),
        slug: finalSlug,
        category: category.trim(),
        tags: tags ? tags.trim() : '',
        featuredImage: featuredImage.trim(),
        richText: richText.trim(),
        seoTitle: seoTitle ? seoTitle.trim() : null,
        seoDescription: seoDescription ? seoDescription.trim() : null,
        publishingStatus: finalStatus,
        scheduledPublishAt: scheduledPublishAt ? new Date(scheduledPublishAt) : null,
        scheduledUnpublishAt: scheduledUnpublishAt ? new Date(scheduledUnpublishAt) : null,
        submittedForApprovalAt,
        approvedById,
        createdById: req.user?.id || null,
        publishDate: parsedDate,
      }
    });

    await logActivity(req, {
      action: finalStatus === 'PENDING_APPROVAL' ? 'BLOG_SUBMITTED_APPROVAL' : 'CREATE_BLOG',
      details: finalStatus === 'PENDING_APPROVAL'
        ? `Submitted blog post for approval: "${title}"`
        : `Created blog post: "${title}" (Status: ${finalStatus})`,
      newValue: blog,
    });

    if (finalStatus === 'PENDING_APPROVAL') {
      const NotificationService = require('../services/notification.service');
      await NotificationService.createNotification({
        senderId: req.user?.id,
        recipientRole: 'SUPER_ADMIN',
        type: 'BLOG_SUBMITTED',
        title: 'Blog Awaiting Approval',
        message: `Blog "${title.trim()}" has been submitted for approval.`,
        entityType: 'BlogPost',
        entityId: blog.id,
        priority: 'HIGH',
      });
    }

    res.status(201).json(blog);
  } catch (error) {
    console.error('[CREATE BLOG ERROR]:', error);
    res.status(500).json({ message: 'Failed to create blog post' });
  }
};

// Update blog post
const updateBlog = async (req, res) => {
  const { id } = req.params;
  const {
    title,
    slug,
    category,
    tags,
    featuredImage,
    richText,
    seoTitle,
    seoDescription,
    publishDate,
    publishingStatus,
    scheduledPublishAt,
    scheduledUnpublishAt,
  } = req.body;

  if (!title || !title.trim() || !category || !category.trim() || !featuredImage || !featuredImage.trim() || !richText || !richText.trim()) {
    return res.status(400).json({ message: 'Title, Category, Featured Image URL, and Article content are required fields.' });
  }

  let parsedDate;
  if (publishDate) {
    parsedDate = new Date(publishDate);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ message: 'Invalid publish date format.' });
    }
  }

  try {
    const existing = await prisma.blogPost.findFirst({
      where: { id, deletedAt: null }
    });

    if (!existing) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    let finalStatus = publishingStatus !== undefined ? publishingStatus : existing.publishingStatus;
    let submittedForApprovalAt = existing.submittedForApprovalAt;
    let approvedById = existing.approvedById;

    // CO_ADMIN approval workflow enforcement
    if (req.user?.role === 'CO_ADMIN') {
      if (finalStatus === 'PUBLISHED') {
        finalStatus = 'PENDING_APPROVAL';
        submittedForApprovalAt = new Date();
      }
    } else if (finalStatus === 'PUBLISHED' && existing.publishingStatus === 'PENDING_APPROVAL') {
      // Admin/Super Admin approving content
      approvedById = req.user?.id || null;
    }

    let finalSlug = slug || existing.slug;
    if (slug && slug !== existing.slug) {
      const slugExists = await prisma.blogPost.findFirst({
        where: { slug, id: { not: id }, deletedAt: null }
      });
      if (slugExists) {
        finalSlug = `${slug}-${Date.now().toString().slice(-4)}`;
      }
    }

    const updated = await prisma.blogPost.update({
      where: { id },
      data: {
        title: title.trim(),
        slug: finalSlug,
        category: category.trim(),
        tags: tags !== undefined ? tags.trim() : existing.tags,
        featuredImage: featuredImage.trim(),
        richText: richText.trim(),
        seoTitle: seoTitle ? seoTitle.trim() : null,
        seoDescription: seoDescription ? seoDescription.trim() : null,
        publishingStatus: finalStatus,
        scheduledPublishAt: scheduledPublishAt !== undefined ? (scheduledPublishAt ? new Date(scheduledPublishAt) : null) : existing.scheduledPublishAt,
        scheduledUnpublishAt: scheduledUnpublishAt !== undefined ? (scheduledUnpublishAt ? new Date(scheduledUnpublishAt) : null) : existing.scheduledUnpublishAt,
        submittedForApprovalAt,
        approvedById,
        publishDate: parsedDate || existing.publishDate,
      }
    });

    const isApproval = existing.publishingStatus === 'PENDING_APPROVAL' && finalStatus === 'PUBLISHED';
    const isRejection = existing.publishingStatus === 'PENDING_APPROVAL' && (finalStatus === 'DRAFT' || finalStatus === 'ARCHIVED' || finalStatus === 'REJECTED');
    const isNewSubmission = existing.publishingStatus !== 'PENDING_APPROVAL' && finalStatus === 'PENDING_APPROVAL';

    await logActivity(req, {
      action: isApproval ? 'BLOG_APPROVED' : 'UPDATE_BLOG',
      details: isApproval
        ? `Approved and published blog post: "${title}"`
        : `Updated blog post: "${title}" (Status: ${finalStatus})`,
      previousValue: existing,
      newValue: updated,
    });

    const NotificationService = require('../services/notification.service');
    const targetRecipientId = existing.createdById || null;

    if (isApproval) {
      await NotificationService.createNotification({
        senderId: req.user?.id,
        recipientId: targetRecipientId,
        type: 'BLOG_APPROVED',
        title: 'Blog Approved',
        message: `Blog "${title.trim()}" has been approved and published.`,
        entityType: 'BlogPost',
        entityId: updated.id,
      });
    } else if (isRejection) {
      await NotificationService.createNotification({
        senderId: req.user?.id,
        recipientId: targetRecipientId,
        type: 'BLOG_REJECTED',
        title: 'Blog Rejected',
        message: `Blog "${title.trim()}" has been rejected.`,
        entityType: 'BlogPost',
        entityId: updated.id,
      });
    } else if (isNewSubmission) {
      await NotificationService.createNotification({
        senderId: req.user?.id,
        recipientRole: 'SUPER_ADMIN',
        type: 'BLOG_SUBMITTED',
        title: 'Blog Awaiting Approval',
        message: `Blog "${title.trim()}" has been submitted for approval.`,
        entityType: 'BlogPost',
        entityId: updated.id,
        priority: 'HIGH',
      });
    }

    res.json(updated);
  } catch (error) {
    console.error('[UPDATE BLOG ERROR]:', error);
    res.status(500).json({ message: 'Failed to update blog post' });
  }
};

// Soft Delete blog post
const deleteBlog = async (req, res) => {
  const { id } = req.params;
  try {
    const existing = await prisma.blogPost.findFirst({
      where: { id, deletedAt: null }
    });

    if (!existing) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    const blog = await prisma.blogPost.update({
      where: { id },
      data: { deletedAt: new Date(), publishingStatus: 'ARCHIVED' }
    });

    await logActivity(req, {
      action: 'DELETE_BLOG',
      details: `Soft-deleted blog post: ${blog.title}`,
      previousValue: existing,
    });

    res.json({ message: 'Blog post soft-deleted successfully' });
  } catch (error) {
    console.error('[DELETE BLOG ERROR]:', error);
    res.status(500).json({ message: 'Failed to delete blog post' });
  }
};

module.exports = {
  getBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
};
