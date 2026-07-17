const nodemailer = require('nodemailer');

// Setup transporter based on env variables
const getTransporter = () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '5855', 10),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  
  // Return null if not fully configured (will fall back to console logging)
  return null;
};

/**
 * Send an email notification to the administrator
 * @param {Object} options Email options
 * @param {string} options.subject The subject of the email
 * @param {string} options.text The text body of the email
 * @param {string} options.html The HTML body of the email
 */
const sendAdminNotification = async ({ subject, text, html }) => {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@archstudio.com';
  const senderEmail = process.env.SENDER_EMAIL || 'noreply@archstudio.com';

  const transporter = getTransporter();

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: `"ArchStudio CMS" <${senderEmail}>`,
        to: adminEmail,
        subject: subject,
        text: text,
        html: html,
      });
      console.log(`[EMAIL SENT] Notification email sent to admin: ${info.messageId}`);
      return true;
    } catch (error) {
      console.error('[EMAIL ERROR] Failed to send email via SMTP:', error);
      // Even if SMTP fails, we log it and don't crash the server
      logEmailToConsole(adminEmail, senderEmail, subject, text);
      return false;
    }
  } else {
    // If SMTP is not configured, simulate by logging to console
    logEmailToConsole(adminEmail, senderEmail, subject, text);
    return true;
  }
};

const logEmailToConsole = (to, from, subject, text) => {
  console.log('\n--- SIMULATED ADMIN EMAIL ALERT ---');
  console.log(`From:    ${from}`);
  console.log(`To:      ${to}`);
  console.log(`Subject: ${subject}`);
  console.log('Body:');
  console.log(text);
  console.log('-----------------------------------\n');
};

module.exports = {
  sendAdminNotification,
};
