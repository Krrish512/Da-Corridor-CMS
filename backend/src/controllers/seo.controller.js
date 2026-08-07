const prisma = require('../utils/db');

const getSEOSettings = async (req, res) => {
  try {
    let seo = await prisma.sEOSettings.findFirst({
      where: { deletedAt: null }
    });

    if (!seo) {
      seo = await prisma.sEOSettings.create({
        data: {
          homepageTitle: "Da' Corridor | Modern Architecture & Design Studio",
          metaDescription: "Da' Corridor is a leading architecture practice delivering sustainable, custom commercial and residential designs.",
          keywords: "architecture, portfolio, design, builder, modern home, sustainable building",
          ogImage: "/uploads/default-og.jpg",
          googleAnalyticsId: "UA-XXXXXXXXX-X",
          searchConsoleVerification: ""
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
    googleAnalyticsId, searchConsoleVerification
  } = req.body;

  if (!homepageTitle || !homepageTitle.trim() || !metaDescription || !metaDescription.trim()) {
    return res.status(400).json({ message: 'Homepage Title and Meta Description are required fields.' });
  }

  try {
    const existing = await prisma.sEOSettings.findFirst({
      where: { deletedAt: null }
    });

    let updated;
    const data = {
      homepageTitle: homepageTitle.trim(),
      metaDescription: metaDescription.trim(),
      keywords: keywords ? keywords.trim() : '',
      ogImage: ogImage ? ogImage.trim() : null,
      googleAnalyticsId: googleAnalyticsId ? googleAnalyticsId.trim() : '',
      searchConsoleVerification: searchConsoleVerification ? searchConsoleVerification.trim() : ''
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
        details: 'Updated global SEO meta configurations',
        userEmail: req.user?.email || 'admin@dacorridor.com'
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
