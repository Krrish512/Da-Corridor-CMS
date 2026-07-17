const prisma = require('../utils/db');
const { validateImageUrl } = require('../utils/validation');


// List Projects with Search, Filter & Pagination
const getProjects = async (req, res) => {
  try {
    const {
      search = '',
      category = '',
      status = '',
      featured,
      page = 1,
      limit = 10,
    } = req.query;

    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);
    const skip = (parsedPage - 1) * parsedLimit;

    // Build Prisma query filters
    const where = {
      deletedAt: null, // Soft delete filter
    };

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
        include: {
          images: {
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
  try {
    const project = await prisma.project.findFirst({
      where: {
        OR: [{ id: id }, { slug: id }],
        deletedAt: null,
      },
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
    console.error('[GET PROJECT ERROR]:', error);
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
    images = [], // Array of URLs or {url, order}
    clientName,
    location,
    area,
    completionDate,
    status,
    description,
    designChallenge,
    solution,
    materials,
    featured,
    seoTitle,
    seoDescription,
  } = req.body;

  try {
    // Generate unique slug if not present
    let finalSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    // Check if slug is unique
    const slugExists = await prisma.project.findFirst({
      where: { slug: finalSlug, deletedAt: null }
    });
    if (slugExists) {
      finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
    }

    // Build relational project images data
    const projectImages = Array.isArray(images)
      ? images.map((img, idx) => ({
          url: typeof img === 'string' ? img : img.url,
          order: typeof img === 'string' ? idx : (img.order !== undefined ? img.order : idx),
        }))
      : [];

    // Validate Cover Image and gallery images
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
        title,
        slug: finalSlug,
        category,
        coverImage,
        clientName,
        location,
        area,
        completionDate: completionDate ? new Date(completionDate) : new Date(),
        status,
        description,
        designChallenge,
        solution,
        materials,
        featured: featured !== undefined ? Boolean(featured) : false,
        seoTitle,
        seoDescription,
        images: {
          create: projectImages,
        },
      },
      include: {
        images: true,
      },
    });

    await prisma.activityLog.create({
      data: {
        action: 'CREATE_PROJECT',
        details: `Created new project: ${title}`,
        userEmail: req.user?.email || 'admin@archstudio.com'
      }
    });

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
    images = [], // New list of images (URLs or {id, url, order})
    clientName,
    location,
    area,
    completionDate,
    status,
    description,
    designChallenge,
    solution,
    materials,
    featured,
    seoTitle,
    seoDescription,
  } = req.body;

  try {
    const existingProject = await prisma.project.findFirst({
      where: { id, deletedAt: null }
    });

    if (!existingProject) {
      return res.status(404).json({ message: 'Project not found.' });
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

    // To update related images: delete all existing images and recreate them to synchronize simple edits
    // In production, we'd do a diff, but deleting and recreating is very robust for full list replacement.
    await prisma.projectImage.deleteMany({
      where: { projectId: id },
    });

    const projectImages = Array.isArray(images)
      ? images.map((img, idx) => ({
          url: typeof img === 'string' ? img : img.url,
          order: typeof img === 'string' ? idx : (img.order !== undefined ? img.order : idx),
        }))
      : [];

    // Validate Cover Image and gallery images
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
        title,
        slug: finalSlug,
        category,
        coverImage,
        clientName,
        location,
        area,
        completionDate: completionDate ? new Date(completionDate) : undefined,
        status,
        description,
        designChallenge,
        solution,
        materials,
        featured: featured !== undefined ? Boolean(featured) : undefined,
        seoTitle,
        seoDescription,
        images: {
          create: projectImages,
        },
      },
      include: {
        images: { orderBy: { order: 'asc' } },
      },
    });

    await prisma.activityLog.create({
      data: {
        action: 'UPDATE_PROJECT',
        details: `Updated project: ${title}`,
        userEmail: req.user?.email || 'admin@archstudio.com'
      }
    });

    res.json(updatedProject);
  } catch (error) {
    console.error('[UPDATE PROJECT ERROR]:', error);
    res.status(500).json({ message: 'Failed to update project.' });
  }
};

// Sort Images (Drag and Drop Sorting Endpoint)
const sortProjectImages = async (req, res) => {
  const { id } = req.params;
  const { imageOrders } = req.body; // Expects array: [{ id: "...", order: 0 }, ...]

  try {
    const project = await prisma.project.findFirst({
      where: { id, deletedAt: null },
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    if (!Array.isArray(imageOrders)) {
      return res.status(400).json({ message: 'Invalid payload. imageOrders must be an array.' });
    }

    // Perform individual updates
    const updatePromises = imageOrders.map((item) =>
      prisma.projectImage.update({
        where: { id: item.id, projectId: id },
        data: { order: item.order },
      })
    );

    await Promise.all(updatePromises);

    const sortedImages = await prisma.projectImage.findMany({
      where: { projectId: id },
      orderBy: { order: 'asc' },
    });

    res.json({
      message: 'Images sorted successfully',
      images: sortedImages,
    });
  } catch (error) {
    console.error('[SORT IMAGES ERROR]:', error);
    res.status(500).json({ message: 'Failed to sort project images.' });
  }
};

// Soft Delete Project
const deleteProject = async (req, res) => {
  const { id } = req.params;
  try {
    const project = await prisma.project.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await prisma.activityLog.create({
      data: {
        action: 'DELETE_PROJECT',
        details: `Soft-deleted project: ${project.title}`,
        userEmail: req.user?.email || 'admin@archstudio.com'
      }
    });

    res.json({ message: 'Project soft-deleted successfully.' });
  } catch (error) {
    console.error('[DELETE PROJECT ERROR]:', error);
    res.status(500).json({ message: 'Failed to delete project.' });
  }
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  sortProjectImages,
  deleteProject,
};
