import dbConnect from '@/lib/mongodb';
import SpecialOffer from '@/models/SpecialOffer';

export default async function handler(req, res) {
  await dbConnect();

  const now = new Date();
  const day = now.toLocaleString('en-US', {
    weekday: 'long',
    timeZone: 'Asia/Kolkata'
  });

  try {
    const offers = await SpecialOffer.find({ active: true });

    const valid = offers.filter(offer => {
      if (offer.offerType === 'day' && offer.dayOfWeek === day) return true;
      if (
        offer.offerType === 'time' &&
        now >= new Date(offer.startDateTime) &&
        now <= new Date(offer.endDateTime)
      ) return true;
      return false;
    });

    if (valid.length > 0) {
      res.status(200).json({ success: true, offer: valid[0] });
    } else {
      res.status(200).json({ success: false });
    }
  } catch (err) {
    console.error('Error fetching valid offers:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}
