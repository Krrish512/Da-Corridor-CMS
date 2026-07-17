const prisma = require('../utils/db');

const getServices = async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      where: { deletedAt: null },
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
  try {
    const service = await prisma.service.findFirst({
      where: { id, deletedAt: null }
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
  const { title, icon, shortDescription, fullDescription, image, displayOrder, isActive } = req.body;
  try {
    // Validate image URL
    if (image) {
    }
    const service = await prisma.service.create({
      data: {
        title,
        icon,
        shortDescription,
        fullDescription,
        image,
        displayOrder: parseInt(displayOrder || '0', 10),
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      }
    });

    await prisma.activityLog.create({
      data: {
        action: 'CREATE_SERVICE',
        details: `Created service: ${title}`,
        userEmail: req.user?.email || 'admin@archstudio.com'
      }
    });

    res.status(201).json(service);
  } catch (error) {
    console.error('[CREATE SERVICE ERROR]:', error);
    res.status(500).json({ message: 'Failed to create service.' });
  }
};

const updateService = async (req, res) => {
  const { id } = req.params;
  const { title, icon, shortDescription, fullDescription, image, displayOrder, isActive } = req.body;
  try {
    // Validate image URL
    if (image) {
    }
    const service = await prisma.service.update({
      where: { id },
      data: {
        title,
        icon,
        shortDescription,
        fullDescription,
        image,
        displayOrder: parseInt(displayOrder || '0', 10),
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      }
    });

    await prisma.activityLog.create({
      data: {
        action: 'UPDATE_SERVICE',
        details: `Updated service: ${title}`,
        userEmail: req.user?.email || 'admin@archstudio.com'
      }
    });

    res.json(service);
  } catch (error) {
    console.error('[UPDATE SERVICE ERROR]:', error);
    res.status(500).json({ message: 'Failed to update service.' });
  }
};

const deleteService = async (req, res) => {
  const { id } = req.params;
  try {
    // SOFT DELETE: Set deletedAt
    const service = await prisma.service.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    await prisma.activityLog.create({
      data: {
        action: 'DELETE_SERVICE',
        details: `Soft-deleted service: ${service.title}`,
        userEmail: req.user?.email || 'admin@archstudio.com'
      }
    });

    res.json({ message: 'Service soft-deleted successfully' });
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
