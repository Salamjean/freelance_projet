const nodemailer = require('nodemailer');
require('dotenv').config();

async function testSmtp() {
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT || '465', 10),
    secure: process.env.MAIL_ENCRYPTION === 'ssl',
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  try {
    console.log('Testing SMTP connection...');
    const result = await transporter.verify();
    console.log('SMTP Connection verified:', result);
    
    console.log('Sending test email...');
    const info = await transporter.sendMail({
      from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
      to: 'infos@plateau-apps.com', // Sending to self for testing
      subject: 'Test Email Server',
      text: 'This is a test email to verify configuration.',
    });
    console.log('Test email sent successfully. MessageId:', info.messageId);
  } catch (err) {
    console.error('SMTP Error:', err);
  }
}

testSmtp();
