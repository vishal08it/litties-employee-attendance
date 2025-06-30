// /pages/api/send-offers.js
import connectToDatabase from '@/lib/mongodb';
import Subscriber from '@/models/Subscriber';
import SpecialOffer from '@/models/SpecialOffer';
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // ✅ 1. Authorization using CRON_SECRET
  const token = req.headers.authorization;
  if (token !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  // ✅ 2. Connect to MongoDB
  await connectToDatabase();

  // ✅ 3. Get current IST time
  const nowUTC = new Date();
  const IST_OFFSET = 5.5 * 60 * 60 * 1000;
  const nowIST = new Date(nowUTC.getTime() + IST_OFFSET);
  const today = nowIST.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'Asia/Kolkata' });

  console.log('📅 Current IST Time:', nowIST.toISOString());
  console.log('🗓️ Today:', today);

  // ✅ 4. Find active offers
  const dayOffer = await SpecialOffer.findOne({
    offerType: 'day',
    dayOfWeek: today,
    active: true,
  });

  const timeOffers = await SpecialOffer.find({
    offerType: 'time',
    startDateTime: { $lte: nowIST },
    endDateTime: { $gte: nowIST },
    active: true,
  });

  const offersToSend = [];
  if (dayOffer) offersToSend.push(dayOffer);
  if (timeOffers.length > 0) offersToSend.push(...timeOffers);

  if (offersToSend.length === 0) {
    console.log('🚫 No active offers at this time.');
    return res.status(200).json({ message: 'No active offers found right now.' });
  }

  // ✅ 5. Get subscribers
  const subscribers = await Subscriber.find();
  if (subscribers.length === 0) {
    console.log('⚠️ No subscribers found.');
    return res.status(200).json({ message: 'No subscribers to notify.' });
  }

  console.log('📧 Subscribers to notify:', subscribers.map(sub => sub.email));

  // ✅ 6. Setup nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const results = [];

  for (const offer of offersToSend) {
    const offerTime = offer.offerType === 'time'
      ? `from <strong>${new Date(offer.startDateTime).toLocaleString('en-IN')}</strong> to <strong>${new Date(offer.endDateTime).toLocaleString('en-IN')}</strong>`
      : `every <strong>${offer.dayOfWeek}</strong>`;

    const htmlContent = `
      <div style="font-family:sans-serif;line-height:1.5;">
        <h2 style="color:#eab308;">${offer.name}</h2>
        <p><strong>Price:</strong> ₹${offer.price}</p>
        <img src="${offer.image}" alt="${offer.name}" style="width:220px;border-radius:8px;margin:10px 0;" />
        <p>This offer is available ${offerTime} at <strong>Litties Restaurant</strong>.</p>
        <p style="color:gray;font-size:14px;">Thank you for subscribing to Litties updates.</p>
      </div>
    `;

    for (const subscriber of subscribers) {
      const mailOptions = {
        from: `"Litties Restaurant" <${process.env.EMAIL_USER}>`,
        to: subscriber.email,
        subject: `🎉 ${offer.name} - Special Offer Just for You!`,
        html: htmlContent,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent to ${subscriber.email} for offer "${offer.name}"`);
        results.push({ email: subscriber.email, offer: offer.name, status: 'sent' });
      } catch (err) {
        console.error(`❌ Failed to send to ${subscriber.email}:`, err.message);
        results.push({ email: subscriber.email, offer: offer.name, status: 'failed', error: err.message });
      }
    }
  }

  return res.status(200).json({ message: 'Offer emails processed', results });
}
