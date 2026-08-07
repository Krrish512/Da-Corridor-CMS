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

    const [items, totalCount, distinctFolders] = await Promise.all([
      prisma.galleryItem.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parsedLimit,
      }),
      prisma.galleryItem.count({ where }),
      prisma.galleryItem.findMany({
        where: { deletedAt: null },
        select: { folder: true },
        distinct: ['folder'],
      }),
    ]);

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

    // Determine the URL for the new gallery record.
    // If the optimizer generated a WebP companion, use it for the DB record.
    // Otherwise fall back to the original uploaded file path.
    // Existing records are never touched — their original URLs remain valid on disk.
    let fileUrl = '';
    if (req.file) {
      const filename = req.file.webpFilename || req.file.filename;
      fileUrl = `/uploads/${filename}`;
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
        userEmail: req.user?.email || 'admin@dacorridor.com'
      }
    });

    const NotificationService = require('../services/notification.service');
    await NotificationService.createNotification({
      senderId: req.user?.id,
      recipientId: req.user?.id || null,
      type: 'GALLERY_UPLOAD_SUCCESS',
      title: 'Media Upload Completed',
      message: `Asset "${fileUrl.split('/').pop()}" uploaded successfully.`,
      entityType: 'GalleryItem',
      entityId: galleryItem.id,
      priority: 'LOW',
    });

    res.status(201).json(galleryItem);
  } catch (error) {
    console.error('[ADD GALLERY ITEM ERROR]:', error);
    const NotificationService = require('../services/notification.service');
    await NotificationService.createNotification({
      senderId: req.user?.id,
      recipientId: req.user?.id || null,
      type: 'GALLERY_UPLOAD_FAILED',
      title: 'Media Upload Failed',
      message: `Failed to upload media item: ${error.message || 'Server error'}`,
      entityType: 'GalleryItem',
      priority: 'HIGH',
    });
    res.status(500).json({ message: 'Failed to upload media item.' });
  }
};

const deleteGalleryItem = async (req, res) => {
  const { id } = req.params;
  try {
    const existing = await prisma.galleryItem.findFirst({
      where: { id, deletedAt: null }
    });

    if (!existing) {
      return res.status(404).json({ message: 'Media item not found.' });
    }

    const item = await prisma.galleryItem.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await prisma.activityLog.create({
      data: {
        action: 'DELETE_MEDIA',
        details: `Soft-deleted media asset: ${item.url}`,
        userEmail: req.user?.email || 'admin@dacorridor.com'
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
