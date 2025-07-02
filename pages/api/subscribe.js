import connectToDatabase from '@/lib/mongodb';
import Subscriber from '@/models/Subscriber';
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ message: 'Invalid email address' });
  }

  try {
    // Connect to database
    await connectToDatabase();

    // Save or update subscriber
    await Subscriber.updateOne({ email }, { $set: { email } }, { upsert: true });
    console.log('✅ Subscriber saved:', email);

    // Send thank-you email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,   // your Gmail
        pass: process.env.EMAIL_PASS,   // Gmail App Password
      },
    });

    const mailOptions = {
      from: `"Litties Restaurant" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🎉 Thank You for Subscribing!',
      html: `
        <h2>Welcome to Litties Restaurant Offers!</h2>
        <p>Thanks for subscribing. We’ll send you exclusive food deals & Offers — directly to your inbox!</p>
        <p>Stay tuned and enjoy delicious food 🍽️</p>
        <p><em>— Litties Multi Cuisine Family Restaurant</em></p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('📧 Thank-you email sent to:', email);

    return res.status(200).json({ message: 'Subscribed successfully! Thank you email sent.' });

  } catch (err) {
    console.error('❌ Subscribe error:', err.message || err);
    return res.status(500).json({ message: 'Subscription failed. Please try again.' });
  }
}
