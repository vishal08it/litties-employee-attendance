import dbConnect from '@/lib/mongodb';
import SpecialOffer from '@/models/SpecialOffer';

export default async function handler(req, res) {
  await dbConnect();

  try {
    const offers = await SpecialOffer.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: offers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
