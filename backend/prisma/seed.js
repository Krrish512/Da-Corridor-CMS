const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with default mock data...');

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
  await prisma.user.deleteMany({});

  // 1. Create Admin User
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('admin123', salt);
  
  const adminUser = await prisma.user.create({
    data: {
      name: 'Studio Admin',
      email: 'admin@archstudio.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });
  console.log(`Created default user: ${adminUser.email}`);

  // 2. Hero Section
  await prisma.heroSection.create({
    data: {
      heading: 'Architecture of Light and Silence',
      subHeading: 'Designing premium minimal spaces that merge aesthetic perfection, structural integrity, and eco-friendliness.',
      backgroundImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2000',
      ctaText: 'Explore Projects',
      ctaLink: '/portfolio',
    },
  });

  // 3. About Section
  await prisma.aboutSection.create({
    data: {
      name: 'ArchStudio Practice',
      profession: 'High-End Minimalist Architecture',
      about: 'A multi-disciplinary architecture and spatial planning firm based in New York. We craft timeless spaces globally.',
      biography: 'Founded in 2012 by principal architect Elena Vance, ArchStudio has grown into a highly recognized brand. We believe in removing the unnecessary to celebrate the essential, creating residences and corporate structures that feel deeply connected to their environment.',
      experience: 14,
      skills: 'Sustainable Systems, Spatial Optimization, Custom Prefab Structures, Urban Masterplanning',
      vision: 'Harmonizing structural geometries with natural elements to enrich the human experience.',
      mission: 'Providing clients with comprehensive design execution, from concept renderings to site engineering, maintaining highest material standards.',
      profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600',
    },
  });

  // 4. Achievements (Counters)
  await prisma.achievement.create({
    data: {
      yearsExperience: 14,
      projectsCompleted: 142,
      happyClients: 96,
      awards: 23,
    },
  });

  // 5. Process Steps
  await prisma.processStep.createMany({
    data: [
      { stepNumber: 1, title: 'Concept Exploration', description: 'Understanding the terrain, solar orientation, and the client vision through preliminary sketches.', icon: 'Compass' },
      { stepNumber: 2, title: 'Design & BIM Modeling', description: 'Generating high-resolution 3D models and structural specifications using BIM software.', icon: 'Layers' },
      { stepNumber: 3, title: 'Execution & Engineering', description: 'Collaborating with engineers and contractors to oversee execution on-site.', icon: 'CheckSquare' },
    ],
  });

  // 6. Why Choose Us
  await prisma.whyChooseUs.createMany({
    data: [
      { title: 'Ecological Integrity', description: 'All materials and construction techniques are certified for carbon footprints and energy savings.', icon: 'Leaf' },
      { title: 'Timeless Minimalism', description: 'Our design system creates clean spaces that resist changing trends, appreciating in value.', icon: 'Hexagon' },
      { title: 'Complete Project Control', description: 'We manage everything from feasibility studies to interior styling, ensuring uniform execution.', icon: 'Shield' },
    ],
  });

  // 7. Services
  await prisma.service.createMany({
    data: [
      { title: 'Residential Architecture', icon: 'Home', shortDescription: 'Tailored residential spaces.', fullDescription: 'Designing luxury private villas and high-end residential apartments focused on privacy, natural lighting, and refined materiality.', displayOrder: 1 },
      { title: 'Commercial Headspaces', icon: 'Briefcase', shortDescription: 'Iconic workplace designs.', fullDescription: 'Crafting responsive offices, research facilities, and hospitality buildings that foster collaboration and leave lasting impressions.', displayOrder: 2 },
      { title: 'Interior Architecture', icon: 'Maximize', shortDescription: 'Cohesive spatial details.', fullDescription: 'Integrating structural bones with bespoke lighting, custom storage, and high-performance custom surfaces.', displayOrder: 3 },
    ],
  });

  // 8. Projects (Portfolio)
  // NOTE: Demo project seed data has been intentionally removed.
  // Portfolio projects must be created exclusively through the Admin CMS to prevent
  // demo/placeholder data from appearing on the public-facing Portfolio page.
  console.log('Skipping demo project seeding -- projects are managed via the Admin CMS.');

  // 9. Gallery Items (Media library)
  await prisma.galleryItem.createMany({
    data: [
      { type: 'IMAGE', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800', category: 'Residential', folder: 'Houses' },
      { type: 'IMAGE', url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800', category: 'Commercial', folder: 'Offices' },
      { type: 'IMAGE', url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=800', category: 'Residential', folder: 'Houses' },
    ],
  });

  // 10. Testimonials
  await prisma.testimonial.createMany({
    data: [
      { clientName: 'Julian Vance', company: 'Hudson Valley Living', designation: 'Developer', review: 'Elena and her team brought our ideas to life with extreme precision. The minimalist design feels alive yet peaceful. The space is functional and absolutely stunning.', rating: 5 },
      { clientName: 'Sarah Jenkins', company: 'Aura Corporate', designation: 'COO', review: 'An architect team that values carbon footprints as much as visual excellence. Our Net-Zero targets were met ahead of schedule without sacrificing aesthetics.', rating: 5 },
    ],
  });

  // 11. Team Members
  await prisma.teamMember.createMany({
    data: [
      { name: 'Elena Vance', position: 'Principal Architect & Founder', bio: 'Over 18 years of design expertise specializing in concrete geometric forms and local environmental integration.', linkedin: 'https://linkedin.com' },
      { name: 'Marcus Sterling', position: 'Senior Associate / BIM Lead', bio: 'BIM workflow expert focused on structural alignment, steel fabrications, and building tech integrations.', linkedin: 'https://linkedin.com' },
    ],
  });

  // 12. Partners
  await prisma.partner.createMany({
    data: [
      { companyName: 'Delta Engineering', logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=300' },
      { companyName: 'Summit Steel Works', logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=300' },
    ],
  });

  // 13. Blog Posts
  await prisma.blogPost.createMany({
    data: [
      {
        title: 'The Future of Carbon-Neutral Concrete',
        slug: 'the-future-of-carbon-neutral-concrete',
        category: 'Innovation',
        tags: 'concrete, sustainability, building materials',
        featuredImage: 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?q=80&w=800',
        richText: '<p>Concrete has long been the target of climate critics. However, structural developments are introducing carbon-capturing concrete models that cure with CO2 injections, saving substantial carbon levels...</p>',
        seoTitle: 'Carbon Neutral Concrete Research | Sustainable Construction',
        seoDescription: 'An analysis on low carbon and carbon curing concrete alternatives shaping the architecture landscape.',
      },
      {
        title: 'Designing with Daylight: Solar Orientation Strategy',
        slug: 'designing-with-daylight-solar-orientation-strategy',
        category: 'Design Systems',
        tags: 'lighting, architecture, solar tracking',
        featuredImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800',
        richText: '<p>Spatial layouts should be defined by the sun’s trajectory. By placing windows and glazing structures along calculated solar vectors, builders can limit electric utility loads while creating beautiful volumetric light plays...</p>',
        seoTitle: 'Solar Orientation & Daylight Design Principles',
        seoDescription: 'Learn how to utilize solar analysis to define window positions and structural geometry for better energy savings.',
      },
    ],
  });

  // 14. FAQs
  await prisma.fAQ.createMany({
    data: [
      { question: 'What is your typical project timeline?', answer: 'Residential villas take 4-6 months for spatial design, rendering, and structural engineering approvals, and 12-18 months for actual site constructions.', displayOrder: 1 },
      { question: 'Do you design projects outside the United States?', answer: 'Yes. We offer virtual BIM modeling and architectural blueprint handoffs globally, partnering with local engineering firms for physical site oversight.', displayOrder: 2 },
    ],
  });

  // 15. Contact Details
  await prisma.contactDetails.create({
    data: {
      officeAddress: '128 Design District, Suite 500, New York, NY 10013',
      email: 'info@archstudio.com',
      phone: '+1 (212) 555-0199',
      whatsApp: '+1 (212) 555-0180',
      googleMapsUrl: 'https://maps.google.com',
      workingHours: 'Mon - Fri: 9:00 AM - 6:00 PM EST',
      socialFacebook: 'https://facebook.com',
      socialLinkedin: 'https://linkedin.com',
      socialInsta: 'https://instagram.com',
    },
  });

  // 16. Contact Messages
  await prisma.contactMessage.createMany({
    data: [
      { name: 'Arthur Pendelton', email: 'arthur.p@gmail.com', phone: '+1-555-403-1288', subject: 'Custom Cabin Feasibility', message: 'Hello, I have a 2-acre plot in Catskill and would love to build a 2-bedroom minimal steel cabin. Do you do smaller residential designs?', status: 'UNREAD' },
      { name: 'Diana Ross', email: 'diana@rosscorp.com', phone: '+1-555-888-9999', subject: 'Office Design Consultation', message: 'We are seeking proposals for our new creative workspace in Brooklyn. The office is 12,000 sq ft. Please let us know your availability next week.', status: 'READ' },
    ],
  });

  // 17. Newsletter Subscribers
  await prisma.newsletterSubscriber.createMany({
    data: [
      { email: 'arch.enthusiast@hotmail.com' },
      { email: 'developer.brian@buildcorp.com' },
    ],
  });

  // 18. SEO Settings
  await prisma.sEOSettings.create({
    data: {
      homepageTitle: 'ArchStudio | Premium Minimalist Architecture & Planning',
      metaDescription: 'ArchStudio designs sustainable, aesthetic, and structural masterpieces for residential and commercial projects globally.',
      keywords: 'minimalist architecture, concrete design, luxury homes, urban planning, BIM modeler',
      ogImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200',
      googleAnalyticsId: 'G-12345678-9',
      searchConsoleVerification: 'google-verification-token-123',
      robotsText: 'User-agent: *\nAllow: /\nSitemap: https://archstudio.com/sitemap.xml',
      sitemapXml: '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>https://archstudio.com/</loc></url>\n  <url><loc>https://archstudio.com/portfolio</loc></url>\n</urlset>',
    },
  });

  // 19. System Settings
  await prisma.systemSettings.create({
    data: {
      websiteLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=100',
      favicon: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=32',
      themeColors: 'default',
      footerText: '© 2026 ArchStudio. Built with architectural detail.',
      maintenanceMode: false,
      timezone: 'America/New_York',
      language: 'en',
    },
  });

  // 20. Activity Logs
  await prisma.activityLog.createMany({
    data: [
      { action: 'SYSTEM_INSTALL', details: 'Database schema generated and default administrator registered.', userEmail: 'system@archstudio.com' },
      { action: 'SEED_DATA', details: 'Populated mock portfolio projects, services, blog posts, and FAQs.', userEmail: 'system@archstudio.com' },
    ],
  });

  console.log('Database successfully seeded with beautiful mock data!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
