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

  if (!question || !question.trim() || !answer || !answer.trim()) {
    return res.status(400).json({ message: 'Question and Answer are required fields.' });
  }

  try {
    const faq = await prisma.fAQ.create({
      data: {
        question: question.trim(),
        answer: answer.trim(),
        displayOrder: parseInt(displayOrder || '0', 10)
      }
    });

    await prisma.activityLog.create({
      data: {
        action: 'CREATE_FAQ',
        details: `Created FAQ: "${question.substring(0, 45)}..."`,
        userEmail: req.user?.email || 'admin@dacorridor.com'
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

  if (!question || !question.trim() || !answer || !answer.trim()) {
    return res.status(400).json({ message: 'Question and Answer are required fields.' });
  }

  try {
    const existing = await prisma.fAQ.findFirst({
      where: { id, deletedAt: null }
    });

    if (!existing) {
      return res.status(404).json({ message: 'FAQ not found.' });
    }

    const faq = await prisma.fAQ.update({
      where: { id },
      data: {
        question: question.trim(),
        answer: answer.trim(),
        displayOrder: parseInt(displayOrder || '0', 10)
      }
    });

    await prisma.activityLog.create({
      data: {
        action: 'UPDATE_FAQ',
        details: `Updated FAQ: "${question.substring(0, 45)}..."`,
        userEmail: req.user?.email || 'admin@dacorridor.com'
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
    const existing = await prisma.fAQ.findFirst({
      where: { id, deletedAt: null }
    });

    if (!existing) {
      return res.status(404).json({ message: 'FAQ not found.' });
    }

    const faq = await prisma.fAQ.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    await prisma.activityLog.create({
      data: {
        action: 'DELETE_FAQ',
        details: `Soft-deleted FAQ: "${faq.question.substring(0, 45)}..."`,
        userEmail: req.user?.email || 'admin@dacorridor.com'
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
