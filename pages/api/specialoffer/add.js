import dbConnect from '@/lib/mongodb';
import SpecialOffer from '@/models/SpecialOffer';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const { name, price, image, offerType, dayOfWeek, startDateTime, endDateTime } = req.body;

  if (!name || !price || !image || !offerType) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  try {
    // Convert to Date and shift to IST (+5:30)
    const convertToIST = (dateStr) => {
      const utcDate = new Date(dateStr);
      const istOffset = 5.5 * 60 * 60 * 1000; // 5.5 hours in ms
      return new Date(utcDate.getTime() + istOffset);
    };

    const startIST = offerType === 'time' ? convertToIST(startDateTime) : null;
    const endIST = offerType === 'time' ? convertToIST(endDateTime) : null;

    const offer = new SpecialOffer({
      name,
      image,
      price,
      offerType,
      dayOfWeek: offerType === 'day' ? dayOfWeek : '',
      startDateTime: startIST,
      endDateTime: endIST,
      active: true
    });

    await offer.save();
    res.status(200).json({ success: true, offer });
  } catch (err) {
    console.error('Error saving offer:', err);
    res.status(500).json({ success: false, message: 'Internal Server Error', error: err.message });
  }
}
