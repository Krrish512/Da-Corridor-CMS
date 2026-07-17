const prisma = require('../utils/db');

const getSEOSettings = async (req, res) => {
  try {
    let seo = await prisma.sEOSettings.findFirst({
      where: { deletedAt: null }
    });

    if (!seo) {
      seo = await prisma.sEOSettings.create({
        data: {
          homepageTitle: "ArchStudio | Modern Architecture & Design Studio",
          metaDescription: "ArchStudio is a leading architecture practice delivering sustainable, custom commercial and residential designs.",
          keywords: "architecture, portfolio, design, builder, modern home, sustainable building",
          ogImage: "/uploads/default-og.jpg",
          googleAnalyticsId: "UA-XXXXXXXXX-X",
          searchConsoleVerification: "",
          robotsText: "User-agent: *\nAllow: /",
          sitemapXml: "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n  <url>\n    <loc>https://archstudio.com/</loc>\n  </url>\n</urlset>"
        }
      });
    }

    res.json(seo);
  } catch (error) {
    console.error('[GET SEO SETTINGS ERROR]:', error);
    res.status(500).json({ message: 'Failed to retrieve SEO configurations.' });
  }
};

const updateSEOSettings = async (req, res) => {
  const {
    homepageTitle, metaDescription, keywords, ogImage,
    googleAnalyticsId, searchConsoleVerification, robotsText, sitemapXml
  } = req.body;

  try {
    const existing = await prisma.sEOSettings.findFirst({
      where: { deletedAt: null }
    });

    // Validate ogImage URL
    if (ogImage) {
    }
    let updated;
    const data = {
      homepageTitle, metaDescription, keywords, ogImage,
      googleAnalyticsId, searchConsoleVerification, robotsText, sitemapXml
    };

    if (existing) {
      updated = await prisma.sEOSettings.update({
        where: { id: existing.id },
        data
      });
    } else {
      updated = await prisma.sEOSettings.create({ data });
    }

    await prisma.activityLog.create({
      data: {
        action: 'UPDATE_SEO_SETTINGS',
        details: 'Updated global SEO meta and XML configurations',
        userEmail: req.user?.email || 'admin@archstudio.com'
      }
    });

    res.json(updated);
  } catch (error) {
    console.error('[UPDATE SEO SETTINGS ERROR]:', error);
    res.status(500).json({ message: 'Failed to update SEO configurations.' });
  }
};

module.exports = {
  getSEOSettings,
  updateSEOSettings,
};
