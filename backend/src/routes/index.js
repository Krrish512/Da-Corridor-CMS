const express = require('express');
const router = express.Router();

// Import sub-routers
const authRoutes = require('./auth.routes');
const dashboardRoutes = require('./dashboard.routes');
const websiteRoutes = require('./website.routes');
const serviceRoutes = require('./service.routes');
const portfolioRoutes = require('./portfolio.routes');
const galleryRoutes = require('./gallery.routes');
const testimonialRoutes = require('./testimonial.routes');
const teamRoutes = require('./team.routes');
const partnerRoutes = require('./partner.routes');
const blogRoutes = require('./blog.routes');
const faqRoutes = require('./faq.routes');
const contactRoutes = require('./contact.routes');
const newsletterRoutes = require('./newsletter.routes');
const seoRoutes = require('./seo.routes');
const settingsRoutes = require('./settings.routes');

// Bind routers to API routes
router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/website', websiteRoutes);
router.use('/services', serviceRoutes);
router.use('/portfolio', portfolioRoutes);
router.use('/gallery', galleryRoutes);
router.use('/testimonials', testimonialRoutes);
router.use('/team', teamRoutes);
router.use('/partners', partnerRoutes);
router.use('/blog', blogRoutes);
router.use('/faqs', faqRoutes);
router.use('/contact', contactRoutes);
router.use('/newsletter', newsletterRoutes);
router.use('/seo', seoRoutes);
router.use('/settings', settingsRoutes);

module.exports = router;
