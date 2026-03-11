const nodemailer = require('nodemailer');

// Create reusable transporter object using Gmail SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'support.focusflow@gmail.com',
    pass: 'cqwdbbvmcuhouyni' // App Password without spaces
  }
});

console.log('✅ Mailer initialized with Gmail');

/**
 * Sends an email
 */
async function sendEmail(to, subject, text, html) {
  try {
    const info = await transporter.sendMail({
      from: '"FocusFlow Support" <support.focuflow@gmail.com>',
      to,
      subject,
      text,
      html,
    });
    
    console.log('Message sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

module.exports = { sendEmail };
