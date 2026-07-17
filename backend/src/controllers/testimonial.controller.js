const prisma = require('../utils/db');

const getTestimonials = async (req, res) => {
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' }
    });
    res.json(testimonials);
  } catch (error) {
    console.error('[GET TESTIMONIALS ERROR]:', error);
    res.status(500).json({ message: 'Failed to fetch testimonials' });
  }
};

const createTestimonial = async (req, res) => {
  const { clientName, company, designation, profileImage, rating, review, isActive } = req.body;
  try {
    // If user is logged in (req.user exists), respect isActive. Otherwise, force to false.
    const activeStatus = req.user ? (isActive !== undefined ? Boolean(isActive) : true) : false;

    // Validate profileImage URL
    if (profileImage) {
    }
    const testimonial = await prisma.testimonial.create({
      data: {
        clientName,
        company: company || '',
        designation: designation || '',
        profileImage: profileImage || '',
        rating: parseInt(rating || '5', 10),
        review,
        isActive: activeStatus,
      }
    });

    await prisma.activityLog.create({
      data: {
        action: 'CREATE_TESTIMONIAL',
        details: req.user ? `Added testimonial from ${clientName}` : `Guest submitted testimonial review from ${clientName}`,
        userEmail: req.user?.email || 'guest@archstudio.com'
      }
    });

    res.status(201).json(testimonial);
  } catch (error) {
    console.error('[CREATE TESTIMONIAL ERROR]:', error);
    res.status(500).json({ message: 'Failed to create testimonial' });
  }
};

const updateTestimonial = async (req, res) => {
  const { id } = req.params;
  const { clientName, company, designation, profileImage, rating, review, isActive } = req.body;
  try {
    // Validate profileImage URL
    if (profileImage) {
    }
    const testimonial = await prisma.testimonial.update({
      where: { id },
      data: {
        clientName,
        company,
        designation,
        profileImage,
        rating: parseInt(rating || '5', 10),
        review,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      }
    });

    await prisma.activityLog.create({
      data: {
        action: 'UPDATE_TESTIMONIAL',
        details: `Updated testimonial from ${clientName}`,
        userEmail: req.user?.email || 'admin@archstudio.com'
      }
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
    const testimonial = await prisma.testimonial.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    await prisma.activityLog.create({
      data: {
        action: 'DELETE_TESTIMONIAL',
        details: `Soft-deleted testimonial from ${testimonial.clientName}`,
        userEmail: req.user?.email || 'admin@archstudio.com'
      }
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
