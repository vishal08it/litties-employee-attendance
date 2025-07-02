import connectToDatabase from '@/lib/mongodb';
import Subscriber from '@/models/Subscriber';
import SpecialOffer from '@/models/SpecialOffer';
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  try {
    // ✅ Authorization header check
    const token = req.headers.authorization;
    if (token !== `Bearer ${process.env.CRON_SECRET}`) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // ✅ Connect to MongoDB
    await connectToDatabase();

    // ✅ Convert UTC to IST
    const nowUTC = new Date();
    const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
    const nowIST = new Date(nowUTC.getTime() + IST_OFFSET_MS);
    const today = nowIST.toLocaleDateString('en-US', {
      weekday: 'long',
      timeZone: 'Asia/Kolkata',
    });

    console.log('📅 Current IST:', nowIST.toISOString());
    console.log('🗓️ Day of Week:', today);

    // ✅ Fetch offers
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
      console.log('🚫 No active offers found.');
      return res.status(200).json({ message: `No active offers for ${today}` });
    }

    // ✅ Fetch subscribers
    const subscribers = await Subscriber.find();
    if (subscribers.length === 0) {
      console.log('⚠️ No subscribers found.');
      return res.status(200).json({ message: 'No subscribers to send to.' });
    }

    // ✅ Setup email transporter
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('❌ Missing email credentials in env');
      return res.status(500).json({ message: 'Email config error' });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const results = [];

    for (const offer of offersToSend) {
      const offerTiming = offer.offerType === 'day'
        ? `on <strong>${offer.dayOfWeek}</strong>s`
        : `from <strong>${new Date(offer.startDateTime).toLocaleString('en-IN')}</strong> to <strong>${new Date(offer.endDateTime).toLocaleString('en-IN')}</strong>`;

      const emailHtml = `
        <div style="font-family:Arial,sans-serif;line-height:1.6;">
          <h2 style="color:#eab308;">${offer.name}</h2>
          <p><strong>Price:</strong> ₹${offer.price}</p>
          <img src="${offer.image}" alt="${offer.name}" style="width:220px;border-radius:8px;margin:10px 0;" />
          <p>This ${offer.offerType}-based offer is available ${offerTiming} at <strong>Litties Restaurant</strong>.</p>
          <hr style="margin:10px 0; border:none; border-top:1px solid #ccc;" />
          <p style="font-size:13px;color:#666;">You're receiving this email because you subscribed to Litties updates.</p>
        </div>
      `;

      for (const user of subscribers) {
        const mailOptions = {
          from: `"Litties Restaurant" <${process.env.EMAIL_USER}>`,
          to: user.email,
          subject: `🎉 ${offer.name} - Special Offer Just for You!`,
          html: emailHtml,
        };

        try {
          await transporter.sendMail(mailOptions);
          console.log(`✅ Email sent to ${user.email} for "${offer.name}"`);
          results.push({ email: user.email, offer: offer.name, status: 'sent' });
        } catch (error) {
          console.error(`❌ Email to ${user.email} failed:`, error.message);
          results.push({
            email: user.email,
            offer: offer.name,
            status: 'failed',
            error: error.message,
          });
        }
      }
    }

    return res.status(200).json({ message: 'Offer emails processed', results });

  } catch (err) {
    console.error('❌ Unexpected error:', err.message || err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
