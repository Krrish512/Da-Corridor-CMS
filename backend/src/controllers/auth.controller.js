const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../utils/db');
const { logActivity } = require('../utils/activityLogger');

// Helper to generate JWT
const generateToken = (id, email, role, rememberMe = false) => {
  const expiresIn = rememberMe ? '7d' : (process.env.JWT_EXPIRE || '24h');
  return jwt.sign(
    { id, email, role },
    process.env.JWT_SECRET,
    { expiresIn }
  );
};

// Login user
const login = async (req, res) => {
  const { email, password, rememberMe } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide an email and password' });
    }

    // Find user (ignore soft-deleted)
    const user = await prisma.user.findFirst({
      where: { email, deletedAt: null }
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check account active status
    if (user.isActive === false) {
      await logActivity(req, {
        action: 'LOGIN_BLOCKED',
        details: `Login attempt blocked for deactivated account: ${user.email}`,
        userEmail: user.email,
      });
      return res.status(403).json({
        message: 'Account is deactivated. Please contact a Super Admin.',
        code: 'ACCOUNT_DEACTIVATED'
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Increment failed login attempt counter
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: { increment: 1 },
          lastFailedLoginAt: new Date(),
        }
      });

      await logActivity(req, {
        action: 'LOGIN_FAILED',
        details: `Invalid password attempt for account: ${user.email}`,
        userEmail: user.email,
      });

      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Successful login -> Reset failed attempts and update lastLoginAt
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        failedLoginAttempts: 0,
        lastFailedLoginAt: null,
      }
    });

    // Record activity log
    await logActivity(req, {
      action: 'USER_LOGIN',
      details: `User ${user.email} (${user.role}) successfully logged in.`,
      userEmail: user.email,
    });

    res.json({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      avatar: updatedUser.avatar,
      mustChangePassword: updatedUser.mustChangePassword,
      lastLoginAt: updatedUser.lastLoginAt,
      token: generateToken(updatedUser.id, updatedUser.email, updatedUser.role, rememberMe),
    });
  } catch (error) {
    console.error('[LOGIN ERROR]:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// Forgot Password
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await prisma.user.findFirst({
      where: { email, deletedAt: null }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found with that email' });
    }

    const resetToken = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
    
    console.log(`\n--- PASSWORD RESET TOKEN GENERATED FOR ${email} ---`);
    console.log(`Token: ${resetToken}`);
    console.log(`URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`);
    console.log('--------------------------------------------------\n');

    const { sendAdminNotification } = require('../utils/email');
    await sendAdminNotification({
      subject: 'Password Reset Request',
      text: `Hello, a password reset has been requested for your admin account. Please use the following token to reset your password:\n\n${resetToken}\n\nThis token will expire in 15 minutes.`,
      html: `<p>Hello,</p><p>A password reset has been requested for your admin account. Please use the following link to reset your password:</p><p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}">Reset Password</a></p><p>Or token: <code>${resetToken}</code></p>`
    });

    await logActivity(req, {
      action: 'PASSWORD_RESET_REQUESTED',
      details: `Password reset link generated for ${user.email}`,
      userEmail: user.email,
    });

    res.json({ message: 'Password reset link sent to your email.' });
  } catch (error) {
    console.error('[FORGOT PASSWORD ERROR]:', error);
    res.status(500).json({ message: 'Server error during forgot password' });
  }
};

// Reset Password via Token
const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await prisma.user.findFirst({
      where: { id: decoded.id, deletedAt: null }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found or has been deleted' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        mustChangePassword: false,
      }
    });

    await logActivity(req, {
      action: 'PASSWORD_RESET_COMPLETED',
      details: `Password reset completed via token for ${user.email}`,
      userEmail: user.email,
    });

    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('[RESET PASSWORD ERROR]:', error);
    res.status(400).json({ message: 'Invalid or expired token' });
  }
};

// Change Password (protected self-service)
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  try {
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || user.deletedAt) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        mustChangePassword: false,
      }
    });

    await logActivity(req, {
      action: 'PASSWORD_CHANGE',
      details: `Password changed successfully by ${user.email}`,
      userEmail: user.email,
    });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('[CHANGE PASSWORD ERROR]:', error);
    res.status(500).json({ message: 'Server error during password change' });
  }
};

// Update Profile (protected self-service)
const updateProfile = async (req, res) => {
  const { name, avatar } = req.body;
  const userId = req.user.id;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, avatar: true, email: true, role: true }
    });

    if (!existingUser || existingUser.deletedAt) {
      return res.status(404).json({ message: 'User not found' });
    }

    const previousValue = { name: existingUser.name, avatar: existingUser.avatar };
    const newValue = { name: name || existingUser.name, avatar: avatar !== undefined ? avatar : existingUser.avatar };

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name !== undefined ? name : existingUser.name,
        avatar: avatar !== undefined ? avatar : existingUser.avatar,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        mustChangePassword: true,
        lastLoginAt: true,
        createdAt: true,
      }
    });

    await logActivity(req, {
      action: 'PROFILE_UPDATED',
      details: `User profile updated for ${existingUser.email}`,
      previousValue,
      newValue,
      userEmail: existingUser.email,
    });

    res.json(updated);
  } catch (error) {
    console.error('[UPDATE PROFILE ERROR]:', error);
    res.status(500).json({ message: 'Server error during profile update' });
  }
};

// Get My Activity Log (protected self-service)
const getMyActivity = async (req, res) => {
  try {
    const logs = await prisma.activityLog.findMany({
      where: { userEmail: req.user.email },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json(logs);
  } catch (error) {
    console.error('[GET MY ACTIVITY ERROR]:', error);
    res.status(500).json({ message: 'Server error fetching user activity' });
  }
};

// Get current profile
const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        isActive: true,
        mustChangePassword: true,
        lastLoginAt: true,
        createdAt: true,
      }
    });

    if (!user || user.deletedAt) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('[GET ME ERROR]:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  login,
  forgotPassword,
  resetPassword,
  changePassword,
  updateProfile,
  getMyActivity,
  getMe,
};
