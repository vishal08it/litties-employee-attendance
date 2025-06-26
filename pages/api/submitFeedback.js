import dbConnect from '@/lib/mongodb';
import Feedback from '@/models/Feedback';

export default async function handler(req, res) {
    debugger
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { userId, itemId, orderId, feedback, rating } = req.body;


  if (!userId || !orderId || !itemId || !feedback || !rating) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  await dbConnect();

  try {
    const existing = await Feedback.findOne({ userId, itemId, orderId });
    if (existing) {
      return res.status(200).json({ success: true, message: 'Feedback already exists' });
    }

    await Feedback.create({
  userId,
  itemId,
  orderId,
  feedback,
  rating, // ✅ Save rating
  createdAt: new Date(),
});


    return res.status(200).json({ success: true, message: 'Feedback submitted successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}
