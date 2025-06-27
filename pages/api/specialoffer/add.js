import dbConnect from '@/lib/mongodb';
import SpecialOffer from '@/models/SpecialOffer';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== 'POST') return res.status(405).end();

  const { name, price, image, offerType, dayOfWeek, startDateTime, endDateTime } = req.body;

  try {
    const offer = new SpecialOffer({
      name,
      image,
      price,
      offerType,
      dayOfWeek: offerType === 'day' ? dayOfWeek : '',
      startDateTime: offerType === 'time' ? new Date(startDateTime) : null,
      endDateTime: offerType === 'time' ? new Date(endDateTime) : null,
      active: true
    });

    await offer.save();
    res.status(200).json({ success: true, offer });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
