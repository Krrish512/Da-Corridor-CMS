const prisma = require('../utils/db');
const { validateImageUrl } = require('../utils/validation');
const { logActivity } = require('../utils/activityLogger');

// List Projects with Search, Filter & Pagination
const getProjects = async (req, res) => {
  try {
    const {
      search = '',
      category = '',
      status = '',
      publishingStatus = '',
      featured,
      page = 1,
      limit = 10,
      isPublic,
    } = req.query;

    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const skip = (parsedPage - 1) * parsedLimit;

    // Build Prisma query filters
    const where = {
      deletedAt: null, // Soft delete filter
    };

    if (isPublic === 'true' || isPublic === true) {
      where.publishingStatus = 'PUBLISHED';
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
        { clientName: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (status) {
      where.status = status;
    }

    if (featured !== undefined && featured !== '') {
      where.featured = featured === 'true' || featured === true;
    }

    // Query data and counts concurrently
    const [projects, totalCount] = await Promise.all([
      prisma.project.findMany({
        where,
        select: {
          id: true,
          title: true,
          slug: true,
          category: true,
          coverImage: true,
          clientName: true,
          location: true,
          area: true,
          completionDate: true,
          status: true,
          publishingStatus: true,
          scheduledPublishAt: true,
          scheduledUnpublishAt: true,
          submittedForApprovalAt: true,
          approvedById: true,
          description: true,
          designChallenge: true,
          solution: true,
          materials: true,
          featured: true,
          seoTitle: true,
          seoDescription: true,
          createdAt: true,
          updatedAt: true,
          images: {
            select: {
              id: true,
              url: true,
              order: true,
            },
            orderBy: { order: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parsedLimit,
      }),
      prisma.project.count({ where }),
    ]);

    res.json({
      data: projects,
      projects: projects,
      meta: {
        total: totalCount,
        page: parsedPage,
        limit: parsedLimit,
        totalPages: Math.ceil(totalCount / parsedLimit),
      },
    });
  } catch (error) {
    console.error('[GET PROJECTS ERROR]:', error);
    res.status(500).json({ message: 'Failed to retrieve portfolio projects.' });
  }
};

// Get single project details by ID or Slug
const getProjectById = async (req, res) => {
  const { id } = req.params;
  const { isPublic } = req.query;

  try {
    const where = {
      OR: [{ id: id }, { slug: id }],
      deletedAt: null,
    };

    if (isPublic === 'true' || isPublic === true) {
      where.publishingStatus = 'PUBLISHED';
      where.AND = [
        { OR: [{ scheduledPublishAt: null }, { scheduledPublishAt: { lte: new Date() } }] },
        { OR: [{ scheduledUnpublishAt: null }, { scheduledUnpublishAt: { gt: new Date() } }] },
      ];
    }

    const project = await prisma.project.findFirst({
      where,
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    res.json(project);
  } catch (error) {
    console.error('[GET PROJECT BY ID ERROR]:', error);
    res.status(500).json({ message: 'Failed to retrieve project details.' });
  }
};

// Create a Project
const createProject = async (req, res) => {
  const {
    title,
    slug,
    category,
    coverImage,
    images = [],
    clientName,
    location,
    area,
    completionDate,
    status,
    publishingStatus,
    scheduledPublishAt,
    scheduledUnpublishAt,
    description,
    designChallenge,
    solution,
    materials,
    featured,
    seoTitle,
    seoDescription,
  } = req.body;

  if (!title || !title.trim() || !category || !category.trim() || !clientName || !clientName.trim() || !location || !location.trim() || !description || !description.trim()) {
    return res.status(400).json({ message: 'Title, Category, Client Name, Location, and Description are required fields.' });
  }

  let parsedDate = new Date();
  if (completionDate) {
    parsedDate = new Date(completionDate);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ message: 'Invalid completion date format.' });
    }
  }

  let finalStatus = publishingStatus || 'DRAFT';
  let submittedForApprovalAt = null;
  let approvedById = null;

  // Only SUPER_ADMIN can publish directly
  if ((req.user?.role === 'ADMIN' || req.user?.role === 'CO_ADMIN') && finalStatus === 'PUBLISHED') {
    return res.status(403).json({
      message: 'Only SUPER_ADMIN can publish projects directly. Please submit for approval instead.',
    });
  }

  // CO_ADMIN approval workflow rule — force PENDING_APPROVAL
  if (req.user?.role === 'CO_ADMIN') {
    if (finalStatus === 'PUBLISHED' || finalStatus === 'PENDING_APPROVAL') {
      finalStatus = 'PENDING_APPROVAL';
      submittedForApprovalAt = new Date();
    }
  } else if (finalStatus === 'PUBLISHED') {
    // SUPER_ADMIN publishing directly
    approvedById = req.user?.id || null;
  }

  try {
    let finalSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    const slugExists = await prisma.project.findFirst({
      where: { slug: finalSlug, deletedAt: null }
    });
    if (slugExists) {
      finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
    }

    const projectImages = Array.isArray(images)
      ? images.map((img, idx) => ({
          url: typeof img === 'string' ? img : img.url,
          order: typeof img === 'string' ? idx : (img.order !== undefined ? img.order : idx),
        }))
      : [];

    const coverVal = validateImageUrl(coverImage);
    if (!coverVal.isValid) {
      return res.status(400).json({ message: `Cover image: ${coverVal.reason}` });
    }
    for (const img of projectImages) {
      const imgVal = validateImageUrl(img.url);
      if (!imgVal.isValid) {
        return res.status(400).json({ message: `Gallery image ("${img.url}"): ${imgVal.reason}` });
      }
    }

    const project = await prisma.project.create({
      data: {
        title: title.trim(),
        slug: finalSlug,
        category: category.trim(),
        coverImage,
        clientName: clientName.trim(),
        location: location.trim(),
        area: area ? area.trim() : 'N/A',
        completionDate: parsedDate,
        status: status ? status.trim() : 'Completed',
        publishingStatus: finalStatus,
        scheduledPublishAt: scheduledPublishAt ? new Date(scheduledPublishAt) : null,
        scheduledUnpublishAt: scheduledUnpublishAt ? new Date(scheduledUnpublishAt) : null,
        submittedForApprovalAt,
        approvedById,
        createdById: req.user?.id || null,
        description: description.trim(),
        designChallenge: designChallenge ? designChallenge.trim() : '',
        solution: solution ? solution.trim() : '',
        materials: materials ? materials.trim() : '',
        featured: featured !== undefined ? Boolean(featured) : false,
        seoTitle: seoTitle ? seoTitle.trim() : null,
        seoDescription: seoDescription ? seoDescription.trim() : null,
        images: {
          create: projectImages,
        },
      },
      include: {
        images: true,
      },
    });

    await logActivity(req, {
      action: finalStatus === 'PENDING_APPROVAL' ? 'PROJECT_SUBMITTED_APPROVAL' : 'CREATE_PROJECT',
      details: finalStatus === 'PENDING_APPROVAL'
        ? `Submitted project for approval: "${title}"`
        : `Created new project: "${title}" (Status: ${finalStatus})`,
      newValue: project,
    });

    if (finalStatus === 'PENDING_APPROVAL') {
      const NotificationService = require('../services/notification.service');
      await NotificationService.createNotification({
        senderId: req.user?.id,
        recipientRole: 'SUPER_ADMIN',
        type: 'PORTFOLIO_SUBMITTED',
        title: 'Portfolio Awaiting Approval',
        message: `Project "${title.trim()}" submitted for approval.`,
        entityType: 'Project',
        entityId: project.id,
        priority: 'HIGH',
      });
    }

    res.status(201).json(project);
  } catch (error) {
    console.error('[CREATE PROJECT ERROR]:', error);
    res.status(500).json({ message: 'Failed to create project.' });
  }
};

// Update a Project
const updateProject = async (req, res) => {
  const { id } = req.params;
  const {
    title,
    slug,
    category,
    coverImage,
    images = [],
    clientName,
    location,
    area,
    completionDate,
    status,
    publishingStatus,
    scheduledPublishAt,
    scheduledUnpublishAt,
    description,
    designChallenge,
    solution,
    materials,
    featured,
    seoTitle,
    seoDescription,
  } = req.body;

  if (!title || !title.trim() || !category || !category.trim() || !clientName || !clientName.trim() || !location || !location.trim() || !description || !description.trim()) {
    return res.status(400).json({ message: 'Title, Category, Client Name, Location, and Description are required fields.' });
  }

  let parsedDate;
  if (completionDate) {
    parsedDate = new Date(completionDate);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ message: 'Invalid completion date format.' });
    }
  }

  try {
    const existingProject = await prisma.project.findFirst({
      where: { id, deletedAt: null }
    });

    if (!existingProject) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    let finalStatus = publishingStatus !== undefined ? publishingStatus : existingProject.publishingStatus;
    let submittedForApprovalAt = existingProject.submittedForApprovalAt;
    let approvedById = existingProject.approvedById;

    // Only SUPER_ADMIN can publish directly — hard reject for ADMIN / CO_ADMIN
    if ((req.user?.role === 'ADMIN' || req.user?.role === 'CO_ADMIN') && finalStatus === 'PUBLISHED') {
      return res.status(403).json({
        message: 'Only SUPER_ADMIN can publish projects directly. Please submit for approval instead.',
      });
    }

    // CO_ADMIN approval workflow rule — force PENDING_APPROVAL
    if (req.user?.role === 'CO_ADMIN') {
      if (finalStatus === 'PUBLISHED') {
        finalStatus = 'PENDING_APPROVAL';
        submittedForApprovalAt = new Date();
      }
    } else if (finalStatus === 'PUBLISHED') {
      // SUPER_ADMIN publishing directly via update
      approvedById = req.user?.id || null;
    }

    let finalSlug = slug || existingProject.slug;
    if (slug && slug !== existingProject.slug) {
      const slugExists = await prisma.project.findFirst({
        where: { slug, id: { not: id }, deletedAt: null }
      });
      if (slugExists) {
        finalSlug = `${slug}-${Date.now().toString().slice(-4)}`;
      }
    }

    await prisma.projectImage.deleteMany({
      where: { projectId: id },
    });

    const projectImages = Array.isArray(images)
      ? images.map((img, idx) => ({
          url: typeof img === 'string' ? img : img.url,
          order: typeof img === 'string' ? idx : (img.order !== undefined ? img.order : idx),
        }))
      : [];

    const coverVal = validateImageUrl(coverImage);
    if (!coverVal.isValid) {
      return res.status(400).json({ message: `Cover image: ${coverVal.reason}` });
    }
    for (const img of projectImages) {
      const imgVal = validateImageUrl(img.url);
      if (!imgVal.isValid) {
        return res.status(400).json({ message: `Gallery image ("${img.url}"): ${imgVal.reason}` });
      }
    }

    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        title: title.trim(),
        slug: finalSlug,
        category: category.trim(),
        coverImage,
        clientName: clientName.trim(),
        location: location.trim(),
        area: area ? area.trim() : 'N/A',
        completionDate: parsedDate || existingProject.completionDate,
        status: status ? status.trim() : existingProject.status,
        publishingStatus: finalStatus,
        scheduledPublishAt: scheduledPublishAt !== undefined ? (scheduledPublishAt ? new Date(scheduledPublishAt) : null) : existingProject.scheduledPublishAt,
        scheduledUnpublishAt: scheduledUnpublishAt !== undefined ? (scheduledUnpublishAt ? new Date(scheduledUnpublishAt) : null) : existingProject.scheduledUnpublishAt,
        submittedForApprovalAt,
        approvedById,
        description: description.trim(),
        designChallenge: designChallenge ? designChallenge.trim() : '',
        solution: solution ? solution.trim() : '',
        materials: materials ? materials.trim() : '',
        featured: featured !== undefined ? Boolean(featured) : existingProject.featured,
        seoTitle: seoTitle ? seoTitle.trim() : null,
        seoDescription: seoDescription ? seoDescription.trim() : null,
        images: {
          create: projectImages,
        },
      },
      include: {
        images: true,
      },
    });

    const isApproval = existingProject.publishingStatus === 'PENDING_APPROVAL' && finalStatus === 'PUBLISHED';
    const isRejection = existingProject.publishingStatus === 'PENDING_APPROVAL' && (finalStatus === 'DRAFT' || finalStatus === 'ARCHIVED');
    const isNewSubmission = existingProject.publishingStatus !== 'PENDING_APPROVAL' && finalStatus === 'PENDING_APPROVAL';

    await logActivity(req, {
      action: isApproval ? 'PROJECT_APPROVED' : 'UPDATE_PROJECT',
      details: isApproval
        ? `Approved and published project: "${title}"`
        : `Updated project: "${title}" (Status: ${finalStatus})`,
      previousValue: existingProject,
      newValue: updatedProject,
    });

    const NotificationService = require('../services/notification.service');
    const targetRecipientId = existingProject.createdById || null;

    if (isApproval) {
      await NotificationService.createNotification({
        senderId: req.user?.id,
        recipientId: targetRecipientId,
        type: 'PORTFOLIO_APPROVED',
        title: 'Portfolio Approved',
        message: `Project "${title.trim()}" has been approved and published.`,
        entityType: 'Project',
        entityId: updatedProject.id,
      });
    } else if (isRejection) {
      await NotificationService.createNotification({
        senderId: req.user?.id,
        recipientId: targetRecipientId,
        type: 'PORTFOLIO_REJECTED',
        title: 'Portfolio Rejected',
        message: `Project "${title.trim()}" has been rejected.`,
        entityType: 'Project',
        entityId: updatedProject.id,
      });
    } else if (isNewSubmission) {
      await NotificationService.createNotification({
        senderId: req.user?.id,
        recipientRole: 'SUPER_ADMIN',
        type: 'PORTFOLIO_SUBMITTED',
        title: 'Portfolio Awaiting Approval',
        message: `Project "${title.trim()}" submitted for approval.`,
        entityType: 'Project',
        entityId: updatedProject.id,
        priority: 'HIGH',
      });
    }

    res.json(updatedProject);
  } catch (error) {
    console.error('[UPDATE PROJECT ERROR]:', error);
    res.status(500).json({ message: 'Failed to update project.' });
  }
};

// Reorder / Sort images for a project
const sortProjectImages = async (req, res) => {
  const { id } = req.params;
  const { images } = req.body;

  if (!Array.isArray(images)) {
    return res.status(400).json({ message: 'An array of images with order is required.' });
  }

  try {
    const existing = await prisma.project.findFirst({
      where: { id, deletedAt: null }
    });

    if (!existing) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    await prisma.$transaction(
      images.map((img) =>
        prisma.projectImage.update({
          where: { id: img.id },
          data: { order: img.order },
        })
      )
    );

    const updated = await prisma.project.findUnique({
      where: { id },
      include: { images: { orderBy: { order: 'asc' } } },
    });

    await logActivity(req, {
      action: 'SORT_PROJECT_IMAGES',
      details: `Sorted gallery images for project: ${existing.title}`,
    });

    res.json(updated);
  } catch (error) {
    console.error('[SORT IMAGES ERROR]:', error);
    res.status(500).json({ message: 'Failed to sort project images.' });
  }
};

// Soft Delete a Project
const deleteProject = async (req, res) => {
  const { id } = req.params;

  try {
    const project = await prisma.project.findFirst({
      where: { id, deletedAt: null }
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    await prisma.project.update({
      where: { id },
      data: { deletedAt: new Date(), publishingStatus: 'ARCHIVED' },
    });

    await logActivity(req, {
      action: 'DELETE_PROJECT',
      details: `Soft-deleted project: ${project.title}`,
      previousValue: project,
    });

    res.json({ message: `Project "${project.title}" deleted successfully.` });
  } catch (error) {
    console.error('[DELETE PROJECT ERROR]:', error);
    res.status(500).json({ message: 'Failed to delete project.' });
  }
};

// Approve a Project (SUPER_ADMIN only) — updates ONLY approval-related fields
// No slug regeneration, no image replacement, no content changes
const approveProject = async (req, res) => {
  const { id } = req.params;

  // Defense-in-depth: controller-level SUPER_ADMIN enforcement
  if (req.user?.role !== 'SUPER_ADMIN') {
    return res.status(403).json({
      message: 'Only SUPER_ADMIN can approve and publish projects.',
    });
  }

  try {
    const project = await prisma.project.findFirst({
      where: { id, deletedAt: null },
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    if (project.publishingStatus !== 'PENDING_APPROVAL') {
      return res.status(400).json({
        message: `Cannot approve project with status "${project.publishingStatus}". Only PENDING_APPROVAL projects can be approved.`,
      });
    }

    // Update ONLY approval-related fields — project ID, slug, title, images, and all
    // content fields remain completely untouched
    const approved = await prisma.project.update({
      where: { id },
      data: {
        publishingStatus: 'PUBLISHED',
        approvedById: req.user.id,
      },
      include: {
        images: { orderBy: { order: 'asc' } },
      },
    });

    await logActivity(req, {
      action: 'PROJECT_APPROVED',
      details: `Approved and published project: "${project.title}"`,
      previousValue: { publishingStatus: project.publishingStatus },
      newValue: { publishingStatus: 'PUBLISHED', approvedById: req.user.id },
    });

    const NotificationService = require('../services/notification.service');
    await NotificationService.createNotification({
      senderId: req.user?.id,
      recipientId: project.createdById || null,
      type: 'PORTFOLIO_APPROVED',
      title: 'Portfolio Approved',
      message: `Project "${project.title}" has been approved and published.`,
      entityType: 'Project',
      entityId: approved.id,
    });

    res.json(approved);
  } catch (error) {
    console.error('[APPROVE PROJECT ERROR]:', error);
    res.status(500).json({ message: 'Failed to approve project.' });
  }
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  sortProjectImages,
  deleteProject,
  approveProject,
};
