const nodemailer = require('nodemailer');

const escapeHtml = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Vercel serverless function; server.js mounts the same handler for local dev.
module.exports = async function handler(req, res) {
  // CORS so the GitHub Pages copy of the site can post here
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { name, email, message, company } = req.body || {};

    // Honeypot field: hidden from people, filled in by bots. Pretend it worked.
    if (company) {
      return res.status(200).json({ success: true, message: 'Email sent successfully' });
    }

    if (![name, email, message].every((v) => typeof v === 'string' && v.trim())) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    if (!EMAIL_RE.test(email) || name.length > 200 || email.length > 320 || message.length > 5000) {
      return res.status(400).json({ success: false, message: 'Invalid input' });
    }

    // Gmail (App Password) by default; set SMTP_HOST to use any other SMTP server
    const transporter = nodemailer.createTransport(
      process.env.SMTP_HOST
        ? {
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT || 587),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            },
          }
        : {
            service: process.env.SMTP_SERVICE || 'gmail',
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS,
            },
          }
    );

    const toAddress = process.env.EMAIL_TO || process.env.EMAIL_USER;
    const fromAddress = process.env.EMAIL_FROM || process.env.EMAIL_USER;

    const mailOptions = {
      from: fromAddress,
      to: toAddress,
      subject: `Portfolio Contact: ${String(name).replace(/[\r\n]+/g, ' ')}`,
      replyTo: email,
      text: `From: ${name} <${email}>\n\n${message}`,
      html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(message).replace(/\n/g, '<br/>')}</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ success: false, message: 'Failed to send email' });
  }
};
