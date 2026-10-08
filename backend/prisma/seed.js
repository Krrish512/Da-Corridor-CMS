const prisma = require('../src/utils/db');

async function main() {
  console.log('Initializing database with clean foundational CMS configuration...');

  // Clear existing items in logical order (dependencies first)
  await prisma.activityLog.deleteMany({});
  await prisma.projectImage.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.service.deleteMany({});
  await prisma.testimonial.deleteMany({});
  await prisma.blogPost.deleteMany({});
  await prisma.teamMember.deleteMany({});
  await prisma.partner.deleteMany({});
  await prisma.fAQ.deleteMany({});
  await prisma.processStep.deleteMany({});
  await prisma.whyChooseUs.deleteMany({});
  await prisma.heroSection.deleteMany({});
  await prisma.aboutSection.deleteMany({});
  await prisma.achievement.deleteMany({});
  await prisma.contactDetails.deleteMany({});
  await prisma.contactMessage.deleteMany({});
  await prisma.newsletterSubscriber.deleteMany({});
  await prisma.sEOSettings.deleteMany({});
  await prisma.systemSettings.deleteMany({});
  await prisma.galleryItem.deleteMany({});

  // NOTE: Administrator accounts are managed exclusively via: node scripts/createAdmin.js
  console.log('Skipping user seeding -- admin accounts are configured securely via node scripts/createAdmin.js.');

  // 1. Hero Section (Foundational initial record)
  await prisma.heroSection.create({
    data: {
      heading: 'Architecture That Endures',
      subHeading: 'Designing premium minimal spaces that merge aesthetic perfection, structural integrity, and eco-friendliness.',
      backgroundImage: '',
      ctaText: 'View Our Work',
      ctaLink: '/portfolio',
    },
  });

  // 2. About Section
  await prisma.aboutSection.create({
    data: {
      name: "Da' Corridor",
      profession: 'Architecture & Spatial Design Practice',
      about: 'A multi-disciplinary architecture and spatial planning practice crafting timeless spaces globally.',
      biography: 'Dedicated to architectural clarity, structural integrity, and sustainable spatial design, Da\' Corridor creates residences and landmarks deeply connected to their environment.',
      experience: 10,
      skills: 'Sustainable Systems, Spatial Optimization, Custom Structures, Architectural Masterplanning',
      vision: 'Harmonizing structural geometries with natural elements to enrich the human experience.',
      mission: 'Providing clients with comprehensive design execution, maintaining highest material and engineering standards.',
      profileImage: '',
    },
  });

  // 3. Achievements (Foundational Stats)
  await prisma.achievement.create({
    data: {
      yearsExperience: 10,
      projectsCompleted: 0,
      happyClients: 0,
      awards: 0,
    },
  });

  // 4. Process Steps (Standard methodology)
  await prisma.processStep.createMany({
    data: [
      { stepNumber: 1, title: 'Concept Exploration', description: 'Understanding the terrain, solar orientation, and the client vision through preliminary sketches.', icon: 'Compass' },
      { stepNumber: 2, title: 'Design & BIM Modeling', description: 'Generating high-resolution 3D models and structural specifications using BIM software.', icon: 'Layers' },
      { stepNumber: 3, title: 'Execution & Engineering', description: 'Collaborating with engineers and contractors to oversee execution on-site.', icon: 'CheckSquare' },
    ],
  });

  // 5. Why Choose Us (Core Principles)
  await prisma.whyChooseUs.createMany({
    data: [
      { title: 'Ecological Integrity', description: 'All materials and construction techniques are certified for carbon footprints and energy savings.', icon: 'Leaf' },
      { title: 'Timeless Minimalism', description: 'Our design system creates clean spaces that resist changing trends, appreciating in value.', icon: 'Hexagon' },
      { title: 'Complete Project Control', description: 'We manage everything from feasibility studies to interior styling, ensuring uniform execution.', icon: 'Shield' },
    ],
  });

  // 6. Contact Details (Clean placeholder record for CMS)
  await prisma.contactDetails.create({
    data: {
      officeAddress: '740 Fifth Avenue, Suite 1800, New York, NY 10019',
      email: 'contact@dacorridor.com',
      phone: '+1 (212) 555-0199',
      whatsApp: '',
      googleMapsUrl: '',
      workingHours: 'Monday - Friday: 9:00 AM - 6:00 PM EST',
      socialFacebook: '',
      socialTwitter: '',
      socialLinkedin: '',
      socialInsta: '',
    },
  });

  // 7. SEO Settings
  await prisma.sEOSettings.create({
    data: {
      homepageTitle: "Da' Corridor | Architecture & Spatial Design",
      metaDescription: "Da' Corridor is a premier minimalist architecture and spatial design practice crafting luxury residential, commercial, and interior spaces globally.",
      keywords: 'architecture firm, spatial design, minimalist architecture, luxury interior design, sustainable building',
      ogImage: '',
      googleAnalyticsId: '',
      searchConsoleVerification: '',
    },
  });

  // 8. System Settings
  await prisma.systemSettings.create({
    data: {
      websiteLogo: "/Da' Corridor.png",
      favicon: '/favicon.ico',
      themeColors: 'default',
      footerText: "© 2026 Da' Corridor. All rights reserved.",
      maintenanceMode: false,
      timezone: 'America/New_York',
      language: 'en',
    },
  });

  // 9. Activity Logs
  await prisma.activityLog.createMany({
    data: [
      { action: 'SYSTEM_INSTALL', details: 'Database initialized with clean production CMS structure.', userEmail: 'system@dacorridor.com' },
    ],
  });

  console.log('Database initialization completed successfully without demo/placeholder records.');
}

main()
  .catch((e) => {
    console.error('Error during database initialization:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
