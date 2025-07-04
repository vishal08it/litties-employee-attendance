import dbConnect from '@/lib/mongodb';
import SpecialOffer from '@/models/SpecialOffer';

export default async function handler(req, res) {
  await dbConnect();

  try {
    // Get current IST time
    const nowUTC = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // IST = UTC + 5:30
    const nowIST = new Date(nowUTC.getTime() + istOffset);

    // Check time-based offers
    const timeOffer = await SpecialOffer.findOne({
      active: true,
      offerType: 'time',
      startDateTime: { $lte: nowIST },
      endDateTime: { $gte: nowIST }
    });

    if (timeOffer) {
      return res.status(200).json({ success: true, offer: timeOffer });
    }

    // Get current day in IST (e.g., "Friday")
    const currentDay = nowIST.toLocaleString('en-IN', {
      weekday: 'long',
      timeZone: 'Asia/Kolkata'
    });

    // Check day-based offers
    const dayOffer = await SpecialOffer.findOne({
      active: true,
      offerType: 'day',
      dayOfWeek: currentDay
    });

    if (dayOffer) {
      return res.status(200).json({ success: true, offer: dayOffer });
    }

    // No valid offers
    res.status(200).json({ success: false, message: 'No valid offers now' });
  } catch (error) {
    console.error('Error fetching special offer:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
}
