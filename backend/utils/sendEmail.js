const nodemailer = require('nodemailer');
const ErrorResponse = require('./errorResponse');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

// Send email
exports.sendEmail = async ({ email, subject, message }) => {
  try {
    const mailOptions = {
      from: process.env.FROM_EMAIL,
      to: email,
      subject,
      text: message
    };

    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error('Email send error:', err);
    throw new ErrorResponse('Email could not be sent', 500);
  }
};