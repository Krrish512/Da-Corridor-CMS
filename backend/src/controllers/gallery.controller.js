const prisma = require('../utils/db');

// List Gallery Items with Search, Folder filtering & Pagination
const getGalleryItems = async (req, res) => {
  try {
    const {
      search = '',
      category = '',
      folder = 'root',
      type = '', // IMAGE or VIDEO
      page = 1,
      limit = 24,
    } = req.query;

    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);
    const skip = (parsedPage - 1) * parsedLimit;

    const where = {
      deletedAt: null,
      folder: folder,
    };

    if (search) {
      where.OR = [
        { url: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (type) {
      where.type = type;
    }

    const [items, totalCount] = await Promise.all([
      prisma.galleryItem.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parsedLimit,
      }),
      prisma.galleryItem.count({ where }),
    ]);

    // Also get all distinct folders in the system to populate folder list in frontend UI
    const distinctFolders = await prisma.galleryItem.findMany({
      where: { deletedAt: null },
      select: { folder: true },
      distinct: ['folder'],
    });

    res.json({
      data: items,
      folders: distinctFolders.map(f => f.folder),
      meta: {
        total: totalCount,
        page: parsedPage,
        limit: parsedLimit,
        totalPages: Math.ceil(totalCount / parsedLimit),
      },
    });
  } catch (error) {
    console.error('[GET GALLERY ITEMS ERROR]:', error);
    res.status(500).json({ message: 'Failed to retrieve media files.' });
  }
};

// Create / Upload items (handles multiple files if configured, or single)
const addGalleryItem = async (req, res) => {
  try {
    const { category = 'General', folder = 'root', type = 'IMAGE' } = req.body;
    
    if (!req.file && !req.body.url) {
      return res.status(400).json({ message: 'No file uploaded or URL provided.' });
    }

    // Determine the URL
    // If a file is uploaded, set the local path; otherwise use the raw URL passed in
    let fileUrl = '';
    if (req.file) {
      // Clean backslashes to forward slashes for Windows-compatibility path serving
      fileUrl = `/uploads/${req.file.filename}`;
    } else {
      fileUrl = req.body.url;
    }

    const galleryItem = await prisma.galleryItem.create({
      data: {
        type: req.file?.mimetype?.startsWith('video') ? 'VIDEO' : type,
        url: fileUrl,
        category,
        folder: folder.trim() || 'root',
      },
    });

    await prisma.activityLog.create({
      data: {
        action: 'UPLOAD_MEDIA',
        details: `Uploaded new asset to Media Library: ${fileUrl}`,
        userEmail: req.user?.email || 'admin@archstudio.com'
      }
    });

    res.status(201).json(galleryItem);
  } catch (error) {
    console.error('[ADD GALLERY ITEM ERROR]:', error);
    res.status(500).json({ message: 'Failed to upload media item.' });
  }
};

// Soft Delete a Gallery item
const deleteGalleryItem = async (req, res) => {
  const { id } = req.params;
  try {
    const item = await prisma.galleryItem.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await prisma.activityLog.create({
      data: {
        action: 'DELETE_MEDIA',
        details: `Soft-deleted media asset: ${item.url}`,
        userEmail: req.user?.email || 'admin@archstudio.com'
      }
    });

    res.json({ message: 'Media item soft-deleted successfully.' });
  } catch (error) {
    console.error('[DELETE GALLERY ITEM ERROR]:', error);
    res.status(500).json({ message: 'Failed to delete media item.' });
  }
};

module.exports = {
  getGalleryItems,
  addGalleryItem,
  deleteGalleryItem,
};
