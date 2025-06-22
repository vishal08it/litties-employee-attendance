import nodemailer from 'nodemailer';

export default async function sendEmail(to, subject, text) {
  const transporter = nodemailer.createTransport({
    service: 'gmail', // ✅ Simpler and more stable for Gmail
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  return transporter.sendMail({
    from: `"Litties" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
  });
}
