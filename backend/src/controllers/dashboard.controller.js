const prisma = require('../utils/db');

const getDashboardStats = async (req, res) => {
  try {
    // 1. Counters
    const [
      totalProjects,
      totalServices,
      totalTestimonials,
      totalBlogPosts,
      unreadMessages,
      totalSubscribers
    ] = await Promise.all([
      prisma.project.count({ where: { deletedAt: null } }),
      prisma.service.count({ where: { deletedAt: null } }),
      prisma.testimonial.count({ where: { deletedAt: null } }),
      prisma.blogPost.count({ where: { deletedAt: null } }),
      prisma.contactMessage.count({ where: { deletedAt: null, status: 'UNREAD' } }),
      prisma.newsletterSubscriber.count({ where: { deletedAt: null } }),
    ]);

    // 2. Projects by category
    const projects = await prisma.project.findMany({
      where: { deletedAt: null },
      select: { category: true }
    });
    
    const categoryCounts = {};
    projects.forEach(p => {
      categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
    });
    
    const projectsByCategory = Object.entries(categoryCounts).map(([name, value]) => ({
      name,
      value
    }));

    // 3. Monthly inquiries (mock analytics generated from recent inquiries of current year)
    const currentYear = new Date().getFullYear();
    const inquiries = await prisma.contactMessage.findMany({
      where: {
        deletedAt: null,
        createdAt: {
          gte: new Date(`${currentYear}-01-01`),
          lte: new Date(`${currentYear}-12-31`),
        }
      },
      select: { createdAt: true }
    });

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyInquiriesCount = Array(12).fill(0);
    
    inquiries.forEach(inq => {
      const monthIndex = new Date(inq.createdAt).getMonth();
      monthlyInquiriesCount[monthIndex]++;
    });

    const monthlyInquiries = monthNames.map((name, index) => ({
      name,
      inquiries: monthlyInquiriesCount[index]
    }));

    // 4. Latest Contact Messages
    const latestMessages = await prisma.contactMessage.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    // 5. Recent Activity Logs
    const recentActivity = await prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    res.json({
      summary: {
        totalProjects,
        totalServices,
        totalTestimonials,
        totalBlogPosts,
        unreadMessages,
        totalSubscribers
      },
      projectsByCategory,
      monthlyInquiries,
      latestMessages,
      recentActivity
    });
  } catch (error) {
    console.error('[DASHBOARD STATS ERROR]:', error);
    res.status(500).json({ message: 'Failed to retrieve dashboard analytics.' });
  }
};

module.exports = {
  getDashboardStats,
};
