import dbConnect from '@/lib/mongodb';
import Feedback from '@/models/Feedback';
import Employee from '@/models/Employee';

export default async function handler(req, res) {
  await dbConnect();

  try {
    // Step 1: Get all feedbacks sorted oldest to newest
    const allFeedbacks = await Feedback.find({})
      .sort({ createdAt: 1 }) // so first feedback comes first
      .lean();

    // Step 2: Keep only the first feedback per user (by mobile number)
    const seenMobiles = new Set();
    const firstFeedbacks = [];

    for (const fb of allFeedbacks) {
      const mobile = fb.userId;
      if (mobile && !seenMobiles.has(mobile)) {
        seenMobiles.add(mobile);
        firstFeedbacks.push(fb); // take only the first feedback per user
      }
    }

    // Step 3: Sort first feedbacks by newest to oldest
    const sorted = firstFeedbacks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Step 4: Enrich feedbacks with employee info
    const enriched = await Promise.all(
      sorted.map(async (fb) => {
        const emp = await Employee.findOne({ mobileNumber: fb.userId }).lean();
        return {
          ...fb,
          name: emp?.name || 'Anonymous',
          image: emp?.image || '',
        };
      })
    );

    return res.status(200).json({ success: true, feedbacks: enriched });

  } catch (err) {
    console.error('Error loading feedbacks:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}
