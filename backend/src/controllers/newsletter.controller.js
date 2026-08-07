const prisma = require('../utils/db');
const { sendAdminNotification } = require('../utils/email');
const { convertToCSV } = require('../utils/csv');

// Get all newsletter subscribers (Paginated)
const getSubscribers = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);
    const skip = (parsedPage - 1) * parsedLimit;

    const where = { deletedAt: null };

    const [subscribers, totalCount] = await Promise.all([
      prisma.newsletterSubscriber.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parsedLimit,
      }),
      prisma.newsletterSubscriber.count({ where }),
    ]);

    res.json({
      data: subscribers,
      meta: {
        total: totalCount,
        page: parsedPage,
        limit: parsedLimit,
        totalPages: Math.ceil(totalCount / parsedLimit),
      }
    });
  } catch (error) {
    console.error('[GET SUBSCRIBERS ERROR]:', error);
    res.status(500).json({ message: 'Failed to fetch subscribers.' });
  }
};

// Subscribe to newsletter (public page - emails admin)
const subscribe = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email || !email.includes('@')) {
      return res.status(400).json({ message: 'Please provide a valid email address.' });
    }

    // Check if subscriber exists (and is not deleted)
    const existing = await prisma.newsletterSubscriber.findFirst({
      where: { email }
    });

    if (existing) {
      if (existing.deletedAt) {
        // Reactivate soft-deleted subscriber
        const reactivated = await prisma.newsletterSubscriber.update({
          where: { id: existing.id },
          data: { deletedAt: null }
        });
        return res.status(200).json({ message: 'Subscribed successfully.', data: reactivated });
      }
      return res.status(400).json({ message: 'This email is already subscribed.' });
    }

    const subscriber = await prisma.newsletterSubscriber.create({
      data: { email }
    });

    // Notify admin
    const emailSubject = `[New Subscriber] ${email} joined your newsletter`;
    const emailText = `Hello Admin,\n\nA new user has subscribed to the newsletter on your Architecture Portfolio website.\n\nEmail: ${email}\nDate: ${new Date().toLocaleString()}`;
    const emailHtml = `<h3>New Newsletter Subscription</h3>
                       <p>Hello Admin,</p>
                       <p>A new visitor has signed up for updates:</p>
                       <p><strong>Email Address:</strong> <a href="mailto:${email}">${email}</a></p>
                       <p>You can view and export subscribers in the CMS dashboard: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/newsletter</p>`;

    await sendAdminNotification({
      subject: emailSubject,
      text: emailText,
      html: emailHtml
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for subscribing!',
      data: subscriber
    });
  } catch (error) {
    console.error('[SUBSCRIBE ERROR]:', error);
    res.status(500).json({ message: 'Subscription failed.' });
  }
};

// Soft delete / Unsubscribe a newsletter user
const deleteSubscriber = async (req, res) => {
  const { id } = req.params;
  try {
    const existing = await prisma.newsletterSubscriber.findFirst({
      where: { id, deletedAt: null }
    });

    if (!existing) {
      return res.status(404).json({ message: 'Subscriber not found.' });
    }

    const subscriber = await prisma.newsletterSubscriber.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    await prisma.activityLog.create({
      data: {
        action: 'UNSUBSCRIBE_USER',
        details: `Soft-deleted subscriber: ${subscriber.email}`,
        userEmail: req.user?.email || 'admin@dacorridor.com'
      }
    });

    res.json({ message: 'Subscriber soft-deleted successfully.' });
  } catch (error) {
    console.error('[DELETE SUBSCRIBER ERROR]:', error);
    res.status(500).json({ message: 'Failed to delete subscriber.' });
  }
};

// Export subscribers to CSV
const exportSubscribersCSV = async (req, res) => {
  try {
    const subscribers = await prisma.newsletterSubscriber.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' }
    });

    const headers = ['id', 'email', 'createdAt'];
    const csvContent = convertToCSV(subscribers, headers);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=newsletter_subscribers.csv');
    res.status(200).send(csvContent);
  } catch (error) {
    console.error('[EXPORT SUBSCRIBERS CSV ERROR]:', error);
    res.status(500).json({ message: 'Failed to export subscribers.' });
  }
};

module.exports = {
  getSubscribers,
  subscribe,
  deleteSubscriber,
  exportSubscribersCSV,
};
