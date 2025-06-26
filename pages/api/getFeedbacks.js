// pages/api/getFeedbacksWithUser.js

import dbConnect from '@/lib/mongodb';
import Feedback from '@/models/Feedback';
import Employee from '@/models/Employee';

export default async function handler(req, res) {
  await dbConnect();
  try {
    const feedbacks = await Feedback.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const enriched = await Promise.all(
      feedbacks.map(async (fb) => {
        const emp = await Employee.findOne({ mobileNumber: fb.userId }).lean();
        return {
          ...fb,
          name: emp?.name || 'Anonymous',
          image: emp?.image || '', // ✅ add image field from Employee
        };
      })
    );

    return res.status(200).json({ success: true, feedbacks: enriched });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}
