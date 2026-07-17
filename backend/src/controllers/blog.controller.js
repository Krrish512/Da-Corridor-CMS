const prisma = require('../utils/db');

// Get all blogs with pagination, search and category filter
const getBlogs = async (req, res) => {
  try {
    const {
      search = '',
      category = '',
      page = 1,
      limit = 10,
      isPublic
    } = req.query;

    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);
    const skip = (parsedPage - 1) * parsedLimit;

    const where = { deletedAt: null };

    if (isPublic === 'true' || isPublic === true) {
      where.publishDate = {
        lte: new Date()
      };
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
      where.publishDate = {
        lte: new Date()
      };
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
    tags, // Comma separated string
    featuredImage,
    richText,
    seoTitle,
    seoDescription,
    publishDate
  } = req.body;

  try {
    // Validate featuredImage URL
    if (featuredImage) {
    }

    let finalSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const slugExists = await prisma.blogPost.findFirst({
      where: { slug: finalSlug, deletedAt: null }
    });

    if (slugExists) {
      finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
    }

    const blog = await prisma.blogPost.create({
      data: {
        title,
        slug: finalSlug,
        category,
        tags: tags || '',
        featuredImage,
        richText,
        seoTitle,
        seoDescription,
        publishDate: publishDate ? new Date(publishDate) : new Date(),
      }
    });

    await prisma.activityLog.create({
      data: {
        action: 'CREATE_BLOG',
        details: `Published blog post: ${title}`,
        userEmail: req.user?.email || 'admin@archstudio.com'
      }
    });

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
    publishDate
  } = req.body;

  try {
    const existing = await prisma.blogPost.findFirst({
      where: { id, deletedAt: null }
    });

    if (!existing) {
      return res.status(404).json({ message: 'Blog post not found' });
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

    // Validate featuredImage URL
    if (featuredImage) {
    }

    const updated = await prisma.blogPost.update({
      where: { id },
      data: {
        title,
        slug: finalSlug,
        category,
        tags: tags !== undefined ? tags : existing.tags,
        featuredImage,
        richText,
        seoTitle,
        seoDescription,
        publishDate: publishDate ? new Date(publishDate) : undefined,
      }
    });

    await prisma.activityLog.create({
      data: {
        action: 'UPDATE_BLOG',
        details: `Updated blog post: ${title}`,
        userEmail: req.user?.email || 'admin@archstudio.com'
      }
    });

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
    const blog = await prisma.blogPost.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    await prisma.activityLog.create({
      data: {
        action: 'DELETE_BLOG',
        details: `Soft-deleted blog post: ${blog.title}`,
        userEmail: req.user?.email || 'admin@archstudio.com'
      }
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

