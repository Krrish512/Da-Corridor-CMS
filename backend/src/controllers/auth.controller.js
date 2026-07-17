const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../utils/db');

// Helper to generate JWT
const generateToken = (id, email, role) => {
  return jwt.sign(
    { id, email, role },
    process.env.JWT_SECRET || 'arch_portfolio_cms_secret_key_2026_unbreakable_secret',
    { expiresIn: process.env.JWT_EXPIRE || '24h' }
  );
};

// Login user
const login = async (req, res) => {
  const { email, password } = req.body;

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

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Record activity log
    await prisma.activityLog.create({
      data: {
        action: 'USER_LOGIN',
        details: `User ${user.email} successfully logged in.`,
        userEmail: user.email,
      }
    });

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user.id, user.email, user.role),
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

    // Since we want to make it easy and simulation-ready, we generate a mock token.
    // In a real application, you would store a reset token in the database and email it.
    const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'arch_portfolio_cms_secret_key_2026_unbreakable_secret', { expiresIn: '15m' });
    
    console.log(`\n--- PASSWORD RESET TOKEN GENERATED FOR ${email} ---`);
    console.log(`Token: ${resetToken}`);
    console.log(`URL: http://localhost:5173/reset-password?token=${resetToken}`);
    console.log('--------------------------------------------------\n');

    // Simulated email notify
    const { sendAdminNotification } = require('../utils/email');
    await sendAdminNotification({
      subject: 'Password Reset Request',
      text: `Hello, a password reset has been requested for your admin account. Please use the following token to reset your password:\n\n${resetToken}\n\nThis token will expire in 15 minutes.`,
      html: `<p>Hello,</p><p>A password reset has been requested for your admin account. Please use the following link to reset your password:</p><p><a href="http://localhost:5173/reset-password?token=${resetToken}">Reset Password</a></p><p>Or token: <code>${resetToken}</code></p>`
    });

    res.json({ message: 'Password reset link sent to your email.' });
  } catch (error) {
    console.error('[FORGOT PASSWORD ERROR]:', error);
    res.status(500).json({ message: 'Server error during forgot password' });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'arch_portfolio_cms_secret_key_2026_unbreakable_secret');
    
    const user = await prisma.user.findFirst({
      where: { id: decoded.id, deletedAt: null }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found or has been deleted' });
    }

    // Encrypt password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    await prisma.activityLog.create({
      data: {
        action: 'PASSWORD_RESET',
        details: `Password reset successfully via reset token for ${user.email}`,
        userEmail: user.email,
      }
    });

    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('[RESET PASSWORD ERROR]:', error);
    res.status(400).json({ message: 'Invalid or expired token' });
  }
};

// Change Password (protected)
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || user.deletedAt) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }

    // Encrypt new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    await prisma.activityLog.create({
      data: {
        action: 'PASSWORD_CHANGE',
        details: `Password changed manually by ${user.email}`,
        userEmail: user.email,
      }
    });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('[CHANGE PASSWORD ERROR]:', error);
    res.status(500).json({ message: 'Server error during password change' });
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
  getMe,
};
