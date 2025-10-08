import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

function createTransporter() {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
    throw new Error('GMAIL_USER and GMAIL_PASS must be set in environment to send emails');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });
}

export async function sendEmail({ to, subject, text, html }) {
  const transporter = createTransporter();
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to,
    subject,
    text,
    html,
  };
  return transporter.sendMail(mailOptions);
}

export async function sendOtpEmail({ to, code, appName = 'YourApp' }) {
  const messageText = `Hello!\n\nYour verification code is: ${code}\nThis code will expire in 10 minutes.\n\nIf you didn't request this, please ignore this email.\n\nThanks,\n${appName}`;

  const messageHtml = `
    <div style="font-family: Arial, sans-serif; color: #222;">
      <h2 style="color:#0b63c6;">${appName} — Verification Code</h2>
      <p>Hello,</p>
      <p>Your verification code is:</p>
      <p style="font-size:20px; font-weight:700; background:#f4f6fb; display:inline-block; padding:10px 16px; border-radius:6px;">${code}</p>
      <p style="margin-top:12px; color:#555;">This code will expire in <strong>10 minutes</strong>.</p>
      <p style="color:#777; font-size:13px;">If you didn't request this, you can safely ignore this email.</p>
      <hr style="border:none; border-top:1px solid #eee; margin:20px 0;" />
      <p style="font-size:12px; color:#999;">Sent by ${appName}</p>
    </div>
  `;

  return sendEmail({ to, subject: `${appName} — Your verification code`, text: messageText, html: messageHtml });
}

export async function verifyTransporter() {
  const transporter = createTransporter();
  return transporter.verify();
}

export default sendEmail;
