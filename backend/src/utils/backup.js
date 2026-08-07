const fs = require('fs');
const path = require('path');
const prisma = require('./db');
const { logActivity } = require('./activityLogger');

const backupDir = path.join(__dirname, '../../backups');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// 1. Create Backup Archive
const createBackup = async (req, type = 'FULL') => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFilename = `backup-${type.toLowerCase()}-${timestamp}.json`;
  const filePath = path.join(backupDir, backupFilename);

  // Dump database models to JSON snapshot
  const [
    users,
    heroSection,
    aboutSection,
    achievements,
    processSteps,
    whyChooseUs,
    services,
    projects,
    galleryItems,
    testimonials,
    teamMembers,
    partners,
    blogPosts,
    faqs,
    contactDetails,
    contactMessages,
    newsletter,
    seoSettings,
    systemSettings,
    activityLogs,
  ] = await Promise.all([
    prisma.user.findMany(),
    prisma.heroSection.findMany(),
    prisma.aboutSection.findMany(),
    prisma.achievement.findMany(),
    prisma.processStep.findMany(),
    prisma.whyChooseUs.findMany(),
    prisma.service.findMany(),
    prisma.project.findMany({ include: { images: true } }),
    prisma.galleryItem.findMany(),
    prisma.testimonial.findMany(),
    prisma.teamMember.findMany(),
    prisma.partner.findMany(),
    prisma.blogPost.findMany(),
    prisma.fAQ.findMany(),
    prisma.contactDetails.findMany(),
    prisma.contactMessage.findMany(),
    prisma.newsletterSubscriber.findMany(),
    prisma.sEOSettings.findMany(),
    prisma.systemSettings.findMany(),
    prisma.activityLog.findMany({ take: 500, orderBy: { createdAt: 'desc' } }),
  ]);

  const backupData = {
    metadata: {
      version: '1.0.0',
      type,
      createdAt: new Date().toISOString(),
      creator: req?.user?.email || 'system@dacorridor.com',
      modelCount: 21,
    },
    tables: {
      users: users.map(u => ({ ...u, password: '***MASKED_IN_BACKUP***' })),
      heroSection,
      aboutSection,
      achievements,
      processSteps,
      whyChooseUs,
      services,
      projects,
      galleryItems,
      testimonials,
      teamMembers,
      partners,
      blogPosts,
      faqs,
      contactDetails,
      contactMessages,
      newsletter,
      seoSettings,
      systemSettings,
      activityLogs,
    },
  };

  fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2), 'utf-8');
  const stats = fs.statSync(filePath);

  await logActivity(req, {
    action: 'BACKUP_CREATED',
    details: `Created system database backup (${type}): ${backupFilename} (${(stats.size / 1024).toFixed(2)} KB)`,
    userEmail: req?.user?.email || 'system@dacorridor.com',
  });

  return {
    filename: backupFilename,
    filePath,
    type,
    sizeBytes: stats.size,
    createdAt: new Date().toISOString(),
  };
};

// 2. List Backups
const listBackups = async () => {
  if (!fs.existsSync(backupDir)) return [];

  const files = fs.readdirSync(backupDir);
  const backups = files
    .filter((f) => f.endsWith('.json') || f.endsWith('.zip'))
    .map((filename) => {
      const filePath = path.join(backupDir, filename);
      const stats = fs.statSync(filePath);
      return {
        filename,
        sizeBytes: stats.size,
        sizeKB: (stats.size / 1024).toFixed(2),
        createdAt: stats.birthtime.toISOString(),
      };
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return backups;
};

// 3. Delete Backup
const deleteBackupFile = async (req, filename) => {
  const safeFilename = path.basename(filename);
  const filePath = path.join(backupDir, safeFilename);

  if (!fs.existsSync(filePath)) {
    throw new Error('Backup file not found');
  }

  fs.unlinkSync(filePath);

  await logActivity(req, {
    action: 'BACKUP_DELETED',
    details: `Deleted backup file: ${safeFilename}`,
    userEmail: req?.user?.email || 'system@dacorridor.com',
  });

  return { message: `Backup file ${safeFilename} deleted successfully` };
};

module.exports = {
  createBackup,
  listBackups,
  deleteBackupFile,
  backupDir,
};
