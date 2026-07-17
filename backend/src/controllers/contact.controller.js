const prisma = require('../utils/db');
const { sendAdminNotification } = require('../utils/email');
const { convertToCSV } = require('../utils/csv');

// ==========================================
// CONTACT DETAILS (OFFICE INFO)
// ==========================================

const getContactDetails = async (req, res) => {
  try {
    let details = await prisma.contactDetails.findFirst({
      where: { deletedAt: null }
    });

    if (!details) {
      details = await prisma.contactDetails.create({
        data: {
          officeAddress: "128 Design District, Suite 500, New York, NY 10013",
          email: "info@archstudio.com",
          phone: "+1 (555) 234-5678",
          whatsApp: "+1 (555) 987-6543",
          googleMapsUrl: "https://maps.google.com",
          workingHours: "Mon - Fri: 9:00 AM - 6:00 PM",
          socialFacebook: "https://facebook.com/archstudio",
          socialTwitter: "https://twitter.com/archstudio",
          socialLinkedin: "https://linkedin.com/company/archstudio",
          socialInsta: "https://instagram.com/archstudio"
        }
      });
    }

    res.json(details);
  } catch (error) {
    console.error('[GET CONTACT DETAILS ERROR]:', error);
    res.status(500).json({ message: 'Failed to retrieve office contact details.' });
  }
};

const updateContactDetails = async (req, res) => {
  const {
    officeAddress, email, phone, whatsApp, googleMapsUrl, workingHours,
    socialFacebook, socialTwitter, socialLinkedin, socialInsta
  } = req.body;

  try {
    const existing = await prisma.contactDetails.findFirst({
      where: { deletedAt: null }
    });

    let updated;
    const data = {
      officeAddress, email, phone, whatsApp, googleMapsUrl, workingHours,
      socialFacebook, socialTwitter, socialLinkedin, socialInsta
    };

    if (existing) {
      updated = await prisma.contactDetails.update({
        where: { id: existing.id },
        data
      });
    } else {
      updated = await prisma.contactDetails.create({ data });
    }

    await prisma.activityLog.create({
      data: {
        action: 'UPDATE_CONTACT_INFO',
        details: 'Updated office contact details and social links',
        userEmail: req.user?.email || 'admin@archstudio.com'
      }
    });

    res.json(updated);
  } catch (error) {
    console.error('[UPDATE CONTACT DETAILS ERROR]:', error);
    res.status(500).json({ message: 'Failed to update contact details.' });
  }
};


// ==========================================
// CONTACT MESSAGES / INQUIRIES (CRUD & EXPORT)
// ==========================================

// Get list of contact messages (Paginated, Searchable, Filterable)
const getMessages = async (req, res) => {
  try {
    const {
      search = '',
      status = '', // UNREAD, READ, REPLIED
      page = 1,
      limit = 15,
    } = req.query;

    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);
    const skip = (parsedPage - 1) * parsedLimit;

    const where = { deletedAt: null };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    const [messages, totalCount] = await Promise.all([
      prisma.contactMessage.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parsedLimit,
      }),
      prisma.contactMessage.count({ where }),
    ]);

    res.json({
      data: messages,
      meta: {
        total: totalCount,
        page: parsedPage,
        limit: parsedLimit,
        totalPages: Math.ceil(totalCount / parsedLimit),
      }
    });
  } catch (error) {
    console.error('[GET MESSAGES ERROR]:', error);
    res.status(500).json({ message: 'Failed to retrieve messages.' });
  }
};

// Create / Submit contact message from public page (includes admin email alert)
const submitMessage = async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  try {
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Please fill in Name, Email and Message.' });
    }

    const inquiry = await prisma.contactMessage.create({
      data: {
        name,
        email,
        phone: phone || '',
        subject: subject || 'General Architecture Inquiry',
        message
      }
    });

    // Send email to admin
    const emailSubject = `[New Client Inquiry] ${subject || 'ArchStudio Contact Form'}`;
    const emailText = `Hello Admin,\n\nYou have received a new contact inquiry from your website.\n\n` + 
                      `Name: ${name}\n` +
                      `Email: ${email}\n` +
                      `Phone: ${phone || 'N/A'}\n` +
                      `Subject: ${subject || 'N/A'}\n\n` +
                      `Message:\n${message}\n\n` +
                      `Manage this message on the Admin Panel: http://localhost:5173/admin/contact-messages`;
    
    const emailHtml = `<h3>New Contact Inquiry Received</h3>
                       <p>Hello Admin,</p>
                       <p>You have received a new client message on the architecture portfolio site:</p>
                       <table border="0" cellpadding="5" cellspacing="0">
                         <tr><td><strong>Name:</strong></td><td>${name}</td></tr>
                         <tr><td><strong>Email:</strong></td><td>${email}</td></tr>
                         <tr><td><strong>Phone:</strong></td><td>${phone || 'N/A'}</td></tr>
                         <tr><td><strong>Subject:</strong></td><td>${subject || 'N/A'}</td></tr>
                       </table>
                       <p><strong>Message Details:</strong></p>
                       <p style="background: #f4f4f4; padding: 10px; border-radius: 4px;">${message.replace(/\n/g, '<br>')}</p>
                       <p><a href="http://localhost:5173/admin/contact-messages">View in Admin Dashboard</a></p>`;

    await sendAdminNotification({
      subject: emailSubject,
      text: emailText,
      html: emailHtml
    });

    res.status(201).json({
      success: true,
      message: 'Inquiry submitted successfully. Our team will contact you shortly.',
      data: inquiry
    });
  } catch (error) {
    console.error('[SUBMIT MESSAGE ERROR]:', error);
    res.status(500).json({ message: 'Failed to submit inquiry.' });
  }
};

// Update message status (e.g. mark as READ or REPLIED)
const updateMessageStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // READ or REPLIED or UNREAD

  try {
    const updated = await prisma.contactMessage.update({
      where: { id },
      data: { status }
    });
    res.json(updated);
  } catch (error) {
    console.error('[UPDATE MESSAGE ERROR]:', error);
    res.status(500).json({ message: 'Failed to update message status.' });
  }
};

// Soft Delete a contact message
const deleteMessage = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await prisma.contactMessage.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    await prisma.activityLog.create({
      data: {
        action: 'DELETE_MESSAGE',
        details: `Soft-deleted contact message from ${deleted.name}`,
        userEmail: req.user?.email || 'admin@archstudio.com'
      }
    });

    res.json({ message: 'Message soft-deleted successfully.' });
  } catch (error) {
    console.error('[DELETE MESSAGE ERROR]:', error);
    res.status(500).json({ message: 'Failed to delete message.' });
  }
};

// Export inquiries to CSV
const exportMessagesCSV = async (req, res) => {
  try {
    const messages = await prisma.contactMessage.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' }
    });

    const headers = ['id', 'name', 'phone', 'email', 'subject', 'message', 'status', 'createdAt'];
    const csvContent = convertToCSV(messages, headers);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=contact_messages.csv');
    res.status(200).send(csvContent);
  } catch (error) {
    console.error('[EXPORT MESSAGES CSV ERROR]:', error);
    res.status(500).json({ message: 'Failed to generate CSV export.' });
  }
};

module.exports = {
  getContactDetails,
  updateContactDetails,
  getMessages,
  submitMessage,
  updateMessageStatus,
  deleteMessage,
  exportMessagesCSV,
};
