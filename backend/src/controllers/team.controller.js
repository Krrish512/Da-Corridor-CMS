const prisma = require('../utils/db');

const getTeamMembers = async (req, res) => {
  try {
    const team = await prisma.teamMember.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'asc' }
    });
    res.json(team);
  } catch (error) {
    console.error('[GET TEAM ERROR]:', error);
    res.status(500).json({ message: 'Failed to fetch team members' });
  }
};

const createTeamMember = async (req, res) => {
  const { name, position, photo, bio, facebook, twitter, linkedin, instagram } = req.body;

  if (!name || !name.trim() || !position || !position.trim() || !bio || !bio.trim()) {
    return res.status(400).json({ message: 'Name, Position, and Bio are required fields.' });
  }

  try {
    const member = await prisma.teamMember.create({
      data: {
        name: name.trim(),
        position: position.trim(),
        photo: photo ? photo.trim() : null,
        bio: bio.trim(),
        facebook: facebook ? facebook.trim() : null,
        twitter: twitter ? twitter.trim() : null,
        linkedin: linkedin ? linkedin.trim() : null,
        instagram: instagram ? instagram.trim() : null,
      }
    });

    await prisma.activityLog.create({
      data: {
        action: 'CREATE_TEAM',
        details: `Added team member: ${name} (${position})`,
        userEmail: req.user?.email || 'admin@dacorridor.com'
      }
    });

    res.status(201).json(member);
  } catch (error) {
    console.error('[CREATE TEAM ERROR]:', error);
    res.status(500).json({ message: 'Failed to add team member' });
  }
};

const updateTeamMember = async (req, res) => {
  const { id } = req.params;
  const { name, position, photo, bio, facebook, twitter, linkedin, instagram } = req.body;

  if (!name || !name.trim() || !position || !position.trim() || !bio || !bio.trim()) {
    return res.status(400).json({ message: 'Name, Position, and Bio are required fields.' });
  }

  try {
    const existing = await prisma.teamMember.findFirst({
      where: { id, deletedAt: null }
    });

    if (!existing) {
      return res.status(404).json({ message: 'Team member not found.' });
    }

    const member = await prisma.teamMember.update({
      where: { id },
      data: {
        name: name.trim(),
        position: position.trim(),
        photo: photo ? photo.trim() : null,
        bio: bio.trim(),
        facebook: facebook ? facebook.trim() : null,
        twitter: twitter ? twitter.trim() : null,
        linkedin: linkedin ? linkedin.trim() : null,
        instagram: instagram ? instagram.trim() : null,
      }
    });

    await prisma.activityLog.create({
      data: {
        action: 'UPDATE_TEAM',
        details: `Updated team member: ${name}`,
        userEmail: req.user?.email || 'admin@dacorridor.com'
      }
    });

    res.json(member);
  } catch (error) {
    console.error('[UPDATE TEAM ERROR]:', error);
    res.status(500).json({ message: 'Failed to update team member' });
  }
};

const deleteTeamMember = async (req, res) => {
  const { id } = req.params;
  try {
    const existing = await prisma.teamMember.findFirst({
      where: { id, deletedAt: null }
    });

    if (!existing) {
      return res.status(404).json({ message: 'Team member not found.' });
    }

    const member = await prisma.teamMember.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    await prisma.activityLog.create({
      data: {
        action: 'DELETE_TEAM',
        details: `Soft-deleted team member: ${member.name}`,
        userEmail: req.user?.email || 'admin@dacorridor.com'
      }
    });

    res.json({ message: 'Team member soft-deleted successfully' });
  } catch (error) {
    console.error('[DELETE TEAM ERROR]:', error);
    res.status(500).json({ message: 'Failed to delete team member' });
  }
};

module.exports = {
  getTeamMembers,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
};
