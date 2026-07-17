const prisma = require('../utils/db');

const getFAQs = async (req, res) => {
  try {
    const faqs = await prisma.fAQ.findMany({
      where: { deletedAt: null },
      orderBy: { displayOrder: 'asc' }
    });
    res.json(faqs);
  } catch (error) {
    console.error('[GET FAQS ERROR]:', error);
    res.status(500).json({ message: 'Failed to fetch FAQs' });
  }
};

const createFAQ = async (req, res) => {
  const { question, answer, displayOrder } = req.body;
  try {
    const faq = await prisma.fAQ.create({
      data: {
        question,
        answer,
        displayOrder: parseInt(displayOrder || '0', 10)
      }
    });

    await prisma.activityLog.create({
      data: {
        action: 'CREATE_FAQ',
        details: `Created FAQ: "${question.substring(0, 45)}..."`,
        userEmail: req.user?.email || 'admin@archstudio.com'
      }
    });

    res.status(201).json(faq);
  } catch (error) {
    console.error('[CREATE FAQ ERROR]:', error);
    res.status(500).json({ message: 'Failed to create FAQ' });
  }
};

const updateFAQ = async (req, res) => {
  const { id } = req.params;
  const { question, answer, displayOrder } = req.body;
  try {
    const faq = await prisma.fAQ.update({
      where: { id },
      data: {
        question,
        answer,
        displayOrder: parseInt(displayOrder || '0', 10)
      }
    });

    await prisma.activityLog.create({
      data: {
        action: 'UPDATE_FAQ',
        details: `Updated FAQ: "${question.substring(0, 45)}..."`,
        userEmail: req.user?.email || 'admin@archstudio.com'
      }
    });

    res.json(faq);
  } catch (error) {
    console.error('[UPDATE FAQ ERROR]:', error);
    res.status(500).json({ message: 'Failed to update FAQ' });
  }
};

const deleteFAQ = async (req, res) => {
  const { id } = req.params;
  try {
    const faq = await prisma.fAQ.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    await prisma.activityLog.create({
      data: {
        action: 'DELETE_FAQ',
        details: `Soft-deleted FAQ: "${faq.question.substring(0, 45)}..."`,
        userEmail: req.user?.email || 'admin@archstudio.com'
      }
    });

    res.json({ message: 'FAQ soft-deleted successfully' });
  } catch (error) {
    console.error('[DELETE FAQ ERROR]:', error);
    res.status(500).json({ message: 'Failed to delete FAQ' });
  }
};

module.exports = {
  getFAQs,
  createFAQ,
  updateFAQ,
  deleteFAQ,
};
