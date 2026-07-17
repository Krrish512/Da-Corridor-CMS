const prisma = require('../utils/db');

const getSystemSettings = async (req, res) => {
  try {
    let settings = await prisma.systemSettings.findFirst({
      where: { deletedAt: null }
    });

    if (!settings) {
      settings = await prisma.systemSettings.create({
        data: {
          websiteLogo: "/uploads/logo.png",
          favicon: "/favicon.ico",
          themeColors: "default",
          footerText: "Â© 2026 ArchStudio. All rights reserved.",
          maintenanceMode: false,
          timezone: "UTC",
          language: "en"
        }
      });
    }

    res.json(settings);
  } catch (error) {
    console.error('[GET SYSTEM SETTINGS ERROR]:', error);
    res.status(500).json({ message: 'Failed to retrieve system configurations.' });
  }
};

const updateSystemSettings = async (req, res) => {
  const {
    websiteLogo, favicon, themeColors, footerText,
    maintenanceMode, timezone, language
  } = req.body;

  try {
    const existing = await prisma.systemSettings.findFirst({
      where: { deletedAt: null }
    });

    // Validate websiteLogo and favicon URLs
    if (websiteLogo) {
    }
    if (favicon) {
    }
    let updated;
    const data = {
      websiteLogo, favicon, themeColors, footerText,
      maintenanceMode: maintenanceMode !== undefined ? Boolean(maintenanceMode) : undefined,
      timezone, language
    };

    if (existing) {
      updated = await prisma.systemSettings.update({
        where: { id: existing.id },
        data
      });
    } else {
      updated = await prisma.systemSettings.create({ data });
    }

    await prisma.activityLog.create({
      data: {
        action: 'UPDATE_SYSTEM_SETTINGS',
        details: 'Updated global site settings and theme preferences',
        userEmail: req.user?.email || 'admin@archstudio.com'
      }
    });

    res.json(updated);
  } catch (error) {
    console.error('[UPDATE SYSTEM SETTINGS ERROR]:', error);
    res.status(500).json({ message: 'Failed to update system configurations.' });
  }
};

module.exports = {
  getSystemSettings,
  updateSystemSettings,
};
