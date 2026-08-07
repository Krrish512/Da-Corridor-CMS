const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const prisma = require('../utils/db');
const { logActivity } = require('../utils/activityLogger');
const { ROLES } = require('../rbac/roles');

// Helper to generate temporary random password
const generateTempPassword = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let pass = 'Arch@';
  for (let i = 0; i < 8; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
};

// Helper: Count active Super Admins
const countSuperAdmins = async () => {
  return await prisma.user.count({
    where: {
      role: ROLES.SUPER_ADMIN,
      isActive: true,
      deletedAt: null,
    }
  });
};

// Get Users (Paginated, Searchable, Filterable, Sortable)
const getUsers = async (req, res) => {
  try {
    const {
      search = '',
      role = '',
      status = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = req.query;

    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const skip = (parsedPage - 1) * parsedLimit;

    const where = {
      deletedAt: null,
      AND: [],
    };

    // Search query
    if (search.trim()) {
      where.AND.push({
        OR: [
          { name: { contains: search.trim(), mode: 'insensitive' } },
          { email: { contains: search.trim(), mode: 'insensitive' } },
        ],
      });
    }

    // Role filter
    if (role.trim()) {
      where.AND.push({ role: role.trim() });
    }

    // Status filter
    if (status === 'active') {
      where.AND.push({ isActive: true });
    } else if (status === 'inactive') {
      where.AND.push({ isActive: false });
    }

    // Allowed sorting fields
    const validSortFields = ['createdAt', 'name', 'email', 'role', 'lastLoginAt', 'isActive'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const order = sortOrder.toLowerCase() === 'asc' ? 'asc' : 'desc';

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parsedLimit,
        orderBy: { [sortField]: order },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatar: true,
          isActive: true,
          mustChangePassword: true,
          lastLoginAt: true,
          failedLoginAttempts: true,
          lastFailedLoginAt: true,
          deactivatedAt: true,
          createdById: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / parsedLimit);

    res.json({
      data: users,
      meta: {
        total: totalCount,
        page: parsedPage,
        limit: parsedLimit,
        totalPages,
      },
    });
  } catch (error) {
    console.error('[GET USERS ERROR]:', error);
    res.status(500).json({ message: 'Server error fetching users list' });
  }
};

// Create User
const createUser = async (req, res) => {
  const { name, email, role, password } = req.body;

  try {
    if (!name || !email || !role) {
      return res.status(400).json({ message: 'Name, email, and role are required' });
    }

    // Validate role is a known role
    if (!Object.values(ROLES).includes(role)) {
      return res.status(400).json({ message: `Invalid role specified: ${role}` });
    }

    // BACKEND AUTHORIZATION CHECK: Only SUPER_ADMIN can assign SUPER_ADMIN role
    if (role === ROLES.SUPER_ADMIN && req.user.role !== ROLES.SUPER_ADMIN) {
      return res.status(403).json({
        message: 'You do not have permission to assign the SUPER_ADMIN role.',
        code: 'ROLE_ASSIGNMENT_FORBIDDEN',
      });
    }

    // Check duplicate email
    const existing = await prisma.user.findFirst({
      where: { email: email.trim().toLowerCase(), deletedAt: null }
    });

    if (existing) {
      return res.status(400).json({ message: 'A user with this email address already exists' });
    }

    // Temporary password generation
    const tempPassword = password || generateTempPassword();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(tempPassword, salt);

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        role,
        isActive: true,
        mustChangePassword: true,
        createdById: req.user.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        isActive: true,
        mustChangePassword: true,
        createdAt: true,
      }
    });

    await logActivity(req, {
      action: 'USER_CREATED',
      details: `Created new user account: ${newUser.email} (${newUser.role})`,
      newValue: newUser,
    });

    res.status(201).json({
      user: newUser,
      tempPassword,
      message: 'User created successfully',
    });
  } catch (error) {
    console.error('[CREATE USER ERROR]:', error);
    res.status(500).json({ message: 'Server error creating user' });
  }
};

// Update User
const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, role } = req.body;

  try {
    const targetUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!targetUser || targetUser.deletedAt) {
      return res.status(404).json({ message: 'User not found' });
    }

    // BACKEND AUTHORIZATION CHECK 1: Only SUPER_ADMIN can modify a SUPER_ADMIN account
    if (targetUser.role === ROLES.SUPER_ADMIN && req.user.role !== ROLES.SUPER_ADMIN) {
      return res.status(403).json({
        message: 'Only a Super Admin can modify a Super Admin account.',
        code: 'TARGET_PROTECTED',
      });
    }

    // BACKEND AUTHORIZATION CHECK 2: Only SUPER_ADMIN can assign SUPER_ADMIN role
    if (role === ROLES.SUPER_ADMIN && req.user.role !== ROLES.SUPER_ADMIN) {
      return res.status(403).json({
        message: 'You do not have permission to assign the SUPER_ADMIN role.',
        code: 'ROLE_ASSIGNMENT_FORBIDDEN',
      });
    }

    // SUPER ADMIN SAFETY RULE 1: Self role change protection
    if (req.user.id === targetUser.id && role && role !== targetUser.role) {
      return res.status(400).json({ message: 'Super Admin cannot modify their own role' });
    }

    // SUPER ADMIN SAFETY RULE 2: Protect last remaining Super Admin demotion
    if (targetUser.role === ROLES.SUPER_ADMIN && role && role !== ROLES.SUPER_ADMIN) {
      const superAdminCount = await countSuperAdmins();
      if (superAdminCount <= 1) {
        return res.status(400).json({ message: 'Cannot demote the last remaining active Super Admin' });
      }
    }

    // Check email collision
    if (email && email.trim().toLowerCase() !== targetUser.email) {
      const existing = await prisma.user.findFirst({
        where: { email: email.trim().toLowerCase(), deletedAt: null }
      });
      if (existing) {
        return res.status(400).json({ message: 'Email address is already in use by another user' });
      }
    }

    const previousValue = { name: targetUser.name, email: targetUser.email, role: targetUser.role };
    const newValue = {
      name: name !== undefined ? name.trim() : targetUser.name,
      email: email !== undefined ? email.trim().toLowerCase() : targetUser.email,
      role: role !== undefined ? role : targetUser.role,
    };

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...newValue,
        updatedById: req.user.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        isActive: true,
        mustChangePassword: true,
        updatedAt: true,
      }
    });

    const isRoleChange = previousValue.role !== newValue.role;
    await logActivity(req, {
      action: isRoleChange ? 'USER_ROLE_CHANGED' : 'USER_UPDATED',
      details: isRoleChange
        ? `Role changed for ${updatedUser.email}: ${previousValue.role} → ${newValue.role}`
        : `Updated user profile details for ${updatedUser.email}`,
      previousValue,
      newValue,
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('[UPDATE USER ERROR]:', error);
    res.status(500).json({ message: 'Server error updating user' });
  }
};

// Toggle User Active/Inactive Status
const toggleUserStatus = async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  try {
    const targetUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!targetUser || targetUser.deletedAt) {
      return res.status(404).json({ message: 'User not found' });
    }

    // BACKEND AUTHORIZATION CHECK: Only SUPER_ADMIN can modify a SUPER_ADMIN account
    if (targetUser.role === ROLES.SUPER_ADMIN && req.user.role !== ROLES.SUPER_ADMIN) {
      return res.status(403).json({
        message: 'Only a Super Admin can modify a Super Admin account.',
        code: 'TARGET_PROTECTED',
      });
    }

    const nextActive = Boolean(isActive);

    // SUPER ADMIN SAFETY RULE 1: Self deactivation protection
    if (req.user.id === targetUser.id && !nextActive) {
      return res.status(400).json({ message: 'Super Admin cannot deactivate their own account' });
    }

    // SUPER ADMIN SAFETY RULE 2: Protect last remaining Super Admin deactivation
    if (targetUser.role === ROLES.SUPER_ADMIN && !nextActive) {
      const superAdminCount = await countSuperAdmins();
      if (superAdminCount <= 1) {
        return res.status(400).json({ message: 'Cannot deactivate the last remaining active Super Admin' });
      }
    }

    const previousValue = { isActive: targetUser.isActive, deactivatedAt: targetUser.deactivatedAt };
    const newValue = { isActive: nextActive, deactivatedAt: nextActive ? null : new Date() };

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        isActive: nextActive,
        deactivatedAt: nextActive ? null : new Date(),
        updatedById: req.user.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        deactivatedAt: true,
      }
    });

    await logActivity(req, {
      action: nextActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
      details: nextActive ? `Activated user account: ${targetUser.email}` : `Deactivated user account: ${targetUser.email}`,
      previousValue,
      newValue,
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('[TOGGLE STATUS ERROR]:', error);
    res.status(500).json({ message: 'Server error updating user status' });
  }
};

// Admin Reset User Password
const resetUserPassword = async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  try {
    const targetUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!targetUser || targetUser.deletedAt) {
      return res.status(404).json({ message: 'User not found' });
    }

    // BACKEND AUTHORIZATION CHECK: Only SUPER_ADMIN can modify a SUPER_ADMIN account
    if (targetUser.role === ROLES.SUPER_ADMIN && req.user.role !== ROLES.SUPER_ADMIN) {
      return res.status(403).json({
        message: 'Only a Super Admin can modify a Super Admin account.',
        code: 'TARGET_PROTECTED',
      });
    }

    // SAFETY RULE: Self-password reset prevention via User Management
    if (req.user.id === targetUser.id) {
      return res.status(400).json({ message: 'To change your own password, please use Profile Settings' });
    }

    const tempPassword = newPassword || generateTempPassword();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(tempPassword, salt);

    await prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
        mustChangePassword: true,
        updatedById: req.user.id,
      }
    });

    await logActivity(req, {
      action: 'ADMIN_RESET_PASSWORD',
      details: `Password reset by admin for user: ${targetUser.email}`,
      userEmail: req.user.email,
    });

    res.json({
      message: `Password reset successfully for ${targetUser.email}`,
      tempPassword,
    });
  } catch (error) {
    console.error('[RESET USER PASSWORD ERROR]:', error);
    res.status(500).json({ message: 'Server error resetting user password' });
  }
};

// Delete User (Soft delete)
const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const targetUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!targetUser || targetUser.deletedAt) {
      return res.status(404).json({ message: 'User not found' });
    }

    // BACKEND AUTHORIZATION CHECK: Only SUPER_ADMIN can delete a SUPER_ADMIN account
    if (targetUser.role === ROLES.SUPER_ADMIN && req.user.role !== ROLES.SUPER_ADMIN) {
      return res.status(403).json({
        message: 'Only a Super Admin can delete a Super Admin account.',
        code: 'TARGET_PROTECTED',
      });
    }

    // SUPER ADMIN SAFETY RULE 1: Self deletion protection
    if (req.user.id === targetUser.id) {
      return res.status(400).json({ message: 'Super Admin cannot delete their own account' });
    }

    // SUPER ADMIN SAFETY RULE 2: Protect last remaining Super Admin deletion
    if (targetUser.role === ROLES.SUPER_ADMIN) {
      const superAdminCount = await countSuperAdmins();
      if (superAdminCount <= 1) {
        return res.status(400).json({ message: 'Cannot delete the last remaining active Super Admin' });
      }
    }

    await prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
        updatedById: req.user.id,
      }
    });

    await logActivity(req, {
      action: 'USER_DELETED',
      details: `Soft-deleted user account: ${targetUser.email}`,
      previousValue: targetUser,
    });

    res.json({ message: `User ${targetUser.email} deleted successfully` });
  } catch (error) {
    console.error('[DELETE USER ERROR]:', error);
    res.status(500).json({ message: 'Server error deleting user' });
  }
};

module.exports = {
  getUsers,
  createUser,
  updateUser,
  toggleUserStatus,
  resetUserPassword,
  deleteUser,
};
