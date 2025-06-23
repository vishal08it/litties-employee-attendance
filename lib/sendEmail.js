import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export default async function sendEmail(to, subject, html) {
  return transporter.sendMail({
    from: `"Litties Restaurant" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,  
  });
}
