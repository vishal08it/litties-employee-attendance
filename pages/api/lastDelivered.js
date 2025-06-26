import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import Feedback from '@/models/Feedback';

export default async function handler(req, res) {
  const { mobile } = req.query;

  if (!mobile) {
    return res.status(400).json({ success: false, message: 'Mobile number is required' });
  }

  await dbConnect();

  try {
    const deliveredOrders = await Order.find({ userId: mobile, status: 'Delivered' }).sort({ createdAt: -1 });

    for (const order of deliveredOrders) {
      for (const item of order.items) {
        const feedbackExists = await Feedback.findOne({ userId: mobile, itemId: item._id });
        if (!feedbackExists) {
          return res.status(200).json({
            success: true,
            item: {
              orderId: order.orderId,
              itemId: item._id,
              name: item.name,
              image: item.image,
            },
            feedbackGiven: false,
          });
        }
      }
    }

    return res.status(200).json({ success: false, message: 'No pending feedback found' });

  } catch (err) {
    console.error('Last Delivered Error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}
