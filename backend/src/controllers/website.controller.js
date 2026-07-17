const prisma = require('../utils/db');

// ==========================================
// HERO SECTION CONTROLLERS
// ==========================================

const getHero = async (req, res) => {
  try {
    let hero = await prisma.heroSection.findFirst({
      where: { deletedAt: null }
    });

    if (!hero) {
      // Return defaults if none exists
      hero = await prisma.heroSection.create({
        data: {
          heading: "Crafting Architectural Masterpieces",
          subHeading: "We merge functionality, aesthetics, and sustainability to design iconic spaces.",
          ctaText: "View Our Work",
          ctaLink: "/portfolio"
        }
      });
    }

    res.json(hero);
  } catch (error) {
    console.error('[GET HERO ERROR]:', error);
    res.status(500).json({ message: 'Failed to retrieve Hero Section' });
  }
};

const updateHero = async (req, res) => {
  const { heading, subHeading, backgroundImage, backgroundVideo, ctaText, ctaLink } = req.body;

  try {
    const existingHero = await prisma.heroSection.findFirst({
      where: { deletedAt: null }
    });

    // Validate backgroundImage URL
    if (backgroundImage) {
    }
    let hero;
    if (existingHero) {
      hero = await prisma.heroSection.update({
        where: { id: existingHero.id },
        data: { heading, subHeading, backgroundImage, backgroundVideo, ctaText, ctaLink }
      });
    } else {
      hero = await prisma.heroSection.create({
        data: { heading, subHeading, backgroundImage, backgroundVideo, ctaText, ctaLink }
      });
    }

    // Log Activity
    await prisma.activityLog.create({
      data: {
        action: 'UPDATE_HERO',
        details: 'Updated website Hero Section content',
        userEmail: req.user?.email || 'admin@archstudio.com'
      }
    });

    res.json(hero);
  } catch (error) {
    console.error('[UPDATE HERO ERROR]:', error);
    res.status(500).json({ message: 'Failed to update Hero Section' });
  }
};


// ==========================================
// ABOUT SECTION CONTROLLERS
// ==========================================

const getAbout = async (req, res) => {
  try {
    let about = await prisma.aboutSection.findFirst({
      where: { deletedAt: null }
    });

    if (!about) {
      about = await prisma.aboutSection.create({
        data: {
          name: "ArchStudio",
          profession: "Principal Architecture Practice",
          about: "A visionary design studio focused on building tomorrow's environments.",
          biography: "Founded in 2012, our work spans across public institutions, residential design, and landscape development.",
          experience: 14,
          skills: "Sustainable Design, BIM Modeling, Interior Design, Project Supervision",
          vision: "Innovating space designs to harmonize human existence with nature.",
          mission: "Providing top-tier, environmental-friendly, functional design services worldwide."
        }
      });
    }

    res.json(about);
  } catch (error) {
    console.error('[GET ABOUT ERROR]:', error);
    res.status(500).json({ message: 'Failed to retrieve About Section' });
  }
};

const updateAbout = async (req, res) => {
  const { name, profession, about, biography, experience, skills, vision, mission, resumeUrl, profileImage } = req.body;

  try {
    const existingAbout = await prisma.aboutSection.findFirst({
      where: { deletedAt: null }
    });

    // Validate profileImage URL
    if (profileImage) {
    }
    let updatedAbout;
    if (existingAbout) {
      updatedAbout = await prisma.aboutSection.update({
        where: { id: existingAbout.id },
        data: {
          name, profession, about, biography,
          experience: parseInt(experience || '0', 10),
          skills, vision, mission, resumeUrl, profileImage
        }
      });
    } else {
      updatedAbout = await prisma.aboutSection.create({
        data: {
          name, profession, about, biography,
          experience: parseInt(experience || '0', 10),
          skills, vision, mission, resumeUrl, profileImage
        }
      });
    }

    await prisma.activityLog.create({
      data: {
        action: 'UPDATE_ABOUT',
        details: 'Updated About page contents and bio',
        userEmail: req.user?.email || 'admin@archstudio.com'
      }
    });

    res.json(updatedAbout);
  } catch (error) {
    console.error('[UPDATE ABOUT ERROR]:', error);
    res.status(500).json({ message: 'Failed to update About Section' });
  }
};


// ==========================================
// ACHIEVEMENTS CONTROLLERS
// ==========================================

const getAchievements = async (req, res) => {
  try {
    let achievement = await prisma.achievement.findFirst({
      where: { deletedAt: null }
    });

    if (!achievement) {
      achievement = await prisma.achievement.create({
        data: {
          yearsExperience: 14,
          projectsCompleted: 120,
          happyClients: 85,
          awards: 18
        }
      });
    }

    res.json(achievement);
  } catch (error) {
    console.error('[GET ACHIEVEMENTS ERROR]:', error);
    res.status(500).json({ message: 'Failed to retrieve achievements count' });
  }
};

const updateAchievements = async (req, res) => {
  const { yearsExperience, projectsCompleted, happyClients, awards } = req.body;

  try {
    const existingAchievement = await prisma.achievement.findFirst({
      where: { deletedAt: null }
    });

    let updated;
    const data = {
      yearsExperience: parseInt(yearsExperience || '0', 10),
      projectsCompleted: parseInt(projectsCompleted || '0', 10),
      happyClients: parseInt(happyClients || '0', 10),
      awards: parseInt(awards || '0', 10),
    };

    if (existingAchievement) {
      updated = await prisma.achievement.update({
        where: { id: existingAchievement.id },
        data
      });
    } else {
      updated = await prisma.achievement.create({ data });
    }

    await prisma.activityLog.create({
      data: {
        action: 'UPDATE_ACHIEVEMENTS',
        details: 'Updated dashboard and homepage key counters',
        userEmail: req.user?.email || 'admin@archstudio.com'
      }
    });

    res.json(updated);
  } catch (error) {
    console.error('[UPDATE ACHIEVEMENTS ERROR]:', error);
    res.status(500).json({ message: 'Failed to update achievements counters' });
  }
};


// ==========================================
// PROCESS STEP CONTROLLERS (CRUD)
// ==========================================

const getProcessSteps = async (req, res) => {
  try {
    const steps = await prisma.processStep.findMany({
      where: { deletedAt: null },
      orderBy: { stepNumber: 'asc' }
    });
    res.json(steps);
  } catch (error) {
    console.error('[GET PROCESS ERROR]:', error);
    res.status(500).json({ message: 'Failed to fetch process steps' });
  }
};

const createProcessStep = async (req, res) => {
  const { stepNumber, title, description, icon } = req.body;
  try {
    const step = await prisma.processStep.create({
      data: {
        stepNumber: parseInt(stepNumber || '1', 10),
        title,
        description,
        icon
      }
    });

    await prisma.activityLog.create({
      data: {
        action: 'CREATE_PROCESS',
        details: `Created process step #${stepNumber}: ${title}`,
        userEmail: req.user?.email || 'admin@archstudio.com'
      }
    });

    res.status(201).json(step);
  } catch (error) {
    console.error('[CREATE PROCESS ERROR]:', error);
    res.status(500).json({ message: 'Failed to create process step' });
  }
};

const updateProcessStep = async (req, res) => {
  const { id } = req.params;
  const { stepNumber, title, description, icon } = req.body;
  try {
    const step = await prisma.processStep.update({
      where: { id },
      data: {
        stepNumber: parseInt(stepNumber || '1', 10),
        title,
        description,
        icon
      }
    });

    await prisma.activityLog.create({
      data: {
        action: 'UPDATE_PROCESS',
        details: `Updated process step #${stepNumber}: ${title}`,
        userEmail: req.user?.email || 'admin@archstudio.com'
      }
    });

    res.json(step);
  } catch (error) {
    console.error('[UPDATE PROCESS ERROR]:', error);
    res.status(500).json({ message: 'Failed to update process step' });
  }
};

const deleteProcessStep = async (req, res) => {
  const { id } = req.params;
  try {
    // SOFT DELETE: Set deletedAt
    const step = await prisma.processStep.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    await prisma.activityLog.create({
      data: {
        action: 'DELETE_PROCESS',
        details: `Soft-deleted process step #${step.stepNumber}: ${step.title}`,
        userEmail: req.user?.email || 'admin@archstudio.com'
      }
    });

    res.json({ message: 'Process step soft-deleted successfully' });
  } catch (error) {
    console.error('[DELETE PROCESS ERROR]:', error);
    res.status(500).json({ message: 'Failed to delete process step' });
  }
};


// ==========================================
// WHY CHOOSE US CONTROLLERS (CRUD)
// ==========================================

const getWhyChooseUs = async (req, res) => {
  try {
    const choices = await prisma.whyChooseUs.findMany({
      where: { deletedAt: null }
    });
    res.json(choices);
  } catch (error) {
    console.error('[GET WHY CHOOSE US ERROR]:', error);
    res.status(500).json({ message: 'Failed to fetch Choose Us features' });
  }
};

const createWhyChooseUs = async (req, res) => {
  const { icon, title, description } = req.body;
  try {
    const choice = await prisma.whyChooseUs.create({
      data: { icon, title, description }
    });

    await prisma.activityLog.create({
      data: {
        action: 'CREATE_WHYCHOOSEUS',
        details: `Created Why Choose Us item: ${title}`,
        userEmail: req.user?.email || 'admin@archstudio.com'
      }
    });

    res.status(201).json(choice);
  } catch (error) {
    console.error('[CREATE WHY CHOOSE US ERROR]:', error);
    res.status(500).json({ message: 'Failed to create item' });
  }
};

const updateWhyChooseUs = async (req, res) => {
  const { id } = req.params;
  const { icon, title, description } = req.body;
  try {
    const choice = await prisma.whyChooseUs.update({
      where: { id },
      data: { icon, title, description }
    });

    await prisma.activityLog.create({
      data: {
        action: 'UPDATE_WHYCHOOSEUS',
        details: `Updated Why Choose Us item: ${title}`,
        userEmail: req.user?.email || 'admin@archstudio.com'
      }
    });

    res.json(choice);
  } catch (error) {
    console.error('[UPDATE WHY CHOOSE US ERROR]:', error);
    res.status(500).json({ message: 'Failed to update item' });
  }
};

const deleteWhyChooseUs = async (req, res) => {
  const { id } = req.params;
  try {
    // SOFT DELETE: Set deletedAt
    const choice = await prisma.whyChooseUs.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    await prisma.activityLog.create({
      data: {
        action: 'DELETE_WHYCHOOSEUS',
        details: `Soft-deleted Why Choose Us item: ${choice.title}`,
        userEmail: req.user?.email || 'admin@archstudio.com'
      }
    });

    res.json({ message: 'Item soft-deleted successfully' });
  } catch (error) {
    console.error('[DELETE WHY CHOOSE US ERROR]:', error);
    res.status(500).json({ message: 'Failed to delete item' });
  }
};

module.exports = {
  getHero, updateHero,
  getAbout, updateAbout,
  getAchievements, updateAchievements,
  getProcessSteps, createProcessStep, updateProcessStep, deleteProcessStep,
  getWhyChooseUs, createWhyChooseUs, updateWhyChooseUs, deleteWhyChooseUs,
};
