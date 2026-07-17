const prisma = require('../utils/db');

const getPartners = async (req, res) => {
  try {
    const partners = await prisma.partner.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' }
    });
    res.json(partners);
  } catch (error) {
    console.error('[GET PARTNERS ERROR]:', error);
    res.status(500).json({ message: 'Failed to fetch partners' });
  }
};

const createPartner = async (req, res) => {
  const { companyName, logo, websiteUrl } = req.body;
  try {
    // Validate logo URL
    if (logo) {
    }
    const partner = await prisma.partner.create({
      data: { companyName, logo, websiteUrl }
    });

    await prisma.activityLog.create({
      data: {
        action: 'CREATE_PARTNER',
        details: `Added brand partner: ${companyName}`,
        userEmail: req.user?.email || 'admin@archstudio.com'
      }
    });

    res.status(201).json(partner);
  } catch (error) {
    console.error('[CREATE PARTNER ERROR]:', error);
    res.status(500).json({ message: 'Failed to add partner' });
  }
};

const updatePartner = async (req, res) => {
  const { id } = req.params;
  const { companyName, logo, websiteUrl } = req.body;
  try {
    // Validate logo URL
    if (logo) {
    }
    const partner = await prisma.partner.update({
      where: { id },
      data: { companyName, logo, websiteUrl }
    });

    await prisma.activityLog.create({
      data: {
        action: 'UPDATE_PARTNER',
        details: `Updated brand partner: ${companyName}`,
        userEmail: req.user?.email || 'admin@archstudio.com'
      }
    });

    res.json(partner);
  } catch (error) {
    console.error('[UPDATE PARTNER ERROR]:', error);
    res.status(500).json({ message: 'Failed to update partner' });
  }
};

const deletePartner = async (req, res) => {
  const { id } = req.params;
  try {
    const partner = await prisma.partner.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    await prisma.activityLog.create({
      data: {
        action: 'DELETE_PARTNER',
        details: `Soft-deleted partner: ${partner.companyName}`,
        userEmail: req.user?.email || 'admin@archstudio.com'
      }
    });

    res.json({ message: 'Partner soft-deleted successfully' });
  } catch (error) {
    console.error('[DELETE PARTNER ERROR]:', error);
    res.status(500).json({ message: 'Failed to delete partner' });
  }
};

module.exports = {
  getPartners,
  createPartner,
  updatePartner,
  deletePartner,
};
