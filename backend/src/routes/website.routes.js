const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  getHero, updateHero,
  getAbout, updateAbout,
  getAchievements, updateAchievements,
  getProcessSteps, createProcessStep, updateProcessStep, deleteProcessStep,
  getWhyChooseUs, createWhyChooseUs, updateWhyChooseUs, deleteWhyChooseUs,
} = require('../controllers/website.controller');

// Hero Section (Public GET, Protected PUT)
router.get('/hero', getHero);
router.put('/hero', protect, updateHero);

// About Section (Public GET, Protected PUT)
router.get('/about', getAbout);
router.put('/about', protect, updateAbout);

// Achievements (Public GET, Protected PUT)
router.get('/achievements', getAchievements);
router.put('/achievements', protect, updateAchievements);

// Process Steps (Public GET, Protected CRUD)
router.get('/process', getProcessSteps);
router.post('/process', protect, createProcessStep);
router.put('/process/:id', protect, updateProcessStep);
router.delete('/process/:id', protect, deleteProcessStep);

// Why Choose Us (Public GET, Protected CRUD)
router.get('/why-choose-us', getWhyChooseUs);
router.post('/why-choose-us', protect, createWhyChooseUs);
router.put('/why-choose-us/:id', protect, updateWhyChooseUs);
router.delete('/why-choose-us/:id', protect, deleteWhyChooseUs);

module.exports = router;
