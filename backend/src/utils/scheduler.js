const prisma = require('./db');
const { logActivity } = require('./activityLogger');

let isSchedulerRunning = false;

/**
 * Background task to process scheduled publishing and unpublishing of CMS content.
 * Runs periodically (e.g. every 60 seconds).
 */
const checkScheduledContent = async () => {
  // Prevent duplicate/overlapping scheduler executions
  if (isSchedulerRunning) {
    return;
  }

  isSchedulerRunning = true;
  const now = new Date();

  try {
    // Parallel fetch for all scheduled content across models
    const [
      scheduledBlogs,
      expiredBlogs,
      scheduledProjects,
      expiredProjects,
      scheduledServices,
      scheduledTestimonials
    ] = await Promise.all([
      prisma.blogPost.findMany({
        where: {
          deletedAt: null,
          publishingStatus: { in: ['DRAFT', 'PENDING_APPROVAL'] },
          scheduledPublishAt: { lte: now },
        },
      }),
      prisma.blogPost.findMany({
        where: {
          deletedAt: null,
          publishingStatus: 'PUBLISHED',
          scheduledUnpublishAt: { lte: now },
        },
      }),
      prisma.project.findMany({
        where: {
          deletedAt: null,
          publishingStatus: { in: ['DRAFT', 'PENDING_APPROVAL'] },
          scheduledPublishAt: { lte: now },
        },
      }),
      prisma.project.findMany({
        where: {
          deletedAt: null,
          publishingStatus: 'PUBLISHED',
          scheduledUnpublishAt: { lte: now },
        },
      }),
      prisma.service.findMany({
        where: {
          deletedAt: null,
          publishingStatus: { in: ['DRAFT', 'PENDING_APPROVAL'] },
          scheduledPublishAt: { lte: now },
        },
      }),
      prisma.testimonial.findMany({
        where: {
          deletedAt: null,
          publishingStatus: { in: ['DRAFT', 'PENDING_APPROVAL'] },
          scheduledPublishAt: { lte: now },
        },
      }),
    ]);

    // 1. Process Scheduled Publishing for Blog Posts
    for (const blog of scheduledBlogs) {
      await prisma.blogPost.update({
        where: { id: blog.id },
        data: {
          publishingStatus: 'PUBLISHED',
          publishDate: blog.scheduledPublishAt || now,
        },
      });

      await logActivity(null, {
        action: 'SCHEDULED_PUBLISH_EXECUTED',
        details: `Scheduled publishing executed for Blog Post: "${blog.title}"`,
        userEmail: 'system@dacorridor.com',
      });
    }

    // 2. Process Scheduled Unpublishing for Blog Posts
    for (const blog of expiredBlogs) {
      await prisma.blogPost.update({
        where: { id: blog.id },
        data: { publishingStatus: 'ARCHIVED' },
      });

      await logActivity(null, {
        action: 'SCHEDULED_UNPUBLISH_EXECUTED',
        details: `Scheduled unpublishing executed for Blog Post: "${blog.title}"`,
        userEmail: 'system@dacorridor.com',
      });
    }

    // 3. Process Scheduled Publishing for Portfolio Projects
    for (const project of scheduledProjects) {
      await prisma.project.update({
        where: { id: project.id },
        data: { publishingStatus: 'PUBLISHED' },
      });

      await logActivity(null, {
        action: 'SCHEDULED_PUBLISH_EXECUTED',
        details: `Scheduled publishing executed for Project: "${project.title}"`,
        userEmail: 'system@dacorridor.com',
      });
    }

    // 4. Process Scheduled Unpublishing for Portfolio Projects
    for (const project of expiredProjects) {
      await prisma.project.update({
        where: { id: project.id },
        data: { publishingStatus: 'ARCHIVED' },
      });

      await logActivity(null, {
        action: 'SCHEDULED_UNPUBLISH_EXECUTED',
        details: `Scheduled unpublishing executed for Project: "${project.title}"`,
        userEmail: 'system@dacorridor.com',
      });
    }

    // 5. Process Scheduled Publishing for Services
    for (const service of scheduledServices) {
      await prisma.service.update({
        where: { id: service.id },
        data: { publishingStatus: 'PUBLISHED' },
      });

      await logActivity(null, {
        action: 'SCHEDULED_PUBLISH_EXECUTED',
        details: `Scheduled publishing executed for Service: "${service.title}"`,
        userEmail: 'system@dacorridor.com',
      });
    }

    // 6. Process Scheduled Publishing for Testimonials
    for (const item of scheduledTestimonials) {
      await prisma.testimonial.update({
        where: { id: item.id },
        data: { publishingStatus: 'PUBLISHED' },
      });

      await logActivity(null, {
        action: 'SCHEDULED_PUBLISH_EXECUTED',
        details: `Scheduled publishing executed for Testimonial from "${item.clientName}"`,
        userEmail: 'system@dacorridor.com',
      });
    }

  } catch (error) {
    console.error('[SCHEDULER ERROR]:', error.message);
  } finally {
    isSchedulerRunning = false;
  }
};

/**
 * Initializes the background scheduler.
 */
const initScheduler = (intervalMs = 60000) => {
  console.log('[SCHEDULER] Content Lifecycle Scheduler initialized (running every 60s).');
  // Initial check on boot (non-blocking)
  setImmediate(() => {
    checkScheduledContent().catch((err) => console.error('[SCHEDULER BOOT ERROR]:', err.message));
  });
  // Periodic check
  setInterval(checkScheduledContent, intervalMs);
};

module.exports = {
  checkScheduledContent,
  initScheduler,
};
