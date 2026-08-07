const prisma = require('./db');

/**
 * Log user activity with IP, User-Agent, and state diff support.
 */
const logActivity = async (req, { action, details, previousValue = null, newValue = null, userEmail = null }) => {
  try {
    const ipAddress = req ? (
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.ip ||
      req.socket?.remoteAddress ||
      '127.0.0.1'
    ) : 'System';

    const userAgent = req ? (req.headers['user-agent'] || 'Unknown') : 'System';
    const email = userEmail || req?.user?.email || process.env.INITIAL_ADMIN_EMAIL || 'system@dacorridor.com';

    const prevStr = previousValue && typeof previousValue === 'object' ? JSON.stringify(previousValue) : previousValue;
    const newStr = newValue && typeof newValue === 'object' ? JSON.stringify(newValue) : newValue;

    await prisma.activityLog.create({
      data: {
        action,
        details,
        previousValue: prevStr,
        newValue: newStr,
        userEmail: email,
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    console.error('[ACTIVITY LOGGER ERROR]:', error.message);
  }
};

module.exports = {
  logActivity,
};
